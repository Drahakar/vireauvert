from os import path
from shapely import geometry
import geojson

UNGAVA_ID = 938
MIN_YEAR = 1990

current_directory = path.dirname(path.realpath(__file__))
source_directory = path.realpath(path.join(current_directory, 'data'))
destination_directory = path.realpath(path.join(current_directory, '..', 'public', 'data'))

def load_map() -> dict[int, geometry.base.BaseGeometry]:
    with open(path.join(destination_directory, 'carte_electorale.json'), 'r', encoding='utf-8') as input_file:
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

