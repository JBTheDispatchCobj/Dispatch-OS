#!/usr/bin/env python3
from pathlib import Path
import sys, yaml

ROOT = Path(__file__).resolve().parents[1]
MAP = yaml.safe_load((ROOT/'docs/context/CONTEXT_MAP.yaml').read_text())

if len(sys.argv) != 2 or sys.argv[1] not in MAP['packs']:
    print('Usage: python scripts/build_context_pack.py <pack>')
    print('Available:', ', '.join(MAP['packs']))
    raise SystemExit(1)

name=sys.argv[1]
files=[]
for f in MAP['always']+MAP['packs'][name]:
    if f not in files: files.append(f)

out=ROOT/'.context'/f'{name}.md'
out.parent.mkdir(exist_ok=True)
parts=[f'# Generated Context Pack: {name}\n']
for rel in files:
    p=ROOT/rel
    parts.append(f'\n---\n\n## FILE: {rel}\n\n{p.read_text()}')
out.write_text(''.join(parts))
print(out)
