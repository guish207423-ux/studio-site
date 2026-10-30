import json, time
from playwright.sync_api import sync_playwright

JS_COLLECT = r"""
() => {
  const parse = (s) => {
    const m = s.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(/[,\s\/]+/).filter(x=>x!=='').map(Number);
    return {r:p[0], g:p[1], b:p[2], a:(p.length>3?p[3]:1)};
  };
  const over = (c, base) => ({r: c.r*c.a + base.r*(1-c.a), g: c.g*c.a + base.g*(1-c.a), b: c.b*c.a + base.b*(1-c.a), a: 1});
  const lum = (c) => {
    const f = v => { v/=255; return v<=0.04045 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); };
    return 0.2126*f(c.r) + 0.7152*f(c.g) + 0.0722*f(c.b);
  };
  const ratio = (a,b) => { const l1=lum(a), l2=lum(b); const hi=Math.max(l1,l2), lo=Math.min(l1,l2); return (hi+0.05)/(lo+0.05); };
  const sel = (el) => {
    let s = el.tagName.toLowerCase();
    if (el.id) return s + '#' + el.id;
    const cls = (el.className||'').toString().trim().split(/\s+/).filter(Boolean).slice(0,2).join('.');
    if (cls) s += '.' + cls;
    return s;
  };
  // returns {rgb, opaque, bgimg, chain}
  const effBg = (el) => {
    const layers = []; let node = el, bgimg = false; const chain = [];
    while (node && node.nodeType === 1) {
      const cs = getComputedStyle(node);
      if (cs.backgroundImage && cs.backgroundImage !== 'none') {
        bgimg = true;
        chain.push(node.tagName.toLowerCase() + ' bgimg=' + cs.backgroundImage.slice(0, 40));
      }
      const c = parse(cs.backgroundColor);
      if (c && c.a > 0) {
        layers.push(c);
        chain.push(node.tagName.toLowerCase() + (node.className?('.'+node.className.toString().split(' ')[0]):'') + ' bg=a' + c.a);
        if (c.a >= 0.999) break;
      }
      node = node.parentElement;
    }
    if (!layers.length) return {rgb: null, opaque: false, bgimg, chain};
    // layers are top->bottom; last is deepest
    let base = null;
    if (layers[layers.length-1].a >= 0.999) { base = layers[layers.length-1]; layers.pop(); }
    const opaque = !!base;
    if (!base) base = {r:255,g:255,b:255,a:1};
    for (let i = layers.length - 1; i >= 0; i--) base = over(layers[i], base);
    return {rgb: {r:base.r,g:base.g,b:base.b}, opaque, bgimg, chain};
  };

  const res = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = walker.nextNode())) {
    const txt = n.nodeValue.trim();
    if (!txt) continue;
    const el = n.parentElement;
    if (!el) continue;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) continue;
    let op = 1, node = el;
    while (node && node.nodeType === 1) { op *= parseFloat(getComputedStyle(node).opacity); node = node.parentElement; }
    if (op < 0.1) continue;
    const fg0 = parse(cs.color);
    if (!fg0) continue;
    const bg = effBg(el);
    let fgEff = fg0, fgAlpha = fg0.a;
    if (fg0.a < 0.999 && bg.rgb) fgEff = over(fg0, bg.rgb);
    const fs = parseFloat(cs.fontSize), fw = parseInt(cs.fontWeight) || 400;
    const large = fs >= 24 || (fs >= 18.66 && fw >= 700);
    const item = {
      sel: sel(el), text: txt.slice(0, 60), fg: `rgba(${Math.round(fg0.r)},${Math.round(fg0.g)},${Math.round(fg0.b)},${fg0.a})`,
      fg_alpha: fg0.a, bgimg: bg.bgimg, chain: bg.chain.slice(0,8),
      fs, fw, large, opacity: +op.toFixed(3),
      rect: [Math.round(r.x), Math.round(r.y+window.scrollY), Math.round(r.width), Math.round(r.height)],
      aria_hidden: !!el.closest('[aria-hidden="true"]'),
      tag: el.tagName.toLowerCase(), role: el.getAttribute('role'),
      cls: (el.className||'').toString(),
    };
    if (bg.rgb) {
      item.bg = `rgb(${Math.round(bg.rgb.r)},${Math.round(bg.rgb.g)},${Math.round(bg.rgb.b)})`;
      item.bg_opaque = bg.opaque;
      item.ratio = +ratio(fgEff, bg.rgb).toFixed(2);
    } else { item.bg = null; item.ratio = null; item.bg_opaque = false; }
    res.push(item);
  }
  return res;
}
"""

SITES = [("studio", "http://127.0.0.1:4173/"), ("software", "http://127.0.0.1:5174/")]
out = {}

with sync_playwright() as p:
    b = p.chromium.connect_over_cdp("http://127.0.0.1:9335")
    for name, url in SITES:
        ctx = b.new_context(viewport={"width": 1440, "height": 900}, device_scale_factor=1)
        pg = ctx.new_page()
        pg.goto(url, wait_until="load", timeout=60000)
        time.sleep(2.0)
        h = pg.evaluate("document.body.scrollHeight")
        y = 0
        while y < h:
            pg.evaluate(f"window.scrollTo(0,{y})")
            time.sleep(0.18)
            y += 700
            h = pg.evaluate("document.body.scrollHeight")
        pg.evaluate("window.scrollTo(0,0)")
        time.sleep(0.8)
        items = pg.evaluate(JS_COLLECT)
        out[name] = items
        pg.close()
    b.close()

json.dump(out, open("contrast_raw.json", "w"), ensure_ascii=False, indent=1)

for name, items in out.items():
    fails = [i for i in items if i["ratio"] is not None and ((i["large"] and i["ratio"] < 3.0) or (not i["large"] and i["ratio"] < 4.5))]
    nulls = [i for i in items if i["ratio"] is None]
    bgimg = [i for i in items if i["bgimg"]]
    print(f"===== {name}: text nodes={len(items)} fails={len(fails)} bgimg={len(bgimg)} nullbg={len(nulls)}")
    for i in fails:
        print(f"  {i['ratio']:>5}:1 {i['sel']:<40} fs={i['fs']:.0f} fw={i['fw']} fg={i['fg']} bg={i['bg']} op={i['opacity']} | {i['text'][:40]}")
    print("  -- bgimg nodes --")
    for i in bgimg[:50]:
        print(f"  {i['sel']:<40} calc={i['ratio']} opaque={i['bg_opaque']} | {i['text'][:36]}")
