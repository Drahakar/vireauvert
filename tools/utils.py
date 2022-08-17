import os

current_directory = os.path.dirname(os.path.realpath(__file__))
source_directory = os.path.realpath(os.path.join(current_directory, 'data'))
destination_directory = os.path.realpath(os.path.join(current_directory, '..', 'public', 'data'))