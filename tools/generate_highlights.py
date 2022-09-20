import frontmatter
import os
import json
import re
import utils

LOCATION_PATTERN = re.compile('(-?\d+\.\d+)')

highlights = []
root_path = os.path.join(utils.source_directory, 'highlights')
for name in os.listdir(root_path):
    full_path = os.path.join(root_path, name)
    if os.path.isfile(full_path):
        with open(full_path, 'r', encoding='utf-8') as input_file:
            file = frontmatter.load(input_file)

            location = LOCATION_PATTERN.findall(file.metadata['location'])
            highlight = {
                'id': os.path.splitext(name)[0],
                'year': int(file.metadata['year']),
                'location': {
                    'lat': float(location[0]),
                    'lng': float(location[1])
                },
                'locale': file.metadata['locale'],
                'type': file.metadata['type'] if 'type' in file.metadata else 'UNKNOWN',
                'body': file.content
            }
            if 'title' in file.metadata:
                highlight['title'] = file.metadata['title']
            highlights.append(highlight)

with open(os.path.join(utils.destination_directory, 'highlights.json'), 'w', encoding='utf-8') as output_file:
    json.dump(highlights, output_file)
