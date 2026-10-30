import json, time
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.connect_over_cdp("http://127.0.0.1:9335")
    for name, url in [("studio", "http://127.0.0.1:4173/"), ("software", "http://127.0.0.1:5174/")]:
        ctx = b.new_context(viewport={"width": 1440, "height": 900})
        pg = ctx.new_page()
        pg.goto(url, wait_until="load", timeout=60000)
        time.sleep(1.8)
        d = pg.evaluate("""() => {
          const out = [];
          document.querySelectorAll('svg').forEach(s => {
            const hiddenSelf = s.getAttribute('aria-hidden') === 'true';
            const hiddenAnc = !!s.closest('[aria-hidden="true"]');
            const labelled = s.getAttribute('aria-label') || s.querySelector('title');
            const host = s.closest('button,a,[role="button"]');
            const hostNamed = host && (host.getAttribute('aria-label') || (host.innerText||'').trim());
            out.push({hiddenSelf, hiddenAnc, labelled: !!labelled, hostNamed: !!hostNamed,
                      hostTag: host ? host.tagName.toLowerCase() : null, role: s.getAttribute('role')});
          });
          return {total: out.length,
                  exposed: out.filter(o => !o.hiddenSelf && !o.hiddenAnc && !o.labelled).length,
                  exposedInNamedHost: out.filter(o => !o.hiddenSelf && !o.hiddenAnc && !o.labelled && o.hostNamed).length,
                  exposedBare: out.filter(o => !o.hiddenSelf && !o.hiddenAnc && !o.labelled && !o.hostNamed).length};
        }""")
        print(name, json.dumps(d, ensure_ascii=False))
        pg.close()
    b.close()
