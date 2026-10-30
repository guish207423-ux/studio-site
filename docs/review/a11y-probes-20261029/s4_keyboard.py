import json, time
from playwright.sync_api import sync_playwright

DESC_JS = r"""
() => {
  const el = document.activeElement;
  if (!el || el === document.body) return {none: true};
  const cs = getComputedStyle(el);
  const r = el.getBoundingClientRect();
  const sel = (e) => { let s = e.tagName.toLowerCase(); if (e.id) return s+'#'+e.id;
    const c = (e.className||'').toString().trim().split(/\s+/).filter(Boolean).slice(0,2).join('.');
    return c ? s+'.'+c : s; };
  const name = el.getAttribute('aria-label') || (el.innerText||'').trim().slice(0,30) || el.getAttribute('title') || '';
  // unfocused baseline via clone (pseudo-class :focus does not apply to clone)
  let base = null;
  try {
    const cl = el.cloneNode(false);
    cl.removeAttribute('id');
    cl.setAttribute('data-a11y-clone','1');
    cl.style.position = 'absolute'; cl.style.left='-9999px'; cl.style.top='0';
    el.parentElement.appendChild(cl);
    const bs = getComputedStyle(cl);
    base = {outlineStyle: bs.outlineStyle, outlineWidth: bs.outlineWidth, outlineColor: bs.outlineColor,
            boxShadow: bs.boxShadow, backgroundColor: bs.backgroundColor, borderColor: bs.borderColor,
            color: bs.color, textDecorationLine: bs.textDecorationLine};
    cl.remove();
  } catch(e) {}
  const st = {outlineStyle: cs.outlineStyle, outlineWidth: cs.outlineWidth, outlineColor: cs.outlineColor,
              boxShadow: cs.boxShadow, backgroundColor: cs.backgroundColor, borderColor: cs.borderColor,
              color: cs.color, textDecorationLine: cs.textDecorationLine};
  return {sel: sel(el), tag: el.tagName.toLowerCase(), name, href: el.getAttribute('href'),
          role: el.getAttribute('role'), type: el.getAttribute('type'),
          rect: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)],
          inViewport: r.top >= -1 && r.bottom <= window.innerHeight + 1 && r.left >= -1 && r.right <= window.innerWidth + 1,
          visible: r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.opacity !== '0',
          style: st, base,
          ariaExpanded: el.getAttribute('aria-expanded'),
          parentLabel: el.parentElement ? sel(el.parentElement) : null};
}
"""

SITES = [("studio", "http://127.0.0.1:4173/"), ("software", "http://127.0.0.1:5174/")]

def visible_focus(stop):
    s, b = stop.get("style"), stop.get("base")
    if not s:
        return None
    if s["outlineStyle"] not in ("none", "") and float(s["outlineWidth"].replace("px", "") or 0) > 0:
        if not b or (s["outlineStyle"], s["outlineWidth"], s["outlineColor"]) != (b["outlineStyle"], b["outlineWidth"], b["outlineColor"]):
            return True
    if s["boxShadow"] != "none" and (not b or s["boxShadow"] != b["boxShadow"]):
        return True
    if b and (s["backgroundColor"] != b["backgroundColor"] or s["borderColor"] != b["borderColor"]
              or s["color"] != b["color"] or s["textDecorationLine"] != b["textDecorationLine"]):
        return True
    return False

out = {}
with sync_playwright() as p:
    b = p.chromium.connect_over_cdp("http://127.0.0.1:9335")
    for name, url in SITES:
        ctx = b.new_context(viewport={"width": 1440, "height": 900}, device_scale_factor=1)
        pg = ctx.new_page()
        pg.goto(url, wait_until="load", timeout=60000)
        time.sleep(1.5)
        # skip link test: first Tab from load
        pg.keyboard.press("Tab")
        time.sleep(0.25)
        first = pg.evaluate(DESC_JS)
        skip = {"firstStop": first}
        if first.get("href"):
            pg.keyboard.press("Enter")
            time.sleep(0.6)
            skip["afterEnter"] = pg.evaluate("""() => ({hash: location.hash, active: document.activeElement.tagName + '#' + document.activeElement.id,
                 scrollY: Math.round(window.scrollY), activeText: (document.activeElement.innerText||'').slice(0,20)})""")
            skip["targetExists"] = pg.evaluate("(h) => { try { return !!document.querySelector(h); } catch(e){ return 'invalid'; } }", first["href"])
        # full tab walk from top
        pg.goto(url, wait_until="load", timeout=60000)
        time.sleep(1.5)
        pg.evaluate("window.scrollTo(0,0)")
        stops = []
        seen = []
        for i in range(120):
            pg.keyboard.press("Tab")
            time.sleep(0.06)
            d = pg.evaluate(DESC_JS)
            if d.get("none"):
                break
            d["visibleFocus"] = visible_focus(d)
            stops.append(d)
            seen.append(d.get("sel"))
            # loop back to start?
            if len(seen) > 6 and d.get("sel") == seen[0] and d.get("name") == stops[0].get("name"):
                break
        out[name] = {"skip": skip, "stops": stops}
        pg.close()
    b.close()

json.dump(out, open("keyboard.json", "w"), ensure_ascii=False, indent=1)
for name, d in out.items():
    print(f"===== {name}  stops={len(d['stops'])}")
    print("  skip first:", json.dumps(d["skip"].get("firstStop", {}), ensure_ascii=False)[:220])
    print("  skip afterEnter:", json.dumps(d["skip"].get("afterEnter"), ensure_ascii=False))
    for i, s in enumerate(d["stops"]):
        vf = {True: "FOCUS-VISIBLE", False: "NO-FOCUS-RING", None: "?"}[s["visibleFocus"]]
        print(f"  {i+1:>2}. {s['sel']:<34} {vf:<16} inview={s['inViewport']} vis={s['visible']} rect={s['rect']} exp={s['ariaExpanded']} name={s['name'][:26]}")
