from os import path

current_directory = path.dirname(path.realpath(__file__))
source_directory = path.realpath(path.join(current_directory, 'data'))
destination_directory = path.realpath(path.join(current_directory, '..', 'public', 'data'))