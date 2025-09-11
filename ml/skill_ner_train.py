"""SkillSync Skill NER fine-tuning script.

Usage (PowerShell):
  python -m venv .venv; .venv/Scripts/Activate.ps1
  pip install -r requirements.txt
  python ml/skill_ner_train.py --data skills_data.jsonl --base distilbert-base-uncased --epochs 5 --hub-repo your-username/skill-ner-skillsync --push

Input data format (JSON lines):
{"text": "We need React and AWS.", "skills": ["React","AWS"]}

Produces directory ml/skill-ner-model with trained weights.
"""
from __future__ import annotations
# pyright: reportMissingImports=false
import argparse, json, re, os, sys
from pathlib import Path
from typing import List, Tuple

# --- Dependency checks (gives clearer message if environment not set up) ---
MISSING = []
try:
    import datasets  # type: ignore
    from datasets import load_dataset, DatasetDict  # type: ignore
except Exception as e:  # pragma: no cover
    MISSING.append("datasets")
try:
    from transformers import (AutoTokenizer, AutoModelForTokenClassification,
                              DataCollatorForTokenClassification, TrainingArguments, Trainer)  # type: ignore
except Exception:
    MISSING.append("transformers")
try:
    import numpy as np  # type: ignore
except Exception:
    MISSING.append("numpy")
try:
    import evaluate  # type: ignore
except Exception:
    MISSING.append("evaluate")

if MISSING:
    msg = (
        "\nMissing required packages: " + ", ".join(MISSING) +
        "\nInstall with (PowerShell):\n  . .venv/Scripts/Activate.ps1 (if not active)\n  pip install " + " ".join(MISSING) +
        "\nOr: pip install -r ml/requirements.txt\n" )
    print(msg, file=sys.stderr)
    raise SystemExit(1)

LABEL_LIST = ["O","B-SKILL","I-SKILL"]
LABEL_TO_ID = {l:i for i,l in enumerate(LABEL_LIST)}
ID_TO_LABEL = {i:l for l,i in LABEL_TO_ID.items()}


def parse_args():
    p = argparse.ArgumentParser()
    p.add_argument('--data', required=True, help='Path to JSONL or CSV data file.')
    p.add_argument('--base', default='distilbert-base-uncased', help='Base HF model.')
    p.add_argument('--epochs', type=int, default=5)
    p.add_argument('--batch', type=int, default=8)
    p.add_argument('--lr', type=float, default=5e-5)
    p.add_argument('--max-length', type=int, default=384)
    p.add_argument('--seed', type=int, default=42)
    p.add_argument('--output', default='ml/skill-ner-model')
    p.add_argument('--hub-repo', default=None, help='Hub repo name (user/repo).')
    p.add_argument('--push', action='store_true', help='Push to hub.')
    return p.parse_args()


def parse_skills_list(sk):
    if isinstance(sk, list):
        return sk
    if isinstance(sk, str):
        s = sk.strip()
        if not s:
            return []
        if s.startswith('['):
            try:
                return json.loads(s)
            except Exception:
                pass
        if ';' in s:
            return [x.strip() for x in s.split(';') if x.strip()]
        if ',' in s:
            return [x.strip() for x in s.split(',') if x.strip()]
        return [s]
    return []


def find_skill_spans(text: str, skills: List[str]) -> List[Tuple[int,int]]:
    spans: List[Tuple[int,int]] = []
    norm = text.lower()
    for skill in sorted({s for s in skills if s}, key=len, reverse=True):
        pattern = re.escape(skill.lower())
        for m in re.finditer(pattern, norm):
            s,e = m.start(), m.end()
            if any(not (e <= s2 or s >= e2) for s2,e2 in spans):
                continue
            spans.append((s,e))
    return spans


def char_labels(text: str, spans: List[Tuple[int,int]]):
    labels = ['O'] * len(text)
    for s,e in spans:
        if s < e <= len(text):
            labels[s] = 'B-SKILL'
            for i in range(s+1,e):
                labels[i] = 'I-SKILL'
    return labels


def add_bio(example):
    spans = find_skill_spans(example['text'], example['skills'])
    example['char_labels'] = char_labels(example['text'], spans)
    return example


def align(example, tokenizer, max_length):
    enc = tokenizer(example['text'], max_length=max_length, truncation=True, return_offsets_mapping=True)
    labels = []
    chars = example['char_labels']
    for (start,end) in enc['offset_mapping']:
        if start == end:
            labels.append(-100)
            continue
        if start < len(chars) and chars[start] != 'O':
            lab = chars[start]
        else:
            inside = [chars[i] for i in range(start, min(end, len(chars))) if chars[i] != 'O']
            lab = inside[0] if inside else 'O'
        labels.append(LABEL_TO_ID[lab])
    enc['labels'] = labels
    enc.pop('offset_mapping')
    return enc


def compute_metrics(eval_pred):
    predictions, labels = eval_pred
    predictions = np.argmax(predictions, axis=-1)
    seqeval_metric = evaluate.load('seqeval')
    true_preds, true_labels = [], []
    for p_seq, l_seq in zip(predictions, labels):
        p_out, l_out = [], []
        for p_i, l_i in zip(p_seq, l_seq):
            if l_i == -100:
                continue
            p_out.append(ID_TO_LABEL[p_i])
            l_out.append(ID_TO_LABEL[l_i])
        true_preds.append(p_out)
        true_labels.append(l_out)
    r = seqeval_metric.compute(predictions=true_preds, references=true_labels)
    return { 'precision': r['overall_precision'], 'recall': r['overall_recall'], 'f1': r['overall_f1'], 'accuracy': r['overall_accuracy'] }


def main():
    args = parse_args()
    data_files = {'all': args.data}
    ext = Path(args.data).suffix.lower()
    if ext == '.csv':
        raw = load_dataset('csv', data_files=data_files)
    else:
        raw = load_dataset('json', data_files=data_files)
    raw = raw.map(lambda ex: {'skills': parse_skills_list(ex['skills'])})
    split = raw['all'].train_test_split(test_size=0.2, seed=args.seed)
    ds = DatasetDict({'train': split['train'], 'test': split['test']})
    ds = ds.map(add_bio)
    tokenizer = AutoTokenizer.from_pretrained(args.base, use_fast=True)
    tokenized = ds.map(lambda ex: align(ex, tokenizer, args.max_length), remove_columns=ds['train'].column_names, desc='Tokenizing')
    model = AutoModelForTokenClassification.from_pretrained(args.base, num_labels=len(LABEL_LIST), id2label=ID_TO_LABEL, label2id=LABEL_TO_ID)
    collator = DataCollatorForTokenClassification(tokenizer)
    training_args = TrainingArguments(
        output_dir=args.output,
        evaluation_strategy='epoch',
        save_strategy='epoch',
        logging_strategy='steps',
        logging_steps=100,
        num_train_epochs=args.epochs,
        per_device_train_batch_size=args.batch,
        per_device_eval_batch_size=args.batch*2,
        learning_rate=args.lr,
        weight_decay=0.01,
        seed=args.seed,
        load_best_model_at_end=True,
        metric_for_best_model='f1',
        greater_is_better=True,
        report_to='none'
    )
    trainer = Trainer(model=model, args=training_args, train_dataset=tokenized['train'], eval_dataset=tokenized['test'], tokenizer=tokenizer, data_collator=collator, compute_metrics=compute_metrics)
    trainer.train()
    metrics = trainer.evaluate()
    print('Eval:', metrics)
    Path(args.output).mkdir(parents=True, exist_ok=True)
    trainer.save_model(args.output)
    tokenizer.save_pretrained(args.output)
    if args.push and args.hub_repo:
        model.push_to_hub(args.hub_repo)
        tokenizer.push_to_hub(args.hub_repo)

if __name__ == '__main__':
    main()
