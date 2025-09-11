# PowerShell helper to set up Python venv and install requirements
python -m venv .venv
. .venv/Scripts/Activate.ps1
pip install --upgrade pip
pip install -r ml/requirements.txt
