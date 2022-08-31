from urllib import request
import sys

station_id = sys.argv[1]
year_start = int(sys.argv[2])
year_end = int(sys.argv[3])
target_directory = sys.argv[4]

HEADERS = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36'}

with open(target_directory, 'w', encoding='utf-8') as output_file:
    for year in range(year_start, year_end + 1):
        for month in range(1, 13):
            url = 'https://dd.weather.gc.ca/climate/observations/daily/csv/QC/climate_daily_QC_{}_{}-{:02d}_P1D.csv'.format(station_id, year, month)
            req = request.Request(url, headers=HEADERS)
            try:
                with request.urlopen(req) as response:
                    data = response.read().decode('latin1').splitlines(True)[1:]
                    output_file.writelines(data[1:])
                    output_file.flush()

            except request.HTTPError as ex:
                if ex.code != 404:
                    raise