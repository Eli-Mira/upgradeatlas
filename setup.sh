#!/bin/bash
set -e
echo "=== Installing upgradeatlas ==="
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
echo "Done. Run: python -m upgradeatlas --help"
