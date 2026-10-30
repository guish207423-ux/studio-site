from PIL import Image
import statistics

def lum(c):
    def f(v):
        v = v / 255
        return v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4
    r, g, b = [f(x) for x in c]
    return 0.2126 * r + 0.7152 * g + 0.0722 * b

def cr(a, b):
    l1, l2 = sorted([lum(a), lum(b)], reverse=True)
    return round((l1 + 0.05) / (l2 + 0.05), 2)

pairs = {
    '#B0B0B0 on #0A0A0A': ((176, 176, 176), (10, 10, 10)),
    '#8A8A8A on #0A0A0A': ((138, 138, 138), (10, 10, 10)),
    '#8A8A8A on #141414': ((138, 138, 138), (20, 20, 20)),
    '#8A8A8A on #0F0F0F': ((138, 138, 138), (15, 15, 15)),
    '#F0F0F0 on #0A0A0A': ((240, 240, 240), (10, 10, 10)),
    '#A8D93A on #0A0A0A': ((168, 217, 58), (10, 10, 10)),
    '#A8D93A on #141414': ((168, 217, 58), (20, 20, 20)),
    '#B0B0B0 on #141414': ((176, 176, 176), (20, 20, 20)),
    '#8A8A8A on #1A1A1A': ((138, 138, 138), (26, 26, 26)),
    '#2E2E2E on #141414': ((46, 46, 46), (20, 20, 20)),
    '#0A0A0A on #A8D93A (btn)': ((10, 10, 10), (168, 217, 58)),
}
for k, (a, b) in pairs.items():
    print(f"{k}: {cr(a, b)}:1")

print("=== pixel stats ===")
for f in ["docs/review/shots/1440-about.png", "docs/review/shots/1440-hero.png",
          "docs/review/shots/390-about.png", "docs/review/shots/390-services.png"]:
    im = Image.open(f).convert('RGB')
    w, h = im.size
    if w > 1000:
        box = (int(w * 0.72), int(h * 0.55), int(w * 0.95), int(h * 0.85))
    else:
        box = (int(w * 0.6), int(h * 0.6), int(w * 0.95), int(h * 0.9))
    crop = im.crop(box)
    px = list(crop.getdata())
    rs = [p[0] for p in px]
    print(f, im.size, 'mean', round(sum(rs) / len(rs), 1),
          'stdev', round(statistics.pstdev(rs), 2),
          'minmax', min(rs), max(rs), 'distinct', len(set(rs)))
