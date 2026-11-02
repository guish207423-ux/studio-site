# EVIDENCE — v6 部署修复（GitHub Pages 子路径 /assets 404）

**卡片**：t_5c7b86ca（P0 修复：Pages 子路径导致线上 /assets/* 全 404）
**结论**：已修复并重新部署。线上 `https://guish207423-ux.github.io/studio-site/` 的 HTML 与全部 `/studio-site/assets/*`
在**外部网络**（GitHub Actions runner + 外部抓取器 Exa）实测 **200**，真实 Chromium 渲染 1440/390 两个视口：
`#works` 6 张卡、`.glass-float` 17、9 个 section、CSS 生效（body 背景 `rgb(10,10,10)`、Geist 字体）、
`bad=[]`、`consoleErrs=[]`。根路径 `/assets/*` 仍 404（负对照，证明 vantage 有效）。

---

## 1. 根因

| 项 | 值 |
|---|---|
| Pages 站点 | `html_url: https://guish207423-ux.github.io/studio-site/`，`cname: null`，`source.branch: gh-pages`，`source.path: /` |
| 出问题构建 | gh-pages `fd0629d`（源 `144af4d`），`vite.config.ts` 为 `base: '/'` |
| 后果 | `dist/index.html` 引用 `/assets/*` → 浏览器解析到 `https://guish207423-ux.github.io/assets/*` → 404；页面只剩无样式 HTML 骨架 |

子路径下真正的 URL 是 `/studio-site/assets/*`，两者不匹配。

## 2. 修复（源改动）

隔离 worktree：`workspaces/t_5c7b86ca/wt-deploy`，分支 `deploy/t_5c7b86ca`，基线 **c0fe0d6**（当前设计线提交态，
未使用父卡旧 dist 改路径；主工作区里 sibling 卡未提交的 `src/styles/globals.css` 未被触碰）。

源提交 **9a3fd2c**（已推 `origin/deploy/t_5c7b86ca`）：

```diff
 vite.config.ts
-  base: '/',
+  // GitHub Pages 项目站点部署在子路径 /studio-site/ 下（cname: null），
+  // base 必须与之一致，否则 dist/index.html 里的 /assets/* 会解析到
+  // https://guish207423-ux.github.io/assets/* → 404（线上只剩无样式骨架）。
+  base: '/studio-site/',

 public/manifest.json
-  "start_url": "/",
+  "start_url": "./",
+  "scope": "./",
-      "src": "/favicon.svg",
+      "src": "./favicon.svg",
```

`manifest.json` 是同根因的第二处：manifest 里的 `/favicon.svg` 在子路径下被解析到域名根，
本地子路径复现时真实抓到一条 `/favicon.svg → 404`（见 §5）。改为相对路径后该 404 消失。

### 懒加载 chunk 路径核对（Base 改动最怕这里）

- `import("./About-BzLUhp2z.js")`：相对**模块自身 URL** 解析 → `/studio-site/assets/About-…js` ✓
- vite preload helper 的依赖数组 `"assets/About-…js"` 由 helper 拼 base，产出的 base 字面量为 `"/studio-site/"` ✓
- 静态资源 `./hyalite.js`、`./favicon.svg`、`./manifest.json`、`./videos/*`：相对当前文档 `/studio-site/` ✓
- 没选 `base: './'`：`index.html` 用的是 `./` 相对引用，但 SPA 深链接/404 回退与将来自定义域时会增加不确定性；
  本卡目标站点确定在 `/studio-site/`，用绝对子路径更可验证。

## 3. 重建

```
$ cd .../wt-deploy && npm run build
vite v7.3.7 building client environment for production...
✓ 1059 modules transformed.
dist/index.html                                9.36 kB │ gzip: 3.69 kB
dist/assets/index-CB6Tu7K9.css                59.74 kB │ gzip: 11.82 kB
dist/assets/index-CPQCBR80.js                 26.23 kB │ gzip:  8.63 kB
dist/assets/vendor-BDbW-k0Q.js               347.56 kB │ gzip: 94.18 kB
dist/assets/gsap-a3sj5zmn.js                 114.01 kB │ gzip: 44.95 kB
✓ built in 1.92s
BUILD_EXIT=0
```

- 产物：38 个文件 / 3.2M（`find dist -type f | wc -l`）
- `sha256sum dist/index.html` = `7735c57a6f3a92fa2c8398c7deffbd2cb1b9cfe6b9f62957c9864cc52f3d15c9`
- `grep -c '"/assets/' dist/index.html` = **0**

> 本次是用 **c0fe0d6** 重建的，比线上原构建（144af4d）多出 `6739290` 大气色层/光场 GPU 化、`d7cca17` 全站优化、
> `83e692e` 玻璃增强三个设计线提交。重构后 chunk hash 与父卡记录不同属预期（`index-C0_DRvSo.js` → `index-CPQCBR80.js`）。

### index.html 引用前后对比

| 位置 | 引用 |
|---|---|
| 旧（gh-pages `fd0629d`） | `/assets/index-C0_DRvSo.js`、`/assets/vendor-BDbW-k0Q.js`、`/assets/gsap-a3sj5zmn.js`、`/assets/index-odkqqXtw.css` |
| 新（本地 dist） | `/studio-site/assets/index-CPQCBR80.js`、`/studio-site/assets/vendor-BDbW-k0Q.js`、`/studio-site/assets/gsap-a3sj5zmn.js`、`/studio-site/assets/index-CB6Tu7K9.css` |
| 线上（runner 抓回的 HTML） | 与"新"完全一致，`"/assets/` 出现次数 = 0 |

旧→新的对比可以直接在线上复核：

```
$ curl -s https://guish207423-ux.github.io/studio-site/ | grep -oE '(src|href)="[^"]*assets[^"]*"'
src="/studio-site/assets/index-CPQCBR80.js"
href="/studio-site/assets/vendor-BDbW-k0Q.js"
href="/studio-site/assets/gsap-a3sj5zmn.js"
href="/studio-site/assets/index-CB6Tu7K9.css"
```

## 4. 部署

沿用现有 `deploy.yml`（push 到 `gh-pages` → 复制分支根目录 → pages artifact → deploy-pages）。

| 项 | 值 |
|---|---|
| 部署提交 | `e9624f7e4ff272055eeabf7e65e12b9e7794bdc8`（tree `dd3bc7ba808b175f488afa54929537c6312ef3a7`，父 `fd0629d`） |
| 推送 | `git push origin e9624f7…:refs/heads/gh-pages` → `fd0629d..e9624f7`，退出码 0 |
| 部署内容 | 38 个 site 文件 + 保留 `.github/workflows/deploy.yml`（否则后续 push 不再触发 workflow），共 39 个 |
| workflow run | **41430651710**（`Deploy to GitHub Pages`，event=push，`build` + `deploy` 两个 job 均 success） |
| Pages deployment | **7489985454**（environment `github-pages`，sha `e9624f7`，ref `gh-pages`） |
| Pages 状态 | `gh api repos/.../pages` → `status: built`，`html_url: https://guish207423-ux.github.io/studio-site/` |

## 5. 外部网络验证（本机 github.io 被 reset，故不用本机直连）

本机实测：`curl https://guish207423-ux.github.io/...` → `Recv failure: Connection reset by peer`；
`--resolve` 直连 4 个 GitHub Pages 边缘 IP（185.199.108–111.153）同样 000。所以验证放在**外部 vantage**。

### 5.1 GitHub Actions runner（ubuntu-latest，GitHub 自己的网络）

临时探针 workflow 跑在 `verify/live` 分支，run **41431465308**（此前 1440 单视口版是 41431216168，两次均 success），
跑完已删除该分支（`gh api -X DELETE .../git/refs/heads/verify/live`，远端已无 `verify/live`）。

HTTP 探针原文（run 41431465308 `HTTP probes from GitHub network` 步骤输出）：

```
== index.html ==
STATUS=200 CONTENT_TYPE=text/html; charset=utf-8 BYTES=9355
root-absolute /assets count = 0
/studio-site/assets/gsap-a3sj5zmn.js -> 200|application/javascript; charset=utf-8|114013
/studio-site/assets/index-CB6Tu7K9.css -> 200|text/css; charset=utf-8|59739
/studio-site/assets/index-CPQCBR80.js -> 200|application/javascript; charset=utf-8|26227
/studio-site/assets/vendor-BDbW-k0Q.js -> 200|application/javascript; charset=utf-8|347562
== lazy chunk probes ==
assets/About-BzLUhp2z.js -> 200|application/javascript; charset=utf-8
assets/Services-BiQSob6Z.js -> 200|application/javascript; charset=utf-8
assets/Works-BYjE4z6K.js -> 200|application/javascript; charset=utf-8
assets/Process-B-_NpAgR.js -> 200|application/javascript; charset=utf-8
assets/Pricing-DQtfFMx0.js -> 200|application/javascript; charset=utf-8
assets/Contact-Con28KWK.js -> 200|application/javascript; charset=utf-8
assets/CaseStudies-bFe7pJ7g.js -> 200|application/javascript; charset=utf-8
assets/Partners-DPdvBOGy.js -> 200|application/javascript; charset=utf-8
assets/SectionIcon-BX0AwFl-.js -> 200|application/javascript; charset=utf-8
== static files ==
/manifest.json -> 200|application/json; charset=utf-8
/favicon.svg -> 200|image/svg+xml
/hyalite.js -> 200|application/javascript; charset=utf-8
/robots.txt -> 200|text/plain; charset=utf-8
/sitemap.xml -> 200|application/xml
== negative control: old root-absolute path (expected 404) ==
/assets/index-C0_DRvSo.js -> 404
```

负对照 404 = vantage 是外部真实网络而非缓存/伪成功；同时证明"根绝对路径确实拿不到文件"这个前提仍然成立。

### 5.2 外部网络里的真实 Chromium（playwright-core + runner 预装 Chrome）

同一 run 的 `Render in real Chromium (external network, 1440 + 390)` 步骤，JSON 原文（`render-result.json`）：

```json
{
 "390": {
  "metrics": {
   "title": "屿作所 — 综合数字产品工作室",
   "sections": 9,
   "workCards": 6,
   "glassFloat": 17,
   "bodyBg": "rgb(10, 10, 10)",
   "bodyFont": "Geist, \"PingFang SC\", \"HarmonyOS Sans SC",
   "h1Color": "rgb(240, 240, 240)",
   "navGlass": 1,
   "hyalite": true,
   "rootChildren": 9,
   "docWidth": 390,
   "bodyScrollWidth": 390,
   "viewport": 390,
   "overflowX": [
    "light-field__atmosphere:492",
    "light-field__fill:491",
    "light-field__grid:459",
    "light-field__drift:491",
    "light-shadow:491",
    "marquee__track:1508",
    "marquee__item:632",
    "marquee__item:1070"
   ]
  },
  "bad": [],
  "failed": [
   [
    "https://guish207423-ux.github.io/studio-site/videos/grafana.webm",
    "net::ERR_ABORTED"
   ]
  ],
  "consoleErrs": [],
  "resourceCount": 27,
  "assetsOk": 15
 },
 "1440": {
  "metrics": {
   "title": "屿作所 — 综合数字产品工作室",
   "sections": 9,
   "workCards": 6,
   "glassFloat": 17,
   "bodyBg": "rgb(10, 10, 10)",
   "bodyFont": "Geist, \"PingFang SC\", \"HarmonyOS Sans SC",
   "h1Color": "rgb(240, 240, 240)",
   "navGlass": 1,
   "hyalite": true,
   "rootChildren": 9,
   "docWidth": 1440,
   "bodyScrollWidth": 1440,
   "viewport": 1440,
   "overflowX": [
    "light-field__atmosphere:1615",
    "light-field__fill:1613",
    "light-field__grid:1558",
    "light-field__drift:1613",
    "light-shadow:1613",
    "marquee__track:2578",
    "marquee__item:1830",
    "marquee__item:2578"
   ]
  },
  "bad": [],
  "failed": [],
  "consoleErrs": [],
  "resourceCount": 25,
  "assetsOk": 15
 },
 "url": "https://guish207423-ux.github.io/studio-site/"
}
VERDICT=PASS
```

读数说明：
- `bad`（HTTP ≥400 的响应）**空**、`consoleErrs` **空** —— 验收要求的"控制台无 404"成立。
- `docWidth == viewport`（1440/390 都是）→ 页面级无横向溢出。`overflowX` 里列的是装饰层
  （`light-field__*`、`light-shadow`、`marquee__track/item`），它们天然超出视口宽度被容器裁切，
  不在文档流里制造滚动条 —— 与 QA 卡记录的 390/768/1440 零溢出一致。
- 390 视口那条 `videos/grafana.webm → net::ERR_ABORTED`：滚动离开后悬停视频请求被浏览器主动取消，
  非 4xx/5xx（`bad` 为空），1440 视口该视口未触发悬停故无此条。
- 截图：`live-1440.png`、`live-390.png`、`live-390-works.png`（随本证据一并上传）。

### 5.3 外部抓取器（Exa，第三方爬取网络）独立复核

修复前（QA 卡记录，本次复核仍可复现负对照）：`https://guish207423-ux.github.io/assets/index-C0_DRvSo.js`
→ `CRAWL_NOT_FOUND`。

修复后抓取 `https://guish207423-ux.github.io/studio-site/`，抓回的是**完整渲染后的正文**
（含"关于我们/能做什么/做过哪些项目/技术资产/常见问题"全部 section 文案，见 `external-crawl-live.md` 全文），
说明 HTML 引用的 JS/chunk 确实加载并执行了 —— 修复前抓到的只有无样式骨架。

## 6. 本地子路径复现（修复前/后对照，同一台机器）

把 `dist` 按 `/studio-site/` 挂到 `http://127.0.0.1:8899`（`simroot/studio-site → dist`），本机真实 Chromium：

| 观察项 | 修复前（QA 卡） | 修复后（本卡） |
|---|---|---|
| `/studio-site/` | 4 条 `/assets/*` 全 404 | 200 |
| `/studio-site/assets/index-CPQCBR80.js` | — | 200，`text/javascript` |
| `/studio-site/assets/index-CB6Tu7K9.css` | — | 200，`text/css` |
| 根 `/assets/index-CPQCBR80.js` | — | 404（预期：文件只在子路径下） |
| `section[id]` | 只剩 `top` | 9 个（top/about/services/cases/works/process/partners/pricing/contact） |
| `.work-card` | 0 | **6** |
| `.glass-float` | 0 | **17** |
| body 背景 | 透明 | `rgb(10, 10, 10)` |
| 字体 | Times New Roman | Geist / PingFang SC 栈 |
| `window.Hyalite` | 未加载 | true |
| 控制台/资源 404 | 骨架级 | `bad=[]`（修 manifest 前的唯一 404 `/favicon.svg` 已消失） |

## 7. 纪律与遗留

未做（按卡片约束）：
- 未重新引入浅色主题（当前 dark-only，判据已在 `bf505aa` v9.18 作废）。
- 未动 `shopforyou.online`（腾讯 ESA 上的旧构建）；未合并分叉的 master；未强推 master。
- 未顺手改 QA 卡点名的既有问题：service-card 悬停位移被 spotlight inline transform 覆盖、触屏作品卡无播放提示、
  筛选按钮 31px、canonical 指向 shopforyou.online。

需要 orchestrator 知道的两件事：
1. **源改动只落在 `origin/deploy/t_5c7b86ca`（9a3fd2c）**，没有落到 `origin/master`。本仓库本地 master 与
   `origin/master` 已分叉（本地领先 62 / 落后 21），卡片要求不强推/不合并分叉 master，所以合入设计线由调度方决定。
   下次从 master 直接 `npm run build` 仍会得到 `base: '/'` 的坏产物，直到这次配置改动被合入。
2. **`dist/404.html`（源 `public/404.html`）里的资源 hash 是旧的**：`/studio-site/assets/index-DQ0m1kNn.js`、
   `vendor-ClFw0Buh.js`、`lenis-BXjoyVLH.js`、`index-B6Z5G3w0.css` 在当前产物里都不存在（只有 `gsap-a3sj5zmn.js` 命中）。
   这不是本次 base 改动引入的（旧 hash 在任何 base 下都 404），而是 404 页从未随构建更新；
   修它需要 post-build 重写该文件的引用，属本卡范围外的独立缺陷，建议单独开卡。

其它观察：
- 本次部署顺带把设计线三个提交（大气色层 / 全站优化 / 玻璃增强）上线，线上产物比 QA 卡当时核的 `144af4d` 更新；
  复核卡请按**当前线上**判定。
- `gh-pages` 上原有 `videos/liquid-glass-react.*` 在本次产物里已不存在（源已移除），随产物同步自然删除。

## 8. 复核卡可用的一行命令

```bash
# 外部 vantage 需要能在公网访问 github.io；本机网络被 reset
curl -sS -D - https://guish207423-ux.github.io/studio-site/ -o /tmp/i.html | head -3
grep -oE '(src|href)="[^"]*assets[^"]*"' /tmp/i.html
for u in $(grep -o '/studio-site/assets/[A-Za-z0-9._-]*' /tmp/i.html | sort -u); do
  echo "$u -> $(curl -sS -o /dev/null -w '%{http_code}|%{content_type}' "https://guish207423-ux.github.io$u")"
done
```
