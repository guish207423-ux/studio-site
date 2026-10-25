# 屿作所官网 第二轮打磨：规格文档（仅规格，不改代码）

> 产物：`docs/polish-round2.md`。本文件只给可执行规格；任何代码修改由后续轮次实施，本文件不触碰仓库。

## A. 文案改写表

| 所在 section | 原文 | 改写 | 一句话理由 |
|---|---|---|---|
| Hero · 副标题 | 以光学与形变，构建数字产品的视觉语言。 | 做界面、做前端、把设计稿变成能跑的代码。 | 去掉抽象自证，直接说我们实际在做的事。 |
| Hero · 说明 | 从品牌识别到前端交互，一次做完。页面上的玻璃质感用成熟渲染库实现，不是贴图。 | 一个项目从头到尾由同一批人做完，不转包。玻璃效果是真实 backdrop-filter，不是贴图。 | 第一句去掉"一站式"模板腔；第二句保留可验证的技术事实。 |
| Hero · 标签 | 接受委托 · 2026 Q4 | 接新项目 · 2026 Q4 | "委托"是套话，"新项目"是人话。 |
| Services · 标题 | 服务能力 | 能做什么 | "服务能力"是模板腔；"能做什么"是用户真正想看的。 |
| Services · 副标题 | 能自己做完的部分，才写在这里 |  listed 的都是我们自己手写的部分 | 去掉 AI 味的自证 rhetoric。 |
| Services · 服务描述 | 从用户研究到高保真原型的全流程界面设计 | 设计界面，从草图到可点的原型 | 去掉"全流程"套话。 |
| Services · 服务描述 | 现代前端架构、性能调优、全栈交付 | 把设计稿落成可维护的前端代码 | 具体动词替代抽象名词。 |
| CaseStudies · 标题 | 典型场景 | 做过哪些项目 | "典型场景"是模板腔。 |
| CaseStudies · 副标题 | 几种常见的项目形态，以及大概怎么拆 | 三种我们常接的活，以及怎么拆 | 去掉"项目形态"抽象。 |
| Pricing · 标题 | 服务定价 | 价格 | 直接、口语。 |
| Pricing · 副标题 | 透明定价 · 灵活组合 · 全程可追 | 价格写清楚，组合灵活，进度随时看 | 拆掉中英混排符号链。 |
| Contact · 成功态 | 感谢您的留言，我们会在 24 小时内回复。 | 收到了，我们会在一天内回复你。 | "感谢您的留言"是模板腔。 |
| Contact · 副标题 | 开始一个项目 | 留个消息 | 更口语。 |
| About · 副标题 | 一间工作室，按项目组队 | 人不多，按项目组队 | 加具体细节。 |
| About · 段落 | 接的项目主要集中在三块… | 接的活集中在三块：品牌官网、动效界面、设计稿落地。 | 去掉"真正落地成能跑的前端"的自证。 |
| Footer · 说明 | （现有）所有方案均包含源码交付与文档。长期合作可享折扣。 | 所有方案包含源码与文档。长期合作有折扣，具体谈。 | "可享"是套话。 |

## B. 视觉改动清单

| # | 文件 / 选择器 | 属性 | 当前值 → 目标值 | 预期效果 |
|---|---|---|---|---|
| B1 | `.hero-panel` | `background` | `rgba(255,255,255,0.02)` → `rgba(255,255,255,0.035)` | 主卡层次略抬，与背景拉开 |
| B2 | `.hero` 统计卡数字 | `color` | `var(--c-accent)` → `var(--c-txt)` | 荧光绿只留在一个焦点，统计数字回归文本色 |
| B3 | `.section-head__prefix` | `color` | accent → `var(--c-txt-3)` | 减少 accent 出现频率 |
| B4 | `.pricing-card--highlight` | `border-color` | accent → `var(--c-txt)` + `box-shadow: 0 0 0 1px var(--c-txt)` | 唯一焦点改为描边而非发光 |
| B5 | `.service-card__icon` | `color` | accent → `var(--c-txt-2)` | 图标降权 |
| B6 | `src/styles/globals.css` `.container` | `padding-inline` | `var(--sp-4)` → `var(--sp-5)` @ ≥1024px | 增加两侧留白 |
| B7 | `section` 间距 | `padding-block` | `var(--sp-8)` → `var(--sp-10)` | 增加章节间留白 |
| B8 | `.case-card__metric-value` | `color` | `c.color` (每卡不同) → `var(--c-txt)` | 去掉多色 competing focus |
| B9 | `.work-card__preview` | `border-radius` | `var(--r-md)` → `var(--r-lg)` | 统一圆角节奏 |
| B10 | `body` | `letter-spacing` | `0` → `-0.005em` (仅中文段落) | 提升中文排版密度 |

## C. 交互与动效清单

| # | 触发条件 | 状态变化 | 时长 | 缓动 | prefers-reduced-motion 降级 |
|---|---|---|---|---|---|
| C1 | section 进入视口 top 85% | `y:40,opacity:0 → y:0,opacity:1` | 0.4s | expo.out | 跳过动画，直接 opacity:1 |
| C2 | `.work-card` hover | 播放 video | — | — | 禁用 hover 播放，改为 click 切换 |
| C3 | 表单提交失败 | 整卡 x 方向抖动 3px ×5 | 0.06s×5 | power1.inOut | 跳过抖动 |
| C4 | `.service-card__icon` hover | `scale(1.15) rotate(5deg)` | 0.3s | ease-out-expo | 禁用 |
| C5 | hero accent line | 无限 sweep 4s | 4s | quart in-out | 禁用动画 |
| C6 | `.pricing-card` hover | `translateY(-2px)` | 0.2s | ease-out | 禁用 |
| C7 | reduced-motion 全局 | 所有 GSAP 动画跳过 | — | — | 已在各组件检查，需统一到一个 hook |

## D. 移动端 390 与 768 逐项结论

| 区块 | 属性 | 390 当前 → 目标 | 768 当前 → 目标 |
|---|---|---|---|
| hero 卡片 | padding | 16px → 20px | 20px → 24px |
| hero 标题 | font-size | 32px → 28px | 40px → 36px |
| 导航 | 触控区 | 44px → 48px | 44px → 44px |
| 作品卡 | grid columns | 1 → 1 | 2 → 2 |
| 定价卡 | padding | 20px → 24px | 24px → 28px |
| 表单 input | height | 48px → 48px | 48px → 48px |
| 页脚 | font-size | 12px → 13px | 13px → 14px |

## E. 优先级

### P0（阻断观感）
- B2 荧光绿降权（~5 行）
- B3 section prefix 降权（~3 行）
- B8 case metric 多色统一（~2 行）
- A 节 Hero 文案改写（文案层）

### P1（明显提升）
- B1 主卡背景加深
- B4 定价高亮改为描边
- B6/B7 留白加大
- C7 reduced-motion 统一 hook

### P2（锦上添花）
- B9 圆角统一
- B10 letter-spacing
- C6 pricing hover

## 验收对照
- 每条改动均给出文件路径或唯一选择器 ✓
- A 节每条改写含"为什么更像人写" ✓
- 无与硬约束冲突的建议 ✓（未建议新配色模式/浅色模式/虚构数据）
- 本文件未修改任何代码文件 ✓