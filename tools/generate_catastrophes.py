from enum import Enum, IntEnum
import json
from pydoc import describe
import re
from datetime import datetime
import xml.etree.ElementTree as ET
from os import path
import os
import csv
import zipfile
from bs4 import BeautifulSoup
import locale
import utils
import geojson
from shapely import geometry

def load_cities():
    cities_xml = ET.parse(path.join(utils.source_directory, 'municipalites.xml'))

    def convert_lat_lon(dms):
        deg, minutes, seconds, direction =  re.split('[°\'"]', dms)
        return (float(deg) + float(minutes)/60 + float(seconds)/(60*60)) * (-1 if direction.strip() in ['O', 'S'] else 1)

    cities = {}
    for city in cities_xml.iterfind('./Municipalite'):
        code = city.findtext('Code_municipalite')
        lat = city.findtext('Latitutde')
        lng = city.findtext('Longitude')
        if code and lat and lng:
            cities[code] = [convert_lat_lon(lat), convert_lat_lon(lng)]
    return cities

def load_map() -> dict[int, geometry.base.BaseGeometry]:
    with open(path.join(utils.destination_directory, 'carte_electorale.json'), 'r', encoding='utf-8') as input_file:
        map = geojson.load(input_file)

    districts = {}
    for feature in map['features']:
        shape = geometry.shape(feature['geometry'])
        id = feature['properties']['id']
        districts[id] = shape
    return districts

def contains_point(geo: geometry.base.BaseGeometry, pt: geometry.Point) -> bool:
    if isinstance(geo, geometry.GeometryCollection):
        for sub in geo.geoms:
            if contains_point(sub, pt):
                return True
        return False    
    return geo.contains(pt)

cities = load_cities()
district_shapes = load_map()

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
    StormWinds = "STORM_WINDS"

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
                "date": date,
                "severity": severity
            }
    return None

def parse_old_line(line):
    no,_,date_observation,code_municipalite,nom,_,_,type,severite,_,_ = line

    event = event_types.get(type.lower())
    if event:
        severity = parse_old_severity(severite.upper())
        if severity >= event['min_severity']:
            date = datetime.strptime(date_observation, '%Y/%m/%d %H:%M:%S')
            if date.year >= 2000:
                location = cities.get(code_municipalite)
                if location:
                    return {
                        "id": no,
                        "location": location,
                        "city": nom,
                        "type": event['type'],
                        "date": date,
                        "severity": severity
                    }
    return None

def parse_file(path, catastrophes, parser):
    with open(path, 'r', encoding='utf-8') as input_file:
        reader = csv.reader(input_file)
        next(reader, None)
        for line in reader:
            catastrophe = parser(line)
            if catastrophe:
                catastrophes.append(catastrophe)

def parse_kmz(path, catastrophes):
    namespaces = {'kml': 'http://www.opengis.net/kml/2.2'}
    with zipfile.ZipFile(path, 'r') as zip:
        for zip_entry in zip.filelist:
            if os.path.splitext(zip_entry.filename)[1] == '.kml':
                with zip.open(zip_entry) as doc:
                    kml = ET.parse(doc)
                    for placemark in kml.iterfind('.//kml:Placemark', namespaces):
                        description = placemark.find('kml:description', namespaces)
                        soup = BeautifulSoup(description.text, 'html.parser')
                        tables = soup.find_all('table')
                        properties = {}
                        for row in tables[1].find_all('tr'):
                            [key, value] = row.find_all('td')
                            properties[key.text.strip()] = value.text.strip()

                        severity = Severity.Unknown
                        match locale.atof(properties['SUP_HA']):
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
                                "id": properties['CLE'],
                                "location": [locale.atof(properties['LATITUDE']), locale.atof(properties['LONGITUDE'])],
                                "type": CatastropheType.ForestFire,
                                "date": datetime.strptime(properties['DATE_DEBUT'], '%Y-%m-%d'),
                                "severity": severity
                            }
                            catastrophes.append(fire)

def collect_all_catastrophes():
    catastrophes = []

    parse_file(path.join(utils.source_directory, 'catastrophes_pre2020.csv'), catastrophes, parse_old_line)
    parse_file(path.join(utils.source_directory, 'catastrophes_post2020.csv'), catastrophes, parse_new_line)

    fire_origin_directory = path.join(utils.source_directory, 'Feux_pt_ori')
    for file_path in os.listdir(fire_origin_directory):
        if path.splitext(file_path)[1] == '.kmz':
            parse_kmz(path.join(fire_origin_directory, file_path), catastrophes)

    catastrophes.sort(key=lambda x: x['date'])

    result = {}
    for catastrophe in catastrophes:
        obj = {
            'id': catastrophe['id'],
            'location': catastrophe['location'],
            'type': catastrophe['type'].value,
            'date': catastrophe['date'].isoformat(),
            'severity': catastrophe['severity'].value,
            'district': 0
        }
        if 'city' in catastrophe:
            obj['city'] = catastrophe['city']
        
        pt = geometry.Point(obj['location'][1], obj['location'][0])
        for id, shape in district_shapes.items():
            if contains_point(shape, pt):
                obj['district'] = id
                break
        
        result.setdefault(catastrophe['date'].year, []).append(obj)

    return result
