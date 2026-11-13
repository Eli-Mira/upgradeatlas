@echo off
echo === Installing upgradeatlas ===
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
echo Done. Run: python -m upgradeatlas --help
