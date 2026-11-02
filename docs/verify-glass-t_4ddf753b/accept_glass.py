#!/usr/bin/env python3
"""玻璃验收三连：桌面实例/对比度、移动端降级、reduced-motion 降级。

全部取实测值，不含截图视觉判读：
  · 折射实例数 = computed backdrop-filter 里含 url( 的元素数（含继承）
  · 导航对比度 = 截取导航条内无字带的最亮/最暗背景像素，与 .nav__link 前景色算 WCAG 比值
  · 移动端 = 390×844：只允许导航挂折射；scrollWidth 不得超视口
  · reduced-motion = 模拟偏好：hover 浮起必须为 none、导航/面板必须回落到 CSS blur
"""
import json
import shutil
import subprocess
import sys
import tempfile
import time
import urllib.request

from PIL import ImageChops

from verify_atmosphere import CDP, CHROME, free_port, screenshot


def srgb_to_lin(c):
    c = c / 255.0
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def rel_lum(rgb):
    r, g, b = (srgb_to_lin(v) for v in rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast(a, b):
    la, lb = rel_lum(a), rel_lum(b)
    hi, lo = max(la, lb), min(la, lb)
    return round((hi + 0.05) / (lo + 0.05), 2)


COUNT_JS = r"""(() => {
  const all = Array.from(document.querySelectorAll('*'));
  const refr = all.filter(el => (getComputedStyle(el).backdropFilter || '').includes('url('));
  return {
    instances: refr.length,
    selectors: refr.map(el => el.className && el.className.toString ? el.className.toString().trim() : el.tagName),
    filterNodes: document.querySelectorAll('filter[id^=hyalite]').length,
    overflowX: document.documentElement.scrollWidth - window.innerWidth,
    navBF: getComputedStyle(document.querySelector('.nav')).backdropFilter,
    contactBF: (() => { const el = document.querySelector('.glass-contact'); return el ? getComputedStyle(el).backdropFilter : null })(),
    linkColor: getComputedStyle(document.querySelector('.nav__link')).color,
    reduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
  };
})()"""

HOVER_STATE = r"""(() => {
  const el = document.querySelector('.glass-contact');
  const cs = getComputedStyle(el);
  return { translate: cs.translate, scale: cs.scale, hovered: el.matches(':hover') };
})()"""


def new_page(port, profile):
    proc = subprocess.Popen(
        [CHROME, "--headless=new", "--no-sandbox", "--disable-gpu", "--hide-scrollbars",
         f"--remote-debugging-port={port}", f"--user-data-dir={profile}", "about:blank"],
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    info = None
    for _ in range(120):
        try:
            info = json.load(urllib.request.urlopen(f"http://127.0.0.1:{port}/json/version", timeout=0.5))
            break
        except Exception:
            time.sleep(0.1)
    if info is None:
        raise RuntimeError("devtools did not start")
    root = CDP(info["webSocketDebuggerUrl"])
    tid = root.send("Target.createTarget", {"url": "about:blank"})["targetId"]
    root.session = root.send("Target.attachToTarget", {"targetId": tid, "flatten": True})["sessionId"]
    root.send("Page.enable")
    root.send("Runtime.enable")
    return proc, root


def mouse(cdp, x, y):
    cdp.send("Input.dispatchMouseEvent",
             {"type": "mouseMoved", "x": x, "y": y, "button": "none", "buttons": 0, "clickCount": 0})


def main():
    url = sys.argv[1]
    out_json = sys.argv[2] if len(sys.argv) > 2 else ""
    out = {}

    # ---------- 1. 桌面 ----------
    port = free_port()
    profile = tempfile.mkdtemp(prefix="cdp-acc1-")
    proc, cdp = new_page(port, profile)
    try:
        cdp.send("Emulation.setDeviceMetricsOverride",
                 {"width": 1440, "height": 900, "deviceScaleFactor": 1, "mobile": False})
        cdp.send("Page.navigate", {"url": url})
        time.sleep(4.5)
        out["desktop"] = cdp.evaluate(COUNT_JS)

        # 导航条对比度：截 nav 区域，取顶部 6px 无字带做背景采样
        nav = cdp.evaluate("""(() => { const r = document.querySelector('.nav').getBoundingClientRect();
          return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) } })()""")
        img = screenshot(cdp).convert("RGB")
        band = img.crop((nav["x"] + 30, nav["y"] + 3, nav["x"] + nav["w"] - 30, nav["y"] + 8))
        px = list(band.getdata())
        lum_sorted = sorted(px, key=rel_lum)
        darkest = lum_sorted[0]
        lightest = lum_sorted[-1]
        fg = cdp.evaluate("(() => { const c = getComputedStyle(document.querySelector('.nav__link')).color;"
                          " const m = c.match(/[\\d.]+/g).map(Number); return m.slice(0,3) })()")
        out["nav_contrast"] = {
            "fg_rgb": fg,
            "bg_darkest_px": list(darkest),
            "bg_lightest_px": list(lightest),
            "contrast_vs_darkest": contrast([int(v) for v in fg], darkest),
            "contrast_vs_lightest": contrast([int(v) for v in fg], lightest),
            "nav_rect": nav,
        }
    finally:
        proc.terminate()
        try:
            proc.wait(timeout=5)
        except Exception:
            proc.kill()
        shutil.rmtree(profile, ignore_errors=True)

    # ---------- 2. 移动端 390×844 ----------
    port = free_port()
    profile = tempfile.mkdtemp(prefix="cdp-acc2-")
    proc, cdp = new_page(port, profile)
    try:
        cdp.send("Emulation.setDeviceMetricsOverride",
                 {"width": 390, "height": 844, "deviceScaleFactor": 2, "mobile": True})
        cdp.send("Page.navigate", {"url": url})
        time.sleep(4.5)
        out["mobile"] = cdp.evaluate(COUNT_JS)
    finally:
        proc.terminate()
        try:
            proc.wait(timeout=5)
        except Exception:
            proc.kill()
        shutil.rmtree(profile, ignore_errors=True)

    # ---------- 3. reduced-motion ----------
    port = free_port()
    profile = tempfile.mkdtemp(prefix="cdp-acc3-")
    proc, cdp = new_page(port, profile)
    try:
        cdp.send("Emulation.setDeviceMetricsOverride",
                 {"width": 1440, "height": 900, "deviceScaleFactor": 1, "mobile": False})
        cdp.send("Emulation.setEmulatedMedia",
                 {"features": [{"name": "prefers-reduced-motion", "value": "reduce"}]})
        cdp.send("Page.navigate", {"url": url})
        time.sleep(4.5)
        out["reduced_before"] = cdp.evaluate(COUNT_JS)
        box = cdp.evaluate("""(() => { const r = document.querySelector('.glass-contact').getBoundingClientRect();
          return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) } })()""")
        cdp.evaluate("document.querySelector('.glass-contact').scrollIntoView({block:'center'})")
        time.sleep(0.8)
        box = cdp.evaluate("""(() => { const r = document.querySelector('.glass-contact').getBoundingClientRect();
          return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) } })()""")
        cx, cy = box["x"] + box["w"] / 2, box["y"] + min(box["h"] / 2, 260)
        for i in range(1, 11):
            mouse(cdp, 5 + (cx - 5) * i / 10, 5 + (cy - 5) * i / 10)
            time.sleep(0.05)
        time.sleep(0.9)
        out["reduced_hover"] = cdp.evaluate(HOVER_STATE)
    finally:
        proc.terminate()
        try:
            proc.wait(timeout=5)
        except Exception:
            proc.kill()
        shutil.rmtree(profile, ignore_errors=True)

    js = json.dumps(out, ensure_ascii=False, indent=1)
    print(js)
    if out_json:
        open(out_json, "w", encoding="utf-8").write(js)


if __name__ == "__main__":
    main()
