#!/usr/bin/env python3
"""全站优化取证探针（真实 Chromium / Playwright）。

用法：python3 docs/review/opt-20261102/probe.py <label>
输出：docs/review/opt-20261102/<label>.json + 终端摘要

测什么（全部为实测，不读源码猜）：
  perf      FCP / LCP / CLS / DCL / load、按资源类型汇总的 transferSize、请求条数
  video     首屏加载阶段有几个 .webm 请求（懒加载是否生效）
  a11y      axe violations / incomplete
  focus     真实 Tab 遍历：停靠点总数、不可见停靠点（关闭的抽屉 / 隐藏 FAB）
  drawer    390 下打开抽屉后 activeElement、Esc 后 activeElement
  fab       Esc 是否关闭、隐藏时是否可聚焦
  cookie    toast 出现后 activeElement、按钮高度
  contrast  推荐报价卡正文的像素对比度（WCAG 相对亮度）
  目标尺寸  390 下 <44px 的可交互元素
"""
import json
import os
import sys
import time

import numpy as np
from PIL import Image
from playwright.sync_api import sync_playwright

URL = "http://127.0.0.1:4173/"
AXE = "/home/guish/.npm-global/lib/node_modules/axe-core/axe.min.js"
HERE = os.path.dirname(os.path.abspath(__file__))
LABEL = sys.argv[1] if len(sys.argv) > 1 else "run"
CHROME = "/usr/bin/chromium"

VITALS = r"""
window.__v = {fcp:0, lcp:0, lcpEl:'', cls:0};
try {
  new PerformanceObserver(l => { for (const e of l.getEntries())
    window.__v.fcp = Math.round(e.startTime); }).observe({type:'paint', buffered:true});
  new PerformanceObserver(l => { for (const e of l.getEntries()) {
    window.__v.lcp = Math.round(e.startTime);
    window.__v.lcpEl = (e.element && (e.element.className || e.element.tagName)) || e.url || '';
  }}).observe({type:'largest-contentful-paint', buffered:true});
  new PerformanceObserver(l => { for (const e of l.getEntries())
    if (!e.hadRecentInput) window.__v.cls += e.value; }).observe({type:'layout-shift', buffered:true});
} catch (err) { window.__v.err = String(err); }
"""

RESOURCES = r"""
() => {
  const out = {byType: {}, entries: [], counts: {}};
  const nav = performance.getEntriesByType('navigation')[0] || {};
  out.nav = {dcl: Math.round(nav.domContentLoadedEventEnd || 0),
             load: Math.round(nav.loadEventEnd || 0),
             transferSize: nav.transferSize || 0};
  for (const e of performance.getEntriesByType('resource')) {
    const t = e.initiatorType || 'other';
    const sz = e.transferSize || 0;
    out.byType[t] = (out.byType[t] || 0) + sz;
    out.counts[t] = (out.counts[t] || 0) + 1;
    out.entries.push({url: e.name.replace(location.origin, ''), type: t, size: sz,
                      duration: Math.round(e.duration)});
  }
  out.videoRequests = out.entries.filter(e => /\.webm(\?|$)/.test(e.url));
  out.videoBytes = out.videoRequests.reduce((a, e) => a + e.size, 0);
  out.jsBytes = out.byType.script || 0;
  out.jsCount = out.counts.script || 0;
  out.cssBytes = out.byType.link || 0;
  out.fontBytes = out.entries.filter(e => /\.woff2?$/.test(e.url)).reduce((a, e) => a + e.size, 0);
  out.imgBytes = out.byType.img || 0;
  out.totalBytes = out.entries.reduce((a, e) => a + e.size, 0) + out.nav.transferSize;
  out.requestCount = out.entries.length + 1;
  out.preloads = Array.from(document.querySelectorAll('link[rel=modulepreload]')).map(l => l.getAttribute('href'));
  return out;
}
"""

# 真实 Tab 遍历：记录每个停靠点是否在视口内、是否可见
TAB_WALK = r"""
async (max) => {
  const desc = (el) => {
    if (!el || el === document.body) return {none: true};
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    const cls = (el.className || '').toString().trim().split(/\s+/).filter(Boolean).slice(0,2).join('.');
    const inVp = r.top >= -1 && r.bottom <= innerHeight + 1 && r.left >= -1 && r.right <= innerWidth + 1;
    const visible = r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && +cs.opacity !== 0
                    && !el.closest('[inert]');
    return {tag: el.tagName.toLowerCase(), cls: cls || el.id, text: (el.innerText || el.getAttribute('aria-label') || '').trim().slice(0, 24),
            rect: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)],
            inViewport: inVp, visible, pointerEvents: cs.pointerEvents};
  };
  const out = [];
  document.body.focus();
  for (let i = 0; i < max; i++) {
    document.activeElement && document.activeElement.blur && document.activeElement.blur();
    // Keyboard Tab 必须由真实按键产生；这里用 CDP 无法模拟，所以改由外部按 Tab。
    break;
  }
  return out;
}
"""


def px_median(img_bytes, box):
    im = Image.open(__import__("io").BytesIO(img_bytes)).convert("RGB")
    a = np.asarray(im)
    return [int(np.median(a[:, :, i])) for i in range(3)]


def rel_lum(rgb):
    def ch(c):
        c = c / 255.0
        return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = (ch(x) for x in rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast(a, b):
    la, lb = rel_lum(a), rel_lum(b)
    hi, lo = max(la, lb), min(la, lb)
    return round((hi + 0.05) / (lo + 0.05), 2)


def parse_rgb(s):
    s = s.strip()
    if s.startswith("rgb"):
        parts = s[s.find("(") + 1 : s.find(")")].replace("/", ",").split(",")
        return [int(float(p)) for p in parts[:3]]
    return None


res = {"label": LABEL, "url": URL}

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=CHROME, headless=True)

    # ---------- 1. 冷启动：性能 + 网络 ----------
    ctx = browser.new_context(viewport={"width": 1440, "height": 900}, device_scale_factor=1,
                              reduced_motion="no-preference")
    pg = ctx.new_page()
    pg.add_init_script(VITALS)
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto(URL, wait_until="load", timeout=60000)
    time.sleep(3.0)
    res["perf"] = pg.evaluate("() => window.__v")
    res["network"] = pg.evaluate(RESOURCES)

    # 滚到底再回顶，确保懒加载 section 全部挂载
    h = pg.evaluate("document.body.scrollHeight")
    y = 0
    while y < h:
        pg.evaluate(f"window.scrollTo(0,{y})")
        time.sleep(0.15)
        y += 700
        h = pg.evaluate("document.body.scrollHeight")
    pg.evaluate("window.scrollTo(0,0)")
    time.sleep(1.0)
    res["network_after_scroll"] = pg.evaluate(RESOURCES)

    # ---------- 2. axe ----------
    pg.add_script_tag(path=AXE)
    res["axe"] = pg.evaluate(
        """async () => {
        const r = await axe.run(document, {resultTypes:['violations','incomplete']});
        return {version: axe.version,
                violations: r.violations.map(v => ({id:v.id, impact:v.impact, help:v.help,
                  targets: v.nodes.slice(0,8).map(n => n.target.join(' '))})),
                incomplete: r.incomplete.map(v => ({id:v.id, impact:v.impact, count:v.nodes.length}))};
    }"""
    )

    # ---------- 3. 真实 Tab 遍历（1440，未打开抽屉）----------
    pg.evaluate("document.body.focus()")
    stops = []
    for i in range(140):
        pg.keyboard.press("Tab")
        d = pg.evaluate(
            """() => {
            const el = document.activeElement;
            if (!el || el === document.body) return {none:true};
            const r = el.getBoundingClientRect(); const cs = getComputedStyle(el);
            const cls = (el.className||'').toString().trim().split(/\\s+/).filter(Boolean).slice(0,2).join('.');
            const inertAnc = !!el.closest('[inert]');
            return {tag: el.tagName.toLowerCase(), cls: cls || el.id,
                    text: (el.innerText || el.getAttribute('aria-label') || '').trim().slice(0,24),
                    rect: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)],
                    inViewport: r.top >= -1 && r.bottom <= innerHeight+1 && r.left >= -1 && r.right <= innerWidth+1,
                    opacity: cs.opacity, visibility: cs.visibility, pointerEvents: cs.pointerEvents,
                    inertAnc};
        }"""
        )
        if d.get("none"):
            stops.append(d)
            if i > 0:
                break
            continue
        stops.append(d)
    seen = set()
    uniq = []
    for s in stops:
        if s.get("none"):
            continue
        key = (s["tag"], s["cls"], tuple(s["rect"]))
        if key in seen:
            continue
        seen.add(key)
        uniq.append(s)
    res["tabwalk_1440"] = {
        "count": len(uniq),
        "invisible": [s for s in uniq if not s["inViewport"] or s["pointerEvents"] == "none"],
    }

    # ---------- 4. 焦点环：页脚订阅框 ----------
    res["newsletter_focus"] = pg.evaluate(
        """() => {
        const el = document.querySelector('.footer__newsletter-input');
        if (!el) return {missing:true};
        el.focus();
        const cs = getComputedStyle(el);
        return {outlineStyle: cs.outlineStyle, outlineWidth: cs.outlineWidth,
                boxShadow: cs.boxShadow, borderColor: cs.borderColor};
    }"""
    )

    # ---------- 4b. 桌面端：流程折叠按钮不应是 button ----------
    res["desktop_process_trigger"] = pg.evaluate(
        """() => {
        const els = Array.from(document.querySelectorAll('.process-step__trigger'));
        return {count: els.length,
                tags: [...new Set(els.map(e => e.tagName.toLowerCase()))],
                buttonsInTabOrder: els.filter(e => e.tagName === 'BUTTON' && !e.closest('[inert]')).length};
    }"""
    )

    # ---------- 5. 推荐报价卡像素对比度 ----------
    res["pricing_contrast"] = []
    for sel in [".pricing-card--highlight .pricing-card__desc",
                ".pricing-card--highlight .pricing-card__period",
                ".pricing-card:not(.pricing-card--highlight) .pricing-card__desc"]:
        info = pg.evaluate(
            """(sel) => {
            const el = document.querySelector(sel);
            if (!el) return null;
            el.scrollIntoView({block:'center'});
            const r = el.getBoundingClientRect();
            const cs = getComputedStyle(el);
            return {sel, text: el.innerText.trim().slice(0,20), color: cs.color,
                    fontSize: cs.fontSize, fontWeight: cs.fontWeight,
                    box: [r.x, r.y, r.width, r.height]};
        }""",
            sel,
        )
        if not info:
            continue
        time.sleep(0.4)
        box = info["box"]
        el_handle = pg.query_selector(sel)
        prev = el_handle.evaluate("el => el.style.color")
        el_handle.evaluate("el => el.style.setProperty('color','transparent','important')")
        shot = el_handle.screenshot()
        el_handle.evaluate("(el, v) => el.style.cssText = v", prev)
        bg = px_median(shot, box)
        fg = parse_rgb(info["color"])
        info["bgPixel"] = bg
        info["ratio"] = contrast(fg, bg) if fg else None
        res["pricing_contrast"].append(info)
    pg.close()

    # ---------- 6. 390 移动端 ----------
    m = browser.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2,
                            is_mobile=True, has_touch=True, reduced_motion="no-preference")
    mp = m.new_page()
    mp.on("pageerror", lambda e: errs.append("mobile: " + str(e)))
    mp.goto(URL, wait_until="load", timeout=60000)
    time.sleep(2.5)

    res["mobile_cookie"] = mp.evaluate(
        """() => {
        const t = document.querySelector('.cookie-toast');
        if (!t) return {missing:true};
        const r = t.getBoundingClientRect();
        const btns = Array.from(t.querySelectorAll('button')).map(b => {
          const br = b.getBoundingClientRect();
          return {text: b.innerText.trim(), w: Math.round(br.width), h: Math.round(br.height)};
        });
        return {activeEl: document.activeElement.tagName + '.' + (document.activeElement.className||''),
                rect: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)],
                buttons: btns};
    }"""
    )

    # 抽屉焦点管理
    mp.evaluate("document.querySelector('.nav__burger').focus()")
    mp.keyboard.press("Enter")
    time.sleep(0.6)
    drawer_open = mp.evaluate(
        """() => {
        const d = document.querySelector('#drawer');
        const el = document.activeElement;
        return {open: d.classList.contains('drawer--open'), inert: d.hasAttribute('inert'),
                activeEl: el.tagName.toLowerCase() + '.' + (el.className||''),
                activeInDrawer: !!el.closest('#drawer')};
    }"""
    )
    mp.keyboard.press("Escape")
    time.sleep(0.6)
    drawer_closed = mp.evaluate(
        """() => {
        const d = document.querySelector('#drawer');
        const el = document.activeElement;
        const r = el.getBoundingClientRect();
        return {open: d.classList.contains('drawer--open'), inert: d.hasAttribute('inert'),
                activeEl: el.tagName.toLowerCase() + '.' + (el.className||''),
                activeY: Math.round(r.y), inViewport: r.top >= -1 && r.bottom <= innerHeight + 1};
    }"""
    )
    res["mobile_drawer"] = {"after_open": drawer_open, "after_escape": drawer_closed}

    # FAB：Esc 是否关闭、隐藏时是否可聚焦
    res["mobile_fab_hidden"] = mp.evaluate(
        """() => {
        const group = document.querySelector('.fab-group');
        const fab = document.querySelector('.fab');
        if (!fab) return {missing:true};
        const gs = getComputedStyle(group);
        fab.focus();
        return {groupOpacity: gs.opacity, groupPointerEvents: gs.pointerEvents,
                groupInert: group.hasAttribute('inert'),
                tabbable: document.activeElement === fab};
    }"""
    )
    # 滚到 fab-group 可见，再测 Esc
    mp.evaluate("window.scrollTo(0, 900)")
    time.sleep(0.8)
    mp.evaluate("document.querySelector('.fab').focus()")
    mp.evaluate("document.querySelector('.fab').click()")
    time.sleep(0.5)
    fab_state = mp.evaluate(
        """() => {
        const group = document.querySelector('.fab-group');
        const fab = document.querySelector('.fab');
        return {groupOpacity: getComputedStyle(group).opacity, groupInert: group.hasAttribute('inert'),
                expandedAfterOpen: fab.getAttribute('aria-expanded'),
                menuVisible: !!document.querySelector('.fab-menu'),
                activeEl: document.activeElement.tagName.toLowerCase() + '.' + (document.activeElement.className||'')};
    }"""
    )
    mp.keyboard.press("Escape")
    time.sleep(0.5)
    fab_state["expandedAfterEscape"] = mp.evaluate(
        "() => document.querySelector('.fab').getAttribute('aria-expanded')"
    )
    fab_state["menuAfterEscape"] = mp.evaluate("() => !!document.querySelector('.fab-menu')")
    fab_state["activeAfterEscape"] = mp.evaluate(
        "() => document.activeElement.tagName.toLowerCase() + '.' + (document.activeElement.className||'')"
    )
    res["mobile_fab"] = fab_state

    # 语义：筛选器角色、视频属性、桌面折叠按钮
    res["semantics"] = mp.evaluate(
        """() => ({
        roleTabCount: document.querySelectorAll('[role=tab]').length,
        pressedCount: document.querySelectorAll('.works-filter__btn[aria-pressed]').length,
        videoPreload: Array.from(document.querySelectorAll('.work-card__preview video')).map(v => v.getAttribute('preload')),
        videoAriaHidden: Array.from(document.querySelectorAll('.work-card__preview video')).map(v => v.getAttribute('aria-hidden')),
        partnersTabindex: document.querySelector('.partners-strip')?.getAttribute('tabindex'),
    })"""
    )

    # 目标尺寸
    res["tap_targets_390"] = mp.evaluate(
        """() => {
        const els = Array.from(document.querySelectorAll(
          'a,button,input,select,textarea,summary,[role=button],[role=tab]'));
        const small = [];
        for (const el of els) {
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) continue;
          if (getComputedStyle(el).visibility === 'hidden') continue;
          if (r.width < 44 || r.height < 44) {
            const cls = (el.className||'').toString().trim().split(/\\s+/)[0];
            small.push({tag: el.tagName.toLowerCase(), cls, text: (el.innerText||'').trim().slice(0,14),
                        w: Math.round(r.width), h: Math.round(r.height)});
          }
        }
        const agg = {};
        for (const s of small) { const k = s.tag + '.' + s.cls; agg[k] = agg[k] ? agg[k] + 1 : 1; }
        return {total: els.length, small: small.length, agg};
    }"""
    )

    res["pageerrors"] = errs
    m.close()
    browser.close()

with open(os.path.join(HERE, LABEL + ".json"), "w") as f:
    json.dump(res, f, ensure_ascii=False, indent=1)

# ---------- 摘要 ----------
pf, nw = res["perf"], res["network"]
print(f"== {LABEL} ==")
print(f"FCP {pf.get('fcp')}ms  LCP {pf.get('lcp')}ms ({pf.get('lcpEl')})  CLS {round(pf.get('cls', 0), 4)}  DCL {nw['nav']['dcl']}ms  load {nw['nav']['load']}ms")
print(f"请求 {nw['requestCount']} 条 / 传输 {nw['totalBytes']/1024:.1f}KB "
      f"(js {nw['jsBytes']/1024:.1f}KB×{nw['jsCount']} · css {nw['cssBytes']/1024:.1f}KB · font {nw['fontBytes']/1024:.1f}KB · img {nw['imgBytes']/1024:.1f}KB)")
print(f"视频请求 @load: {len(nw['videoRequests'])} 条 / {nw['videoBytes']/1024:.1f}KB ; 滚到底后: "
      f"{len(res['network_after_scroll']['videoRequests'])} 条 / {res['network_after_scroll']['videoBytes']/1024:.1f}KB")
print(f"modulepreload: {nw['preloads']}")
a = res["axe"]
print(f"axe {a['version']}: violations={len(a['violations'])} incomplete={len(a['incomplete'])}")
for v in a["violations"]:
    print(f"   [V] {v['id']} x{len(v['targets'])} {v['targets'][:3]}")
for v in a["incomplete"]:
    print(f"   (i) {v['id']} x{v['count']}")
tw = res["tabwalk_1440"]
print(f"Tab 停靠点 {tw['count']}，不可见/不可点 {len(tw['invisible'])}: "
      f"{[(s['cls'], s['rect'], s['pointerEvents']) for s in tw['invisible'][:8]]}")
print(f"订阅框焦点环: {res['newsletter_focus']}")
for c in res["pricing_contrast"]:
    print(f"对比度 {c['sel']} → {c['ratio']} (fg {c['color']} / bg {c['bgPixel']})")
print(f"cookie: {res['mobile_cookie']}")
print(f"抽屉: 打开后 {res['mobile_drawer']['after_open']} / Esc 后 {res['mobile_drawer']['after_escape']}")
print(f"FAB 隐藏态: {res['mobile_fab_hidden']}")
print(f"FAB 可见态: {res['mobile_fab']}")
print(f"语义: {res['semantics']}")
print(f"390 目标尺寸: {res['tap_targets_390']['small']}/{res['tap_targets_390']['total']} <44px {res['tap_targets_390']['agg']}")
print(f"pageerrors: {res['pageerrors'][:5]}")
