import json, time, io
from PIL import Image
from playwright.sync_api import sync_playwright

def lum(c):
    f = lambda v: (v/255)/12.92 if v/255 <= 0.04045 else (((v/255)+0.055)/1.055)**2.4
    return 0.2126*f(c[0]) + 0.7152*f(c[1]) + 0.0722*f(c[2])
def ratio(a, b):
    l1, l2 = lum(a), lum(b); hi, lo = max(l1, l2), min(l1, l2)
    return (hi+0.05)/(lo+0.05)

with sync_playwright() as p:
    b = p.chromium.connect_over_cdp("http://127.0.0.1:9335")
    ctx = b.new_context(viewport={"width": 1440, "height": 900})
    pg = ctx.new_page()
    pg.goto("http://127.0.0.1:4173/", wait_until="load", timeout=60000)
    time.sleep(2.0)
    pg.evaluate("document.querySelector('#pricing').scrollIntoView()")
    time.sleep(1.2)
    # mark each pricing card desc/period with index
    info = pg.evaluate("""() => {
      const out = [];
      document.querySelectorAll('.pricing-card').forEach((card, ci) => {
        const cardName = (card.querySelector('.pricing-card__name')||{innerText:''}).innerText;
        ['__desc', '__period'].forEach(suf => {
          const el = card.querySelector('.pricing-card' + suf);
          if (!el) return;
          el.setAttribute('data-a11y-p', ci + suf);
          const cs = getComputedStyle(el);
          out.push({key: ci + suf, card: cardName, cls: el.className, text: el.innerText.slice(0,26),
                    color: cs.color, fs: parseFloat(cs.fontSize), fw: cs.fontWeight,
                    bgColor: cs.backgroundColor, bgImage: getComputedStyle(card).backgroundImage.slice(0, 60)});
        });
      });
      return out; }""")
    pg.add_style_tag(content="*,*::before,*::after{color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important;}")
    time.sleep(0.3)
    for it in info:
        r = pg.evaluate("""(k) => { const el=document.querySelector('[data-a11y-p="'+k+'"]'); const b=el.getBoundingClientRect();
            return [b.x,b.y,b.width,b.height]; }""", it["key"])
        x, y, w, h = r
        if w < 2 or h < 2 or y < 0 or y + h > 900:
            pg.evaluate("""(k) => document.querySelector('[data-a11y-p="'+k+'"]').scrollIntoView({block:'center'})""", it["key"])
            time.sleep(0.4)
            x, y, w, h = pg.evaluate("""(k) => { const el=document.querySelector('[data-a11y-p="'+k+'"]'); const b=el.getBoundingClientRect();
                return [b.x,b.y,b.width,b.height]; }""", it["key"])
        shot = pg.screenshot(clip={"x": max(0, x), "y": max(0, y), "width": min(w, 1440-max(0, x)), "height": min(h, 900-max(0, y))})
        im = Image.open(io.BytesIO(shot)).convert("RGB")
        px = sorted(im.getdata(), key=lambda c: c[0]+c[1]+c[2])
        med = px[len(px)//2]
        fg = tuple(int(v) for v in it["color"].replace("rgb(", "").replace(")", "").split(",")[:3])
        it["bg_px"] = med
        it["ratio"] = round(ratio(fg, med), 2)
        it["pass"] = it["ratio"] >= (3.0 if (it["fs"] >= 24 or (it["fs"] >= 18.66 and int(it["fw"]) >= 700)) else 4.5)
    # marquee under reduced motion
    pg.emulate_media(reduced_motion="reduce")
    time.sleep(1.0)
    mq = pg.evaluate("""() => { const els=[...document.querySelectorAll('.marquee, .marquee *')].slice(0,6).map(e=>{
        const cs=getComputedStyle(e); return {sel:e.tagName.toLowerCase()+'.'+(e.className||'').toString().split(' ')[0],
          anim: cs.animationName, dur: cs.animationDuration, state: cs.animationPlayState, transform: cs.transform.slice(0,30)}; });
      const t1 = (document.querySelector('.marquee')||{}).getBoundingClientRect ? document.querySelector('.marquee').getBoundingClientRect().y : null;
      return {els}; }""")
    pos1 = pg.evaluate("() => { const m=document.querySelector('.marquee__track')||document.querySelector('.marquee'); return m ? getComputedStyle(m).transform : null; }")
    time.sleep(1.2)
    pos2 = pg.evaluate("() => { const m=document.querySelector('.marquee__track')||document.querySelector('.marquee'); return m ? getComputedStyle(m).transform : null; }")
    out = {"pricing": info, "marquee_reduce": mq, "marquee_moving_under_reduce": pos1 != pos2, "pos": [pos1, pos2]}
    json.dump(out, open("pricing_final.json", "w"), ensure_ascii=False, indent=1)
    print(json.dumps(out, ensure_ascii=False, indent=1)[:4000])
    pg.close(); b.close()
