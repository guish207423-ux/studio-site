import json
import os
import re

"""Generate src/styles/fonts.css from the site's actual character set.

The @fontsource default entry declares 101 unicode-range shards (4.5MB), of
which 97 are CJK shards. The site only uses a few hundred distinct characters,
so most of that payload is never requested. This script keeps only the shards
that actually cover a site character, and drops the rest.

Re-run after adding content with new characters:
    python3 scripts/gen-fonts-css.py
"""

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
        if url and rng and fam:
            out.append({
                'file': os.path.basename(url.group(1).strip('"\'')),
                'range': rng.group(1).strip(),
                'family': fam.group(1).strip(),
            })
    return out


def ranges_of(rng):
    for m in re.finditer(r'U\+([0-9a-fA-F]+)(?:-([0-9a-fA-F]+))?', rng):
        lo = int(m.group(1), 16)
        hi = int(m.group(2), 16) if m.group(2) else lo
        yield lo, hi


def collect_chars():
    """Every non-ASCII char in src/ + public/ + index.html."""
    chars = set()
    for base in ('src', 'public'):
        for dirpath, _, files in os.walk(os.path.join(ROOT, base)):
            for f in files:
                if f.endswith(('.tsx', '.ts', '.css', '.html', '.js')):
                    text = open(os.path.join(dirpath, f), encoding='utf-8').read()
                    chars.update(c for c in text if ord(c) > 0x2000)
    with open(os.path.join(ROOT, 'index.html'), encoding='utf-8') as fh:
        chars.update(c for c in fh.read() if ord(c) > 0x2000)
    return sorted(chars)


def emit(shards):
    out = []
    for s in shards:
        out.append('@font-face {')
        out.append("  font-family: 'Noto Sans SC Variable';")
        out.append('  font-style: normal;')
        out.append('  font-display: swap;')
        out.append('  font-weight: 100 900;')
        out.append("  src: url('@fontsource-variable/noto-sans-sc/files/%s') "
                   "format('woff2-variations');" % s['file'])
        out.append('  unicode-range: %s;' % s['range'])
        out.append('}')
        out.append('')
    return out


def main():
    shards = parse(os.path.join(PKG, 'wght.css'))
    chars = collect_chars()
    missing = [c for c in chars if not any(
        lo <= ord(c) <= hi for s in shards for lo, hi in ranges_of(s['range']))]

    kept = [s for s in shards
            if any(lo <= ord(c) <= hi for c in chars for lo, hi in ranges_of(s['range']))]

    payload = sum(os.path.getsize(os.path.join(PKG, 'files', s['file'])) for s in kept)
    total = sum(os.path.getsize(os.path.join(PKG, 'files', s['file'])) for s in shards)

    out = [
        '/**',
        ' * Noto Sans SC —— 按站内实际用字子集化（构建期生成，请勿手改）。',
        ' *',
        ' * @fontsource 默认入口为 101 个 unicode-range 分片各声明一个 @font-face，',
        ' * 合计 %.2fMB，其中 97 个是中文分片。站内实际只用到 %d 个非 ASCII 字符，' % (total / 1024 / 1024, len(chars)),
        ' * 落在 %d 个分片里（%.2fMB）—— 其余分片永远不会被请求，纯属把体积搬进产物。' % (len(kept), payload / 1024 / 1024),
        ' *',
        ' * 未被任何分片覆盖的字符回退到 system-ui / PingFang SC / 微软雅黑，它们就排在',
        ' * --font-sans 里 Noto Sans SC 之后。当前未覆盖：%s' % (''.join(missing) or '（无）'),
        ' *',
        ' * 重新生成：python3 scripts/gen-fonts-css.py',
        ' */',
        '',
    ]
    out.extend(emit(kept))
    out.append('/* ---- 展示字体 / 等宽字体 ---- */')
    out.append("@import '@fontsource/archivo-black/400.css';")
    out.append("@import '@fontsource/jetbrains-mono/500.css';")
    out.append('')

    dest = os.path.join(ROOT, 'src/styles/fonts.css')
    with open(dest, 'w', encoding='utf-8') as fh:
        fh.write('\n'.join(out))
    print('shards %d/%d, payload %.2fMB/%.2fMB, uncovered %d' % (
        len(kept), len(shards), payload / 1024 / 1024, total / 1024 / 1024, len(missing)))
    print('wrote', dest)


if __name__ == '__main__':
    main()
