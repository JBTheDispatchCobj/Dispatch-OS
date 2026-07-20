#!/usr/bin/env python3
from pathlib import Path
import yaml, sys
root=Path(__file__).resolve().parents[1]
mp=yaml.safe_load((root/'docs/context/CONTEXT_MAP.yaml').read_text())
missing=[]
for f in mp['always']:
    if not (root/f).exists(): missing.append(f)
for pack, files in mp['packs'].items():
    for f in files:
        if not (root/f).exists(): missing.append(f)
if missing:
    print('Missing documentation references:')
    print('\n'.join(sorted(set(missing))))
    sys.exit(1)
print('Documentation references valid.')
