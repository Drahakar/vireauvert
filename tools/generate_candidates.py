import csv
import os
import json
import locale
import utils
import re

locale.setlocale(locale.LC_ALL, 'fr-CA.UTF-8')

phone_pattern = re.compile(
    '^(?:\+?1[-. ]?)?\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$')

districts = {}

with open(os.path.join(utils.source_directory, 'liste_circonscriptions.csv'), encoding='utf-8') as input_file:
    reader = csv.reader(input_file, delimiter=';')
    next(reader, None)
    for [id, name] in reader:
        districts[name.lower()] = int(id)
    districts['bourget'] = districts['camille-laurin']


def get_party(party_name):
    match party_name.lower():
        case 'coalition avenir québec':
            return 'CAQ'
        case 'parti libéral':
            return 'PLQ'
        case 'parti québécois':
            return 'PQ'
        case 'québec solidaire':
            return 'QS'
        case 'climat québec':
            return 'CQ'
        case 'parti conservateur':
            return 'PCQ'
        case 'parti vert':
            return 'PV'
    return None


party_leaders = [
    {'party': 'CAQ', 'district': 554},
    {'party': 'PLQ', 'district': 326},
    {'party': 'PQ', 'district': 370},
    {'party': 'QS', 'district': 346},
    {'party': 'PCQ', 'district': 754},
]


candidates = []
with open(os.path.join(utils.source_directory, 'candidatures.csv'), encoding='utf-8') as input_file:
    reader = csv.reader(input_file)
    next(reader, None)  # "Dernière modification le..."
    next(reader, None)  # En-têtes de colonnes

    for line in reader:
        _, district, party, name, _, facebook, _, _, _ = line
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

        if district_id == utils.UNGAVA_ID:
            ungava_clone = candidate.copy()
            ungava_clone['district'] = district_id + 1
            candidates.append(ungava_clone)

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
with open(os.path.join(utils.destination_directory, 'candidates.json'), 'w', encoding='utf-8') as output_file:
    json.dump(candidates, output_file)
