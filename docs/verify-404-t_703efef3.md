# EVIDENCE — 自定义 404 页全白修复（线上已复验）

**卡片**：t_703efef3（P2，来源 t_5dac0c22 线上复核）
**结论**：已修复并重新部署。线上任意不存在路径现在返回**真 404 + 有内容的自定义页**：
HTTP 404、`body.innerText` 202 字、`cssRules = 32`、背景 `rgb(10, 10, 10)`、
**总请求 1 条（只有文档本身）、资源 4xx 0 条、资源报错 0 条**；主站 index 字节未变
（sha256 与修复前一致），6 卡 / 17 glass / 0 条 4xx / 0 报错。

| 项 | 修复前（t_5dac0c22 实测） | 修复后（本卡外部 vantage 实测） |
|---|---|---|
| HTTP | 404 | 404 |
| `body.innerText` | `""` | 202 字（正常文案） |
| 可读 CSS 规则 | 0 | **32** |
| body 背景 | `rgba(0,0,0,0)` | `rgb(10, 10, 10)` |
| 字体 | `Times New Roman` | `"PingFang SC", "HarmonyOS Sans SC", …` |
| 404 资源 | 6 条（4 hashed + 2 archivo-black 字体） | **0 条** |
| 控制台报错 | 7 条 | 1 条（= 文档自身 404 的 network 日志，见 §6） |

---

## 1. 根因

`public/404.html` 是 `index.html` 的**手抄副本**：`<head>` 里留着某一次构建的产物
（`/studio-site/assets/index-B6Z5G3w0.css`、`index-DQ0m1kNn.js`、`vendor-ClFw0Buh.js`、
`lenis-BXjoyVLH.js`）和两个早已删除的 `assets/fonts/archivo-black-latin*.woff2`
（现在 `assets/fonts/` 只有 `jetbrains-mono-500.woff2`）。构建 hash 一换代，
这一页的 CSS/JS/字体全部 404 —— 6 条资源失败换来的就是「0 条 CSS、Times New Roman、全白」。

致命点是**没有任何环节校验这些引用还在不在**：`public/` 是原样拷贝，构建不会重写它。

## 2. 修复

### 2.1 结构：404 页不引用构建产物

新增 `templates/404.html`，**全内联**：`<style>` + SVG data URI 图标 + 系统字体栈，
零 `assets/*.js|css|woff2`、零外链、零图片请求。配色取主站令牌
（`--c-ink #0A0A0A` / `--c-txt #F0F0F0` / `--c-txt-2 #B0B0B0` / `--c-txt-3 #8A8A8A`
/ `--c-accent #A8D93A` / `--c-line #2E2E2E`），字体栈与 `src/styles/globals.css`
一致（Geist 之外的中文回落链原样照抄：苹方 / HarmonyOS Sans / 思源黑体 / Noto Sans CJK / 微软雅黑）。

页面内容：品牌条 + `ERROR 404` 眉标 + 「这一页不存在。」+ 一句说明 +
三个出口（返回首页 / 看作品 / 联系我们）+ 请求路径回显（内联脚本，仅 `location.pathname`，
不引任何资源）+ 页脚（标语 / 邮箱）。出血的描边 `404` 作版式重量（`aria-hidden`，
`z-index: -1`，`@supports` 兜底；≤900px 收起，避免压正文）。

### 2.2 base：构建期替换，不手写

深链接下**相对路径不可用**：Pages 返回 `404.html` 时地址栏 URL 不变，
`/studio-site/a/b` 里的 `./x` 会解析成 `/studio-site/a/x`。所以站内链接必须是
带 base 的绝对路径；但 base 又不能在 HTML 里写死（`/` ↔ 子路径一换就废）。

模板写 `%BASE%`，`vite.config.ts` 新增 `studio-pages-404` 插件在 `closeBundle`
阶段替换成本次构建的 base，再写 `dist/404.html`。

### 2.3 校验：写盘前不过就构建失败

插件在写盘前逐条校验，任一条不过就让构建失败（`error during build`，不出包）：

1. 模板里不得出现任何 `src|href="…assets/…"`（404 页一旦依赖构建产物就会再次全白）；
2. 替换后不得残留 `%BASE%`；
3. 所有 `src|href` 必须是 `base` 开头、`data:`、`mailto:`、`https://` 或 `#` 之一
   —— 根绝对 `/assets/*` 和相对路径都在这一步被拦住。

**负向验证**（证明门是真的拦得住）：临时往模板 `<body>` 插一行
`<link rel="stylesheet" href="%BASE%assets/index-OLDHASH.css">` 后构建：

```
error during build:
Error: [404] templates/404.html 不得引用 assets/*（构建产物 hash 会变）：href="%BASE%assets/
NEGATIVE_BUILD_EXIT=1
```

### 2.4 删除源头

`public/404.html` 已删除（手抄副本的源头）；`HANDOFF.md` 的目录说明改为
`templates/404.html` + 插件。

## 3. 构建

隔离 worktree（分支 `fix/t_703efef3-404`，基线 `origin/deploy/t_5c7b86ca` = `5f0d186`，
即线上所用、带 `base: '/studio-site/'` 的分支；**未碰 master、未合并分叉的 master**）。

```
$ npm run build            # tsc -b && vite build（exit 0）
✓ built in 1.85s
[404] dist/404.html 已生成（base=/studio-site/，内联零外部资源，11003 B）
$ npx tsc -b --pretty false      # exit 0
$ npm run lint                   # oxlint: 0 error（仅既有 warning）
```

| 产物 | sha256 |
|---|---|
| `dist/404.html`（11 003 B） | `39deb97ef5b202369e1e0fa8261ce74d1880cbcb4cb5eaedfaaa3457145131f9` |
| `dist/index.html`（9 355 B） | `7735c57a6f3a92fa2c8398c7deffbd2cb1b9cfe6b9f62957c9864cc52f3d15c9`（= 修复前线上值） |

`grep -c '"/assets/' dist/index.html` = **0**；dist 文件数 38。

## 4. 部署

不新建 workflow，沿用 `deploy.yml`（push `gh-pages` → 复制分支根 → Pages artifact）。

| 项 | 值 |
|---|---|
| 源提交 | `f4dfe85`（fix/t_703efef3-404） |
| gh-pages 提交 | `9d75d11fbdab01db3ce96486b991a6c85c8fbf83`（父 `e9624f7`） |
| 树差异 | `git diff-tree -r e9624f7 9d75d11` → **只有 `404.html` 一个文件**（M），其余 38 个文件字节一致 |
| workflow run | **41451180722**（Deploy to GitHub Pages，event=push，`build` + `deploy` 均 success） |
| Pages deployment | **7493053868**（sha `9d75d11`，ref `gh-pages`） |

只替换 404.html 是这次部署的关键：主站产物一个字节都没动，把回归面压到最小。

## 5. 外部 vantage 复验（本机 github.io 仍被 reset）

本机 `curl https://guish207423-ux.github.io/…` → `Connection reset`，因此复验在 GitHub
Actions runner（GitHub 自己的网络）上跑真实 Chrome。临时分支 `verify/404`，
run **41452654155**（终版，含字体诊断）、**41452303097**（同判据先行跑通），跑完已删分支。

### 5.1 HTTP（runner 内 curl，run 41452654155）

```
===== 1. custom 404 page (shallow) =====
STATUS=404 CT=text/html; charset=utf-8 BYTES=11003
server: GitHub.com        content-type: text/html; charset=utf-8      x-cache: MISS
404.html sha256: 39deb97ef5b202369e1e0fa8261ce74d1880cbcb4cb5eaedfaaa3457145131f9   ← 与本地 dist 一致
assets/ refs in 404.html: 0
old stale hash refs: 0
-- all src/href in 404.html --
href="data:image/svg+xml,…"            ← 内联图标，不是请求
href="/studio-site/"                   ← 首页
href="/studio-site/#works"
href="/studio-site/#contact"
href="mailto:3629748383@qq.com"
===== 2. deep link 404 =====
deep: 404|text/html; charset=utf-8|11003     deep same body as shallow: YES
===== 3. explicit 404.html fetch =====
404.html direct: 200|text/html; charset=utf-8|11003
===== 4. main site unaffected =====
index STATUS=200 CT=text/html; charset=utf-8 BYTES=9355
index sha256: 7735c57a6f3a92fa2c8398c7deffbd2cb1b9cfe6b9f62957c9864cc52f3d15c9   ← 与修复前一致
root-absolute "/assets/ occurrences: 0
/studio-site/assets/gsap-a3sj5zmn.js -> 200
/studio-site/assets/index-CB6Tu7K9.css -> 200
/studio-site/assets/index-CPQCBR80.js -> 200
/studio-site/assets/vendor-BDbW-k0Q.js -> 200
/manifest.json -> 200   /favicon.svg -> 200   /robots.txt -> 200   /404.html -> 200
negative control root /assets/index-CPQCBR80.js -> 404        ← vantage 有效
```

### 5.2 真实 Chrome（playwright-core + runner 的 google-chrome）

14 条判据全 PASS：

```
PASS 404 shallow status=404          // /studio-site/this-path-does-not-exist-404fix
PASS 404 deep status=404             // /studio-site/alpha/beta/gamma/missing-page
PASS 404 mobile status=404           // /studio-site/nope-390 @390×844
PASS body 有可见文案
PASS cssRules > 0
PASS 深色底 #0A0A0A
PASS 中文用 CJK 栈（非 Times New Roman）
PASS 页面资源 0 条 4xx
PASS 页面资源 0 报错（不含文档 404 日志）
PASS 404 页总请求 ≤ 1（只有文档）
PASS 站内链接可点（首页/#works/#contact 均 200）
PASS 无横向溢出
PASS 主站 6 卡 / 17 glass
PASS 主站 0 条 4xx / 0 报错
EXTERNAL_404_ALL_PASS=YES
```

关键量（`probe404.json`）：

| 观测 | 浅层 404 | 深层 404 | 390 移动 |
|---|---|---|---|
| status | 404 | 404 | 404 |
| `body.innerText` 长度 | 202 | 200 | 174 |
| cssRules | 32 | 32 | 32 |
| body 背景 | `rgb(10, 10, 10)` | 同 | 同 |
| body 前景 | `rgb(240, 240, 240)` | 同 | 同 |
| 总请求数 | **1** | **1** | **1** |
| 资源 4xx | 0 | 0 | 0 |
| 资源报错 | 0 | 0 | 0 |
| 横向溢出 | 0 | — | 0 |
| 请求路径回显 | `/studio-site/this-path-does-not-exist-404fix` | `/studio-site/alpha/beta/gamma/missing-page` | `/studio-site/nope-390` |

主站同一轮：`status 200`、`cards 6`、`glass 17`、`rules 452`、`http4xxAll []`、
`consoleErrs []`、`overflowX 0`。

站内链接逐个 HTTP 复核：`/studio-site/` → 200、`/studio-site/#works` → 200、
`/studio-site/#contact` → 200。

### 5.3 第三方 vantage（r.jina.ai，与 GitHub 网络完全无关）

用 r.jina.ai 抓同一路径（新的一条不存在路径，避开缓存），返回：

```
Warning: Target URL returned error 404: Not Found
Title: 页面不存在 · 404 — 屿作所 YU STUDIO
Markdown Content:
Error 404
## 这一页不存在。
链接可能已经改版，或者地址拼错了一位。回到首页继续浏览，也可以直接找我们。
[返回首页](https://guish207423-ux.github.io/studio-site/)
[看作品](…/studio-site/#works) [联系我们](…/studio-site/#contact)
请求路径 `/studio-site/this-path-does-not-exist-703efef3-final`
```

第三方 vantage 同时确认了三件事：HTTP 404、HTML body 有中文内容、内联脚本回显了真实请求路径
（说明页面不依赖任何外部资源即可执行）。可用的 curl 抓取器（Keyless Keenable）对该 URL 返回
401/404 错误体，也是「它确实是 404」的旁证。

## 6. 关于「控制台 0 报错」这条口径

探针记录了 **1 条** 控制台条目：

```
Failed to load resource: the server responded with a status of 404 ()
@ /studio-site/this-path-does-not-exist-404fix
```

它是浏览器为**文档自身的 404 状态码**记的 network 日志，URL 就是被请求的那条不存在路径。
这跟卡片要求「HTTP 404」是同一件事：只要文档真的返回 404，Chrome 就一定会记这一条；
要让它消失，只能让 404 页返回 200，那就违背验收的第一条。

因此本卡按来源拆开记账：

- `http4xxResources`（除文档外的资源 4xx）= **0**
- `http4xxAll` = 1 条，且唯一一条就是被请求的路径本身
- `consoleErrsNonDoc`（除文档 404 日志外的报错）= **0**
- `resourceCount` = **1**（页面不发起任何子资源请求，连 favicon 都是 data URI）

修复前那 7 条里，6 条是 hashed 资源 + 字体的 404；这部分现在是 0。

## 7. runner 截图里的中文豆腐块（非站点缺陷）

runner 截图（`out/live-404-1440.png`）中文是空心方框，原因是 runner 没有 CJK 字体：

```
fc-list :lang=zh count: 0
fc-list total count: 53
fc-match 'PingFang SC'    → DejaVu Sans
fc-match 'Noto Sans CJK SC' → DejaVu Sans
```

同一份字节（sha256 `39deb97…`，线上抓取值与本地 dist 一致）在本机渲染中文正常
（`out/local-404-1440.png`、`out/local-404-390.png`）。页面字体栈是系统栈，
真实用户端（macOS 苹方 / Windows 雅黑 / Android·Linux Noto Sans CJK）都有中文字形；
本轮没有引入任何 webfont，因此也不存在「字体文件 404」这条历史故障面。

## 8. 备注 / 遗留

1. **master 未改动**：`base: '/studio-site/'` 目前仍只在 `deploy/t_5c7b86ca`（父卡 t_5c7b86ca
   的部署分支），master 的 `vite.config.ts` 仍是 `base: '/'`。本卡按约束没有合并分叉的 master，
   所以 404 修复提交在 `fix/t_703efef3-404`（父 `5f0d186`）。一旦 master 的 base 问题被
   合并/修复，这个提交可以直接 cherry-pick —— 插件读的是 `config.base`，两种 base 都成立
   （`/` 时页面链接变 `/`，子路径时变 `/studio-site/`，不需要改模板）。
2. **验证工具不进仓库**：`verify/404` 临时分支（workflow + 探针）已删除，
   `git ls-remote` 确认远端无此分支；仓库内没有留下任何临时 workflow。
3. 404 页没有 og/canonical/JSON-LD（原副本从 index 抄过来的那套对 404 无意义且
   canonical 指向 `shopforyou.online`），改为 `robots: noindex, follow`。
