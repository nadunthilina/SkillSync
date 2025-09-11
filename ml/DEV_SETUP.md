# SkillSync ML Dev Setup

1. Create / activate venv (PowerShell):
```
python -m venv .venv
. .venv/Scripts/Activate.ps1
pip install --upgrade pip
pip install -r ml/requirements.txt
```
2. In VS Code select interpreter: Command Palette > Python: Select Interpreter > choose .venv.
3. Reload window if imports still unresolved.
4. (Optional) GPU wheel example (CUDA 12.1):
```
pip install torch --index-url https://download.pytorch.org/whl/cu121
```
5. Run training:
```
python ml/skill_ner_train.py --data skills_data.jsonl --epochs 3
```

If Pylance still flags missing imports after install, ensure the workspace trust is enabled and that `.vscode/settings.json` points to `.venv`.