# 屿作所 YU STUDIO — 交付说明

> 最后更新：2026-10-29（上一版写于 10-20，技术栈与指标已大面积失真，本次重写）

## 是什么

综合数字产品工作室官网，线上在 <https://shopforyou.online>（阿里云 ESA Pages 托管，
DNS 在腾讯云：`@ CNAME → shopforyou.online.a1.initkk.com`）。

## 技术栈（以此为准）

| 层 | 实际使用 |
|---|---|
| 框架 | React 19.2 + TypeScript 5.6 |
| 构建 | Vite 7.3（需 Node ≥ 22；本机走 `~/.hermes/tools/node-26.7.0-linux-x64`）+ oxlint |
| 动效 | GSAP 3.15（唯一引擎）+ Lenis 1.3 平滑滚动 |
| 液态玻璃 | `public/hyalite.js` 0.5.0（SVG backdrop-filter 折射） |
| 图标 | iconsax-react（品牌/营销面） |
| 字体 | 自托管 Geist（仅拉丁）+ JetBrains Mono；**中文走系统栈**（苹方 / HarmonyOS Sans SC / 思源黑体 / 雅黑） |

> 已下线：Framer Motion、liquid-glass-react、Archivo Black、Noto Sans SC 打包分片。
> 决策与理由见 `DESIGN.md` §设计决策记录。

## 目录

```
src/
  components/ layout/    Navigation, Footer
  components/ sections/  Hero, About, Services, Works, Process, CaseStudies, Pricing, Contact
  components/ ui/        BrandMark, DynamicLight, FloatingToolbar, Marquee, ScrollToTop, SectionIcon
  styles/                fonts.css（@font-face）、globals.css（唯一样式表，token 见 DESIGN.md）
  lib/                   motion.ts（reduced-motion）、hyalite.ts（参数档位来源）
  main.tsx               Lenis / Hyalite 接线 / Service Worker 注销
  App.tsx                滚动进度、入场看门狗、懒加载区块
scripts/
  check-shell.mjs        静态首屏壳 ↔ 组件文案一致性（npm run check:shell）
  perf-probe.py          零依赖 CDP 探针：LCP / CLS / FCP / DCL（npm run perf）
  gen-fonts-css.py       中文分片生成器（当前未启用，见 fonts.css 顶部说明）
public/                  hyalite.js、videos/、og-image.png、sitemap.xml、robots.txt、manifest.json
templates/404.html       404 页模板（全内联）；vite.config.ts 的 studio-pages-404 插件把 %BASE% 换成本次 base 后写 dist/404.html
dist/                    构建产物，部署这个目录
```

## 构建与部署

```bash
export PATH=/home/guish/.hermes/tools/node-26.7.0-linux-x64/bin:$PATH   # vite7 要 Node ≥22
pnpm install
pnpm build          # tsc -b && vite build → dist/
python3 scripts/perf-probe.py http://127.0.0.1:4173/ --mobile --slow4g  # 需先起静态服务
```

**生产部署（阿里云 ESA Pages）**：把 `dist/` 打成 zip → 控制台「函数和 Pages」上传 → 触发构建。
站点本身只是加速层，静态内容必须落在「函数和 Pages」里，再绑定域名。

临时预览（3 天过期，非生产）：`npx -y @shipstatic/ship ./dist --json`；
若 30s 超时用 SDK：`new Ship({timeout:600000, maxRetries:3}).deploy('./dist')`。

`.github/workflows/deploy.yml` 会把 master 推到 **GitHub Pages**（镜像，不是生产域名）。

## 验收（2026-10-29 实测）

| 项 | 值 | 基准 |
|---|---|---|
| LCP | Mobile Slow4G **1672ms** / 本地 176ms | ≤ 2500ms |
| CLS | 0 – 0.0008 | ≤ 0.1 |
| axe-core 4.10.2 违例 | **0** | 0 |
| 文本对比度 | 324 个文本节点 0 处不达 AA | 4.5:1 / 3:1（大字） |
| 横向溢出 | 0（390 / 1440 实测） | 0 |
| 构建产物 | 3.4MB（assets 680KB） | — |

复验：`npm run check:shell`、`python3 scripts/perf-probe.py <url>`，
浏览器内注入 axe-core 跑 `axe.run(document)`。完整逐项结论见 `qa-receipt.json`。

## 已知限制

- **帧率**在本机无头环境测不出可信值（同一构建在 30/59.9fps 间摆动，关掉全部动画仍 30fps），
  需真机复测；代码侧保证只动 transform/opacity。
- 生产推送需要 ESA 控制台登录，仓库内没有 API 凭证，无法脚本化。
- `docs/` 下多是 10 月的评审/商业计划稿，属过程文档，不代表当前实现。
