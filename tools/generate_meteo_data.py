import json
import csv
from os import path
import re
import os
import utils

region_name_pattern = re.compile('(\d+)', re.I)

def collect_statistics(name):
    result = {}
    with open(path.join(utils.source_directory, '{}.csv'.format(name)), encoding='utf-8') as input_file:
        reader = csv.reader(input_file)
        
        next(reader, None)
        for line in reader:
            match = re.match('(\d+)', line[0])
            if match:
                result[int(match.group(1))] = [float(value) if value else None for value in line[1:]]
    return result
