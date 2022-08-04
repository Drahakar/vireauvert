import json
import csv
from os import path
import re

current_directory = path.dirname(path.realpath(__file__))
data_directory = path.realpath(path.join(current_directory, '..', 'public', 'data'))

files = ['temperatures_moy_regions', 'precipitations_moy_regions']

region_name_pattern = re.compile('(\d+)', re.I)

for file in files:
    grid = []
    with open(path.join(data_directory, '{}.csv'.format(file)), encoding='utf-8') as input_file:
        reader = csv.reader(input_file)
        
        next(reader, None)
        for line in reader:
            grid.append([float(value) if value else None for value in line[1:]])

    regions = [None] * 17
    for i in range(len(regions)):
        regions[i] = [grid[j][i] for j in range(len(grid))]

    with open(path.join(data_directory, '{}.json'.format(file)), 'w', encoding='utf-8') as output_file:
        json.dump(regions, output_file)
