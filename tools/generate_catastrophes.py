from enum import Enum, IntEnum
import json
from pydoc import describe
import re
from datetime import datetime
import xml.etree.ElementTree as ET
from os import path
import os
import csv
import locale
import utils
import geojson
from shapely import geometry
import shapefile

locale.setlocale(locale.LC_ALL, 'fr-CA.UTF-8')

district_shapes = utils.load_map()

class Severity(IntEnum):
    Unknown = 0
    Minor = 1
    Moderate = 2
    Important = 3
    Extreme = 4

class CatastropheType(Enum):
    Flood = "FLOOD"
    ForestFire = "FOREST_FIRE"
    ViolentStorm = "VIOLENT_STORM"
    Tornado = "TORNADO"
    FreezingRain = "FREEZING_RAIN"
    WinterStorm = "WINTER_STORM"
    StormWinds = "STORM_WINDS",
    HeatWave = "HEAT_WAVE"

event_types = {
    "inondation": {"type": CatastropheType.Flood, "min_severity": Severity.Important},
    "tornade": {"type": CatastropheType.Tornado, "min_severity": Severity.Minor},
    "orage violent": {"type": CatastropheType.ViolentStorm, "min_severity": Severity.Important},
    "ouragan": {"type": CatastropheType.ViolentStorm, "min_severity": Severity.Important},
    "pluie verglaçante": {"type": CatastropheType.FreezingRain, "min_severity": Severity.Extreme},
    "feu de forêt": {"type": CatastropheType.ForestFire, "min_severity": Severity.Important},
    "tempête hivernale": {"type": CatastropheType.WinterStorm, "min_severity": Severity.Extreme},
    "vent de tempête": {"type": CatastropheType.StormWinds, "min_severity": Severity.Important},
    "vent violent": {"type": CatastropheType.StormWinds, "min_severity": Severity.Important},
}

severity_pattern = re.compile(r'menace (\w+)', re.I)

def parse_old_severity(description):
    if description == 'EXTRAORDINAIRE' or description == 'EXTRÊME':
        return Severity.Extreme
    if description == 'IMPORTANTE':
        return Severity.Important
    if description == 'POSSIBLE' or description == 'MODÉRÉE':
        return Severity.Moderate
    if description == 'FAIBLE' or description == 'MINEURE':
        return Severity.Minor
    return Severity.Unknown

def parse_new_severity(description):
    match = severity_pattern.search(description)
    if match:
        menace = match.group(1).upper()
        return parse_old_severity(menace)
    return Severity.Unknown

def parse_new_line(line):
    code_alea,alea,code_municipalite,municipalite,_,_,severite,date_signalement,date_debut,_,_,_,coord_x,coord_y = line
    event = event_types.get(alea.lower())
        
    if event:
        severity = parse_new_severity(severite)
        if severity >= event['min_severity']:
            date = datetime.strptime(date_debut if date_debut else date_signalement, '%Y-%m-%d')
            return {
                "id": "{}{}{}".format(code_alea, code_municipalite, date.date().strftime('%Y%m%d')),
                "location": [float(coord_y), float(coord_x)],
                "city": municipalite,
                "type": event['type'],
                "date": date.date(),
                "severity": severity
            }
    return None

def parse_old_file(path, catastrophes):
    with open(path, 'r', encoding='utf-8') as input_file:
        event_collection = geojson.load(input_file)

    for feature in event_collection['features']:
        properties = feature['properties']
        date = datetime.strptime(properties['date_observation'], '%Y/%m/%d %H:%M:%S')
        if date.year >= utils.MIN_YEAR:
            event = event_types.get(properties['type'].lower())
            if event:
                severity = parse_old_severity(properties['severite'].upper())
                if severity >= event['min_severity']:
                    location = feature['geometry']['coordinates']
                    catastrophe = {
                        "id": str(properties['no_seq_observation']),
                        "location": location,
                        "city": properties['nom'],
                        "type": event['type'],
                        "date": date.date(),
                        "severity": severity,
                        "loc_approx": properties['imprecision'] == 'localisation'
                    }
                    catastrophes.append(catastrophe)

def parse_new_file(path, catastrophes):
    with open(path, 'r', encoding='utf-8') as input_file:
        reader = csv.reader(input_file)
        next(reader, None)
        for line in reader:
            code_alea,alea,code_municipalite,municipalite,precision_localisation,_,severite,date_signalement,date_debut,_,_,_,coord_x,coord_y = line
            event = event_types.get(alea.lower())
                
            if event:
                severity = parse_new_severity(severite)
                if severity >= event['min_severity']:
                    date = datetime.strptime(date_debut if date_debut else date_signalement, '%Y-%m-%d')
                    catastrophe = {
                        "id": "{}{}{}".format(code_alea, code_municipalite, date.date().strftime('%Y%m%d')),
                        "location": [float(coord_x), float(coord_y)],
                        "city": municipalite,
                        "type": event['type'],
                        "date": date.date(),
                        "severity": severity,
                        "loc_approx": precision_localisation.lower() == 'imprécise'
                    }
                    catastrophes.append(catastrophe)

def parse_shp(path, catastrophes):
    reader = shapefile.Reader(path)
    for shape in reader.shapeRecords(['ANNEE', 'DATE_DEBUT', 'LATITUDE', 'LONGITUDE', 'CLE', 'SUP_HA']):
        record = shape.record
        if record.ANNEE >= utils.MIN_YEAR:
            severity = Severity.Unknown
            match record.SUP_HA:
                case ha if ha < 100:
                    severity = Severity.Minor
                case ha if ha >= 100 and ha < 1000:
                    severity = Severity.Moderate
                case ha if ha >= 1000 and ha < 10000:
                    severity = Severity.Important
                case ha if ha >= 10000:
                    severity = Severity.Extreme
            
            if severity >= Severity.Important:
                fire = {
                    "id": str(int(record.CLE)),
                    "location": [record.LONGITUDE, record.LATITUDE],
                    "type": CatastropheType.ForestFire,
                    "date": record.DATE_DEBUT,
                    "severity": severity,
                    'loc_approx': False
                }
                catastrophes.append(fire)

def parse_heat_waves(path, catastrophes):
     with open(path, 'r', encoding='utf-8') as input_file:
        reader = csv.reader(input_file)
        next(reader, None)
        for line in reader:
            nom,station_id,lng,lat,raw_date,duration = line
            date = datetime.strptime(raw_date, '%Y-%m-%d')
            severity = Severity(min(Severity.Extreme.value, int(duration) - 2))
            if severity >= Severity.Important:
                heat_wave = {
                        "id": '{}_{}'.format(station_id, date.strftime('%Y%m%d')),
                        "location": [float(lng), float(lat)],
                        "type": CatastropheType.HeatWave,
                        "date": date.date(),
                        "severity": severity,
                        'loc_approx': True
                    }
                if nom:
                    heat_wave['city'] = nom
                catastrophes.append(heat_wave)

catastrophes = []

parse_old_file(path.join(utils.source_directory, 'catastrophes_pre2020.json'), catastrophes)
parse_new_file(path.join(utils.source_directory, 'catastrophes_post2020.csv'), catastrophes)

parse_shp(path.join(utils.source_directory, 'Feux_pt_ori', 'FEUX_PT_ORI_1972_2021.shp'), catastrophes)
parse_heat_waves(path.join(utils.source_directory, 'heat_waves.csv'), catastrophes)

catastrophes.sort(key=lambda x: x['date'])

result = {}
for catastrophe in catastrophes:
    obj = {
        'id': catastrophe['id'],
        'location': catastrophe['location'],
        'type': catastrophe['type'].value,
        'date': catastrophe['date'].isoformat(),
        'severity': catastrophe['severity'].value,
        'district': 0,
        'loc_approx': catastrophe['loc_approx']
    }
    if 'city' in catastrophe:
        obj['city'] = catastrophe['city']
    
    pt = geometry.Point(obj['location'])
    for id, shape in district_shapes.items():
        if utils.contains_point(shape, pt):
            obj['district'] = id
            break
    
    result.setdefault(str(catastrophe['date'].year), []).append(obj)

with open(os.path.join(utils.destination_directory, 'catastrophes.json'), 'w', encoding='utf-8') as output_file:
    json.dump(result, output_file)