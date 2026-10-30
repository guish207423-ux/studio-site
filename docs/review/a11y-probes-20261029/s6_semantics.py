import json, time
from playwright.sync_api import sync_playwright

JS_SEM = r"""
() => {
  const sel = (e) => { let s = e.tagName.toLowerCase(); if (e.id) return s+'#'+e.id;
    const c = (e.className||'').toString().trim().split(/\s+/).filter(Boolean).slice(0,2).join('.');
    return c ? s+'.'+c : s; };
  const heads = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(h => ({lv: +h.tagName[1], t: h.innerText.trim().slice(0,30), sel: sel(h)}));
  const skips = [];
  for (let i = 1; i < heads.length; i++) if (heads[i].lv - heads[i-1].lv > 1) skips.push([heads[i-1].lv + '->' + heads[i].lv, heads[i].t, heads[i].sel]);
  const fields = [...document.querySelectorAll('input,select,textarea')].map(f => ({
    sel: sel(f), type: f.type, name: f.getAttribute('name'),
    labels: f.labels ? [...f.labels].map(l => l.innerText.trim().slice(0,20)) : [],
    ariaLabel: f.getAttribute('aria-label'), ariaLabelledby: f.getAttribute('aria-labelledby'),
    title: f.getAttribute('title'), placeholder: f.placeholder || null,
    required: f.required, ariaRequired: f.getAttribute('aria-required'),
    id: f.id
  }));
  const imgs = [...document.querySelectorAll('img')].map(i => ({src: (i.currentSrc||i.src).split('/').pop().slice(0,40), alt: i.getAttribute('alt'), ariaHidden: i.getAttribute('aria-hidden')}));
  const svgs = [...document.querySelectorAll('svg')].map(s => ({sel: sel(s), ariaHidden: s.getAttribute('aria-hidden'), label: s.getAttribute('aria-label'), title: !!s.querySelector('title'), role: s.getAttribute('role'), focusable: s.getAttribute('focusable')}));
  const landmarks = [...document.querySelectorAll('header,nav,main,footer,aside,section[aria-label],section[aria-labelledby],form[aria-label],[role]')]
    .filter(e => ['banner','navigation','main','contentinfo','complementary','region','form','search','dialog','button','link','tab','tablist','menu','menuitem','listbox','option'].includes(e.getAttribute('role')) || ['HEADER','NAV','MAIN','FOOTER','ASIDE'].includes(e.tagName))
    .map(e => ({tag: e.tagName.toLowerCase(), role: e.getAttribute('role'), label: e.getAttribute('aria-label') || (e.getAttribute('aria-labelledby') ? 'by:'+e.getAttribute('aria-labelledby') : null), sel: sel(e)}));
  // aria-hidden wrapping focusables
  const hiddenFocus = [];
  document.querySelectorAll('[aria-hidden="true"]').forEach(h => {
    const f = h.querySelectorAll('a[href],button,input,select,textarea,[tabindex]:not([tabindex="-1"])');
    if (f.length) hiddenFocus.push({container: sel(h), count: f.length, sample: [...f].slice(0,3).map(sel)});
  });
  // focusable but inert/pointer-events none
  const pe = [];
  document.querySelectorAll('a[href],button').forEach(e => {
    const cs = getComputedStyle(e);
    if (cs.pointerEvents === 'none' && e.getBoundingClientRect().width > 0) pe.push(sel(e));
  });
  // empty buttons/links by text (AX name done separately)
  const emptyInteractive = [...document.querySelectorAll('a[href],button')].filter(e => {
    const t = (e.innerText || '').trim();
    return !t && !e.getAttribute('aria-label') && !e.getAttribute('aria-labelledby') && !e.getAttribute('title') && !e.querySelector('img[alt]:not([alt=""])');
  }).map(e => ({sel: sel(e), html: e.outerHTML.slice(0, 120)}));
  return {heads, skips, fields, imgs, svgs: svgs.slice(0, 40), svgTotal: svgs.length,
          landmarks, hiddenFocus, pointerNone: pe, emptyInteractive,
          lang: document.documentElement.lang, title: document.title,
          viewport: document.querySelector('meta[name="viewport"]') ? document.querySelector('meta[name="viewport"]').content : null};
}
"""

res = {}
with sync_playwright() as p:
    b = p.chromium.connect_over_cdp("http://127.0.0.1:9335")
    for name, url in [("studio", "http://127.0.0.1:4173/"), ("software", "http://127.0.0.1:5174/")]:
        ctx = b.new_context(viewport={"width": 1440, "height": 900})
        pg = ctx.new_page()
        pg.goto(url, wait_until="load", timeout=60000)
        time.sleep(2.0)
        d = {"sem": pg.evaluate(JS_SEM)}
        # accessible names of interactive elements from the AX tree
        cdp = ctx.new_cdp_session(pg)
        nodes = cdp.send("Accessibility.getFullAXTree")["nodes"]
        names = []
        for n in nodes:
            if n.get("ignored"): continue
            role = (n.get("role") or {}).get("value")
            if role in ("button", "link", "textbox", "combobox", "searchbox", "checkbox", "switch", "tab", "menuitem"):
                nm = (n.get("name") or {}).get("value", "")
                names.append({"role": role, "name": nm[:40], "empty": nm.strip() == ""})
        d["ax"] = {"total": len(names), "empty": [x for x in names if x["empty"]], "counts": {}}
        for x in names: d["ax"]["counts"][x["role"]] = d["ax"]["counts"].get(x["role"], 0) + 1
        # reduced motion
        pg.emulate_media(reduced_motion="reduce")
        time.sleep(0.8)
        d["reduced"] = pg.evaluate("""() => {
          const out = {invisible: [], animating: []};
          document.querySelectorAll('body *').forEach(e => {
            const cs = getComputedStyle(e);
            if (e.children.length === 0 && (e.innerText||'').trim()) {
              if (cs.opacity === '0' || cs.visibility === 'hidden' || cs.display === 'none') out.invisible.push(e.tagName.toLowerCase()+'.'+(e.className||'').toString().split(' ')[0]);
            }
            if (cs.animationName !== 'none' && cs.animationDuration !== '0s') out.animating.push(e.tagName.toLowerCase()+'.'+(e.className||'').toString().split(' ')[0]);
          });
          return {invisibleCount: out.invisible.length, invisible: out.invisible.slice(0,8), animatingCount: out.animating.length, animating: out.animating.slice(0,8)};
        }""")
        pg.emulate_media(reduced_motion="no-preference")
        # 200% zoom: halve viewport (1440x900 -> 720x450) which is what 200% zoom gives
        pg.set_viewport_size({"width": 720, "height": 450})
        time.sleep(0.8)
        d["zoom200"] = pg.evaluate("""() => {
          const d = document.documentElement;
          const clipped = [];
          document.querySelectorAll('h1,h2,h3,p,li,a,button,span,div').forEach(e => {
            if (!(e.innerText||'').trim() || e.children.length) return;
            const r = e.getBoundingClientRect();
            if (r.width > 0 && (r.right > window.innerWidth + 1 || r.left < -1)) clipped.push({sel: e.tagName.toLowerCase()+'.'+(e.className||'').toString().split(' ')[0], text: e.innerText.slice(0,20), right: Math.round(r.right)});
          });
          return {hScroll: d.scrollWidth - window.innerWidth, scrollW: d.scrollWidth, winW: window.innerWidth,
                  clippedCount: clipped.length, clipped: clipped.slice(0, 10)};
        }""")
        # also true CSS zoom 200% on a 1440 viewport
        pg.set_viewport_size({"width": 1440, "height": 900})
        pg.evaluate("document.documentElement.style.zoom = '2'")
        time.sleep(0.8)
        d["cssZoom200"] = pg.evaluate("""() => ({hScroll: document.documentElement.scrollWidth - window.innerWidth,
             bodyScroll: document.body.scrollWidth, winW: window.innerWidth})""")
        res[name] = d
        pg.close()
    b.close()

json.dump(res, open("semantics.json", "w"), ensure_ascii=False, indent=1)
for name, d in res.items():
    s = d["sem"]
    print("=====", name, "lang=", s["lang"], "title=", s["title"], "viewport=", s["viewport"])
    print("  landmarks:", [(l["tag"], l["role"], l["label"]) for l in s["landmarks"]])
    print("  headings:", [(h["lv"], h["t"]) for h in s["heads"]])
    print("  skips:", s["skips"])
    print("  fields:")
    for f in s["fields"]:
        print("   ", f["sel"], "labels=", f["labels"], "aria=", f["ariaLabel"], "ph=", f["placeholder"], "type=", f["type"], "req=", f["required"], f["ariaRequired"])
    print("  imgs w/o alt:", [i for i in s["imgs"] if i["alt"] is None])
    print("  imgs total:", len(s["imgs"]), "empty-alt:", len([i for i in s["imgs"] if i["alt"] == ""]))
    print("  svgs total:", s["svgTotal"], "no-hidden:", [x for x in s["svgs"] if x["ariaHidden"] != "true" and not x["label"] and not x["title"]][:5])
    print("  hiddenFocus:", s["hiddenFocus"])
    print("  pointerNone:", s["pointerNone"])
    print("  emptyInteractive:", s["emptyInteractive"])
    print("  ax:", d["ax"]["counts"], "emptyNames:", d["ax"]["empty"])
    print("  reduced:", json.dumps(d["reduced"], ensure_ascii=False)[:400])
    print("  zoom200:", json.dumps(d["zoom200"], ensure_ascii=False)[:500])
    print("  cssZoom200:", d["cssZoom200"])
