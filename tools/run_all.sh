#!/bin/bash
cd "${0%/*}"

python -m venv .venv
source  .venv/bin/activate

echo "Installing dependencies..."
pip --disable-pip-version-check install -r requirements.txt > NUL

echo "Generating map data..."
python update_map.py
echo "Generating candidates..."
python generate_candidates.py
echo "Generating catastrophes..."
python generate_catastrophes.py
echo "Generating statistics..."
python generate_meteo_data.py

echo "Done"

deactivate