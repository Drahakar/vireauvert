import json
import locale
from turtle import st
import utils
import os

import tools.generate_catastrophes as generate_catastrophes
import tools.generate_meteo_data as generate_meteo_data

locale.setlocale(locale.LC_ALL, 'fr-CA.UTF-8')

catastrophes = generate_catastrophes.collect_all_catastrophes()
temperatures = generate_meteo_data.collect_statistics('temperatures_moy_regions')
precipitations = generate_meteo_data.collect_statistics('precipitations_moy_regions')

years = set().union(catastrophes.keys(), temperatures.keys(), precipitations.keys())

result = {}
for year in years:
    stats = [{
        'avg_temp': x[0],
        'avg_prec': x[1],
    } for x in zip(temperatures.get(year, []), precipitations.get(year, []))]
    result[year] = {
        'catastrophes': catastrophes.get(year, []),
        'statistics': stats
    }

os.makedirs(os.path.join(utils.destination_directory, 'yearly_data'), exist_ok=True)
for key, value in result.items():
    with open(os.path.join(utils.destination_directory, 'yearly_data', '{}.json'.format(key)), 'w', encoding='utf-8') as output_file:
        json.dump(value, output_file)
