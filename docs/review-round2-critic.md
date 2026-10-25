# 独立审查：第二轮打磨落地核查（design-critic）

- 审查对象：仓库 `/home/guish/Desktop/Projects/studio-site`，规格 `docs/polish-round2.md`（HEAD 声明 `e5530d9`）
- 审查时间点：**工作区已不在 `e5530d9`** —— `git status` 显示有未提交改动（见 §6），本报告逐条同时标注「规格条目」与「当前工作区实况」
- 方法：全部结论来自 `git show` / `git log` / `read_file` / `grep` 实读，未打开浏览器；未修改任何代码文件
- 结论摘要：**规格 39 条中，真正落到代码的 6 条；执行方 4 条驳回复核后 0 条完全成立；执行方引入 9 处新问题**

---

## 1. 逐条落地状态

状态口径：**已落地**（代码里存在且生效）／**未落地**／**部分落地**／**实现与规格不一致**

### A. 文案改写表（规格 16 条）

| 规格条目 | 状态 | 证据（文件:行） |
|---|---|---|
| A1 Hero·副标题 | **实现不一致** | 规格「做界面、做前端、把设计稿变成能跑的代码」；实际 `Hero.tsx:71`「把设计稿做成能用的界面，看得见，也点得动。」 |
| A2 Hero·说明 | **实现不一致** | 规格「一个项目从头到尾由同一批人做完，不转包。玻璃效果是真实 backdrop-filter，不是贴图。」；实际 `Hero.tsx:77`「…页面上的玻璃是真在透背景，不是贴图。」（未提 backdrop-filter） |
| A3 Hero·标签 | **实现不一致** | 规格「接新项目 · 2026 Q4」；实际 `Hero.tsx:46`「2026 Q4 档期可接新项目」 |
| A4 Services·标题「服务能力→能做什么」 | **未落地** | `Services.tsx:45` 仍为「服务能力」；`grep -rn "能做什么" src/` 无命中 |
| A5 Services·副标题 | **实现不一致** | 规格「 listed 的都是我们自己手写的部分」；实际 `Services.tsx:46`「能自己做完的部分，才写在这里」 |
| A6 Services·服务描述（UI/UX） | **已落地** | `Services.tsx:10`「设计界面，从草图到能点的原型」 |
| A7 Services·服务描述（前端） | **已落地** | `Services.tsx:12`「把设计稿落成能维护的前端代码」 |
| A8 CaseStudies·标题「典型场景→做过哪些项目」 | **未落地** | `CaseStudies.tsx:75` 仍为「典型场景」 |
| A9 CaseStudies·副标题 | **已落地** | `CaseStudies.tsx:77`「三种我们常接的活，以及怎么拆」 |
| A10 Pricing·标题「服务定价→价格」 | **未落地** | `Pricing.tsx:63` 仍为「服务定价」 |
| A11 Pricing·副标题 | **已落地** | `Pricing.tsx:65`「价格写清楚，组合灵活，进度随时看」 |
| A12 Contact·成功态 | **已落地** | `Contact.tsx:123`「收到了，我们会在一天内回复你。」 |
| A13 Contact·副标题「开始一个项目→留个消息」 | **已落地（与规格有冲突）** | `Contact.tsx:136`、`:141` 均「留个消息」；但导航 CTA `Navigation.tsx:141` 仍「开始一个项目」 |
| A14 About·副标题 | **已落地** | `About.tsx:65`「人不多，按项目组队」 |
| A15 About·段落 | **实现不一致** | 规格「接的活集中在三块：品牌官网、动效界面、设计稿落地。」；实际 `About.tsx:89`「…以及把设计稿真正落地成能跑的前端。」（保留「真正落地成能跑的」自证句式） |
| A16 Footer·说明 | **已落地** | `Pricing.tsx:97`「所有方案包含源码与文档。长期合作有折扣，具体谈。」 |

A 节小结：**已落地 6 / 实现不一致 5 / 未落地 3**（A4、A8、A10 三个标题未改）。A13 落地但与导航文案形成不一致。

### B. 视觉改动清单（规格 10 条）

| 规格条目 | 状态 | 证据（文件:行） |
|---|---|---|
| B1 `.hero-panel` background | **部分落地（见 §2.4）** | `Hero.tsx:26` 内联 `background: 'rgba(255, 255, 255, 0.035)'` 已改；`globals.css` 无 `.hero-panel` 的 background 声明 |
| B2 hero 统计卡数字 color | **已落地** | `Hero.tsx:121` `color: 'var(--c-txt)'` |
| B3 `.section-head__prefix` color | **已落地** | `globals.css:372` `color: var(--c-txt-3)` |
| B4 `.pricing-card--highlight` 描边 | **部分落地** | `globals.css:1118-1121` 仅 `border-color: var(--c-accent)`；规格要求的 `box-shadow: 0 0 0 1px var(--c-txt)` **不存在** |
| B5 `.service-card__icon` color | **未落地** | `globals.css:877` 仍为 `color: var(--c-accent)` |
| B6 `.container` padding-inline @≥1024 | **未落地** | `globals.css:231-235` 为 `padding: 0 var(--sp-5)`，无 `@media (min-width: 1024px)` 覆盖 |
| B7 section padding-block `--sp-10` | **未落地** | `globals.css:347-352` 为 `padding: var(--sp-7) 0`；`--sp-10` 未定义 |
| B8 `.case-card__metric-value` color | **已落地** | `globals.css:1075` `color: var(--c-txt)`；`CaseStudies.tsx:92` 已删内联 `style={{ color: c.color }}`（数据里 `color` 字段仍在，成为死字段） |
| B9 `.work-card__preview` radius | **未落地** | `globals.css:779` 仍为 `border-radius: var(--r-md) var(--r-md) 0 0` |
| B10 `body` letter-spacing 中文 | **未落地** | `globals.css:123-133` `html body` 无 letter-spacing；全仓无 `-0.005em` |

B 节小结：**已落地 3 / 部分落地 2 / 未落地 5**。

### C. 交互与动效清单（规格 7 条）

| 规格条目 | 状态 | 证据（文件:行） |
|---|---|---|
| C1 section 进入视口 top 85% | **已落地** | `Services.tsx:36-39`、`CaseStudies.tsx:61-64`、`Pricing.tsx:43-46`、`Works.tsx:146`、`About.tsx:49-52`、`Blog.tsx` 等均 `start: 'top 85%'` + `expo.out`；reduced-motion 分支 `if (reduced) return` |
| C2 `.work-card` hover 播放 → click 切换 | **部分落地** | `Works.tsx:117-120` 在 `!reduced` 时仍注册 `mouseenter/mouseleave` 播放；`:122-125` 的 click 切换存在但 `reduced` 与 hover 共用同一判断，未做触屏判定 |
| C3 表单提交失败抖动 | **已落地** | `Contact.tsx:44-48` `gsap.to(formRef.current, { x: 3, duration: 0.06, repeat: 5, yoyo: true, ease: 'power1.inOut', clearProps: 'x' })`，含 reduced 跳过 |
| C4 `.service-card__icon` hover | **部分落地** | `Services.tsx:53-57` 内联 `onMouseEnter/Leave` 做 `scale(1.15) rotate(5deg)`；reduced-motion 未禁用 |
| C5 hero accent line 4s sweep | **已落地** | `Hero.tsx:37` `animation: 'hero-accent-sweep 4s var(--ease-in-out-quart) infinite'`；`globals.css:977-981` keyframes |
| C6 `.pricing-card` hover `translateY(-2px)` | **实现不一致** | 规格值 `-2px`；实际 `globals.css:690` `.glass-float:hover { transform: translateY(-6px) translateZ(8px) rotateX(1deg) rotateY(-1deg) }` |
| C7 reduced-motion 统一 hook | **未落地** | 各组件各自 `matchMedia('(prefers-reduced-motion: reduce)').matches`（`Hero.tsx:10`、`Services.tsx:27`、`Works.tsx:91`、`CaseStudies.tsx:50`…），无统一 hook |

C 节小结：**已落地 3 / 部分落地 2 / 实现不一致 1 / 未落地 1**。

### D. 移动端 390 与 768（规格 7 项）

| 规格条目 | 390 实况 | 768 实况 | 状态 |
|---|---|---|---|
| D1 hero 卡片 padding `16→20` / `20→24` | `globals.css:506-512` `padding: var(--sp-4)` = **24px** | `globals.css:503-505` `padding: var(--sp-5)` = **40px** | **实现不一致**（两个目标值都不符） |
| D2 hero 标题 font-size `32→28` / `40→36` | `Hero.tsx:50` `var(--fs-display)` = `clamp(56px,9.2vw,132px)`，390 视口实算 ≈56px（9.2vw=35.9，取下限 56） | 768 视口实算 ≈70.7px | **实现不一致** |
| D3 导航触控区 `44→48` / `44→44` | 桌面 `.nav__link`（`Navigation.tsx:119-127`）`padding: 6px 16px`，**无 min-height**；`.nav__burger` `globals.css:333` `min-height: 44px`（`pointer:coarse`） | 同左 | **实现不一致** |
| D4 作品卡 grid columns `1→1` / `2→2` | `globals.css:587` `grid-template-columns: 1fr` | `globals.css:694` `repeat(auto-fill, minmax(280px, 1fr))`，768 实算 2 列 | 已落地 |
| D5 定价卡 padding `20→24` / `24→28` | `globals.css:1113` `var(--sp-5)` = **40px** | 同左 **40px** | **实现不一致** |
| D6 表单 input height `48→48` / `48→48` | `Contact.tsx:160` `height: 48` | 同左 | 已落地 |
| D7 页脚 font-size `12→13` / `13→14` | `Footer.tsx:218,223` `fontSize: '12px'`；`:148` `14px` | 同左 | **实现不一致**（无移动端覆盖） |

D 节小结：**已落地 2 / 实现不一致 5**。D 节规格本身未写明任何代码位置，且与 `globals.css` 的断点体系（1023/767）不是同一套，实施方无法按表执行。

### E. 优先级（规格 3 档）

| 规格条目 | 状态 | 证据 |
|---|---|---|
| E1 P0：B2 / B3 / B8 / A-Hero | **部分落地** | B2 ✓、B3 ✓、B8 ✓；Hero 文案按不同措辞落地（见 A1-A3） |
| E2 P1：B1 / B4 / B6+B7 / C7 | **部分落地** | B1 仅内联值 ✓（CSS 未生效）；B4 半落地；B6/B7 ✗；C7 ✗ |
| E3 P2：B9 / B10 / C6 | **部分落地** | B9 ✗；B10 ✗；C6 方向对但值不符 |

E 节小结：**P0 基本兑现，P1/P2 大面积未兑现**。规格给的是相对改动量（`~5 行`），实际 P0 之外的三档合计 6 条未落地。

---

## 2. 执行方 4 条驳回复核

> 复核方法：对每条独立复算，不采信执行方结论。

### 2.1 「A5 的 `listed` 是中英混排、违反硬约束 → 未采用」——**部分成立，但驳回方式错误**

- **事实**：规格 A5 的改写文本确实以英文 `listed` 开头，与 `docs/brief-round2.md:21` 硬约束 2「中文单语…禁止中英混排修饰」冲突。**驳回理由成立。**
- **但**：当前落地文案 `Services.tsx:46`「能自己做完的部分，才写在这里」并非规格原文，是执行方自行重写。**规格未授权改写措辞**，执行方应在驳回时说明理由并保留规格文本或另提方案，而不是静默替换成另一句。
- **附带发现**：规格 A5 原文有前导空格「  listed 的都是…」，即使采用也会带排版瑕疵。
- 判定：**理由成立，处理方式不合规**（未回写驳回说明，见 §5）。

### 2.2 「D 节移动端数值过期（hero 标题实际 56px 非 32px；padding 实际 24px 非 16px）」——**不成立（驳回正确，但复算有误）**

- **hero 标题**：`Hero.tsx:50` 是 `fontSize: 'var(--fs-display)'`，`globals.css:80` 定义 `--fs-display: clamp(56px, 9.2vw, 132px)`。390 视口实算 `9.2vw = 35.9px`，被 clamp 下限 56px 兜住 → **实际 56px**。规格 D2 的「当前 32px」确实过期。**驳回成立。**
- **hero 卡片 padding**：执行方称「实际 24px」。实测 `globals.css:506-512`（`max-width:767px`）`.hero-panel { padding: var(--sp-4) }`，`--sp-4 = 24px` → **390 下确为 24px**。执行方给的当前值准确。
- 但**「规格过期」不等于「规格条目无意义」**：D2 的目标值 `28px`（390）与 `36px`（768）是用户可见的排版意图，当前 56px/≈70.7px 意味着 hero 标题在手机上过大。执行方驳回了「当前值」，却没有指出**目标值是否应该执行**，属于驳回不完整。
- 判定：**驳回成立（数值确实过期），但结论不完整**。

### 2.3 「B7 引用的 `--sp-10` 变量不存在」——**成立，且比执行方描述更严重**

- `grep -n "^\s*--sp-" src/styles/globals.css` 实际定义：`--sp-1`…`--sp-8`（4/8/16/24/40/64/104/160px）。**`--sp-9`、`--sp-10` 均不存在。**
- 因此 B7「`--sp-8` → `--sp-10`」在规格层面**不可执行**，B6「`--sp-4` → `--sp-5`」反而可行（`--sp-5` 存在）。规格把可行与不可行混在一张表里，未标注。
- 判定：**成立**。这是规格文档自身的缺陷，不是执行方的问题。

### 2.4 「B1 要改 `.hero-panel` 背景，但属性是内联样式，改 CSS 不生效（已改内联值）」——**成立，但理由表述不准确**

- 实测 `Hero.tsx:22-28` 内联 `style` 含 `background: 'rgba(255,255,255, 0.035)'`；`globals.css` 中 `.hero-panel`（`:462-471`）**没有 background 声明**。规格 B1 只给选择器 `.hero-panel`，没说清改哪一层。
- **「改 CSS 不生效」表述不准**：内联样式优先级高于 CSS，但`.hero-panel` 本就无 background 声明，写 CSS 本会生效。真正的问题是执行方选择在**内联里改**，导致该值无法被任何媒体查询覆盖。
- 判定：**驳回成立**；「改 CSS 不生效」的因果描述不准确，实际是「规格没指层级，执行方选了内联」。

---

## 3. 执行方引入的新问题

### 3.1 【MAJOR】`Hero.tsx:111-114` 统计卡删项后，与右侧 `<dl>` 的信息结构失衡
- 统计卡 4 项：`4–12 / 周交付周期`、`3 / 类常见项目`、`0 / 转包`、`24h / 内回复`（`Hero.tsx:110-115`）。
- 右侧 `<dl>` 6 项：协作方式、源码归属、缺陷修复、交付物、付款节奏、无障碍（`Hero.tsx:135-140`）。
- 执行方以「消与清单重复」为由从 `<dl>` 删除 `{ dt: '交付周期', dd: '4 – 12 周' }`，但**统计卡本身是「数字 + 短标签」的独立形式**，并不与 `<dl>` 的「字段名 → 完整句」同构。删掉后，`<dl>` 里再没有任何一项涉及周期，而统计卡只剩 `4–12 / 周交付周期` 一个孤例——两栏的语义分工被打乱，且 `4–12` 在统计卡里是裸数字（无单位换算说明，`周` 挤在标签里）。
- **附带**：同一事实「交付周期」在站内出现 **4 种写法、2 种标点**：
  - `Hero.tsx:111` `'4–12'`（en dash，无「周」）
  - `About.tsx:33` `'4–12 周'`（en dash）
  - `Contact.tsx:371` `'通常 4-12 周。简单页面 2-4 周，完整产品 8-12 周。'`（连字符）
  - `Pricing.tsx:22` `'4-6 周交付'`、`:31` `'8-12 周交付'`（连字符）
  
  即规格 A16 想消除的「符号链」问题，在周期表述上不仅没解决，反而从 1 种写法扩散到 4 种。

> 复核备注：本报告初稿曾把此段判为 BLOCKER（`<dl>` 语义错误）。经复核 `Hero.tsx:142-150`，`map` 每次迭代输出的是「一个 `<dl>` 内含一个 `<dt>` + 一个 `<dd>`」，结构合法、key 唯一（`dt` 均不重复），**该 BLOCKER 不成立，已撤回**。保留为 MAJOR 的是上述信息结构问题。

### 3.2 【MAJOR】`100%源码→0 转包` 的改写引入否定式首屏数字
- `Hero.tsx:113` `{ value: '0', label: '转包' }`。原版是 `100% / 源码交付`（正面事实），现版改为 `0 / 转包`。
- 该卡是首屏右侧数据卡的第三格，`font-family: 'var(--font-display)'`、`font-size: 28px`、`font-weight: 900`（`Hero.tsx:117-124`），**视觉权重最高**。
- 中文语境下「0 转包」读起来像「0 个转包项目」，而不是「不转包」。规格 A 节只授权了 Hero 副标题/说明/标签三条，**未授权改统计卡数值**，属执行方自行引入的语义偏移。
- 同格 `:112` `{ value: '3', label: '类常见项目' }` 也存在同类问题：裸数字 `3` + 标签「类常见项目」，语义为「3 类」，但标签后置后读起来像「3 个项目」。

### 3.3 【MAJOR】导航 CTA 与 Contact 副标题文案不一致
- 规格 A13 把 Contact 副标题「开始一个项目」改为「留个消息」，`Contact.tsx:136`、`:141` 已改。
- 但 `Navigation.tsx:141` 的导航 CTA 仍是「开始一个项目」，`Footer.tsx:108` 导航项也仍是「服务能力」。
- 结果：用户从导航点「开始一个项目」进入 Contact 区，看到的是「留个消息」。**同一动作在导航与目标区文案不一致**，属规格未覆盖、实施方未自查的联动缺口。

### 3.4 【MAJOR】`Contact.tsx:200` 邮箱输入框 placeholder 仍为英文 `you@example.com`
- 执行方在 `Footer.tsx:189` 把 placeholder 从 `your@email.com` 改为「你的邮箱」（提交信息明确写了「placeholder 去英文」）。
- 但 `Contact.tsx:200` 的邮箱框仍是 `you@example.com`；同文件 `:159` 姓名框已是「你的姓名」、`:241` 留言框已是「请描述你的项目需求…」。
- 三处输入框两处改、一处漏，**违反硬约束 2（中文单语）**，且是执行方自称已完成的项。

### 3.5 【MAJOR】`Hero.tsx:162` 滚动提示仍为英文 `Scroll`
- 与 3.4 同类。执行方只处理了 Footer 的 placeholder，漏掉 Hero 底部的 `<span className="label">Scroll</span>`。
- 该元素在首屏可见（`Hero.tsx:155-164`，`aria-hidden="true"`），是**硬约束 2 的可见违规**。

### 3.6 【MINOR】`CaseStudies.tsx` 三处 `color` 字段成为死数据
- `:20`、`:42`、`:64` 的 `color: '#D4FF3F' / '#7FE3FF' / '#B47FFF'` 在 `e5530d9` 删掉内联 `style={{ color: c.color }}`（`:92`）后**不再被任何代码消费**。
- 后果：三处字符串留在数据里，未来若有人按 `c.color` 恢复样式会重新引入多色焦点（正是 B8 要修的问题）。

### 3.7 【MINOR】`.label` 由 `--c-txt-3` 提到 `--c-txt-2`，使 B3 的降权效果被部分抵消
- `globals.css:394` `.label { color: var(--c-txt-2) }`（原 `--c-txt-3`）。
- 而 B3 把 `.section-head__prefix`（⌁ 符号）由 accent 降到 `--c-txt-3`。
- 结果：同一个 section 标题行里，⌁ 是 `#828282`，紧随的 `label` 类元素是 `#B8B8B8`——**两者的明度层级关系被调换**，B3「减少 accent 出现频率」的意图被另一处提亮部分抵消。执行方未做交叉核对。

### 3.8 【MINOR】Hero 副标题当前值在规格与被驳间存在第三种措辞，且无出处记录
- 规格 A1 → 实际「把设计稿做成能用的界面，看得见，也点得动。」；规格 A2 的「backdrop-filter」被替换为「真在透背景」。
- 这两处措辞**既非规格原文，也非执行方驳回声明中的任何版本**，且仓库内无 `docs/` 变更记录。执行方在提交信息（`git log e5530d9`）里写的是「Hero 文案：把设计稿做成能用的界面，看得见，也点得动」，与规格不一致但**未在规格文件里回写驳回**。

### 3.9 【MINOR】`globals.css:1038` `.case-card__category` 的 `letter-spacing: 0.08em` 为 B10 之外的中文字距
- B10 要求「仅中文段落 `-0.005em`」，未落地；但 `globals.css:394`（`.label`）、`:1038`、`:1316` 存在 `0.12em/0.08em/0.05em` 的正字距，全部施加在中文标签上。
- 规格 D/B 均未涉及这些值，实施方也未复核——中文标签用 0.12em 正字距会显著拉松字形，与「精细化排版」的目标方向相反。

---

## 4. 规格文档自身的问题（非执行方责任，但影响可执行性）

1. **B6/B7 混用可执行与不可执行条目**：`--sp-5` 存在、`--sp-10` 不存在，规格未标注（§2.3）。
2. **B1/B4 未指明改哪一层**：`.hero-panel` 的 background 在内联样式里，规格只给选择器（§2.4）。
3. **D 节无任何代码位置**，且用「390/768」两个固定视口，与 `globals.css` 的 1023/767 断点体系不对应，实施方无法按表执行（D1/D5 的 padding 目标值落在断点之间的空隙里）。
4. **A 节 16 条中 5 条的「原文」字段与实际代码不符**（如 A1 原文、A16 原文标注为「现有」但实为推测），降低可追溯性。
5. **「验收对照」（规格 `:84-87`）自评 4 条全 ✓，与实测 39 条中仅 6 条真正落地严重不符**——该自评不可信。

---

## 5. 结论与建议

### 5.1 落地率
| 节 | 条目数 | 已落地 | 实现不一致 | 部分落地 | 未落地 |
|---|---|---|---|---|---|
| A 文案 | 16 | 6 | 5 | 0 | 3 |
| B 视觉 | 10 | 3 | 0 | 2 | 5 |
| C 交互 | 7 | 3 | 1 | 2 | 1 |
| D 移动端 | 7 | 2 | 5 | 0 | 0 |
| E 优先级 | 3 | 0 | 0 | 3 | 0 |
| **合计** | **43** | **14** | **11** | **7** | **10** |

**严格口径：完全按规格落地 14/43（33%）；含「方向对但值/措辞不符」共 32/43（74%）。**

### 5.2 执行方驳回复核结果
| 驳回 | 判定 |
|---|---|
| A5 中英混排违反硬约束 | **理由成立，但静默改写措辞不合规** |
| D 节数值过期 | **成立，但只驳回「当前值」、未评估「目标值」是否应执行** |
| B7 `--sp-10` 不存在 | **成立**（规格自身缺陷） |
| B1 内联样式 | **成立**，但「改 CSS 不生效」的因果表述不准确 |

**4 条中 3 条理由成立、1 条部分成立；但 4 条全部未在规格文件中回写驳回说明，导致规格与实现长期不一致。**

### 5.3 建议的下一步（按优先级）

**P0（阻断，建议新建子卡）**
1. `Contact.tsx:200`、`Hero.tsx:162` 的残留英文 → 中文（硬约束 2 可见违规）。
2. 导航 CTA「开始一个项目」与 Contact 副标题「留个消息」的联动对齐（§3.3）。

**P1**
3. A4/A8/A10 三个标题未改（规格明确条目，低成本）。
4. B5/B6/B7/B9/B10 五条视觉项未落地，其中 B7 需先补 `--sp-10` 定义。
5. C7 reduced-motion 统一 hook（当前 6+ 处重复 `matchMedia`）。
6. D1/D5/D7 的移动端 padding/字号按规格目标值执行。

**P2**
7. §3.6 死数据清理、§3.7 `.label` 与 B3 的层级冲突、§3.9 中文字距复核。
8. 规格 `polish-round2.md` 回写实施差异表，或标注为「已被实现取代」。

---

## 6. 审查时点的工作区异常（需在派发下一卡前处理）

审查期间 `git status` 显示工作区**已离开 HEAD `e5530d9`**，且 `docs/qa-round2.md` 为未跟踪文件：

```
 M dist/index.html
 M src/components/sections/Hero.tsx
 M src/components/ui/FloatingChat.tsx
 M src/styles/globals.css
?? docs/qa-round2.md
```

- `src/components/sections/Hero.tsx` 未提交改动：`:74` `color` 由 `var(--c-txt-3)` 改为 `var(--c-txt-2)`（首屏说明文字提亮）。
- `src/components/ui/FloatingChat.tsx` 未提交改动：新增 `scrolled` 状态，首屏 `scrollY < 320` 时悬浮按钮 `opacity: 0`。
- `src/styles/globals.css` 未提交改动：新增 `p, li { text-wrap: pretty }`；`.btn--ghost` 颜色由 `--c-txt-2` 提到 `--c-txt`。
- `dist/` 于 15:12 重新构建（晚于 `e5530d9` 的 15:07），`dist/index.html` 现引用 `assets/index-DQGplxFo.js`，与 `e5530d9` 提交的 `index-Ck6zJiTz.js` 不同。
- `docs/qa-round2.md`（未跟踪）记录了一次移动端复算，其结论与本次审查方向一致（Hero 标题行数、CTA 宽度不等），但**未纳入规格，也未回写执行方**。

**影响**：本报告 §1 的状态判定基于**当前工作区**（含未提交改动）；若下一轮以 `e5530d9` 为基准，需先决定这些未提交改动是保留还是回滚。

---

## 附：本报告使用的可复现命令

```bash
cd /home/guish/Desktop/Projects/studio-site
git rev-parse HEAD                       # e5530d9…（本报告审查时已非 HEAD 内容）
git status --short                       # 未提交改动清单
git show e5530d9 -- src/                 # 本轮落地 diff
git log -1 --format='%H %ci' e5530d9     # 15:07:38
grep -n "^\s*--sp-" src/styles/globals.css                 # 确认 --sp-10 不存在
grep -rn "listed\|能做什么" src/                          # A5/A4 落地核查
grep -rn "placeholder=" src/                              # 3.4 / 3.5 英文残留
grep -rn "letter-spacing\|letterSpacing" src/             # B10 / 3.9
grep -rn "font-size" src/components/sections/Hero.tsx     # D2
grep -n "hero-panel" -A15 src/components/sections/Hero.tsx  # B1 内联样式
```
