from os import path
import json
import xml.etree.ElementTree as ET
import kml2geojson
import csv

current_directory = path.dirname(path.realpath(__file__))
data_directory = path.realpath(
    path.join(current_directory, '..', 'public', 'data'))

result = kml2geojson.main.convert(path.join(data_directory, 'carte2017simple.kml'), data_directory)[0]

with open(path.join(data_directory, 'liste_circonscriptions2017.csv'), 'r', encoding='utf-8') as input_file:
    reader = csv.reader(input_file, delimiter=';')
    next(reader, None)
    districts = {x[1]: x[0] for x in reader}

for feature in result['features']:
    properties = feature['properties']
    properties['name'] = properties['name'].strip()
    properties['id'] = districts[properties['name']]
with open(path.join(data_directory, 'carte_electorale.json'), 'w', encoding='utf-8') as output_file:
    json.dump(result, output_file)