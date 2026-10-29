# Interface Design System — 屿作所 YU STUDIO

> 本文件保存设计决策与模式记忆。色 / 字 / 间距 / 圆角 / 阴影 / 动效 token 一律以 `DESIGN.md` 为准。

## Intent

- **Who**：寻找"把设计变成能运行的代码"的团队——创始人、产品经理、技术负责人。
- **What**：预约咨询、查看案例、了解服务范围、获取报价。
- **Feel**：暗夜荧光——克制、精密、有技术张力，但不冰冷。

## Domain

1. 暗夜荧光（品牌色是光源，不是装饰）
2. 液态折射（玻璃是"对背后内容的加工"）
3. 精密网格（动态光影背景的 96px 稀疏网格）
4. 平滑滚动（Lenis 的惯性叙事）
5. 滚动视差（DynamicLight 的漂移 + 暗部）
6. Bento 布局（Apple 风格的不对称卡片）
7. 品牌动效（Iconsax + GSAP stagger）
8. 中英混排（Geist 拉丁 + 系统苹方/思源黑体）

## Color World

1. `#0A0A0A` 墨黑（背景）
2. `#A8D93A` 暗夜荧光绿（accent）
3. `#7FE3FF` 冷青（动态光影 / 折射源）
4. `rgba(255,255,255,0.08~0.16)` 玻璃透光
5. `#F0F0F0` 近白（主文字）

## Signature

- **动态光影背景**：三层 fixed 结构（fill + grid + drift）+ 指针暗部层，全局唯一折射源，让 Hyalite 玻璃有"可弯折的结构"。
- **暗夜荧光 accent**：全站唯一高饱和色，只用于 CTA / 进度条 / 焦点环，克制使用。

## Rejecting

- 默认 1：纯白背景 → 替代为 `#0A0A0A` + noise + 动态渐变
- 默认 2：蓝灰配色 → 替代为暗夜荧光绿 accent + 中性灰阶
- 默认 3：居中 Hero → 替代为左对齐 editorial + 右侧留白 / 视觉重量平衡
- 默认 4：3 列等宽卡片 → 替代为 Bento 不对称网格（bento-lg / bento-sm / bento-wide）

## Depth Strategy

- **Borders only**（默认）：`rgba(255,255,255,0.06~0.12)` 低不透明度边框，暗色模式下分层。
- **Glass**（功能层）：nav / contact / modal / hero-panel 使用 Hyalite，参数统一。
- **Shadows**（浮起层）：`--sh-1` / `--sh-2` 用于 floating toolbar / dropdown。

## Spacing

- 基础单位：`4px`（`--sp-1`）
- 章节间距：`--sp-7`（104px） / `--sp-10`（200px）
- 容器：`max-w-[1400px] mx-auto`

## Typography

- 中文正文：系统 CJK 栈（苹方 / HarmonyOS Sans SC / 思源黑体 / 微软雅黑）—— 不打包，见 DESIGN.md 决策记录 2026-10-29
- 英文展示：`Geist`（自托管变量字体，unicode-range 仅拉丁）
- 等宽：`JetBrains Mono`
- 字号比例：display 56-132 / h1 40-76 / h2 24-36 / body 16 / label 12
- 字距：中文 `-0.005em`；英文标题 tight tracking

## Hierarchy

- 一级焦点：Hero 标题（`--fs-h1` + weight + accent color）
- 二级：Section 标题（`--fs-h2`）
- 三级：卡片标题（`--fs-h3`）
- 正文：`--fs-body` / `--c-txt`
- 辅助：`--fs-body-sm` / `--c-txt-2`
- 标签：`--fs-label` / `--c-txt-3`

## Component Patterns

### Button
- 尺寸：`btn--lg`（36px h / 12px 16px pad / 6px radius）
- 主按钮：`bg-[--c-accent] text-[--c-accent-ink]`
- 幽灵按钮：`border border-[--c-line] text-[--c-txt-2]`
- 按压回弹：`transform: scale(0.97)` on `:active`

### Card
- 默认不用卡片；需要 elevation 时才用。
- 玻璃卡片：`.glass-float`（`--glass-bg` + `backdrop-filter` + border）
- Spotlight 卡片：`.spotlight-card`（CSS 变量 `--spotlight-x/y` 驱动 border glow）

### Nav
- 桌面：顶部导航，滚动后加背景（`.nav--scrolled`）
- 移动：汉堡菜单 → drawer（`drawer--open`）
- 玻璃态：`.glass-nav`（Hyalite watch 目标）

### Floating Toolbar
- 单一 FAB，展开联系菜单（220px）
- 滚动后显示（`>320px`），回到顶部（`>600px`）
- Cookie consent 合并进同一 FAB 区域

## Motion

- 引擎唯一：GSAP（`gsap.to` / `fromTo` / `ScrollTrigger.batch`）
- 入场：`y: 40 → 0, opacity: 0 → 1, duration: 0.4~0.8, ease: expo.out`
- Stagger：`0.08s` between items
- 滚动揭示：`start: 'top 85%', once: true`
- 数字滚动：待引入 NumberFlow
- 减少动效：`prefers-reduced-motion` 全局覆盖，保留 opacity/color，去掉位移

## 已排除的参考

- 纯白 / 浅色落地页风格（本站锁定暗色）
- 蓝灰企业配色（accent 已锁定暗夜荧光绿）
- 3 列等宽卡片（已改为 Bento 不对称）
- Inter 字体（已 banned，用 Geist + 系统 CJK 栈）
- Framer Motion（已 banned，引擎唯一 = GSAP）
