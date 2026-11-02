#!/usr/bin/env python3
"""折射强度分带量化：把玻璃上沿按 0-4 / 4-10 / 10-20 / 20-40 / 40-70px 分带，
逐带统计折射 on/off 的像素差分。弯折带（bevel）加宽后，差异会从最外 10px
摊到更深的带里 —— 只看固定 10px 会误判「变弱」。

用法: python3 probe_bands.py <url> --json out.json
"""
import argparse
import json
import shutil
import subprocess
import sys
import tempfile
import time
import urllib.request

from verify_atmosphere import CDP, CHROME, diff_stats, free_port, screenshot
from verify_glass_ab import FREEZE_JS, SCROLL_JS, WARM_JS

FALLBACK = "blur(16px) saturate(160%) brightness(108%)"
READ_BF = """(() => {
  const el = document.querySelector('.glass-contact');
  const cs = getComputedStyle(el);
  return { bf: cs.backdropFilter, hyalite: cs.getPropertyValue('--hyalite').trim() };
})()"""

BANDS = [("0-4", 0, 4), ("4-10", 4, 10), ("10-20", 10, 20), ("20-40", 20, 40), ("40-70", 40, 70)]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("url")
    ap.add_argument("--json", default="")
    ap.add_argument("--shots", default="")
    args = ap.parse_args()

    port = free_port()
    profile = tempfile.mkdtemp(prefix="cdp-bands-")
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
        cdp.send("Page.navigate", {"url": args.url})
        time.sleep(4.0)
        out["docH"] = cdp.evaluate(WARM_JS, await_promise=True)
        pos = cdp.evaluate(SCROLL_JS % ".glass-contact", await_promise=True)
        time.sleep(0.8)
        out["scroll"] = pos
        cdp.evaluate(FREEZE_JS, await_promise=True)
        time.sleep(0.5)
        out["refraction_on"] = cdp.evaluate(READ_BF)
        screenshot(cdp)
        time.sleep(0.8)
        a = screenshot(cdp)
        if args.shots:
            a.save(args.shots + "-on.png")
        cdp.evaluate("document.querySelector('.glass-contact').style.setProperty('--hyalite', %s)"
                     % json.dumps(FALLBACK))
        time.sleep(0.7)
        out["refraction_off"] = cdp.evaluate(READ_BF)
        b = screenshot(cdp)
        if args.shots:
            b.save(args.shots + "-off.png")

        r = pos["rect"]
        x1, y1 = max(0, r["x"]), max(0, r["y"])
        x2, y2 = min(1440, r["x"] + r["w"]), min(900, r["y"] + r["h"])
        out["bands"] = {}
        for name, top, bottom in BANDS:
            box = (x1, y1 + top, x2, min(y2, y1 + bottom))
            if box[3] <= box[1]:
                continue
            out["bands"][name] = diff_stats(a, b, box)
        cx1, cy1 = x1 + int((x2 - x1) * 0.3), y1 + int((y2 - y1) * 0.3)
        out["center"] = diff_stats(a, b, (cx1, cy1, x2 - int((x2 - x1) * 0.3), y2 - int((y2 - y1) * 0.3)))
        out["bg_band"] = diff_stats(a, b, (0, y1 + 120, 150, y2 - 120))

        js = json.dumps(out, ensure_ascii=False, indent=1)
        print(js)
        if args.json:
            open(args.json, "w", encoding="utf-8").write(js)
    finally:
        proc.terminate()
        try:
            proc.wait(timeout=5)
        except Exception:
            proc.kill()
        shutil.rmtree(profile, ignore_errors=True)


if __name__ == "__main__":
    sys.exit(main())
