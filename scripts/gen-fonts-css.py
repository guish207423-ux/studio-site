"""Build src/styles/fonts.css from the site's actual character set.

Reads every non-ASCII character used in src/ + index.html + public/, finds which
@fontsource unicode-range shards cover them, and emits only those @font-face
blocks. Everything else in the shard set (101 files, 4.5MB) is dropped;
uncovered characters fall back to the system sans that already sits right behind
'Noto Sans SC' in --font-sans.

Re-run after adding content that uses new characters:
    python3 scripts/gen-fonts-css.py
"""
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PKG = os.path.join(ROOT, 'node_modules/@fontsource-variable/noto-sans-sc')

BLOCK = re.compile(r'@font-face\s*\{(.*?)\}', re.S)


def parse(path):
    css = open(path, encoding='utf-8').read()
    out = []
    for m in BLOCK.finditer(css):
        body = m.group(1)
        url = re.search(r'url\(([^)]+)\)', body)
        rng = re.search(r'unicode-range:\s*([^;]+);', body)
        fam = re.search(r'font-family:\s*([^;]+);', body)
        if not (url and rng and fam):
            continue
        out.append({
            'file': os.path.basename(url.group(1).strip('"\'')),
            'range': rng.group(1).strip(),
            'family': fam.group(1).strip(),
        })
    return out


def parse_ranges(rng):
    for m in re.finditer(r'U\+([0-9a-fA-F]+)(?:-([0-9a-fA-F]+))?', rng):
        lo = int(m.group(1), 16)
        hi = int(m.group(2), 16) if m.group(2) else lo
        yield lo, hi


def covers(rng, cp):
    return any(lo <= cp <= hi for lo, hi in parse_ranges(rng))


def collect_chars():
    chars = set()
    for base in ('src', 'public'):
        for dirpath, _, files in os.walk(os.path.join(ROOT, base)):
            for f in files:
                if f.endswith(('.tsx', '.ts', '.css', '.html', '.js')):
                    text = open(os.path.join(dirpath, f), encoding='utf-8').read()
                    chars.update(c for c in text if ord(c) > 0x2000)
    p = os.path.join(ROOT, 'index.html')
    if os.path.exists(p):
        text = open(p, encoding='utf-8').read()
        chars.update(c for c in text if ord(c) > 0x2000)
    return sorted(chars)


def emit(faces, note):
    out = []
    for s in faces:
        out.append('@font-face {')
        out.append("  font-family: 'Noto Sans SC Variable';")
        out.append('  font-style: normal;')
        out.append('  font-display: swap;')
        out.append('  font-weight: 100 900;')
        out.append(
            "  src: url('@fontsource-variable/noto-sans-sc/files/%s') "
            "format('woff2-variations');" % s['file'])
        out.append('  unicode-range: %s;' % s['range'])
        out.append('}')
        out.append('')
    return out


def main():
    shards = parse(os.path.join(PKG, 'wght.css'))
    print('shards declared in wght.css:', len(shards))

    chars = collect_chars()
    print('distinct non-ASCII chars in site text:', len(chars))

    # One face per shard, kept in the order the package declares them.
    kept, missing = [], []
    for s in shards:
        hits = [c for c in chars if covers(s['range'], ord(c))]
        if hits:
            kept.append((s, len(hits), ''.join(sorted(hits)[:10])))
    for ch in chars:
        if not any(covers(s['range'], ord(ch)) for s in shards):
            missing.append(ch)

    print('shards kept:', len(kept), 'of', len(shards))
    print('uncovered chars (fall back to system sans):', len(missing))
    if missing:
        print('   ', ''.join(missing))

    faces = [s for s, _, _ in kept]

    out = []
    out.append('/**')
    out.append(' * Noto Sans SC —— 按站内实际用字子集化（构建期生成，请勿手改）。')
    out.append(' *')
    out.append(' * 全量引入的代价：@fontsource 默认入口为 101 个 unicode-range 分片各声明')
    out.append(' * 一个 @font-face，合计 4.5MB，其中 97 个是中文分片。站内实际只用到')
    out.append(' * %d 个非 ASCII 字符，落在 %d 个分片里 —— 其余分片永远不会被请求，' % (len(chars), len(faces)))
    out.append(' * 纯属把体积搬进产物。')
    out.append(' *')
    out.append(' * 未被任何分片覆盖的字符回退到 system-ui / PingFang SC / 微软雅黑，')
    out.append(' * 它们就排在 --font-sans 里 Noto Sans SC 之后。')
    out.append(' *')
    out.append(' * 重新生成：python3 scripts/gen-fonts-css.py')
    out.append(' */')
    out.append('')
    out.extend(emit(faces, 'zh + latin'))
    out.append("/* ---- 展示字体 / 等宽字体 ---- */")
    out.append("@import '@fontsource/archivo-black/400.css';")
    out.append("@import '@fontsource/jetbrains-mono/500.css';")
    out.append('')

    dest = os.path.join(ROOT, 'src/styles/fonts.css')
    with open(dest, 'w', encoding='utf-8') as fh:
        fh.write('\n'.join(out))
    print('wrote', dest, os.path.getsize(dest), 'bytes')


if __name__ == '__main__':
    main()
