import encodings
from os import path
import json
import kml2geojson
import csv
import utils
import geojson
import geojson.mapping
from shapely import ops
from shapely import geometry
import copy

result = kml2geojson.main.convert(path.join(
    utils.source_directory, 'carte_simple.kml'), 'carte_electorale')[0]

with open(path.join(utils.source_directory, 'liste_circonscriptions.csv'), 'r', encoding='utf-8') as input_file:
    reader = csv.reader(input_file, delimiter=';')
    next(reader, None)
    districts = {x[1]: int(x[0]) for x in reader}

for feature in result['features']:
    properties = feature['properties']
    properties['name'] = properties['name'].strip()
    properties['id'] = districts[properties['name']]

ungava_index = next(i for i, v in enumerate(result['features']) if v['properties']['id'] == utils.UNGAVA_ID)
ungava_shape = geometry.shape(result['features'][ungava_index]['geometry'])
[north_geo, south_geo] = ops.split(
    ungava_shape, geometry.LineString([(-180, 55), (180, 55)])).geoms

ungava_north = result['features'][ungava_index]
ungava_south = copy.deepcopy(ungava_north)
result['features'].insert(ungava_index, ungava_south)

ungava_north['geometry'] = geojson.mapping.to_mapping(north_geo)
ungava_north['properties']['name'] = 'Ungava (Nunavik)'
ungava_south['geometry'] = geojson.mapping.to_mapping(south_geo)
ungava_south['properties']['name'] = 'Ungava (Jamésie)'
ungava_south['properties']['id'] = ungava_north['properties']['id'] + 1

district_map = {str(id): name for name, id in districts.items()}
district_map[str(ungava_north['properties']['id'])] = ungava_north['properties']['name']
district_map[str(ungava_south['properties']['id'])] = ungava_south['properties']['name']

polygons = [geometry.shape(f['geometry']) for f in result['features']]
merged: geometry.Polygon = ops.unary_union(
    [p if p.is_valid else p.buffer(0) for p in polygons])

box = geometry.Polygon(
    [(-180, -180), (-180, 180), (180, 180), (180, -180)]).difference(merged)

with open(path.join(utils.destination_directory, '..', '..', 'src', 'models', 'districts.json'), 'w', encoding='utf-8') as output_file:
    json.dump(district_map, output_file)
with open(path.join(utils.destination_directory, 'carte_electorale.json'), 'w', encoding='utf-8') as output_file:
    json.dump(result, output_file)
with open(path.join(utils.destination_directory, 'masque_electoral.json'), 'w', encoding='utf-8') as output_file:
    geojson.dump(box, output_file)
