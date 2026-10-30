# 设计系统 — 屿作所 YU STUDIO

> 唯一真源。本项目所有色 / 字 / 间距 / 圆角 / 阴影 / 动效 token 均以本文件为准。
> CSS 变量（`:root`）由它派生；`src/styles/globals.css` 是具体实现，不是 token 源。

## 项目信息

- **项目名称**：屿作所 YU STUDIO
- **定位**：综合数字产品工作室（品牌官网 / 动效界面 / 设计稿落地）
- **风格**：Apple 极简 + Linear 精确 + 暗夜荧光（品牌 accent）
- **目标平台**：Web（桌面优先，移动端降级）
- **暗色模式**：默认 / 唯一交付（浅色待定）
- **物理层**：noise overlay + 动态光影背景（DynamicLight）+ 液态玻璃（Hyalite）

## 设计方向

- **Clarity 清晰**：每处都让人一眼懂用途，弱化装饰。
- **Deference 顺从**：界面退后、内容优先；留白与层级让信息呼吸。
- **Depth 纵深**：用层次 / 材质（模糊 / elevation）表达空间关系，而非粗边框。

## 参考

- `REFERENCE.md`（本目录下）

## Color Tokens

### 基础色板（暗色）

| Token | 值 | 用途 |
|---|---|---|
| `--c-ink` | `#0A0A0A` | 页面背景（最深） |
| `--c-ink-2` | `#0F0F0F` | 次级背景 |
| `--c-panel` | `#141414` | 卡片 / 面板 |
| `--c-panel-2` | `#1A1A1A` | 面板 hover / 浮起 |
| `--c-line` | `#2E2E2E` | 弱分割线 |
| `--c-line-strong` | `#3E3E3E` | 强分割线（装饰性，不受非文本对比约束） |
| `--c-border-ui` | `#666666` | **交互控件边界**（按钮 / 筛选器 / 输入框）。WCAG 1.4.11 要求 ≥3:1；在 `#0A0A0A`–`#1A1A1A` 上实测 3.03–3.45:1 |
| `--c-txt` | `#F0F0F0` | 主正文 |
| `--c-txt-2` | `#B0B0B0` | 次级文字 |
| `--c-txt-3` | `#8A8A8A` | 辅助 / 占位文字（2026-10-29 由 `#7A7A7A` 提亮：原值在 `#141414`/`#1A1A1A` 面板上只有 4.29/4.05:1，全站 44 处 12px 小字不达 AA） |
| `--c-accent` | `#A8D93A` | 品牌 accent（暗夜荧光绿） |
| `--c-accent-ink` | `#0A0A0A` | accent 上的反色文字 |

### 语义色

| Token | 值 | 用途 |
|---|---|---|
| `--c-ok` | `#7DFF6A` | 成功 / 正向 |
| `--c-warn` | `#FFB020` | 警告 |
| `--c-err` | `#FF4D6D` | 错误 / 危险 |
| `--c-info` | `#7FE3FF` | 信息 |

### 玻璃态

| Token | 值 | 用途 |
|---|---|---|
| `--glass-bg` | `rgba(255, 255, 255, 0.08)` | 玻璃基础背景 |
| `--glass-bg-hover` | `rgba(255, 255, 255, 0.12)` | 玻璃 hover |
| `--glass-bg-active` | `rgba(255, 255, 255, 0.16)` | 玻璃 active |
| `--glass-blur` | `blur(16px) saturate(160%) brightness(108%)` | 玻璃模糊基准 |

## Typography Tokens

### 字体家族

| Token | 值 | 用途 |
|---|---|---|
| `--font-display` | `'Geist', 'PingFang SC', 'HarmonyOS Sans SC', 'Source Han Sans SC', 'Noto Sans CJK SC', 'Noto Sans SC', 'Microsoft YaHei', system-ui, sans-serif` | 展示标题（拉丁 Geist / 中文系统栈） |
| `--font-sans` | `'Geist', 'PingFang SC', 'HarmonyOS Sans SC', 'Source Han Sans SC', 'Noto Sans CJK SC', 'Noto Sans SC', 'Microsoft YaHei', system-ui, sans-serif` | 正文 / UI（同上） |
| `--font-mono` | `'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, Consolas, monospace` | 等宽 / 数据 |

### 字号（clamp 响应式）

| Token | 值 | 用途 |
|---|---|---|
| `--fs-display` | `clamp(56px, 9.2vw, 132px)` | 超大展示 |
| `--fs-h1` | `clamp(40px, 5.6vw, 76px)` | 一级标题 |
| `--fs-h2` | `clamp(24px, 3.2vw, 36px)` | 二级标题 |
| `--fs-h3` | `20px` | 三级标题 |
| `--fs-body-lg` | `clamp(17px, 1.5vw, 21px)` | 大正文 |
| `--fs-body` | `16px` | 正文 |
| `--fs-body-sm` | `14px` | 辅助正文 |
| `--fs-label` | `12px` | 标签 / 说明 |
| `--fs-footer` | `12px` | 页脚（移动端 13 / 平板 14） |

### 字距 / 行高

- 中文段落：`letter-spacing: -0.005em`（收紧拉丁默认松字距）
- 正文行高：`1.75`
- 大标题：`leading-none` + 负字距（tight tracking）

## Spacing Tokens

| Token | 值 | 用途 |
|---|---|---|
| `--sp-1` | `4px` | 微间距 |
| `--sp-2` | `8px` | 小组件内间距 |
| `--sp-3` | `16px` | 标准组件内间距 |
| `--sp-4` | `24px` | 区块 padding |
| `--sp-5` | `40px` | 区块间距 |
| `--sp-6` | `64px` | 大区块间距 |
| `--sp-7` | `104px` | 章节间距 |
| `--sp-8` | `160px` | 超大间距 |
| `--sp-10` | `200px` | 章节间距再抬一档 |

## Radius Tokens

| Token | 值 | 用途 |
|---|---|---|
| `--r-xs` | `4px` | 小标签 |
| `--r-sm` | `8px` | 按钮 / 输入 |
| `--r-md` | `14px` | 卡片 / 面板 |
| `--r-lg` | `20px` | 大卡片 |
| `--r-xl` | `28px` | 模态 / 大浮层 |
| `--r-pill` | `999px` | 胶囊按钮 |

## Shadow Tokens

| Token | 值 | 用途 |
|---|---|---|
| `--sh-0` | `0 1px 2px rgba(0,0,0,.35)` | 微浮起 |
| `--sh-1` | `0 2px 6px rgba(0,0,0,.4), 0 8px 20px rgba(0,0,0,.28)` | 卡片浮起 |
| `--sh-2` | `0 4px 12px rgba(0,0,0,.44), 0 16px 40px rgba(0,0,0,.30)` | 浮层浮起 |
| `--sh-3` | `0 8px 24px rgba(0,0,0,.5), 0 24px 60px rgba(0,0,0,.36)` | 模态浮起 |
| `--sh-focus` | `0 0 0 3px #0A0A0A, 0 0 0 5px #A8D93A` | 焦点环 |

## Z-Index Tokens

| Token | 值 | 用途 |
|---|---|---|
| `--z-bg` | `-1` | 背景层 |
| `--z-content` | `0` | 内容层 |
| `--z-card` | `10` | 卡片 |
| `--z-float` | `20` | 浮动组件 |
| `--z-nav` | `40` | 导航栏 |
| `--z-overlay` | `60` | 遮罩 |
| `--z-modal` | `80` | 模态框 |
| `--z-toast` | `100` | 提示 |

## Motion Tokens

### 缓动

| Token | 值 | 用途 |
|---|---|---|
| `--ease-out-expo` | `cubic-bezier(0.16, 1, 0.3, 1)` | 标准出场 |
| `--ease-out-quint` | `cubic-bezier(0.22, 1, 0.36, 1)` | 长出场 |
| `--ease-out-back` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | 回弹 |
| `--ease-in-out-quart` | `cubic-bezier(0.76, 0, 0.24, 1)` | 双向过渡 |
| `--ease-linear` | `linear` | 进度条等 |

### 时长

| Token | 值 | 用途 |
|---|---|---|
| `--dur-micro` | `180ms` | 微交互 |
| `--dur-standard` | `420ms` | 标准过渡 |
| `--dur-slow` | `800ms` | 慢速动画 |

> 阈值与上限唯一出处：`ui-workflow/references/design-tokens-motion.md` §0/§2。

## 组件库登记

| 库 | 版本 | 用途 | 登记理由 |
|---|---|---|---|
| `gsap` + `@gsap/react` | ^3.15.0 | 唯一动效引擎（timeline / ScrollTrigger / Flip） | 项目已装，按 skill 要求必须用 |
| `iconsax-react` | ^0.0.8 | 品牌 / 动效面图标（Hero、营销、空态） | 同层不混库 |
| `lucide-react` | （待装） | 密集工具面图标（admin、表格、表单） | 备选主库 |
| `morphicons` | ^2.0.0 | 图标形变（stroke 源须配 lucide） | 唯一实现 |
| `lenis` | ^1.3.27 | 平滑滚动 | 已装 |
| `@fontsource-variable/noto-sans-sc` | ^5.3.1 | 中文字体（子集化） | 已装 |
| `@fontsource-variable/geist` | ^5.3.0 | 展示标题（拉丁，变量字体） | 已装，替换 Archivo Black |
| `@fontsource/jetbrains-mono` | ^5.3.0 | 等宽字体 | 已装 |
| `hyalite` | （vendor） | 液态玻璃折射 | 已装 |
| `sonner` | （待装） | Toast / 通知 | 强制调用库 |
| `NumberFlow` | （待装） | 数字滚动 | 强制调用库 |
| `react-bits` | （本地 `~/.agents/component-libraries/react-bits/`） | 166 个动画组件参考 | 社区资源 |
| `aceternity` | （本地 `~/.agents/component-libraries/aceternity/`） | 特效组件参考 | 社区资源 |
| `liquid-glass-react` | （本地 `~/.agents/component-libraries/liquid-glass-react/`） | Apple Liquid Glass 参考 | 社区资源 |

## 设计决策记录

- 2026-10-28：唯一 token 真源从 `globals.css :root` 迁移到 `DESIGN.md`；CSS 变量由它派生。
- 2026-10-28：风格锁定 Apple 极简 + Linear 精确 + 暗夜荧光 accent。
- 2026-10-28：字体系统保留 Noto Sans SC（中文），Geist 用于英文展示词（替换 Archivo Black）。
- 2026-10-28：物理层 = noise overlay + DynamicLight + Hyalite 液态玻璃。
- 2026-10-28：动效引擎唯一 = GSAP；不接受 Framer Motion。
- 2026-10-29：**中文不再打包 woff2**。原 Noto Sans SC 按站内用字子集化成 26 个分片（1.29MB），
  实测 Slow 4G 下 LCP 3.96s / FCP 2.21s；改走系统 CJK 栈后 FCP 回到 1.5s 量级。
  拉丁仍自托管 Geist（identity 在展示字上），等宽用 JetBrains Mono。
- 2026-10-29：**删掉 `.section` 的 `content-visibility: auto` + `contain-intrinsic-size: auto 600px`**。
  区块真实高度 700–2445px，占位值固定 728px，移动端文档高 6874 vs 真实 10790（差 36%）：
  滚动时页面不断变长、锚点落偏、ScrollTrigger start 按假高度算。8 个区块不值得换这个。
- 2026-10-29：**index.html 增加静态首屏壳（导航 + Hero）**，React 挂载时整体替换。
  纯 CSR 下首屏 JS 147KB(gzip)、Slow 4G 要 3.4s 才 DCL；加壳后 LCP 3.6s → 1.57s，且爬虫可见正文。
  壳与 `Hero.tsx` / `Navigation.tsx` 是双份文案，`npm run check:shell` 比对 H1 / 副标题 / 导航 / CTA。
- 2026-10-29：**移除首屏 LoadingScreen**。原 1.2s 满屏 + 0.6s 淡出，首屏被品牌板挡近 2s；
  有静态壳之后它只剩副作用，删掉。
- 2026-10-30：**区块标题独立成级** `--fs-h2-display: clamp(26px, 3.6vw, 44px)`。原先
  `.section-head__title` 取的是 `--fs-h1`，390 档实测 h2=40px > h1=39px（层级倒置）。
  约束：`h1 ≥ 1.4 × h2`，两档都成立（1440 档 2.18 / 390 档 1.50）。
- 2026-10-30：**面板色 `--c-panel` #141414 → #1A1A1A**，卡片边框接 `--c-border-ui` #666666。
  原边框 #2E2E2E 对页底只有 1.46:1，暗屏上 8 张 bento 塌成一整块；#666666 是同时满足
  页底(3.45:1)与面板(3.03:1)的最小值（#5A5A5A 2.87、#616161 对面板 2.81 都不够）。
- 2026-10-30：**区块留白 `--sp-10`(200px) → 120px（移动 72px）**，桌面文档高 12569→11389px。
- 2026-10-30：**Hero 改两行**（「我们把设计变成 / 能运行的产品」），accent 落在动词短语上。
  原三行末行只有「产品」二字（占最长行 33%，390 档 21%）= 悬垂孤行，且把最重的视觉资源
  压在信息量最低的两个字上。
- 2026-10-30：**区块顺序 Cases → Works**。原先「技术资产（第三方开源录屏）」排在自己的案例
  之前 2767px，采购视角读作「没有代表作」。
- 2026-10-30：关掉 `.light-field__ruler`（第二层纯装饰网格，不承载任何测量信息）。
  `.light-field__grid` 保留 —— 它是 hyalite 折射的采样源，删掉玻璃会退化成灰白塑料。
- 2026-10-29：Cookie 提示从「顶部居中压住导航 + accent 绿主按钮」改为「左下角、双按钮同权重」，
  避免与真实 CTA 抢层级，也避免同意/拒绝的视觉诱导。
- 2026-10-29：**液态玻璃此前从未真正接线**。`applyHyalite` 里写的是
  `stopWatchers.push(() => Hyalite.watch(...).stop())` —— 存进去的是「开启后立刻关闭」的函数，
  watcher 从未启动；同时 `.glass-btn` 没有任何 `backdrop-filter: var(--hyalite…)` 消费方
  （按钮 class 里没有 `.glass`）。修复：改为「先 watch、存 handle.stop()」，
  `.glass-btn` 补上消费声明（兜底档 6px，比面板薄），并在 DOMContentLoaded 与懒加载区块挂载后重接。
  **验收看 DOM 里 `filter` 元素数与 `backdrop-filter: url(#…)`，不看代码里有没有写 watch。**
- 2026-10-29：`applyHyalite` 改为**幂等**（接好就返回，不重建）。原因：Hyalite 的 stop() 不回收
  注入的 `<filter>` 与元素上的 `--hyalite`；`detach()` 又会删掉滤镜 DOM 而元素仍指向已删的 id。
  反复重接实测把 7 个玻璃元素的 filter 堆到 54 个，而切主题后又归零（玻璃凭空消失）。
  单主题本站的正确答案是「不重建」；将来真做浅色主题，需要单独设计重挂流程。
- 2026-10-29：`.glass-btn` 的玻璃档位用 button 参数（bevel 20 / thickness 38 / squircle），
  面板用 panel 参数（bevel 46 / thickness 84 / lip）；`edge: 0.08` 两个档位都不动 —— 0.3+ 就是塑料白圈。
