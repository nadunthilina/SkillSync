"""Inference example for SkillSync skill extraction.
Run after training:
  python ml/inference_example.py --model ml/skill-ner-model --text "We need a developer with React, Node.js, and AWS."
Or load from hub:
  python ml/inference_example.py --model your-username/skill-ner-skillsync
"""
import argparse
from transformers import AutoTokenizer, AutoModelForTokenClassification, pipeline

def parse_args():
    p = argparse.ArgumentParser()
    p.add_argument('--model', required=True, help='Local path or hub repo id.')
    p.add_argument('--text', default='We need a developer with React, Node.js, and AWS.')
    return p.parse_args()

def main():
    a = parse_args()
    tokenizer = AutoTokenizer.from_pretrained(a.model)
    model = AutoModelForTokenClassification.from_pretrained(a.model)
    nlp = pipeline('token-classification', model=model, tokenizer=tokenizer, aggregation_strategy='simple')
    ents = nlp(a.text)
    skills = []
    seen = set()
    for e in ents:
        if 'SKILL' in e['entity_group']:
            w = e['word']
            lw = w.lower()
            if lw not in seen:
                seen.add(lw)
                skills.append(w)
    print('Input:', a.text)
    print('Extracted skills:', skills)

if __name__ == '__main__':
    main()
