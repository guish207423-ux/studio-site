import json, time
from playwright.sync_api import sync_playwright

AXE = "/home/guish/.hermes/cache/scratch/axe-tmp/node_modules/axe-core/axe.min.js"
SITES = [("studio", "http://127.0.0.1:4173/"), ("software", "http://127.0.0.1:5174/")]

out = {}

with sync_playwright() as p:
    b = p.chromium.connect_over_cdp("http://127.0.0.1:9335")
    for name, url in SITES:
        try:
            ctx = b.new_context(viewport={"width": 1440, "height": 900},
                                device_scale_factor=1, reduced_motion="no-preference")
        except Exception as e:
            ctx = b.contexts[0]
        pg = ctx.new_page()
        errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.goto(url, wait_until="load", timeout=60000)
        time.sleep(2.0)
        h = pg.evaluate("document.body.scrollHeight")
        y = 0
        while y < h:
            pg.evaluate(f"window.scrollTo(0,{y})")
            time.sleep(0.2)
            y += 700
            h = pg.evaluate("document.body.scrollHeight")
        pg.evaluate("window.scrollTo(0,0)")
        time.sleep(1.0)
        pg.add_script_tag(path=AXE)
        res = pg.evaluate("""async () => {
            const r = await axe.run(document, {resultTypes:['violations','incomplete']});
            return {version: axe.version,
                    violations: r.violations.map(v => ({id:v.id, impact:v.impact, help:v.help,
                      nodes:v.nodes.map(n=>({target:n.target, html:n.html.slice(0,220), msg:(n.failureSummary||'').slice(0,300)}))})),
                    incomplete: r.incomplete.map(v=>({id:v.id, impact:v.impact, count:v.nodes.length}))};
        }""")
        out[name] = {"axe": res, "pageerrors": errs}
        pg.close()
    b.close()

with open("axe_out.json", "w") as f:
    json.dump(out, f, ensure_ascii=False, indent=1)

for name, d in out.items():
    a = d["axe"]
    print(f"== {name}: axe {a['version']} violations={len(a['violations'])} incomplete={len(a['incomplete'])} pageerrors={len(d['pageerrors'])}")
    for v in a["violations"]:
        print(f"  [{v['impact']}] {v['id']} x{len(v['nodes'])}")
        for n in v["nodes"][:6]:
            print("     ", n["target"], "|", n["msg"].replace("\n", " ")[:150])
    for v in a["incomplete"]:
        print(f"  (incomplete) {v['id']} x{v['count']}")
