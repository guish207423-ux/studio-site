import json
import sys

for tag in ("base", "after"):
    d = json.load(open(sys.argv[1] if tag == "base" else sys.argv[2], encoding="utf-8"))
    print(f"[{tag}]")
    for band in ["0-4", "4-10", "10-20", "20-40", "40-70"]:
        v = d["bands"].get(band)
        if v:
            print(f"  {band:<8} mean={v.get('mean_delta')}  max={v['max_delta']}  changed%={v['changed_pct']}")
    c = d["center"]
    print(f"  center   mean={c.get('mean_delta')}  max={c['max_delta']}  changed%={c['changed_pct']}")
