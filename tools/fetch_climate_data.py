import os
import csv
import subprocess
import sys
import utils
from datetime import datetime
import unicodedata
import string


def chunks(lst, n):
    for i in range(0, len(lst), n):
        yield lst[i:i + n]


climate_directory = os.path.join(utils.source_directory, 'raw_climate_data')
os.makedirs(climate_directory, exist_ok=True)

cities = []

with open(os.path.join(utils.source_directory, 'municipalites.csv'), 'r', encoding='utf-8') as input_file:
    reader = csv.reader(input_file)
    next(reader, None)
    for line in reader:
        name = line[1]
        normalized = ''.join(x for x in unicodedata.normalize(
            'NFKD', name) if x in string.ascii_letters).replace('-', ' ').lower()
        cities.append((normalized, name))

stations = {}

with open(os.path.join(utils.source_directory, 'climate_station_list.csv'), 'r', encoding='utf-8') as input_file:
    reader = csv.reader(input_file)
    next(reader, None)
    for line in reader:
        raw_name, province, lat, lng, alt, clim_id, wmo_id, tc_id, fyr, lyr, hfyr, hlyr, dfyr, dlyr, mfyr, mlyr = line
        if province != 'QUEBEC':
            continue
        if not dfyr or not dlyr or int(dlyr) < utils.MIN_YEAR:
            continue

        name = next((x[1] for x in cities if raw_name.lower().startswith(x[0])), '')
        stations[clim_id] = {
            'name': name,
            'loc': [float(lng), float(lat)],
            'start': max(int(dfyr), utils.MIN_YEAR),
            'end': int(dlyr)
        }

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36'}

script_path = os.path.join(utils.current_directory,
                           'fetch_climate_data_station.py')

for chunk in chunks(list(stations.keys()), 8):
    processes = []
    for station_id in chunk:
        dest_path = os.path.join(
            climate_directory, '{}.csv'.format(station_id))
        if os.path.isfile(dest_path):
            continue
        temp_path = dest_path + '.tmp'
        station = stations[station_id]
        args = [sys.executable, script_path, station_id, str(
            station['start']), str(station['end']), temp_path]
        process = subprocess.Popen(args)
        processes.append((process, temp_path, dest_path))

    for (process, temp_path, dest_path) in processes:
        if process.wait() == 0:
            os.rename(temp_path, dest_path)
        else:
            os.unlink(temp_path)

with open(os.path.join(utils.source_directory, 'heat_waves.csv'), 'w', encoding='utf-8') as output_file:
    output_file.write('Nom,Longitude,Latitude,Date de départ,Durée en jours\n')
    for station_id, station in stations.items():
        with open(os.path.join(climate_directory, '{}.csv'.format(station_id)), 'r', encoding='utf-8') as input_file:
            reader = csv.reader(input_file)
            readings = []
            for line in reader:
                _, _, _, _, _, year, month, day, _, max_temp, _, min_temp, _, mean_temp, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _ = line
                if not max_temp:
                    continue

                date = datetime(int(year), int(month), int(day))
                readings.append((date, float(max_temp)))

        readings.sort(key=lambda x: x[0])

        heat_wave_start = None
        heat_wave_length = 0
        for i in range(1, len(readings)):
            last_reading = readings[i - 1]
            reading = readings[i]

            if abs(last_reading[0].toordinal() - reading[0].toordinal()) > 1 or reading[1] < 30:
                if heat_wave_length >= 3 and heat_wave_start is not None:
                    output_file.write('"{}",{},{},{},"{}",{}\n'.format(
                        station['name'], station_id, station['loc'][0], station['loc'][1], heat_wave_start.strftime('%Y-%m-%d'), heat_wave_length))
                heat_wave_length = 0
            else:
                if heat_wave_length == 0:
                    heat_wave_start = reading[0]
                heat_wave_length += 1

        if heat_wave_length >= 3 and heat_wave_start is not None:
            output_file.write('"{}",{},{},{},"{}",{}\n'.format(
                station['name'], station_id, station['loc'][0], station['loc'][1], heat_wave_start.strftime('%Y-%m-%d'), heat_wave_length))
