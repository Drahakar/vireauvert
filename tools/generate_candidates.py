import csv
import os
import json
import locale
import utils

locale.setlocale(locale.LC_ALL,'fr-CA.UTF-8')

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

candidates = []
with open(os.path.join(utils.source_directory, 'candidatures.csv'), encoding='utf-8') as input_file:
    reader = csv.reader(input_file)
    next(reader, None)

    for line in reader:
        _,district,party,name,email,facebook,phone,twitter,address = line
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
        if email:
            candidate['email'] = email.strip()
        if phone:
            candidate['phone'] = phone.strip()
        if address:
            candidate['address'] = address.strip()
        if facebook:
            candidate['facebook'] = facebook.strip()
        if twitter:
            candidate['twitter'] = twitter.strip()
        candidates.append(candidate)

candidates.sort(key=lambda x: locale.strxfrm(x['name']))
with open(os.path.join(utils.destination_directory, 'candidates.json'), 'w', encoding='utf-8') as output_file:
    json.dump(candidates, output_file)



