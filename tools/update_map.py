import locale
from os import path
import os
import json
import kml2geojson
import csv
import utils
import geojson
from shapely import ops
from shapely import geometry

locale.setlocale(locale.LC_ALL, 'fr-CA.UTF-8')

result = kml2geojson.main.convert(path.join(
    utils.source_directory, 'carte2017simple.kml'), 'carte_electorale')[0]

with open(path.join(utils.source_directory, 'liste_circonscriptions2017.csv'), 'r', encoding='utf-8') as input_file:
    reader = csv.reader(input_file, delimiter=';')
    next(reader, None)
    districts = {x[1]: int(x[0]) for x in reader}

for feature in result['features']:
    properties = feature['properties']
    properties['name'] = properties['name'].strip()
    properties['id'] = districts[properties['name']]

polygons = [geometry.shape(f['geometry']) for f in result['features']]
merged: geometry.Polygon = ops.unary_union([p if p.is_valid else p.buffer(0) for p in polygons])

box = geometry.Polygon([(-180, -180), (-180, 180), (180, 180), (180, -180)]).difference(merged)

os.makedirs(utils.destination_directory, exist_ok=True)

with open(path.join(utils.destination_directory, 'carte_electorale.json'), 'w', encoding='utf-8') as output_file:
    json.dump(result, output_file)

with open(path.join(utils.destination_directory, 'masque_electoral.json'), 'w', encoding='utf-8') as output_file:
    geojson.dump(box, output_file)
