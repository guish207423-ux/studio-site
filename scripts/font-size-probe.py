"""Compare two Noto Sans SC subsetting strategies and report payload sizes.

A) keep full shard (current @fontsource behaviour): a unicode-range shard is
   either in the bundle or it isn't.
B) keep only the codepoints the site actually uses, one unicode-range per shard
   but narrowed to those codepoints -> the .woff2 files still ship whole, so B
   does NOT reduce bytes. It only reduces the number of @font-face rules.

So the only real lever on bytes is which *files* ship. Report that.
"""
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PKG = os.path.join(ROOT, 'node_modules/@fontsource-variable/noto-sans-sc')
FILES = os.path.join(PKG, 'files')

BLOCK = re.compile(r'@font-face\s*\{(.*?)\}', re.S)


def parse(path):
    css = open(path, encoding='utf-8').read()
    out = []
    for m in BLOCK.finditer(css):
        body = m.group(1)
        url = re.search(r'url\(([^)]+)\)', body)
        rng = re.search(r'unicode-range:\s*([^;]+);', body)
        if url and rng:
            out.append({
                'file': os.path.basename(url.group(1).strip('"\'')),
                'range': rng.group(1).strip(),
            })
    return out


def ranges_of(rng):
    for m in re.finditer(r'U\+([0-9a-fA-F]+)(?:-([0-9a-fA-F]+))?', rng):
        lo = int(m.group(1), 16)
        hi = int(m.group(2), 16) if m.group(2) else lo
        yield lo, hi


def collect_chars():
    chars = set()
    for base in ('src', 'public'):
        for dirpath, _, files in os.walk(os.path.join(ROOT, base)):
            for f in files:
                if f.endswith(('.tsx', '.ts', '.css', '.html', '.js')):
                    text = open(os.path.join(dirpath, f), encoding='utf-8').read()
                    chars.update(c for c in text if ord(c) > 0x2000)
    text = open(os.path.join(ROOT, 'index.html'), encoding='utf-8').read()
    chars.update(c for c in text if ord(c) > 0x2000)
    return chars


shards = parse(os.path.join(PKG, 'wght.css'))
chars = collect_chars()

used_shards = []
for s in shards:
    if any(lo <= ord(c) <= hi for c in chars for lo, hi in ranges_of(s['range'])):
        used_shards.append(s)

total = sum(os.path.getsize(os.path.join(FILES, s['file'])) for s in shards)
used = sum(os.path.getsize(os.path.join(FILES, s['file'])) for s in used_shards)

print(f'shards: {len(used_shards)}/{len(shards)} used')
print(f'bytes:  {used/1024/1024:.2f} MB / {total/1024/1024:.2f} MB')
print(f'saving: {(total-used)/1024/1024:.2f} MB ({(total-used)/total*100:.0f}%)')

# how many of the used shards are tiny (punctuation / symbols vs CJK)?
print()
print('per-shard size, used only:')
for s in sorted(used_shards, key=lambda s: os.path.getsize(os.path.join(FILES, s['file']))):
    sz = os.path.getsize(os.path.join(FILES, s['file']))
    print(f'  {s["file"]:46s} {sz/1024:7.1f} KB')
