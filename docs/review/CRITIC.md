# CRITIC.md — 设计评审报告

评审对象：屿作所 studio-site 预览站
预览 URL：https://guish207423-ux.github.io/studio-site/
评审日期：2026-10-20
评审人：design-critic（design-orchestrator）

## 总结结论

**结论：有条件通过（Conditional Pass）** — 3 秒第一印象与液态玻璃质感达标，但存在 3 项必修项（作品真实性声明、联系表单后端、动效节奏证据）与 2 项建议项。未发现阻塞级（BLOCKER）问题；移动端零溢出已验证。

## 1. 3 秒第一印象

- 证据：预览 URL 首屏 Hero 文案「以光学与形变，构建数字产品的视觉语言」+ 液态玻璃实例 5/5 + hyalite.js v0.5.0 引擎；桌面截图（viewport 1440）显示大字标题 + 玻璃卡片。
- 结论：Hero 立即传达「大胆张扬、视觉冲击、动效丰富」。液态玻璃由成熟库驱动（hyalite.js），非手搓。✅ 达标。但 Hero 视觉与任意 SaaS 模板的差异主要依赖玻璃折射；若移除玻璃，文案/布局仍偏模板化 → 建议强化品牌独有图形。

## 2. 视觉一致性

- Token 使用：CSS 变量 + Tailwind；玻璃参数 hyalite edge≤0.08（按 skill）。
- 静态稿 vs 线上：线上 glass 实例 5 个，与 HANDOFF 声明一致。
- 液态玻璃：边缘无脏污/溢色观察；与底色协调。✅
- 问题 M-1：作品区展示 Blender/Grafana/Audacity 等开源项目并标 ⭐ 星数，易被误解为真实客户案例；需明确「开源项目编排」署名与 LICENSE 合规声明。[URL: https://guish207423-ux.github.io/studio-site/#works]

## 3. 动效质量

- 节奏：GSAP + Lenis + Framer Motion 三栈；微交互 739 监听器。
- 廉价特效：未观察无意义粒子/乱飞元素；动效 GPU 友好（transform/opacity）。
- 滚动：Lenis 平滑滚动；未测帧率但 HANDOFF 记录 20ms/帧上限。
- 问题 M-2：需提供滚动帧率采样或长任务记录作为证据（当前仅声明）。[URL: https://guish207423-ux.github.io/studio-site/]

## 4. 细节

- 字体层级：Archivo Black + Noto Sans SC + JetBrains Mono，层级清晰。
- 留白：Hero 与 section 间距充足。
- 移动端：viewport 390×844 实测 scrollWidth 390 = innerWidth，零溢出。✅ 但断点是否仅桌面缩水需真机验证（当前仅 CSS 响应式）。
- 问题 M-3：联系表单无后端 endpoint（HANDOFF 待补充），提交无响应。[URL: https://guish207423-ux.github.io/studio-site/#contact]

## 5. 与用户确认方向的偏离点

- 用户确认方向（CONFIRM.md 不存在于本项目，以 spec 为准）：液态玻璃必须用成熟库 ✅ hyalite.js；动效丰富 ✅；Awwwards 风格 ✅。
- 偏离：作品区用开源项目替代真实案例（spec 允许「直接编排开源项目/资源」，但需署名 LICENSE）；联系信息占位。

## 必修项（Conditional Pass 升级为 Pass 的条件）

1. M-1：作品区添加「开源项目编排，非客户案例」声明 + LICENSE 署名。
2. M-2：提供滚动帧率采样证据（Lighthouse/Performance trace）。
3. M-3：联系表单接入后端 endpoint 或 mailto fallback。

## 截图证据

- desktop-1440.png：Hero 首屏（workspace 附件）
- mobile-390.png：移动端零溢出（workspace 附件）

## 验证命令

- curl -sI https://guish207423-ux.github.io/studio-site/ → 200
- 浏览器 viewport 390×844：scrollWidth 390 == innerWidth 390（零溢出）
