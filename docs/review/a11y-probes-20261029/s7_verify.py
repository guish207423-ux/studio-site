import json, time, io
from PIL import Image
from playwright.sync_api import sync_playwright

def lum(c):
    f = lambda v: (v/255)/12.92 if v/255 <= 0.04045 else (((v/255)+0.055)/1.055)**2.4
    return 0.2126*f(c[0]) + 0.7152*f(c[1]) + 0.0722*f(c[2])
def ratio(a, b):
    l1, l2 = lum(a), lum(b); hi, lo = max(l1, l2), min(l1, l2)
    return (hi+0.05)/(lo+0.05)

res = {}
with sync_playwright() as p:
    b = p.chromium.connect_over_cdp("http://127.0.0.1:9335")

    # ---- studio ----
    ctx = b.new_context(viewport={"width": 1440, "height": 900})
    pg = ctx.new_page()
    pg.goto("http://127.0.0.1:4173/", wait_until="load", timeout=60000)
    time.sleep(2.0)
    d = {}
    d["fab"] = pg.evaluate("""() => { const f=document.querySelector('.fab'); if(!f) return null; const cs=getComputedStyle(f); const r=f.getBoundingClientRect();
      return {opacity: cs.opacity, pointerEvents: cs.pointerEvents, visibility: cs.visibility, transform: cs.transform,
              rect:[Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)],
              display: cs.display, tabIndex: f.tabIndex, ariaExpanded: f.getAttribute('aria-expanded')}; }""")
    d["stepTrigger"] = pg.evaluate("""() => { const t=document.querySelector('.process-step__trigger'); if(!t) return null; const cs=getComputedStyle(t);
      return {pointerEvents: cs.pointerEvents, cursor: cs.cursor, ariaExpanded: t.getAttribute('aria-expanded'),
              controls: t.getAttribute('aria-controls'), role: t.getAttribute('role'), tag: t.tagName,
              parentPE: getComputedStyle(t.parentElement).pointerEvents, parentTag: t.parentElement.tagName,
              disabled: t.disabled}; }""")
    # does Enter on the trigger do anything?
    pg.evaluate("document.querySelector('.process-step__trigger').focus()")
    before = pg.evaluate("() => { const s=document.querySelector('.process-step'); return s.className + '|' + (s.querySelector('.process-step__body')||{innerText:''}).innerText.slice(0,20); }")
    pg.keyboard.press("Enter"); time.sleep(0.5)
    after = pg.evaluate("() => { const s=document.querySelector('.process-step'); return s.className + '|' + (s.querySelector('.process-step__body')||{innerText:''}).innerText.slice(0,20); }")
    d["stepEnter"] = {"before": before, "after": after, "changed": before != after}
    # work-card hint: no-preference vs reduce
    d["hint_noPref"] = pg.evaluate("""() => [...document.querySelectorAll('.work-card__hint')].map(e => ({t: e.innerText.trim().slice(0,24), op: getComputedStyle(e).opacity}))""")
    pg.emulate_media(reduced_motion="reduce"); time.sleep(0.6)
    d["hint_reduce"] = pg.evaluate("""() => [...document.querySelectorAll('.work-card__hint')].map(e => ({t: e.innerText.trim().slice(0,24), op: getComputedStyle(e).opacity}))""")
    pg.emulate_media(reduced_motion="no-preference")
    # 200% zoom clipped, excluding marquee
    pg.set_viewport_size({"width": 720, "height": 450}); time.sleep(0.8)
    d["zoom_clip_nonmarquee"] = pg.evaluate("""() => { const out=[];
      document.querySelectorAll('h1,h2,h3,p,li,a,button,span').forEach(e=>{
        if (!(e.innerText||'').trim() || e.children.length) return;
        if (e.closest('.marquee') || e.classList.contains('marquee__item')) return;
        const r=e.getBoundingClientRect();
        if (r.width>0 && (r.right > window.innerWidth+1 || r.left < -1)) out.push({sel:e.tagName.toLowerCase()+'.'+(e.className||'').toString().split(' ')[0], t:e.innerText.slice(0,24), right:Math.round(r.right), left:Math.round(r.left)});
      });
      return {count: out.length, sample: out.slice(0,12)}; }""")
    d["zoom_hscroll"] = pg.evaluate("() => document.documentElement.scrollWidth - window.innerWidth")
    # section horizontal scrollers present?
    d["scrollers"] = pg.evaluate("""() => [...document.querySelectorAll('*')].filter(e=>e.scrollWidth > e.clientWidth+20 && getComputedStyle(e).overflowX!=='visible').map(e=>e.tagName.toLowerCase()+'.'+(e.className||'').toString().split(' ')[0]+' '+e.clientWidth+'/'+e.scrollWidth).slice(0,10)""")
    pg.set_viewport_size({"width": 1440, "height": 900}); time.sleep(0.6)
    # contrast re-measure for the two pricing nodes (2nd independent run)
    pg.evaluate("window.scrollTo(0, document.querySelector('.pricing-card__desc').getBoundingClientRect().top + window.scrollY - 300)")
    time.sleep(0.8)
    pg.add_style_tag(content="*,*::before,*::after{color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important;}")
    time.sleep(0.3)
    samples = []
    for q, label in [(".pricing-card__desc", "desc"), (".pricing-card__period", "period")]:
        r = pg.evaluate("""(q) => { const el=document.querySelector(q); const b=el.getBoundingClientRect();
           return [b.x,b.y,b.width,b.height, el.innerText.slice(0,20)]; }""", q)
        x, y, w, h, txt = r
        shot = pg.screenshot(clip={"x": x, "y": y, "width": w, "height": h})
        im = Image.open(io.BytesIO(shot)).convert("RGB")
        px = sorted(im.getdata(), key=lambda c: c[0]+c[1]+c[2])
        med = px[len(px)//2]
        fg = (138, 138, 138)
        samples.append({"label": label, "text": txt, "bg": med, "ratio": round(ratio(fg, med), 2), "rect": [round(x), round(y), round(w), round(h)]})
    d["contrast_rerun"] = samples
    res["studio"] = d
    pg.close()

    # ---- software ----
    ctx2 = b.new_context(viewport={"width": 1440, "height": 900})
    pg = ctx2.new_page()
    pg.goto("http://127.0.0.1:5174/", wait_until="load", timeout=60000)
    time.sleep(2.0)
    s = {}
    s["thumbLetter"] = pg.evaluate("""() => { const e=document.querySelector('.software-card__thumb-letter'); if(!e) return null;
      const p=e.parentElement; return {text:e.innerText, ariaHiddenAncestor: !!e.closest('[aria-hidden="true"]'),
        ownAria: e.getAttribute('aria-hidden'), parentClass: p.className, parentAria: p.getAttribute('aria-hidden'),
        parentRole: p.getAttribute('role'), opacity: getComputedStyle(e).opacity, color: getComputedStyle(e).color}; }""")
    cdp = ctx2.new_cdp_session(pg)
    nodes = cdp.send("Accessibility.getFullAXTree")["nodes"]
    statics = [n for n in nodes if not n.get("ignored") and (n.get("role") or {}).get("value") == "StaticText"]
    letters = [((n.get("name") or {}).get("value", "")) for n in statics]
    s["ax_static_single_letters"] = [x for x in letters if len(x.strip()) == 1][:15]
    s["ax_static_count"] = len(statics)
    s["searchAX"] = pg.evaluate("""() => { const i=document.querySelector('.search-bar__input'); const cs=getComputedStyle(i);
       return {outline: cs.outlineStyle + ' ' + cs.outlineWidth, focusOutline: null, type: i.type, name: i.name,
               closestLabel: i.closest('label') ? true : false, prevText: (i.parentElement.previousElementSibling||{innerText:''}).innerText,
               parentHTML: i.parentElement.outerHTML.slice(0,200)}; }""")
    # focus style of search input
    pg.evaluate("document.querySelector('.search-bar__input').focus()")
    time.sleep(0.3)
    s["searchFocused"] = pg.evaluate("""() => { const i=document.querySelector('.search-bar__input'); const cs=getComputedStyle(i);
       return {outline: cs.outlineStyle+' '+cs.outlineWidth+' '+cs.outlineColor, boxShadow: cs.boxShadow, border: cs.borderColor}; }""")
    res["software"] = s
    pg.close()
    b.close()

json.dump(res, open("verify.json", "w"), ensure_ascii=False, indent=1)
print(json.dumps(res, ensure_ascii=False, indent=1)[:6000])
