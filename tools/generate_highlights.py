from genericpath import isfile
import frontmatter
import os
import json
import utils

highlights = []
root_path = os.path.join(utils.source_directory, 'highlights')
for name in os.listdir(root_path):
    full_path = os.path.join(root_path, name)
    if os.path.isfile(full_path):
        with open(full_path, 'r', encoding='utf-8') as input_file:
            file = frontmatter.load(input_file)

            location = file.metadata['location'].split(',')
            highlight = {
                'id': os.path.splitext(name)[0],
                'year': int(file.metadata['year']),
                'location': {
                    'lat': float(location[0]),
                    'lng': float(location[1])
                },
                'locale': file.metadata['locale'],
                'type': file.metadata['type'],
                'body': file.content
            }
            if 'title' in file.metadata:
                highlight['title'] = file.metadata['title']
            highlights.append(highlight)

with open(os.path.join(utils.destination_directory, 'highlights.json'), 'w', encoding='utf-8') as output_file:
    json.dump(highlights, output_file)
