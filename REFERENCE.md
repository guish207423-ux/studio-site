# 参考注入

> 本文件为 `ui-workflow` S1 产物。所有参考须可解析、可核查。

## 参考 1
- 来源：apple-design skill / references/hig/
- 参考在教什么：Apple Human Interface Guidelines 的三支柱（Clarity / Deference / Depth）是平台无关的 UI 质量底线——清晰优于装饰、内容优于容器、材质优于描边；Liquid Glass 专项要求材料只浮在功能层（tab bar / toolbar / sidebar / 主 CTA），不在内容层。
- 链接：https://developer.apple.com/design/human-interface-guidelines/

## 参考 2
- 来源：web-design-guidelines skill / references/web-interface-guidelines.md
- 参考在教什么：Vercel 的 Web Interface Guidelines 把"看起来对"翻译成可 grep 的规则——语义色 token 优先于硬编码 hex、触控目标 ≥24pt/44px、焦点环必须可见、`prefers-reduced-motion` 必须降级、`transition: all` 和 `scale(0)` 是红线。
- 链接：本地 skill 文件（已加载）

## 参考 3
- 来源：design-md:linear.app
- 参考在教什么：Linear 的深色界面用 1px 分割线替代卡片边框、等宽数据字体、左侧对齐为主、标题不居中、留白非常慷慨——高级感来自"不画多余的东西"。
- 链接：https://linear.app

## 参考 4
- 来源：design-md:stripe.com
- 参考在教什么：Stripe 的渐变背景只做"氛围不抢焦点"、精确的排版层级（weight + color 做 hierarchy，不是只靠 size）、微动效承载信息（价签翻滚 = 价格在变）。
- 链接：https://stripe.com

## 参考 5
- 来源：component-libraries:react-bits（本地 `~/.agents/component-libraries/react-bits/`）
- 参考在教什么：166 个动画组件中 36 个用 GSAP，可单文件复制即用——包括 Text Animations / Backgrounds / Components，适合给本站的 Hero / Marquee / Pricing 提供现成动效模式。
- 链接：本地目录（已验证存在）

## 参考 6
- 来源：component-libraries:aceternity（本地 `~/.agents/component-libraries/aceternity/`）
- 参考在教什么：Aceternity 的 Spotlight Card、Beam、Bento Grid、Text Effects 都是"大厂感"的来源——不是因为它复杂，而是因为细节克制；本站服务区 bento 可借鉴其 spotlight border 和 stagger reveal。
- 链接：本地目录（已验证存在）

## 参考 7
- 来源：component-libraries:liquid-glass-react（本地 `~/.agents/component-libraries/liquid-glass-react/`）
- 参考在教什么：Apple Liquid Glass 的折射 / 色散 / 磨砂 / 弹性变形有 5 种模式（standard / polar / prominent / shader），本站 Hyalite 已实现基础折射，可对照其 variant 选择补全缺失的变形与弹性。
- 链接：本地目录（已验证存在）

## 反向禁令

- 禁止：纯白 / 纯黑背景（off-white/off-black + noise overlay + 动态渐变）
- 禁止：无交互状态（按钮 / 卡片必须有完整 hover / active / focus / disabled）
- 禁止：白底圆角卡片千篇一律（用 border / divide-y / negative space 分组）
- 禁止：标题永远居中（左对齐为主，居中只用于极少数强调）
- 禁止：蓝灰配色无品牌感（本站 accent 已锁定暗夜荧光绿 #A8D93A）
- 禁止：大面积静态（每个内容区块必须有承载信息的动效）
- 禁止：emoji 作为图标（统一用 Iconsax / Lucide / SVG）
- 禁止：Inter 字体（本站已用 Noto Sans SC + Archivo Black，待评估替换）

## 库选择

| 库 | 选取理由 | 本项目用法 |
|---|---|---|
| `gsap` + `@gsap/react` | 唯一动效引擎，timeline / ScrollTrigger / Flip 全覆盖 | 已装，Hero / Services / DynamicLight 已使用 |
| `iconsax-react` | 品牌 / 动效面图标，6 种 variant，现代感强 | 已装，Services 等 section 已使用 |
| `lucide-react` | 密集工具面图标，线条统一，小尺寸可读性最好 | **待装**，导航 / 工具类组件将切换 |
| `morphicons` | 图标形变唯一实现，stroke 源须配 lucide | 已装，待配 lucide 数据包 |
| `lenis` | 平滑滚动，性能优于 locomotive-scroll | 已装，main.tsx 已接入 |
| `hyalite` | 液态玻璃折射，参数档位已调校到 v6 | 已装，main.tsx 唯一接线点 |
| `react-bits` | 166 个 GSAP 动画组件，单文件复制 | 本地可用，Hero / Marquee 可借鉴 |
| `aceternity` | Spotlight / Beam / Bento 特效 | 本地可用，服务区 / 案例区可借鉴 |
| `liquid-glass-react` | Apple Liquid Glass 5 种模式参考 | 本地可用，Hyalite 参数可对照优化 |
| `sonner` | Toast / 通知，轻量动画 | **待装**，替代 alert / inline toast |
| `NumberFlow` | 数字滚动 | **待装**，Pricing / 数据展示 |
