import json, time
from playwright.sync_api import sync_playwright

JS_TARGETS = r"""
() => {
  const sel = (e) => { let s = e.tagName.toLowerCase(); if (e.id) return s+'#'+e.id;
    const c = (e.className||'').toString().trim().split(/\s+/).filter(Boolean).slice(0,2).join('.');
    return c ? s+'.'+c : s; };
  const q = 'a,button,input,select,textarea,summary,[role="button"],[tabindex]:not([tabindex="-1"])';
  const out = [];
  document.querySelectorAll(q).forEach(el => {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    if (cs.display === 'none' || cs.visibility === 'hidden' || r.width === 0 || r.height === 0) return;
    const name = el.getAttribute('aria-label') || (el.innerText||'').trim().slice(0,24) ||
                 el.getAttribute('placeholder') || el.getAttribute('name') || el.getAttribute('title') || '';
    out.push({sel: sel(el), tag: el.tagName.toLowerCase(), name, w: +r.width.toFixed(1), h: +r.height.toFixed(1),
              x: +r.x.toFixed(1), y: +r.y.toFixed(1),
              small: (r.width < 44 || r.height < 44),
              offscreen: r.right > window.innerWidth + 1 || r.x < -1,
              ariaHiddenAncestor: !!el.closest('[aria-hidden="true"]')});
  });
  return {targets: out, docW: document.documentElement.scrollWidth, winW: window.innerWidth,
          docH: document.documentElement.scrollHeight};
}
"""

def open_state(pg):
    return pg.evaluate("""() => {
      const burger = document.querySelector('.nav__burger');
      const drawer = document.querySelector('.drawer');
      const fab = document.querySelector('.fab');
      const ae = document.activeElement;
      return {
        burgerExpanded: burger ? burger.getAttribute('aria-expanded') : null,
        drawerClass: drawer ? drawer.className : null,
        drawerRect: drawer ? (r => [Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)])(drawer.getBoundingClientRect()) : null,
        active: ae ? (ae.tagName.toLowerCase() + '.' + (ae.className||'').toString().split(' ')[0]) : null,
        fabExpanded: fab ? fab.getAttribute('aria-expanded') : null,
        bodyOverflow: getComputedStyle(document.body).overflow,
      };
    }""")

res = {}
with sync_playwright() as p:
    b = p.chromium.connect_over_cdp("http://127.0.0.1:9335")
    for name, url in [("studio", "http://127.0.0.1:4173/"), ("software", "http://127.0.0.1:5174/")]:
        ctx = b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2,
                            is_mobile=True, has_touch=True)
        pg = ctx.new_page()
        pg.goto(url, wait_until="load", timeout=60000)
        time.sleep(2.5)
        d = {}
        d["initial"] = pg.evaluate(JS_TARGETS)
        d["overflow_initial"] = pg.evaluate("() => document.documentElement.scrollWidth - window.innerWidth")
        d["state0"] = open_state(pg)
        if name == "studio":
            # burger via keyboard
            pg.evaluate("document.querySelector('.nav__burger').focus()")
            pg.keyboard.press("Enter")
            time.sleep(0.7)
            d["afterOpen"] = open_state(pg)
            d["afterOpen"]["drawerLinks"] = pg.evaluate("() => [...document.querySelectorAll('.drawer__link')].map(a => { const r=a.getBoundingClientRect(); return {t:a.innerText, y:Math.round(r.y), h:Math.round(r.height), vis:getComputedStyle(a).visibility}; })")
            # tab 3 times to see where focus goes
            seq = []
            for _ in range(4):
                pg.keyboard.press("Tab")
                time.sleep(0.12)
                seq.append(pg.evaluate("() => { const a=document.activeElement; const r=a.getBoundingClientRect(); return [a.tagName.toLowerCase()+'.'+(a.className||'').toString().split(' ')[0], Math.round(r.y), Math.round(r.height)]; }"))
            d["tabAfterOpen"] = seq
            pg.keyboard.press("Escape")
            time.sleep(0.6)
            d["afterEsc"] = open_state(pg)
            # FAB
            pg.evaluate("document.querySelector('.fab').focus()")
            pg.keyboard.press("Enter")
            time.sleep(0.7)
            d["fabOpen"] = pg.evaluate("""() => { const f=document.querySelector('.fab'); const m=document.querySelector('.fab-menu, .floating-menu, .chat-panel, [class*="fab-"]');
                return {expanded: f.getAttribute('aria-expanded'), active: document.activeElement.tagName+'.'+(document.activeElement.className||''),
                        menu: m ? m.className : null, bodyText: (document.body.innerText.match(/微信|邮件|电话/g)||[]).join(',')}; }""")
            pg.keyboard.press("Escape")
            time.sleep(0.5)
            d["fabAfterEsc"] = pg.evaluate("() => { const f=document.querySelector('.fab'); return {expanded: f.getAttribute('aria-expanded')}; }")
            d["cookie"] = pg.evaluate("""() => { const c=document.querySelector('.cookie-toast'); if(!c) return null;
                const r=c.getBoundingClientRect(); const btns=[...c.querySelectorAll('button')].map(b=>{const br=b.getBoundingClientRect(); return {t:b.innerText, w:Math.round(br.width), h:Math.round(br.height)};});
                return {rect:[Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)], btns, role:c.getAttribute('role'), label:c.getAttribute('aria-label')}; }""")
            d["overflow_after"] = pg.evaluate("() => document.documentElement.scrollWidth - window.innerWidth")
        else:
            d["headerNav"] = pg.evaluate("""() => { const n=document.querySelector('.header-nav'); if(!n) return null;
                const r=n.getBoundingClientRect(); const links=[...n.querySelectorAll('a')].map(a=>{const b=a.getBoundingClientRect(); return {t:a.innerText, x:Math.round(b.x), w:Math.round(b.width), h:Math.round(b.height), right:Math.round(b.right)};});
                return {rect:[Math.round(r.x),Math.round(r.width)], links, docW: document.documentElement.scrollWidth}; }""")
            d["searchInput"] = pg.evaluate("""() => { const i=document.querySelector('.search-bar__input'); if(!i) return null;
                const l = i.labels ? [...i.labels].map(x=>x.innerText) : [];
                return {label: i.getAttribute('aria-label'), labelledby: i.getAttribute('aria-labelledby'), labels: l, placeholder: i.placeholder, type: i.type}; }""")
        res[name] = d
        pg.close()
    b.close()

json.dump(res, open("mobile.json", "w"), ensure_ascii=False, indent=1)
for name, d in res.items():
    print("=====", name)
    t = d["initial"]["targets"]
    small = [x for x in t if x["small"]]
    print(f"  targets={len(t)} small(<44)={len(small)} overflow_px={d['overflow_initial']}")
    from collections import Counter
    c = Counter(x["sel"] for x in small)
    for k, v in c.most_common(20):
        ex = [x for x in small if x["sel"] == k][0]
        print(f"    {k:<34} x{v:<3} {ex['w']}x{ex['h']} e.g. {ex['name'][:16]!r}")
    if name == "studio":
        for k in ["state0", "afterOpen", "afterEsc", "fabOpen", "fabAfterEsc", "cookie", "overflow_after"]:
            print(f"  {k}: {json.dumps(d.get(k), ensure_ascii=False)[:420]}")
        print("  tabAfterOpen:", d.get("tabAfterOpen"))
    else:
        print("  headerNav:", json.dumps(d.get("headerNav"), ensure_ascii=False)[:500])
        print("  searchInput:", json.dumps(d.get("searchInput"), ensure_ascii=False))
