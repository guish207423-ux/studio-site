#!/usr/bin/env python3
"""无依赖 CDP 性能探针：LCP / CLS / long task / 帧率。

用法：
  python3 scripts/perf-probe.py http://127.0.0.1:4173 [--mobile] [--slow4g]

为什么不用 playwright：本机没装，且 chromium 自带 remote debugging 足够。
为什么用 websockets 手写：只需 Page/Network/Performance 几个域，避免引入 300MB 依赖。
"""
import argparse, json, os, shutil, socket, subprocess, sys, tempfile, time
import urllib.request

import websockets.sync.client as ws_client

CHROME = shutil.which("chromium") or "/usr/bin/chromium"

VITALS_JS = r"""
window.__v = {lcp:0, lcpEl:'', cls:0, lcpCandidates:[]};
try {
  new PerformanceObserver(l => {
    for (const e of l.getEntries()) {
      window.__v.lcp = Math.round(e.startTime);
      window.__v.lcpEl = (e.element && (e.element.className || e.element.tagName)) || e.url || '';
    }
  }).observe({type:'largest-contentful-paint', buffered:true});
  new PerformanceObserver(l => {
    for (const e of l.getEntries()) if (!e.hadRecentInput) window.__v.cls += e.value;
  }).observe({type:'layout-shift', buffered:true});
} catch (err) {}
"""


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

    def send(self, method, params=None, session=None, timeout=30):
        self.id += 1
        msg = {"id": self.id, "method": method, "params": params or {}}
        if session or self.session:
            msg["sessionId"] = session or self.session
        self.ws.send(json.dumps(msg))
        deadline = time.time() + timeout
        while time.time() < deadline:
            raw = self.ws.recv(timeout=deadline - time.time())
            data = json.loads(raw)
            if data.get("id") == self.id:
                if "error" in data:
                    raise RuntimeError(f"{method}: {data['error']}")
                return data.get("result", {})
            # 事件忽略（本探针用轮询而非事件）
        raise TimeoutError(method)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("url")
    ap.add_argument("--mobile", action="store_true")
    ap.add_argument("--slow4g", action="store_true")
    ap.add_argument("--wait", type=float, default=6.0)
    ap.add_argument("--fps", action="store_true", help="额外测量滚动中的帧率")
    args = ap.parse_args()

    port = free_port()
    profile = tempfile.mkdtemp(prefix="cdp-perf-")
    proc = subprocess.Popen(
        [CHROME, "--headless=new", "--no-sandbox", "--disable-gpu", "--hide-scrollbars",
         f"--remote-debugging-port={port}", f"--user-data-dir={profile}", "about:blank"],
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        for _ in range(100):
            try:
                info = json.load(urllib.request.urlopen(f"http://127.0.0.1:{port}/json/version", timeout=0.5))
                break
            except Exception:
                time.sleep(0.1)
        else:
            raise RuntimeError("chrome 未起来")

        root = CDP(info["webSocketDebuggerUrl"])
        target = root.send("Target.createTarget", {"url": "about:blank"})
        tid = target["targetId"]
        att = root.send("Target.attachToTarget", {"targetId": tid, "flatten": True})
        # flatten 模式下 session 命令必须复用浏览器级同一条 websocket
        cdp = root
        cdp.session = att["sessionId"]

        cdp.send("Page.enable")
        cdp.send("Runtime.enable")
        if args.mobile:
            cdp.send("Emulation.setDeviceMetricsOverride",
                     {"width": 390, "height": 844, "deviceScaleFactor": 3, "mobile": True})
            cdp.send("Emulation.setTouchEmulationEnabled", {"enabled": True})
        else:
            cdp.send("Emulation.setDeviceMetricsOverride",
                     {"width": 1440, "height": 900, "deviceScaleFactor": 1, "mobile": False})
        if args.slow4g:
            cdp.send("Network.enable")
            cdp.send("Network.emulateNetworkConditions", {
                "offline": False, "latency": 150,
                "downloadThroughput": 1.6 * 1024 * 1024 / 8,
                "uploadThroughput": 750 * 1024 / 8,
            })
            cdp.send("Emulation.setCPUThrottlingRate", {"rate": 4})

        cdp.send("Page.addScriptToEvaluateOnNewDocument", {"source": VITALS_JS})
        t0 = time.time()
        cdp.send("Page.navigate", {"url": args.url})
        time.sleep(args.wait)
        elapsed = time.time() - t0

        out = cdp.send("Runtime.evaluate", {
            "expression": """JSON.stringify({
              v: window.__v,
              nav: (() => { const n = performance.getEntriesByType('navigation')[0] || {};
                return {ttfb: Math.round(n.responseStart||0), dcl: Math.round(n.domContentLoadedEventEnd||0),
                        load: Math.round(n.loadEventEnd||0), transfer: n.transferSize||0}; })(),
              resources: performance.getEntriesByType('resource').length,
              fcp: Math.round((performance.getEntriesByType('paint').find(p=>p.name==='first-contentful-paint')||{}).startTime||0),
              mem: (performance.memory ? Math.round(performance.memory.usedJSHeapSize/1048576) : null)
            })""",
            "returnByValue": True,
        })
        data = json.loads(out["result"]["value"])

        if args.fps:
            # 滚动 4s 采样 rAF 间隔。headless 下若标签页被判定隐藏会掉到 30fps，
            # 因此同时把 visibilityState 带回来，读数要连同它一起看。
            fps_out = cdp.send("Runtime.evaluate", {
                "expression": """(async () => {
                  const d=[]; let last=0;
                  const tick=(t)=>{ if(last) d.push(t-last); last=t; requestAnimationFrame(tick); };
                  requestAnimationFrame(tick);
                  let y=0;
                  await new Promise(res=>{
                    const iv=setInterval(()=>{ y+=140; window.scrollTo(0,y); if(y>5200){ clearInterval(iv); setTimeout(res, 320); } }, 16);
                  });
                  const s=d.filter(x=>x>0).sort((a,b)=>a-b);
                  const med=s[Math.floor(s.length/2)]||0, p95=s[Math.floor(s.length*0.95)]||0;
                  return JSON.stringify({visibility: document.visibilityState, frames: s.length,
                    medianFps: med? +(1000/med).toFixed(1): null, p5Fps: p95? +(1000/p95).toFixed(1): null});
                })()""",
                "returnByValue": True, "awaitPromise": True,
            })
            data["fps_sample"] = json.loads(fps_out["result"]["value"])
        data["elapsed_s"] = round(elapsed, 1)
        data["mode"] = ("mobile" if args.mobile else "desktop") + ("/slow4g" if args.slow4g else "/local")
        print(json.dumps(data, ensure_ascii=False, indent=1))
    finally:
        proc.terminate()
        try:
            proc.wait(timeout=5)
        except Exception:
            proc.kill()
        shutil.rmtree(profile, ignore_errors=True)


if __name__ == "__main__":
    main()
