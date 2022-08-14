import json
import locale
from turtle import st
import utils
import os

import generate_catastrophes
import generate_meteo_data

locale.setlocale(locale.LC_ALL, 'fr-CA.UTF-8')

stat_files = {
    'avg_temp': 'temperatures_moy_regions',
    'avg_prec': 'precipitations_moy_regions',
    'avg_liq_prec': 'precipitations_liq_moy_regions',
    'days_above_30': 'nb_jours_plus_30_deg',
    'days_below_min_25': 'nb_jours_moins_25_deg'
}

catastrophes = generate_catastrophes.collect_all_catastrophes()
statistics = { k: generate_meteo_data.collect_statistics(v) for k,v in stat_files.items() }

years = set().union(catastrophes.keys(), *[x.keys() for x in statistics.values()])

result = {}
for year in years:
    year_stats = { str(k): v.get(year, {}) for k,v in statistics.items() }
    region_ids = set().union(*[x.keys() for x in year_stats.values()])
    result[str(year)] = {
        'catastrophes': catastrophes.get(year, []),
        'statistics': { str(id): {str(k): v.get(id, None) for k,v in year_stats.items()} for id in region_ids }
    }

os.makedirs(os.path.join(utils.destination_directory, 'yearly_data'), exist_ok=True)
for key, value in result.items():
    with open(os.path.join(utils.destination_directory, 'yearly_data', '{}.json'.format(key)), 'w', encoding='utf-8') as output_file:
        json.dump(value, output_file)
