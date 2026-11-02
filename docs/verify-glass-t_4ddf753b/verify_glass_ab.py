#!/usr/bin/env python3
"""玻璃区折射 A/B 差分 —— 有/无大气色层两帧对比（分区判读）。

判据（liquid-glass-ui references/verify-refraction.md）：
  玻璃元素区域 changed% / max 应显著高于同帧空白背景带 —— 气泡/色偏是「背景被加工」，
  只有拿同帧的非玻璃区做对照才能排除「大气层自己变色」。

额外：rim（8px 内环）vs center（中心 40%）分带统计 —— 折射是边缘现象。

用法：python3 verify_glass_ab.py <url> [--json out.json]
"""
import argparse
import json
import shutil
import subprocess
import sys
import tempfile
import time
import urllib.request

from PIL import ImageChops

from verify_atmosphere import CDP, CHROME, diff_stats, free_port, screenshot

SCROLL_JS = r"""
(async (sel) => {
  const el = document.querySelector(sel);
  if (!el) return { ok: false };
  const y = el.getBoundingClientRect().top + window.scrollY - (window.innerHeight - el.offsetHeight) / 2;
  if (window.lenis && typeof window.lenis.scrollTo === 'function') {
    window.lenis.scrollTo(y, { immediate: true });
  } else {
    window.scrollTo(0, y);
  }
  await new Promise(r => setTimeout(r, 700));
  const r2 = el.getBoundingClientRect();
  return { ok: true, scrollY: Math.round(window.scrollY),
           rect: { x: Math.round(r2.x), y: Math.round(r2.y), w: Math.round(r2.width), h: Math.round(r2.height) } };
})('%s')
"""

FREEZE_JS = r"""
(async () => {
  document.getAnimations().forEach(a => { try { a.pause(); } catch (e) {} });
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  return document.getAnimations().filter(a => a.playState === 'running').length;
})()
"""

# 预热：整页滚一遍触发 lazy chunk / 图片 / reveal，再回来测。
# 不预热时「两帧之间新挂载的区块」会被读成差分噪声。
WARM_JS = r"""(async () => {
  const h = document.documentElement.scrollHeight;
  for (let y = 0; y < h; y += 600) {
    if (window.lenis && window.lenis.scrollTo) window.lenis.scrollTo(y, { immediate: true });
    else window.scrollTo(0, y);
    await new Promise(r => setTimeout(r, 120));
  }
  if (window.lenis && window.lenis.scrollTo) window.lenis.scrollTo(0, { immediate: true });
  else window.scrollTo(0, 0);
  await new Promise(r => setTimeout(r, 1600));
  return Math.round(document.documentElement.scrollHeight);
})()"""

SAMPLE_JS = r"""(() => {
  const atm = document.querySelector('.light-field__atmosphere');
  const pts = {blue:[0.25,0.20], purple:[0.78,0.74], teal:[0.52,0.52], corner:[0.03,0.95]};
  const cv = document.createElement('canvas');
  cv.width = 1; cv.height = 1;
  // 用 CSS 变量算期望色更容易，但这里直接从计算样式取渐变字符串做记录
  return { backgroundImage: getComputedStyle(atm).backgroundImage.slice(0, 400) };
})()"""


def region(box, sub):
    """把 box 裁到子区域：sub = 'rim' | 'center' | 'all'"""
    x1, y1, x2, y2 = box
    w, h = x2 - x1, y2 - y1
    if sub == "all":
        return box
    if sub == "center":
        dx, dy = int(w * 0.3), int(h * 0.3)
        return (x1 + dx, y1 + dy, x2 - dx, y2 - dy)
    # rim: 取上沿 10px 带 + 下沿 10px 带（上边缘是折射弯折最可读的位置）
    return (x1, y1, x2, y1 + 10)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("url")
    ap.add_argument("--json", default="")
    ap.add_argument("--shots", default="")
    args = ap.parse_args()

    port = free_port()
    profile = tempfile.mkdtemp(prefix="cdp-glass-")
    proc = subprocess.Popen(
        [CHROME, "--headless=new", "--no-sandbox", "--disable-gpu", "--hide-scrollbars",
         f"--remote-debugging-port={port}", f"--user-data-dir={profile}", "about:blank"],
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    out = {}
    try:
        for _ in range(120):
            try:
                info = json.load(urllib.request.urlopen(f"http://127.0.0.1:{port}/json/version", timeout=0.5))
                break
            except Exception:
                time.sleep(0.1)
        else:
            raise RuntimeError("chromium 未启动")

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
        out["warm_docH"] = cdp.evaluate(WARM_JS, await_promise=True)

        pos = cdp.evaluate(SCROLL_JS % ".glass-contact", await_promise=True)
        out["scroll"] = pos
        if not pos.get("ok"):
            raise RuntimeError("找不到 .glass-contact")

        time.sleep(0.8)
        out["running_after_freeze"] = cdp.evaluate(FREEZE_JS, await_promise=True)
        # 稳定帧：先空拍一张丢掉。首帧可能正处在图片解码 / 字体换字 / 图层首次合成中，
        # 直接拿它做 A 会把「页面还在变」读成差分信号（实测假信号 max 229）。
        screenshot(cdp)
        time.sleep(0.8)

        a = screenshot(cdp)
        if args.shots:
            a.save(args.shots + "-glass-with-atm.png")
        cdp.evaluate("document.querySelector('.light-field__atmosphere').style.display='none'")
        time.sleep(0.6)
        b = screenshot(cdp)
        if args.shots:
            b.save(args.shots + "-glass-without-atm.png")
        cdp.evaluate("document.querySelector('.light-field__atmosphere').style.display=''")
        time.sleep(0.4)

        r = pos["rect"]
        glass_box = (max(0, r["x"]), max(0, r["y"]),
                     min(1440, r["x"] + r["w"]), min(900, r["y"] + r["h"]))
        out["glass_box"] = glass_box

        # 同帧空白背景带：容器左边距（1440 下容器 1224 居中 → 内容从 108 起，
        # 玻璃卡从 x=172 起，x∈[0,150] 是纯背景），取与玻璃卡同 y 范围
        bg_box = (0, glass_box[1] + 20, 150, glass_box[3] - 20)
        out["background_box"] = bg_box

        out["diff"] = {
            "full_viewport": diff_stats(a, b),
            "glass_all": diff_stats(a, b, glass_box),
            "glass_rim_top": diff_stats(a, b, region(glass_box, "rim")),
            "glass_center": diff_stats(a, b, region(glass_box, "center")),
            "background_same_band": diff_stats(a, b, bg_box),
        }

        # 折射体感判据：rim 的 max/超阈值占比 vs 同帧背景带
        d = out["diff"]
        out["verdict"] = {
            "rim_max": d["glass_rim_top"]["max_delta"],
            "bg_max": d["background_same_band"]["max_delta"],
            "rim_changed_pct": d["glass_rim_top"]["changed_pct"],
            "bg_changed_pct": d["background_same_band"]["changed_pct"],
            "rim_over_bg_max": round(d["glass_rim_top"]["max_delta"] / max(1, d["background_same_band"]["max_delta"]), 2),
        }

        # 三色落点：取像素确认色相方向（with-atm 相对 without 的通道差）
        out["hue_probe"] = []
        for name, (fx, fy) in {"blue": (0.25, 0.20), "purple": (0.78, 0.74),
                               "teal": (0.52, 0.52), "corner": (0.03, 0.95)}.items():
            px = (int(fx * 1440), int(fy * 900))
            ca, cb = a.getpixel(px), b.getpixel(px)
            out["hue_probe"].append({
                "at": name, "px": px, "with_atm": ca, "without_atm": cb,
                "delta_rgb": [ca[i] - cb[i] for i in range(3)],
            })

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
