import csv
import os
import json
import locale
import utils
import re

locale.setlocale(locale.LC_ALL, 'fr_CA.UTF-8')

phone_pattern = re.compile(
    '^(?:\+?1[-. ]?)?\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$')

districts = {}

with open(os.path.join(utils.source_directory, 'liste_circonscriptions2017.csv'), encoding='utf-8') as input_file:
    reader = csv.reader(input_file, delimiter=';')
    next(reader, None)
    for [id, name] in reader:
        districts[name.lower()] = int(id)


def get_party(party_name):
    match party_name.lower():
        case 'caq':
            return 'CAQ'
        case 'parti libéral':
            return 'PLQ'
        case 'parti québécois':
            return 'PQ'
        case 'québec solidaire':
            return 'QS'
        case 'climat québec':
            return 'CQ'
        case 'pati conservateur':
            return 'PCQ'
        case 'parti vert':
            return 'PV'
    return None


party_leaders = [
    {'party': 'CAQ', 'district': 554},
    {'party': 'PLQ', 'district': 326},
    {'party': 'PQ', 'district': 370},
    {'party': 'QS', 'district': 346},
    {'party': 'CQ', 'district': 246},
    {'party': 'PCQ', 'district': 754},
    #{ 'party': 'PV', 'district': 0 },
]


def format_phone(phone):
    match = phone_pattern.search(phone)
    if match:
        return '+1{}{}{}'.format(
            match.group(1),
            match.group(2),
            match.group(3),
        )
    return None


candidates = []
with open(os.path.join(utils.source_directory, 'candidatures.csv'), encoding='utf-8') as input_file:
    reader = csv.reader(input_file)
    next(reader, None)

    for line in reader:
        _,district,party,name,_,facebook,_,_,_ = line
        if not name:
            continue
        district_id = districts.get(district.strip().lower(), None)
        if district_id is None:
            continue
        party_id = get_party(party.strip())
        if party_id is None:
            continue

        candidate = {
            'name': name.strip(),
            'party': party_id,
            'district': district_id
        }
        if facebook:
            candidate['facebook'] = facebook.strip()
        candidates.append(candidate)

for leader in party_leaders:
    candidate = next(filter(lambda x: x['party'] == leader['party']
                     and x['district'] == leader['district'], candidates), None)
    if candidate:
        copy = {
            **candidate,
            'district': 0
        }
        candidates.append(copy)

candidates.sort(key=lambda x: locale.strxfrm(x['name']))

os.makedirs(utils.destination_directory, exist_ok=True)
with open(os.path.join(utils.destination_directory, 'candidates.json'), 'w', encoding='utf-8') as output_file:
    json.dump(candidates, output_file)
