# HANDOFF — 设计修正 v5 构建部署记录（t_c4c0b5c9）

> 执行方：design-implementer · 任务 t_c4c0b5c9 · 2026-10-21
> 上游：t_a37d022b（design-ui v5 实现，已完成）· 下游：t_c890c612（design-qa QA 验收）

## 1. 本次做了什么

对 design-ui 的 v5 改动执行构建 + 部署 + 线上回归。

**上游改动（src/，未修改，仅接管部署）**

| 文件 | 改动 |
|------|------|
| src/styles/globals.css | 新增 `.refract-blob` 单一折射源 + `@keyframes blob-drift`；`--glass-blur` 24px → `blur(20px) saturate(160%) brightness(105%)` |
| src/App.tsx | 恢复单个 `<div className="refract-blob" aria-hidden="true" />`（放在 Navigation 之前，z-index:-1） |
| src/microInteractions.ts | 恢复 `visibilitychange` 暂停 blob 动画（单个元素） |

**构建**

- 命令：`npm run build`（= `tsc -b && vite build`）
- 结果：**零错误、零警告失败**。`tsc -b` 通过；vite 1050 modules transformed。
- 产物：`dist/` **141 文件 / 7.9MB**，CSS `index-BYMtcfzD.css` 128.95 kB（gzip 53.97 kB），花括号 190/190 平衡。
- 资源：`dist/videos/` 6 WebM + 6 poster 全在；`dist/hyalite.js` 51.6KB；`dist/icons.svg` 5.0KB；`dist/favicon.svg`。

**部署**

- 提交 `e5ab87a`（master），推送 origin 成功：`88f2b0d..e5ab87a`。
- 本地 `dist/` 为 gitignore 项，构建产物只进提交 `dist/index.html`（asset 引用名）；部署由 GitHub Actions 在 master 上重新构建，无需推送 dist 资源。
- GitHub Actions「Deploy to GitHub Pages」run `39593096843` **completed/success**（41s）。
- 线上 URL：https://guish207423-ux.github.io/studio-site/

## 2. 线上验证（Playwright 实测，非推断）

| 项 | 结果 |
|----|------|
| HTTP | 200（CSS/JS 均 200，Age 0–14s，即本次新产物） |
| 页面错误 | **0 条**（无 pageerror / 无 console error） |
| root 挂载 | 6 个子节点（正常渲染） |
| `.refract-blob` | 存在；`position: fixed`、`z-index: -1`、`864px`（=60vw，max 960px 未触发）、`animation: blob-drift 32s`、radial-gradient 冷光 rgba(127,227,255,0.10/0.04) ✅ |
| body 背景 | `rgb(5, 5, 5)` = `var(--c-ink)` 纯色 ✅ |
| `--glass-blur` | `blur(20px) saturate(160%) brightness(105%)` ✅（v5 值生效） |
| hyalite 实例 | 桌面 5 个 SVG filter（≤5 预算）✅；移动端 2 个（≤3 预算）✅ |
| 玻璃接线 | `.glass` backdrop-filter = `url("#hyalite-1")`（hyalite 变量接线生效）；`--hyalite-edge` = `inset 0 0 0 .5px rgba(255,255,255,0.058)` ✅ |
| 作品视频 | 6/6 WebM 全部 `readyState ≥ 2` ✅ |
| 响应式 | 1440 / 1024 / 390 三档 `overflow = 0`（零横向溢出）✅ |
| 移动端汉堡 | 390px `display: block`（生效）；1440px 隐藏 ✅ |
| reduced-motion | blob `animation-duration: 1e-05s`、`iteration-count: 1`、`transform: none` ✅（全局降级生效） |
| 残留清理 | `refract-grid` / `refract-atmosphere` / `grid-fine-drift` / `atmosphere` 在 src 与 dist 中 **0 命中** ✅ |

## 3. 已知限制（非本次回归，转告 QA）

- `--glass-blur` 的移动端降级（blur 12px / saturate 140% / brightness 103%）与 blob 移动端 `animation-duration: 48s` **在 globals.css 中不存在**：mobile 390 实测 blob 仍为 `32s`，与评估报告 §1.2/§4 的建议不一致。当前不影响功能与验收，但属于「建议 vs 实现」的偏差，由 design-qa 决定是否要求补。
- `prefers-contrast: more` 的 `--glass-bg` 提升已存在（globals.css:468）。
- 线上 `--hyalite` 变量正常注入，无 `var(--hyalite)` 未定义回退问题。

## 4. 环境与复现命令

```bash
cd /home/guish/Desktop/Projects/studio-site
npm run build                      # tsc -b && vite build，零错误
python3 -m http.server 8905 --bind 127.0.0.1   # 注意：base 为 /studio-site/，需从仓库根服务
# 本地验证入口是 http://127.0.0.1:8905/dist/ （dist/index.html 的 asset 用绝对 /studio-site/ 前缀）
```

本地 8904 直服 dist/ 会 404（绝对路径前缀），QA 的 `qa_verify_v5.py` 用 `http://127.0.0.1:8904` 直服 dist/ —— **该脚本在本仓库 base 配置下取不到资源**，建议 QA 改为从仓库根起服务并访问 `/dist/`，或直接打线上 URL。

## 5. 交付物

- 线上站点：https://guish207423-ux.github.io/studio-site/
- 提交：`e5ab87a`（master，已推送）
- 构建产物：`/home/guish/Desktop/Projects/studio-site/dist/`（141 文件 / 7.9MB）
- 本报告：`HANDOFF-v5-t_c4c0b5c9.md`
- 验证脚本（workspace）：`verify_v5.py`、`verify_live.py`、`verify_glass.py`、`probe2.py`
