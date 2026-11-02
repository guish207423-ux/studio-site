#!/usr/bin/env python3
"""t_dec95ed7 真实浏览器验收 —— 无第三方依赖（chromium CDP + websockets + PIL）。

覆盖：
  1. 折射 A/B 差分：有/无大气色层两帧对比，按「玻璃区 vs 空白背景区」分区判读
     （liquid-glass-ui references/verify-refraction.md 的判据）
  2. hyalite 实例数（getComputedStyle backdroFilter startsWith url，含继承来的）
  3. 背景动画周期（document.getAnimations）是否互不同步
  4. reduced-motion / prefers-contrast 实测
  5. 12 视口横向溢出
  6. 大气层桌面/移动端渐变数与周期

用法：python3 verify_atmosphere.py <url> [--json out.json]
"""
import argparse
import base64
import io
import json
import shutil
import socket
import subprocess
import sys
import tempfile
import time
import urllib.request

import websockets.sync.client as ws_client
from PIL import Image, ImageChops

CHROME = shutil.which("chromium") or "/usr/bin/chromium"


def free_port():
    s = socket.socket()
    s.bind(("127.0.0.1", 0))
    p = s.getsockname()[1]
    s.close()
    return p


class CDP:
    def __init__(self, ws_url):
        self.ws = ws_client.connect(ws_url, max_size=64 * 1024 * 1024)
        self.id = 0
        self.session = None

    def send(self, method, params=None, timeout=40):
        self.id += 1
        msg = {"id": self.id, "method": method, "params": params or {}}
        if self.session:
            msg["sessionId"] = self.session
        self.ws.send(json.dumps(msg))
        deadline = time.time() + timeout
        while time.time() < deadline:
            data = json.loads(self.ws.recv(timeout=max(0.1, deadline - time.time())))
            if data.get("id") == self.id:
                if "error" in data:
                    raise RuntimeError(f"{method}: {data['error']}")
                return data.get("result", {})
        raise TimeoutError(method)

    def evaluate(self, expr, await_promise=False):
        r = self.send("Runtime.evaluate", {
            "expression": expr, "returnByValue": True,
            "awaitPromise": await_promise,
        })
        if "exceptionDetails" in r:
            raise RuntimeError(json.dumps(r["exceptionDetails"])[:800])
        return r["result"].get("value")


# ---------------------------------------------------------------- JS 探针

JS_AUDIT = r"""
(() => {
  const out = {};
  const de = document.documentElement;

  // --- 溢出 ---
  out.overflow = {
    scrollW: Math.max(de.scrollWidth, document.body.scrollWidth),
    clientW: de.clientWidth,
    vw: window.innerWidth,
    overflowPx: Math.max(de.scrollWidth, document.body.scrollWidth) - de.clientWidth,
    offenders: [...document.querySelectorAll('body *')]
      .filter(el => {
        const r = el.getBoundingClientRect();
        if (!r.width) return false;
        return r.right > de.clientWidth + 1 || r.left < -1;
      })
      .slice(0, 6)
      .map(el => (el.className && el.className.toString().slice(0, 40)) || el.tagName),
  };

  // --- hyalite 实例（含继承：父级 --hyalite 会漏给后代） ---
  const glass = [];
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el);
    const bf = cs.backdropFilter || cs.webkitBackdropFilter || '';
    if (bf.includes('url(')) {
      glass.push({
        cls: (el.className && el.className.toString().slice(0, 48)) || el.tagName,
        bf: bf.slice(0, 90),
      });
    }
  }
  out.hyalite = {
    instances: glass.length,
    elements: glass,
    vars: [...document.querySelectorAll('.glass, .glass-nav, .glass-contact, .glass-hero, .glass-btn')]
      .map(el => ({
        cls: el.className.toString().slice(0, 40),
        hyalite: getComputedStyle(el).getPropertyValue('--hyalite').trim().slice(0, 60),
      })),
    filtersInDom: document.querySelectorAll('svg filter[id^=hyalite], filter[id^=hyalite]').length,
  };

  // --- 背景动画 ---
  out.animations = document.getAnimations().map(a => {
    const t = a.effect && a.effect.target;
    const kf = (a.effect && a.effect.getKeyframes) ? a.effect.getKeyframes() : [];
    const props = [...new Set(kf.flatMap(k => Object.keys(k).filter(x => !['offset','computedOffset','easing','composite'].includes(x))))];
    return {
      name: a.animationName || (a.constructor && a.constructor.name) || '?',
      target: t ? ((t.className && t.className.toString().slice(0, 40)) || t.tagName) : null,
      duration: Math.round(a.effect ? a.effect.getTiming().duration : 0),
      iterations: a.effect ? a.effect.getTiming().iterations : null,
      playState: a.playState,
      props,
    };
  });

  // --- 大气层 ---
  const atm = document.querySelector('.light-field__atmosphere');
  if (atm) {
    const cs = getComputedStyle(atm);
    out.atmosphere = {
      exists: true,
      radiusCount: (cs.backgroundImage.match(/radial-gradient/g) || []).length,
      animationName: cs.animationName,
      animationDuration: cs.animationDuration,
      inset: cs.inset,
      zIndex: cs.zIndex,
      opacity: cs.opacity,
      pointerEvents: cs.pointerEvents,
      transform: cs.transform,
    };
  } else {
    out.atmosphere = { exists: false };
  }

  // --- 页面色彩占比探针：抓几个空白像素点的实际颜色 ---
  const empties = [];
  for (let y = 40; y < window.innerHeight - 40; y += 40) {
    for (let x = 20; x < window.innerWidth - 20; x += 40) {
      const el = document.elementFromPoint(x, y);
      if (!el) continue;
      const cls = el.className && el.className.toString();
      if (el === document.body || el === document.documentElement ||
          (cls && /light-field|light-shadow|skip-link/.test(cls))) {
        empties.push([x, y]);
      }
    }
  }
  out.emptySamples = empties.length;
  out.emptySamplePoints = empties.filter((_, i) => i % 12 === 0).slice(0, 14);

  // --- 玻璃元素几何 ---
  out.glassRects = [...document.querySelectorAll('.glass-nav, .glass-contact, .glass-hero')].map(el => {
    const r = el.getBoundingClientRect();
    return {
      cls: el.className.toString().slice(0, 40),
      x: Math.round(r.x), y: Math.round(r.y),
      w: Math.round(r.width), h: Math.round(r.height),
      visible: r.bottom > 0 && r.top < window.innerHeight,
    };
  });

  out.doc = { h: de.scrollHeight, vh: window.innerHeight, reduced: matchMedia('(prefers-reduced-motion: reduce)').matches };
  return out;
})()
"""

JS_FREEZE = r"""
(async () => {
  // 冻结所有动画，让 A/B 两帧只差大气层本身
  document.getAnimations().forEach(a => { try { a.pause(); } catch (e) {} });
  // 也停掉 JS 视差：滚到顶、指针不动时 rAF 自己会停表
  window.scrollTo(0, 0);
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  return document.getAnimations().filter(a => a.playState === 'running').length;
})()
"""


def load_page(cdp, url, width, height, wait=3.5, mobile=False):
    cdp.send("Emulation.setDeviceMetricsOverride", {
        "width": width, "height": height, "deviceScaleFactor": 1, "mobile": mobile,
    })
    cdp.send("Page.navigate", {"url": url})
    time.sleep(wait)


def screenshot(cdp):
    r = cdp.send("Page.captureScreenshot", {"format": "png", "captureBeyondViewport": False})
    return Image.open(io.BytesIO(base64.b64decode(r["data"]))).convert("RGB")


def diff_stats(a, b, box=None, thr=4):
    """返回 (changed_pct, max_delta, mean_delta)。只统计超过 thr 的像素。"""
    if box:
        a = a.crop(box)
        b = b.crop(box)
    d = ImageChops.difference(a, b)
    r, g, bl = d.split()
    mx = ImageChops.lighter(ImageChops.lighter(r, g), bl)
    hist = mx.histogram()
    total = sum(hist)
    changed = sum(hist[thr + 1:])
    maxd = max((i for i, c in enumerate(hist) if c), default=0)
    mean = sum(i * c for i, c in enumerate(hist)) / max(1, total)
    return {
        "pixels": total,
        "changed_pct": round(100.0 * changed / max(1, total), 2),
        "max_delta": maxd,
        "mean_delta": round(mean, 2),
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("url")
    ap.add_argument("--json", default="")
    ap.add_argument("--shots", default="")
    args = ap.parse_args()

    port = free_port()
    profile = tempfile.mkdtemp(prefix="cdp-atm-")
    proc = subprocess.Popen(
        [CHROME, "--headless=new", "--no-sandbox", "--disable-gpu", "--hide-scrollbars",
         f"--remote-debugging-port={port}", f"--user-data-dir={profile}", "about:blank"],
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    report = {}
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

        # ============ 1. 桌面审计 ============
        load_page(cdp, args.url, 1440, 900, wait=4.0)
        audit = cdp.evaluate(JS_AUDIT)
        report["desktop_audit"] = audit

        # ============ 2. A/B 差分（冻结动画后只改大气层） ============
        running = cdp.evaluate(JS_FREEZE, await_promise=True)
        report["ab"] = {"running_after_freeze": running}
        shot_a = screenshot(cdp)
        if args.shots:
            shot_a.save(args.shots + "-with-atm.png")

        cdp.evaluate("document.querySelector('.light-field__atmosphere').style.display='none'")
        time.sleep(0.5)
        shot_b = screenshot(cdp)
        if args.shots:
            shot_b.save(args.shots + "-without-atm.png")
        cdp.evaluate("document.querySelector('.light-field__atmosphere').style.display=''")
        time.sleep(0.3)

        full = diff_stats(shot_a, shot_b)
        report["ab"]["full_viewport"] = full

        # 玻璃区 = 视口内可见的 .glass-nav
        nav = next((g for g in audit["glassRects"] if "glass-nav" in g["cls"] and g["visible"]), None)
        if nav:
            box = (nav["x"], nav["y"], nav["x"] + nav["w"], nav["y"] + nav["h"])
            report["ab"]["glass_nav_region"] = dict(box=box, **diff_stats(shot_a, shot_b, box))

        # 空白背景区：用 elementFromPoint 找到的空白点周围取块
        empty = audit.get("emptySamplePoints") or []
        blocks = []
        for (x, y) in empty:
            box = (max(0, x - 80), max(0, y - 60),
                   min(1440, x + 80), min(900, y + 60))
            if box[2] - box[0] < 100 or box[3] - box[1] < 80:
                continue
            blocks.append(dict(box=box, **diff_stats(shot_a, shot_b, box)))
        report["ab"]["empty_background_regions"] = blocks[:6]

        # ============ 3. reduced-motion ============
        cdp.send("Emulation.setEmulatedMedia",
                 {"features": [{"name": "prefers-reduced-motion", "value": "reduce"}]})
        time.sleep(0.6)
        report["reduced_motion"] = cdp.evaluate(
            """(() => {
              const atm = document.querySelector('.light-field__atmosphere');
              const grid = document.querySelector('.light-field__grid');
              const drift = document.querySelector('.light-field__drift');
              const cs = el => el ? getComputedStyle(el) : null;
              const anims = document.getAnimations().map(a => ({
                name: a.animationName,
                target: (a.effect?.target?.className || '').toString().slice(0, 30),
                duration: Math.round(a.effect?.getTiming().duration || 0),
              }));
              return {
                atmAnimation: cs(atm)?.animationName,
                gridAnimation: cs(grid)?.animationName,
                driftAnimation: cs(drift)?.animationName,
                shadowDisplay: cs(document.querySelector('.light-shadow'))?.display,
                atmGradients: (cs(atm)?.backgroundImage.match(/radial-gradient/g) || []).length,
                animations: anims,
                stillVisible: !!atm && cs(atm).opacity !== '0' && cs(atm).display !== 'none',
              };
            })()""")
        cdp.send("Emulation.setEmulatedMedia", {"features": []})
        time.sleep(0.3)

        # ============ 4. prefers-contrast: more ============
        cdp.send("Emulation.setEmulatedMedia",
                 {"features": [{"name": "prefers-contrast", "value": "more"}]})
        time.sleep(0.5)
        report["prefers_contrast"] = cdp.evaluate(
            """(() => {
              const cs = el => el ? getComputedStyle(el) : null;
              return {
                driftOpacity: cs(document.querySelector('.light-field__drift'))?.opacity,
                driftAnimation: cs(document.querySelector('.light-field__drift'))?.animationName,
                atmOpacity: cs(document.querySelector('.light-field__atmosphere'))?.opacity,
                gridOpacity: cs(document.querySelector('.light-field__grid'))?.opacity,
              };
            })()""")
        cdp.send("Emulation.setEmulatedMedia", {"features": []})
        time.sleep(0.3)

        # ============ 5. 移动端 ============
        cdp.send("Emulation.setDeviceMetricsOverride",
                 {"width": 390, "height": 844, "deviceScaleFactor": 2, "mobile": True})
        cdp.send("Emulation.setTouchEmulationEnabled", {"enabled": True})
        time.sleep(1.2)
        report["mobile"] = cdp.evaluate(
            """(() => {
              const atm = document.querySelector('.light-field__atmosphere');
              const cs = getComputedStyle(atm);
              const de = document.documentElement;
              return {
                atmGradients: (cs.backgroundImage.match(/radial-gradient/g) || []).length,
                atmDuration: cs.animationDuration,
                gridDuration: getComputedStyle(document.querySelector('.light-field__grid')).animationDuration,
                driftFilter: getComputedStyle(document.querySelector('.light-field__drift')).filter,
                scrollW: de.scrollWidth, clientW: de.clientWidth,
                overflowPx: de.scrollWidth - de.clientWidth,
              };
            })()""")
        cdp.send("Emulation.setTouchEmulationEnabled", {"enabled": False})

        # ============ 6. 12 视口横向溢出 ============
        widths = [320, 360, 375, 390, 414, 480, 600, 768, 820, 1024, 1280, 1440, 1920]
        rows = []
        for w in widths:
            cdp.send("Emulation.setDeviceMetricsOverride",
                     {"width": w, "height": 900, "deviceScaleFactor": 1, "mobile": w < 768})
            time.sleep(0.45)
            rows.append(cdp.evaluate(
                """(async () => {
                  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
                  const de = document.documentElement;
                  const sw = Math.max(de.scrollWidth, document.body.scrollWidth);
                  return { w: %d, scrollW: sw, clientW: de.clientWidth, overflow: sw - de.clientWidth };
                })()""" % w, await_promise=True))
        report["viewports"] = rows

        out = json.dumps(report, ensure_ascii=False, indent=1)
        print(out)
        if args.json:
            open(args.json, "w", encoding="utf-8").write(out)
    finally:
        proc.terminate()
        try:
            proc.wait(timeout=5)
        except Exception:
            proc.kill()
        shutil.rmtree(profile, ignore_errors=True)


if __name__ == "__main__":
    sys.exit(main())
