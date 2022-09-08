import os
import csv
import multiprocessing
import utils
from datetime import datetime, timedelta
import unicodedata
import string
from urllib import request

climate_directory = os.path.join(utils.source_directory, 'raw_climate_data')
os.makedirs(climate_directory, exist_ok=True)


def months_between(start_date, end_date):
    if end_date <= start_date:
        return

    year = start_date.year
    month = start_date.month

    while (year, month) <= (end_date.year, end_date.month):
        yield datetime(year, month, 1)
        if month >= 12:
            month = 1
            year += 1
        else:
            month += 1


def download_data_for_station(station_id, start, end):
    destination_path = os.path.join(
        climate_directory, '{}.csv'.format(station_id))
    records: dict[datetime, list[str]] = {}
    try:
        with open(destination_path, 'r', encoding='utf-8') as input_file:
            latest = None
            reader = csv.reader(input_file)
            for line in reader:
                date = datetime.strptime(line[4], '%Y-%m-%d')
                if latest is None or date > latest:
                    latest = date
                records[date] = line
            if latest is not None and latest > start:
                start = latest + timedelta(days=1)
            if start >= end:
                return
    except OSError:
        pass

    has_new_data = False
    HEADERS = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36'}
    for poll_date in months_between(start, end):
        url = 'https://dd.weather.gc.ca/climate/observations/daily/csv/QC/climate_daily_QC_{}_{}-{:02d}_P1D.csv'.format(
            station_id, poll_date.year, poll_date.month)
        req = request.Request(url, headers=HEADERS)
        try:
            with request.urlopen(req) as response:
                reader = csv.reader(response.read().decode('latin1').splitlines())
                next(reader, None)
                for line in reader:
                    date = datetime.strptime(line[4], '%Y-%m-%d')
                    if date not in records:
                        records[date] = line
                        has_new_data = True
        except request.HTTPError as ex:
            if ex.code != 404:
                raise

    if has_new_data:
        records = { key: records[key] for key in sorted(records.keys()) }
        with open(destination_path, 'w', encoding='utf-8', newline='') as output_file:
            writer = csv.writer(output_file)
            writer.writerows(records.values())


if __name__ == '__main__':
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

            name = next(
                (x[1] for x in cities if raw_name.lower().startswith(x[0])), '')
            stations[clim_id] = {
                'name': name,
                'loc': [float(lng), float(lat)],
                'start': datetime(max(int(dfyr), utils.MIN_YEAR), 1, 1),
                'end': min(datetime(int(dlyr), 12, 31), datetime.now())
            }

    script_path = os.path.join(
        utils.current_directory, 'fetch_climate_data_station.py')

    with multiprocessing.Pool(processes=8) as pool:
        inputs = ((k, v['start'], v['end']) for k, v in stations.items())
        pool.starmap(download_data_for_station, inputs)

    with open(os.path.join(utils.source_directory, 'heat_waves.csv'), 'w', encoding='utf-8', newline='') as output_file:
        writer = csv.writer(output_file)
        writer.writerow(['Nom','Longitude','Latitude','Date de départ','Durée en jours'])
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
                        writer.writerow([station['name'], station_id, station['loc'][0], station['loc'][1], heat_wave_start.strftime('%Y-%m-%d'), heat_wave_length])
                    heat_wave_length = 0
                else:
                    if heat_wave_length == 0:
                        heat_wave_start = reading[0]
                    heat_wave_length += 1

            if heat_wave_length >= 3 and heat_wave_start is not None:
                writer.writerow([station['name'], station_id, station['loc'][0], station['loc'][1], heat_wave_start.strftime('%Y-%m-%d'), heat_wave_length])
