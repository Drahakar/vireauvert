import json
import csv
from os import path
import re
import utils
import os


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
                values = {}
                for i, v in enumerate(line[1:]):
                    if v:
                        values[headers[i]] = float(v)
                result[int(match.group(1))] = values
    return result


stat_files = {
    'avg_temp': ['temperatures_moy_regions', 'temperatures_moy_circs'],
    'avg_prec': ['precipitations_moy_regions', 'precipitations_moy_circs'],
    'days_above_30': ['nb_jours_plus_30_deg'],
    'days_below_min_25': ['nb_jours_moins_25_deg_regions', 'nb_jours_moins_25_deg_circs']
}

result = {}

for prop, file_names in stat_files.items():
    for file_name in file_names:
        for year, statistics in collect_statistics(file_name).items():
            for_year: dict = result.setdefault(year, {})
            for region, value in statistics.items():
                for_region = for_year.setdefault(str(region), {})
                for_region[prop] = value

ref_year = result[1990]

all_stats = {}
first_above_1_5 = {}

for year, data in result.items():
    for region, statistics in data.items():
        if region in ref_year:
            temp_delta = statistics['avg_temp'] - \
                ref_year[region]['avg_temp']
            statistics['temp_delta'] = temp_delta
            if region not in first_above_1_5 and temp_delta >= 1.5:
                first_above_1_5[region] = year
    all_stats[str(year)] = data

output = {
    'statistics': all_stats,
    'over_target': first_above_1_5
}
with open(os.path.join(utils.destination_directory, 'statistics.json'), 'w', encoding='utf-8') as output_file:
    json.dump(output, output_file)
