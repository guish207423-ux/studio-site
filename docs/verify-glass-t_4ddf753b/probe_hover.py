#!/usr/bin/env python3
"""hover 浮起的定点排查：:hover 是否命中、translate/scale 计算值、内联写入、命中目标。"""
import json
import shutil
import subprocess
import sys
import tempfile
import time
import urllib.request

from verify_atmosphere import CDP, CHROME, free_port

SCROLL_JS = r"""(() => {
  const el = document.querySelector('.glass-contact');
  const y = el.getBoundingClientRect().top + window.scrollY - (window.innerHeight - el.offsetHeight) / 2;
  if (window.lenis && typeof window.lenis.scrollTo === 'function') window.lenis.scrollTo(y, { immediate: true });
  else window.scrollTo(0, y);
  const r = el.getBoundingClientRect();
  return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
})()"""

READ = r"""(async () => {
  const el = document.querySelector('.glass-contact');
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  const cs = getComputedStyle(el);
  const r = el.getBoundingClientRect();
  return {
    matchesHover: el.matches(':hover'),
    hoverChain: Array.from(document.querySelectorAll(':hover')).map(e => e.className && e.className.toString ? e.className.toString().trim() : e.tagName).slice(-4),
    translate: cs.translate, scale: cs.scale, transform: cs.transform,
    inlineTranslate: el.style.translate || '(empty)', inlineTransform: el.style.transform || '(empty)',
    bg: cs.backgroundColor, shadowLen: cs.boxShadow.length,
    rect: { x: Math.round(r.x), y: Math.round(r.y) },
    reduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
    hoverMedia: matchMedia('(hover: hover)').matches,
    anyHover: matchMedia('(any-hover: hover)').matches,
    pointerFine: matchMedia('(pointer: fine)').matches,
  };
})()"""


def mouse(cdp, x, y):
    cdp.send("Input.dispatchMouseEvent",
             {"type": "mouseMoved", "x": x, "y": y, "button": "none", "buttons": 0, "clickCount": 0})


def main():
    url = sys.argv[1]
    out_json = sys.argv[2] if len(sys.argv) > 2 else ""
    port = free_port()
    profile = tempfile.mkdtemp(prefix="cdp-hover-")
    proc = subprocess.Popen(
        [CHROME, "--headless=new", "--no-sandbox", "--disable-gpu", "--hide-scrollbars",
         f"--remote-debugging-port={port}", f"--user-data-dir={profile}", "about:blank"],
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    out = {}
    try:
        info = None
        for _ in range(120):
            try:
                info = json.load(urllib.request.urlopen(f"http://127.0.0.1:{port}/json/version", timeout=0.5))
                break
            except Exception:
                time.sleep(0.1)
        if info is None:
            raise RuntimeError("no devtools")
        root = CDP(info["webSocketDebuggerUrl"])
        tid = root.send("Target.createTarget", {"url": "about:blank"})["targetId"]
        root.session = root.send("Target.attachToTarget", {"targetId": tid, "flatten": True})["sessionId"]
        cdp = root
        cdp.send("Page.enable")
        cdp.send("Runtime.enable")
        cdp.send("Emulation.setDeviceMetricsOverride",
                 {"width": 1440, "height": 900, "deviceScaleFactor": 1, "mobile": False})
        cdp.send("Page.navigate", {"url": url})
        time.sleep(4.5)
        r = cdp.evaluate(SCROLL_JS)
        time.sleep(1.0)
        out["rect"] = r
        out["before"] = cdp.evaluate(READ, await_promise=True)
        cx, cy = r["x"] + r["w"] * 0.5, r["y"] + r["h"] * 0.4
        out["target_point"] = {"x": cx, "y": cy}
        # 分步移动，避免瞬移被某些实现忽略
        px, py = 5.0, 5.0
        for i in range(1, 11):
            mouse(cdp, px + (cx - px) * i / 10, py + (cy - py) * i / 10)
            time.sleep(0.05)
        time.sleep(1.4)
        out["hovered"] = cdp.evaluate(READ, await_promise=True)
        out["element_from_point"] = cdp.evaluate(
            "(() => { const el = document.elementFromPoint(%s, %s); return el ? (el.className||el.tagName) : null })()"
            % (round(cx), round(cy)))
        # 移开
        for i in range(1, 11):
            mouse(cdp, cx + (5 - cx) * i / 10, cy + (5 - cy) * i / 10)
            time.sleep(0.05)
        time.sleep(1.4)
        out["reset"] = cdp.evaluate(READ, await_promise=True)
        js = json.dumps(out, ensure_ascii=False, indent=1)
        print(js)
        if out_json:
            open(out_json, "w", encoding="utf-8").write(js)
    finally:
        proc.terminate()
        try:
            proc.wait(timeout=5)
        except Exception:
            proc.kill()
        shutil.rmtree(profile, ignore_errors=True)


if __name__ == "__main__":
    main()
