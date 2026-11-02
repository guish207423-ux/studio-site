#!/usr/bin/env python3
"""hyalite 面板参数扫档：同一页面内用 Hyalite.setOpts 逐档重建滤镜，逐档做折射 on/off
差分，比较「弯折带宽度的均值」与「rim 峰值」。

判据（liquid-glass-ui references/verify-refraction.md 的分区思路）：
  · rim 峰值 (0-4px) 越高 = 边缘位移越强
  · 4-40px 带的 mean 越高 = 玻璃背后的结构被弯折得更明显（这才是「折射看得见」）
  · center 必须接近 0（中心被加工 = 假玻璃）
用法: python3 sweep_params.py <url> --json out.json
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

CANDIDATES = {
    "old_46_84_3.4":  dict(bevel=46, thickness=84,  shape="lip", slope=3.4, dispersion=2.4,
                           shade=0.62, rim=2.4,  edgeW=4, sat=1.9, edge=0.08),
    "new_56_118_3.6": dict(bevel=56, thickness=118, shape="lip", slope=3.6, dispersion=3.1,
                           shade=0.68, rim=2.75, edgeW=5, sat=2.1, edge=0.08),
    "wide_62_150_2.9": dict(bevel=62, thickness=150, shape="lip", slope=2.9, dispersion=3.0,
                            shade=0.68, rim=2.75, edgeW=5, sat=2.1, edge=0.08),
    "wide_58_132_2.4": dict(bevel=58, thickness=132, shape="lip", slope=2.4, dispersion=2.8,
                            shade=0.66, rim=2.7,  edgeW=5, sat=2.0, edge=0.08),
    "deep_70_160_2.6": dict(bevel=70, thickness=160, shape="lip", slope=2.6, dispersion=3.2,
                            shade=0.7,  rim=2.8,  edgeW=5, sat=2.1, edge=0.08),
}

BANDS = [("0-4", 0, 4), ("4-10", 4, 10), ("10-20", 10, 20), ("20-40", 20, 40), ("40-70", 40, 70)]

SET = """(async (o) => {
  await window.Hyalite.setOpts(o);
  await new Promise(r => setTimeout(r, 400));
  const el = document.querySelector('.glass-contact');
  return getComputedStyle(el).backdropFilter + ' | ' + getComputedStyle(el).getPropertyValue('--hyalite').trim();
})"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("url")
    ap.add_argument("--json", default="")
    args = ap.parse_args()

    port = free_port()
    profile = tempfile.mkdtemp(prefix="cdp-sweep-")
    proc = subprocess.Popen(
        [CHROME, "--headless=new", "--no-sandbox", "--disable-gpu", "--hide-scrollbars",
         f"--remote-debugging-port={port}", f"--user-data-dir={profile}", "about:blank"],
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    out = {"candidates": {}}
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
        cdp.evaluate(FREEZE_JS, await_promise=True)
        time.sleep(0.4)
        out["scroll"] = pos
        r = pos["rect"]
        x1, y1, x2, y2 = max(0, r["x"]), max(0, r["y"]), min(1440, r["x"] + r["w"]), min(900, r["y"] + r["h"])

        for name, params in CANDIDATES.items():
            bf = cdp.evaluate(
                "(async () => { await window.Hyalite.setOpts(%s);"
                " await new Promise(r => setTimeout(r, 500));"
                " return getComputedStyle(document.querySelector('.glass-contact')).backdropFilter; })()"
                % json.dumps(params), await_promise=True)
            time.sleep(0.9)
            screenshot(cdp)
            time.sleep(0.5)
            a = screenshot(cdp)
            cdp.evaluate("document.querySelector('.glass-contact').style.setProperty('--hyalite', %s)"
                         % json.dumps(FALLBACK))
            time.sleep(0.7)
            ctl = cdp.evaluate("getComputedStyle(document.querySelector('.glass-contact')).backdropFilter")
            b = screenshot(cdp)
            cdp.evaluate("document.querySelector('.glass-contact').style.removeProperty('--hyalite')")
            time.sleep(0.3)

            rec = {"backdropFilter": bf, "control": ctl, "params": params, "bands": {}}
            for band, top, bottom in BANDS:
                box = (x1, y1 + top, x2, min(y2, y1 + bottom))
                if box[3] > box[1]:
                    rec["bands"][band] = diff_stats(a, b, box)
            rec["center"] = diff_stats(a, b, (x1 + int((x2 - x1) * .3), y1 + int((y2 - y1) * .3),
                                              x2 - int((x2 - x1) * .3), y2 - int((y2 - y1) * .3)))
            rec["control_really_off"] = "url(" not in (ctl or "")
            # 评分：边缘峰值 + 弯折带(4-40px)均值
            mid = [rec["bands"][b]["mean_delta"] for b in ("4-10", "10-20", "20-40") if b in rec["bands"]]
            rec["rim_max"] = rec["bands"]["0-4"]["max_delta"]
            rec["mid_mean"] = round(sum(mid) / max(1, len(mid)), 2)
            rec["center_max"] = rec["center"]["max_delta"]
            out["candidates"][name] = rec
            print(f"{name:<18} rim_max={rec['rim_max']:<4} mid_mean={rec['mid_mean']:<7} "
                  f"center_max={rec['center_max']:<4} off={rec['control_really_off']} bf={bf}")

        js = json.dumps(out, ensure_ascii=False, indent=1)
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
