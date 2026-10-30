from PIL import Image
import statistics

# 1) 桌面空区：检测 96px 网格线是否存在、对比度多少
im = Image.open("docs/review/shots/1440-hero.png").convert("RGB")
patch = im.crop((1150, 120, 1400, 520))
px = list(patch.getdata())
vals = [p[0] for p in px]
print("empty patch (1440-hero: x1150-1400,y120-520):",
      "min", min(vals), "max", max(vals), "mean", round(sum(vals)/len(vals), 2),
      "stdev", round(statistics.pstdev(vals), 2))
# 行均值波动 → 网格线
rows = []
for y in range(0, 400):
    row = [patch.getpixel((x, y))[0] for x in range(0, 250)]
    rows.append(sum(row)/len(row))
print("row-mean min/max:", round(min(rows), 1), round(max(rows), 1),
      "delta", round(max(rows)-min(rows), 1))

# 2) 作品封面亮度（6 张 poster）
print("--- posters ---")
for n in ["blender", "grafana", "metabase", "audacity", "penpot", "openshot"]:
    p = Image.open(f"public/videos/{n}-poster.jpg").convert("L").resize((64, 36))
    v = list(p.getdata())
    print(n, "mean-lum", round(sum(v)/len(v), 1), "/255")

# 3) 卡片边框 vs 页面背景实测对比
def cr(a, b):
    def lum(c):
        def f(x):
            x = x/255
            return x/12.92 if x <= 0.04045 else ((x+0.055)/1.055)**2.4
        return 0.2126*f(c[0]) + 0.7152*f(c[1]) + 0.0722*f(c[2])
    l1, l2 = sorted([lum(a), lum(b)], reverse=True)
    return round((l1+0.05)/(l2+0.05), 2)

print("border(46,46,46) vs card bg(20,20,20):", cr((46,46,46),(20,20,20)))
print("card bg(20,20,20) vs page(10,10,10):", cr((20,20,20),(10,10,10)))
print("grid line composite ~ (25,38,42) vs page(10,10,10):", cr((25,38,42),(10,10,10)))
