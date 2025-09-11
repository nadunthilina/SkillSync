# SkillSync Skill Extraction (NER)

This module fine-tunes a Hugging Face Transformer to tag skill mentions in job / profile text.

## Data Format
JSON Lines (`skills_data.jsonl`):
```json
{"text": "Looking for a developer skilled in React and AWS Lambda.", "skills": ["React", "AWS Lambda"]}
{"text": "Strong Node.js, PostgreSQL, and Docker experience.", "skills": ["Node.js", "PostgreSQL", "Docker"]}
```
You may also provide a CSV with columns: `text, skills` where `skills` is a JSON list or semi-colon/comma separated string.

## Quick Start
```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r ml/requirements.txt
# Prepare your data file skills_data.jsonl in project root (or elsewhere)
python ml/skill_ner_train.py --data skills_data.jsonl --base distilbert-base-uncased --epochs 5 --hub-repo your-username/skill-ner-skillsync --push
```
(omit `--push` if you do not want to upload to Hugging Face Hub).

## Inference
```powershell
python ml/inference_example.py --model ml/skill-ner-model --text "We need a developer with React, Node.js, and AWS."
```
Or load from the Hub (after pushing):
```powershell
python ml/inference_example.py --model your-username/skill-ner-skillsync
```

## Customization
- Adjust `--max-length` for longer descriptions.
- Increase `--epochs` or switch `--base` to a larger model (e.g., `bert-base-cased`).
- Extend entity set: modify `LABEL_LIST` in `skill_ner_train.py` and adapt BIO generation.

## Notes
- Simple span match heuristic builds labels; ensure skill strings appear verbatim in text (case-insensitive).
- To improve recall for variations (e.g., "React.js" vs "React"), add both forms to `skills` list or introduce normalization in preprocessing.
- For extremely long job posts consider splitting text and aggregating extracted skills.

## License
Adapts open-source Hugging Face tooling; review upstream model licenses before distribution.
