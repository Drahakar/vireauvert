import json
import csv
from os import path
import re
import utils

number_pattern = re.compile('(\d+)')

def parse_header(header):
    match = number_pattern.search(header)
    if match:
        return int(match.group(1), 10)
    return 0

def collect_statistics(name):
    result = {}
    with open(path.join(utils.source_directory, '{}.csv'.format(name)), encoding='utf-8') as input_file:
        reader = csv.reader(input_file)
        
        headers = [parse_header(x) for x in next(reader, None)[1:]]
            
        for line in reader:
            match = number_pattern.search(line[0])
            if match:
                result[int(match.group(1))] = { headers[i]: (float(v) if v else None) for i, v in enumerate(line[1:]) }
    return result
