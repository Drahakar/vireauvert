from os import path
import json
import xml.etree.ElementTree as ET
import kml2geojson
import csv
import utils

result = kml2geojson.main.convert(path.join(utils.source_directory, 'carte2017simple.kml'), 'carte_electorale')[0]

with open(path.join(utils.source_directory, 'liste_circonscriptions2017.csv'), 'r', encoding='utf-8') as input_file:
    reader = csv.reader(input_file, delimiter=';')
    next(reader, None)
    districts = {x[1]: int(x[0]) for x in reader}

for feature in result['features']:
    properties = feature['properties']
    properties['name'] = properties['name'].strip()
    properties['id'] = districts[properties['name']]
with open(path.join(utils.destination_directory, 'carte_electorale.json'), 'w', encoding='utf-8') as output_file:
    json.dump(result, output_file)