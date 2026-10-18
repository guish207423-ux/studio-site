"""QA verification for v5 fixes: B-6 micro-interactions, B-5 mobile overflow, hamburger regression."""
import asyncio
import json
from playwright.async_api import async_playwright

DIST_DIR = "/home/guish/Desktop/Projects/studio-site/dist"

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        results = {}

        # === Test 1: Mobile overflow at various viewports ===
        overflow_results = []
        for vw in [1440, 1024, 768, 480, 414, 390, 375, 360, 320, 280]:
            page = await browser.new_page(viewport={"width": vw, "height": 800})
            await page.goto(f"http://127.0.0.1:8904", wait_until="networkidle")
            await page.wait_for_timeout(500)
            m = await page.evaluate("""() => ({
                docClientW: document.documentElement.clientWidth,
                docScrollW: document.documentElement.scrollWidth,
                overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
                horizScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth,
            })""")
            m["viewport"] = vw
            overflow_results.append(m)
            await page.close()
        results["overflow"] = overflow_results

        # === Test 2: Hamburger visibility ===
        page = await browser.new_page(viewport={"width": 1440, "height": 900})
        await page.goto("http://127.0.0.1:8904", wait_until="networkidle")
        await page.wait_for_timeout(500)
        burger_desktop = await page.evaluate("""() => {
            const b = document.querySelector('.nav__burger');
            if (!b) return { found: false };
            const cs = getComputedStyle(b);
            const r = b.getBoundingClientRect();
            return { found: true, display: cs.display, visible: cs.display !== 'none', w: r.width, h: r.height };
        }""")
        results["burger_desktop"] = burger_desktop
        await page.close()

        page = await browser.new_page(viewport={"width": 390, "height": 844})
        await page.goto("http://127.0.0.1:8904", wait_until="networkidle")
        await page.wait_for_timeout(500)
        burger_mobile = await page.evaluate("""() => {
            const b = document.querySelector('.nav__burger');
            if (!b) return { found: false };
            const cs = getComputedStyle(b);
            const r = b.getBoundingClientRect();
            return { found: true, display: cs.display, visible: cs.display !== 'none', w: r.width, h: r.height };
        }""")
        results["burger_mobile"] = burger_mobile

        # Also check nav__links and nav__cta on mobile
        nav_mobile = await page.evaluate("""() => {
            const links = document.querySelector('.nav__links');
            const cta = document.querySelector('.nav__cta');
            const inner = document.querySelector('.nav__inner');
            return {
                linksDisplay: links ? getComputedStyle(links).display : 'not found',
                ctaDisplay: cta ? getComputedStyle(cta).display : 'not found',
                innerPadding: inner ? getComputedStyle(inner).padding : 'not found',
            };
        }""")
        results["nav_mobile"] = nav_mobile

        # Check glass-hero padding on mobile
        hero_mobile = await page.evaluate("""() => {
            const h = document.querySelector('.glass-hero');
            return h ? { padding: getComputedStyle(h).padding } : { found: false };
        }""")
        results["hero_mobile"] = hero_mobile
        await page.close()

        # === Test 3: Micro-interaction listeners ===
        page = await browser.new_page(viewport={"width": 1440, "height": 900})
        # Inject init script to count addEventListener calls
        await page.add_init_script("""
            window.__listenerCount = 0;
            window.__listenerTargets = {};
            const orig = EventTarget.prototype.addEventListener;
            EventTarget.prototype.addEventListener = function(type, fn, opts) {
                window.__listenerCount++;
                const key = this.className || this.tagName || 'unknown';
                window.__listenerTargets[key] = (window.__listenerTargets[key] || 0) + 1;
                return orig.call(this, type, fn, opts);
            };
        """)
        await page.goto("http://127.0.0.1:8904", wait_until="networkidle")
        await page.wait_for_timeout(1000)
        micro = await page.evaluate("""() => ({
            totalListeners: window.__listenerCount,
            byTarget: window.__listenerTargets,
        })""")
        results["micro_interactions"] = micro

        # Test actual interaction: click a button and check for ripple
        await page.evaluate("""() => {
            window.__testBtn = document.querySelector('.btn');
        }""")
        btn_info = await page.evaluate("""() => {
            const btn = document.querySelector('.btn');
            if (!btn) return { found: false };
            btn.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0, clientX: 50, clientY: 20 }));
            const ripple = btn.querySelector('.btn-ripple');
            const transform = getComputedStyle(btn).transform;
            return { found: true, hasRipple: !!ripple, transform: transform };
        }""")
        results["micro_button_test"] = btn_info

        # Test mouseenter on service card
        card_info = await page.evaluate("""() => {
            const card = document.querySelector('.service-card');
            if (!card) return { found: false };
            card.dispatchEvent(new MouseEvent('mouseenter', { bubbles: false }));
            const transform = getComputedStyle(card).transform;
            return { found: true, transform: transform };
        }""")
        results["micro_card_test"] = card_info

        # Test mousemove on .glass panel
        glass_info = await page.evaluate("""() => {
            const g = document.querySelector('.glass');
            if (!g) return { found: false };
            g.dispatchEvent(new MouseEvent('mousemove', { bubbles: false, clientX: 100, clientY: 50 }));
            const transform = getComputedStyle(g).transform;
            return { found: true, transform: transform };
        }""")
        results["micro_glass_test"] = glass_info

        await page.close()
        await browser.close()

        print(json.dumps(results, indent=2, ensure_ascii=False))

asyncio.run(main())
