import json
import sys

base = json.load(open(sys.argv[1], encoding="utf-8"))
aft = json.load(open(sys.argv[2], encoding="utf-8"))

print(f"{'band':<10} | {'baseline changed%/max':<26} | {'enhanced changed%/max':<26} | delta")
print("-" * 100)


def fmt(d):
    return f"{d['changed_pct']:<8} / {d['max_delta']:<6}"


for band in ["0-4", "4-10", "10-20", "20-40", "40-70"]:
    a = base["bands"].get(band)
    b = aft["bands"].get(band)
    if not a or not b:
        continue
    d_pct = round(b["changed_pct"] - a["changed_pct"], 2)
    d_max = b["max_delta"] - a["max_delta"]
    print(f"{band:<10} | {fmt(a):<26} | {fmt(b):<26} | {d_pct:+.2f}pp / {d_max:+d}")

for key in ("center", "bg_band"):
    a, b = base[key], aft[key]
    print(f"{key:<10} | {fmt(a):<26} | {fmt(b):<26} | "
          f"{round(b['changed_pct'] - a['changed_pct'], 2):+.2f}pp / {b['max_delta'] - a['max_delta']:+d}")

print("\ncontrols")
for tag, d in (("baseline", base), ("enhanced", aft)):
    print(f"  {tag}: on={d['refraction_on']['bf']}  off={d['refraction_off']['bf']}")
