import json, time, io
from PIL import Image
from playwright.sync_api import sync_playwright

JS_TAG = r"""
() => {
  const parse = (s) => { const m = s.match(/rgba?\(([^)]+)\)/); if(!m) return null;
    const p = m[1].split(/[,\s\/]+/).filter(x=>x!=='').map(Number);
    return {r:p[0],g:p[1],b:p[2],a:(p.length>3?p[3]:1)}; };
  const sel = (el) => { let s = el.tagName.toLowerCase(); if (el.id) return s+'#'+el.id;
    const cls = (el.className||'').toString().trim().split(/\s+/).filter(Boolean).slice(0,2).join('.');
    return cls ? s+'.'+cls : s; };
  const items = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let n, idx = 0;
  while ((n = walker.nextNode())) {
    const txt = n.nodeValue.trim(); if (!txt) continue;
    const el = n.parentElement; if (!el) continue;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const r = el.getBoundingClientRect(); if (r.width < 1 || r.height < 1) continue;
    // does any ancestor have background-image?
    let node = el, bgimg = false;
    while (node && node.nodeType === 1) {
      const c2 = getComputedStyle(node);
      if (c2.backgroundImage && c2.backgroundImage !== 'none') { bgimg = true; break; }
      node = node.parentElement;
    }
    if (!bgimg) continue;
    el.setAttribute('data-a11y-idx', String(idx));
    const fg = parse(cs.color);
    items.push({idx, sel: sel(el), text: txt.slice(0,50), fg: cs.color, fgA: fg?fg.a:1,
                fs: parseFloat(cs.fontSize), fw: parseInt(cs.fontWeight)||400,
                aria_hidden: !!el.closest('[aria-hidden="true"]')});
    idx++;
  }
  return items;
}
"""

def lum(c):
    def f(v):
        v /= 255
        return v/12.92 if v <= 0.04045 else ((v+0.055)/1.055)**2.4
    return 0.2126*f(c[0]) + 0.7152*f(c[1]) + 0.0722*f(c[2])

def ratio(a, b):
    l1, l2 = lum(a), lum(b)
    hi, lo = max(l1, l2), min(l1, l2)
    return (hi+0.05)/(lo+0.05)

def over(fg, bg):
    a = fg[3]
    return (fg[0]*a + bg[0]*(1-a), fg[1]*a + bg[1]*(1-a), fg[2]*a + bg[2]*(1-a))

SITES = [("studio", "http://127.0.0.1:4173/"), ("software", "http://127.0.0.1:5174/")]
results = {}

with sync_playwright() as p:
    b = p.chromium.connect_over_cdp("http://127.0.0.1:9335")
    for name, url in SITES:
        ctx = b.new_context(viewport={"width": 1440, "height": 900}, device_scale_factor=1)
        pg = ctx.new_page()
        pg.goto(url, wait_until="load", timeout=60000)
        time.sleep(2.0)
        h = pg.evaluate("document.body.scrollHeight"); y = 0
        while y < h:
            pg.evaluate(f"window.scrollTo(0,{y})"); time.sleep(0.18); y += 700
            h = pg.evaluate("document.body.scrollHeight")
        pg.evaluate("window.scrollTo(0,0)"); time.sleep(0.6)
        items = pg.evaluate(JS_TAG)
        print(f"[{name}] bgimg text nodes: {len(items)}")
        # make text invisible so screenshots capture true background
        pg.add_style_tag(content="*,*::before,*::after{color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important;}")
        time.sleep(0.3)
        out = []
        for it in items:
            q = f'[data-a11y-idx="{it["idx"]}"]'
            ok = pg.evaluate("""(q) => { const el=document.querySelector(q); if(!el) return false;
                el.scrollIntoView({block:'center', inline:'center'});
                return true; }""", q)
            if not ok:
                continue
            time.sleep(0.12)
            r = pg.evaluate("""(q) => { const el=document.querySelector(q); const b=el.getBoundingClientRect();
                return [b.x,b.y,b.width,b.height, window.innerWidth, window.innerHeight]; }""", q)
            x, y2, w, hh, vw, vh = r
            if w < 2 or hh < 2 or x + w < 0 or y2 + hh < 0 or x > vw or y2 > vh:
                continue
            shot = pg.screenshot(clip={"x": max(0, x), "y": max(0, y2),
                                       "width": min(w, vw-max(0, x)), "height": min(hh, vh-max(0, y2))})
            im = Image.open(io.BytesIO(shot)).convert("RGB")
            W, H = im.size
            # inset to avoid borders/edges
            ix, iy = max(1, int(W*0.15)), max(1, int(H*0.2))
            crop = im.crop((ix, iy, max(ix+1, W-ix), max(iy+1, H-iy)))
            px = list(crop.getdata())
            px.sort(key=lambda c: c[0]+c[1]+c[2])
            med = px[len(px)//2]
            fgs = it["fg"]
            nums = [int(float(v)) for v in fgs[fgs.index('(')+1:fgs.index(')')].replace(',', ' ').split()]
            a = it["fgA"]
            fg_rgb = over((nums[0], nums[1], nums[2], a), med) if a < 1 else (nums[0], nums[1], nums[2])
            it2 = dict(it)
            it2["bg_px"] = med
            it2["ratio_px"] = round(ratio(fg_rgb, med), 2)
            it2["n_px"] = len(px)
            out.append(it2)
        pg.evaluate("document.querySelectorAll('[data-a11y-idx]').forEach(e=>e.removeAttribute('data-a11y-idx'))")
        results[name] = out
        pg.close()
    b.close()

json.dump(results, open("pixel_bg.json", "w"), ensure_ascii=False, indent=1)
for name, out in results.items():
    bad = [o for o in out if (o["fs"] >= 24 or (o["fs"] >= 18.66 and o["fw"] >= 700)) and o["ratio_px"] < 3 or (o["fs"] < 24 and o["ratio_px"] < 4.5)]
    print(f"===== {name}: sampled={len(out)} below_threshold={len(bad)}")
    for o in sorted(out, key=lambda z: z["ratio_px"]):
        flag = "FAIL" if ((o["fs"] >= 24 or (o["fs"] >= 18.66 and o["fw"] >= 700)) and o["ratio_px"] < 3) or (o["fs"] < 24 and o["ratio_px"] < 4.5) else "ok  "
        print(f"  {flag} {o['ratio_px']:>5}:1 {o['sel']:<34} fs={o['fs']:.0f} fw={o['fw']} fg={o['fg']} bgpx={o['bg_px']} hidden={o['aria_hidden']} | {o['text'][:34]}")
