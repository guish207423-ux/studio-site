# 全面升级验收记录 — 动态光影背景 + 玻璃增强 + 全站优化 (t_dec95ed7)

日期：2026-11-02
任务：`t_dec95ed7`（依赖 `t_c3e71c8f` UI 设计 / `t_614b63ce` 动画设计）
改动文件：`src/styles/globals.css`、`src/components/ui/DynamicLight.tsx`
验证工具：`chromium` + CDP（无第三方依赖），探针脚本见本卡工作区
（`verify_atmosphere.py` / `verify_refraction_ab.py` / `probe_depth.py` /
`perf_idle.py` / `contrast.py` / `diag_null.py`）

---

## 0. 结论

| 验收项 | 结果 |
| --- | --- |
| `npm run build`（`tsc -b && vite build`） | **exit 0**，`✓ built in 1.80s`，TypeScript 0 错误 |
| `npm run lint`（oxlint） | 0 error，4 warning（均为既有，非本卡引入） |
| 大气色层 | 已实现并接线，3 条径向（桌面）/ 2 条（移动），62s 独立相位漂移 |
| 折射 A/B 差分 | rim 22.62% / max 69，center 4.68% / max 7，**背景带 0.00% / max 0** |
| hyalite 实例 | **1**（预算 ≤5），DOM 内 `filter[id^=hyalite]` 1 个 |
| 背景动画 | 3 条（62s transform / 46s transform / 34s opacity），两两无 1:1、无 2:1 |
| LCP | 桌面 Slow4G **740ms**，移动 Slow4G **728ms**（预算 <2500ms） |
| 主线程 | 静止 10s、4 条动画在跑：**0.94ms/帧**（预算 20ms/帧） |
| 横向溢出 | 13 视口（320→1920）**全部 0px** |
| reduced-motion | 背景动画全部 `none`，静态色层保留，暗部层 `display:none` |
| 对比度 | 最亮可达背景 rgb(21,28,35) 下 `--c-txt-3` 仍 **4.98:1**（≥4.5） |
| 强调色 | 仍是唯一装饰色（当前值 `#A8D93A`，见 §6 说明） |

---

## 1. 实现了什么

### 1.1 大气色层（新增）

`.light-field__atmosphere` —— 折射源的「色彩信息」那一半（网格负责「结构」）。
单图层 3 条近黑径向渐变（深靛蓝 / 深紫 / 深青，令牌 `--c-atm-*`），
62s 右上漂移，与网格的 46s 右下反向。

实测（冻结动画后开/关该层，1440×900 首屏）：

| 指标 | 值 |
| --- | --- |
| 全视口 changed% | 49.41% |
| max Δ（单通道） | 17 / 255 |
| mean Δ | 4.77 |
| 空差分基线（A1 vs A2，状态不变） | 0.00% / max 0 |

空差分基线为 0 说明这套测量是确定性的：上面的 49.41% / max 17 全部来自该层本身。

### 1.2 动效节奏：修掉一对同频周期

改前 `.light-field__grid` 与 `.light-field__drift` 的呼吸都是 **46s**（1:1 同频）——
技能纪律「多层漂移周期必须互不同步」的反面：整屏一起动，且所有 `backdrop-filter`
同时重采样。改后：

| 层 | 动画 | 周期 | 属性 |
| --- | --- | --- | --- |
| 大气色层 | `light-field-atm-drift` | 62s | transform |
| 网格层 | `light-field-grid-drift` | 46s | transform |
| 光晕层 | `light-field-breathe` | 34s | **opacity** |
| 跑马灯（内容，非背景） | `marquee-scroll` | 30s | transform |

两两比值 23:31 / 17:23 / 15:17 / 15:23 / 15:31 / 31:17 —— 无 1:1、无 2:1 谐波。

### 1.3 GPU 化：两条每帧重绘的动画改成合成器属性

- `.light-field__grid`：`background-position` → `transform: translate3d()`（不再逐帧重绘全屏渐变）
- `.light-field__drift`：`background-position` → `opacity`（呼吸不再逐帧重绘全屏 `blur(28px)`）

静止 10s 实测（`Performance.getMetrics`，4 条动画在跑）：

| 项 | 每帧 |
| --- | --- |
| TaskDuration | 0.939 ms |
| LayoutDuration | 0.009 ms（10s 内 LayoutCount = 1） |
| RecalcStyleDuration | 0.214 ms |
| ScriptDuration | 0.206 ms |

预算 20ms/帧 → 用了 4.7%。注：headless 是软件渲染，帧率读数（30fps）不代表用户设备，
所以这里报的是主线程预算占用，不是 fps。

### 1.4 全站：区块底改「纱幕」，让光场连续、让玻璃背后有折射源

这是本次唯一改动视觉结构的全站项，也是「玻璃质感出不来」的真因。

`.section--ink2` 原来是实底 `--c-ink-2`（#0F0F0F）。不透明区块底做了两件坏事：

1. **把动态光影背景切成一段一段**。逐深度实测（开/关大气层差分）：

| scrollY | 改前 changed% | 改后 changed% |
| --- | --- | --- |
| 0 | 49.5% | 49.3% |
| 1761 | 57.6% | 57.3% |
| 3522 | 58.7% | 55.8% |
| 5871 | 23.5% | 22.9% |
| 8220 | 37.7% | 37.5% |
| 10333（FAQ / ink2 屏） | **0.00%** | **13.4%** |

2. **让玻璃面板背后没有折射源**。联系卡 `.glass-contact` 就在 ink2 区块里：
   改前该屏 A/B 差分 **全 0.00%**（光场完全看不见 → 玻璃采样到的是一块纯色）。

改法：`--c-ink-2-veil: rgba(15, 15, 15, 0.55)` —— 55% 的 ink2 纱幕，区块明度交替仍在
（#0E0E0E vs 基底 #0A0A0A），光场与网格从下面透上来。页脚同理改透明（与 body 同色）。

---

## 2. 折射 A/B 差分（核心验收项）

**测法**：同一帧、同一滚动位置，把 `.glass-contact` 从 `url(#hyalite-1)` 换成 CSS 兜底
`blur(16px) saturate(160%) brightness(108%)`。两帧之间只有「折射有没有发生」一个变量。

**对照组自证**：换完后回读 computed `backdropFilter` = `blur(16px) saturate(1.6) brightness(1.08)`，
不含 `url(` → 对照组真的关掉了（`control_really_off: true`）。

| 区域 | changed% | max Δ | mean Δ |
| --- | --- | --- | --- |
| 玻璃 rim（上沿 10px 带） | 22.62% | **69** | 5.00 |
| 玻璃中心（中央 40%） | 4.68% | 7 | 1.44 |
| 同帧非玻璃背景带（x∈[0,150]） | **0.00%** | **0** | 0.00 |

判读：rim/center = **9.86×**，rim/背景 = **69×**，背景带零差异（排除环境噪声）。
差异集中在边缘而不是均匀分布 → 是位移贴图在弯折，不是整体变色。

### 2.1 试过、已否决：区级 64px 折射直尺

技能「折射源系统」建议在容器上挂 64px 直尺。实测（`--no-ruler` 对照，同帧同位置）：

| | rim | center |
| --- | --- | --- |
| 无直尺 | 22.62% / max 69 | 4.68% / max 7 |
| 有直尺 | 22.76% / max 68 | 9.83% / max 11 |

边缘可读性零提升，中心多一层纹理噪声 → 按纪律 10「先做减法、禁止再加层」删除。
代码里留了注释与这组数字，避免下一轮再加一遍。

---

## 3. hyalite 实例预算

| 项 | 实测 |
| --- | --- |
| computed `backdropFilter` 含 `url(` 的元素 | **1** 个（`.glass-contact` → `url("#hyalite-1")`） |
| DOM 内 `filter[id^=hyalite]` | 1 个 |
| 预算 | ≤5（移动端 ≤2） |

说明：`.glass-nav` 在当前版本不存在（导航用 CSS `blur` 轻玻璃，非 hyalite），
`.glass-btn` 会从 `.glass-contact` 祖先**继承** `--hyalite` 变量，但 `.glass-btn` 规则里
没有 `backdrop-filter` 消费它 → 不产生隐藏实例（技能纪律 9 提到的继承陷阱，这里实测未触发）。

---

## 4. 降级路径实测

### 4.1 `prefers-reduced-motion: reduce`

| 项 | 结果 |
| --- | --- |
| 大气层 / 网格 / 光晕 `animationName` | `none` / `none` / `none` |
| 运行中的动画数 | **0** |
| 大气层静态色层 | 仍在（3 条径向，`opacity: 1`） |
| 暗部层 | `display: none` |

### 4.2 `prefers-contrast: more`

| 项 | 结果 |
| --- | --- |
| `.light-field__drift` | `animation: none` + `opacity: 0.5` |
| `.light-field__atmosphere` | `animation: none` + `opacity: 0.5` |
| `.light-field__grid` | `opacity: 0.45` |

修掉一处真 bug：改前 `.light-field__drift` 的 `opacity: 0.5` 是死代码 —— 呼吸动画
（`background-position` 之外，opacity 由动画写入）会盖过普通声明。现在同时停动画再写值。

### 4.3 移动端（390×844）

| 项 | 结果 |
| --- | --- |
| 大气层径向数 | 3 → **2** |
| 大气层周期 | 62s → **92s** |
| 网格周期 | 46s → **69s** |
| 光晕 blur | 28px → **22px** |
| 横向溢出 | **0px** |

### 4.4 13 视口横向溢出

320 / 360 / 375 / 390 / 414 / 480 / 600 / 768 / 820 / 1024 / 1280 / 1440 / 1920 ——
`scrollWidth - clientWidth` 全部 **0**。

---

## 5. 性能

| 项 | 预算 | 实测 |
| --- | --- | --- |
| LCP（桌面 Slow4G + 4× CPU） | < 2500ms | **740ms**（`hero-title-editorial`） |
| LCP（移动 Slow4G + 4× CPU） | < 2500ms | **728ms** |
| CLS | — | 0.0003 / 0 |
| 主线程（静止、4 条动画在跑） | 20ms/帧 | **0.94ms/帧** |
| 每帧 Layout | — | 0.009ms（LayoutCount = 1 / 10s） |

大气色层是纯 CSS `position:fixed` 层：零网络请求、零 JS、不进 LCP 关键路径。

---

## 6. 色彩与强调色

| 项 | 状态 |
| --- | --- |
| 唯一装饰性强调色 | `--c-accent: #A8D93A`（**不是**设计文档写的 `#D4FF3F`） |
| 大气色是否与强调色竞争 | 否 —— 三条都是「近黑的有彩色」，最大通道抬升 ≈17/255 |

**为什么没有把强调色改回 `#D4FF3F`**：`#D4FF3F` 在 2026-10-30 的
`537b0ec fix(site): 修复 5 处静默失效 + 可访问性达标 + 首屏 LCP 3.6s→1.6s`
里被换成 `#A8D93A`（深底上的对比度与观感调整）。本卡要求的是「强调色唯一」这一约束，
把值改回去等于回退那次的 a11y 结论。所以：**保持 `#A8D93A` 为唯一强调色**，
不引入第二个装饰色相。若品牌要回到 `#D4FF3F`，应作为独立卡处理（需重跑对比度）。

### 6.1 对比度（纱幕改透明后重算）

背景最亮可达值按真实层级叠出来：body `#0A0A0A` → 大气层 `rgba(13,18,32,.88)` →
网格线 `rgba(127,227,255,.13)` → ink2 纱幕 `rgba(15,15,15,.55)` = **rgb(21,28,35)**。

| 文字 | 对比度 | AA |
| --- | --- | --- |
| `--c-txt` #F0F0F0 | 15.08:1 | PASS |
| `--c-txt-2` #B0B0B0 | 7.92:1 | PASS |
| `--c-txt-3` #8A8A8A | 4.98:1 | PASS |
| `--c-accent` #A8D93A | 10.35:1 | PASS |

附注：纱幕反而把该区域最亮处的 `--c-txt-3` 对比度从 4.13:1 抬到 4.98:1
（纱幕压暗了网格线最亮处）。

---

## 7. 设计文档 → 实现的偏差（有意识的）

| 文档要求 | 实现 | 原因 |
| --- | --- | --- |
| 新建 `.refract-atmosphere` + `.refract-grid-fine/coarse` 三层 | 并入既有 `.light-field` 体系（`__atmosphere` + `__grid` + `__drift`） | 文档写于 10-19，之后仓库已用 `.light-field` 三层替代 `.refract-*`（v6，含滚动/指针视差）。新建一套等于两套折射源并存，违反纪律 10 |
| 周期 24s / 36s / 48s | 46s / 62s / 34s | 保留既有网格 46s 与光晕的既有节奏，只把同频的 46s/46s 拆开；三组周期同样互不同步，且不比文档方案更密 |
| 玻璃参数 rim 2.1 / shade 0.54 | **不动**（当前 rim 2.4 / shade 0.62 / dispersion 2.4 / bevel 46 / thickness 84） | `GLASS-UPDATE-t_c3e71c8f.md` 的结论是「不需要因大气层调参」；当前值已在这条方向上更远（v6 增强），改回 2.1/0.54 是降档 |
| 大气层 `z-index: 0` | 容器 `--z-bg: -1`，层内 `absolute` | 站内 `.light-field` 整体在 `z-index:-1`，层内再设 0 没有意义 |
| `document.hidden` 暂停动画 | 不做 | CSS 动画在标签页隐藏时由浏览器自行节流；加 `animationPlayState` 内联值会盖过 `prefers-reduced-motion` 媒体查询（DynamicLight.tsx 里已有这条实测记录） |

---

## 8. 复现命令

```bash
cd ~/Desktop/Projects/studio-site
npm run build                      # tsc -b && vite build
npm run preview -- --port 4173     # 另开一个 shell
cd ~/.hermes/kanban/boards/design-team/workspaces/t_dec95ed7
python3 verify_atmosphere.py   http://127.0.0.1:4173/ --json out-audit.json
python3 verify_refraction_ab.py http://127.0.0.1:4173/ --json out-refraction.json
python3 probe_depth.py         http://127.0.0.1:4173/ --json out-depth.json
python3 perf_idle.py           http://127.0.0.1:4173/
python3 contrast.py
cd ~/Desktop/Projects/studio-site && python3 scripts/perf-probe.py http://127.0.0.1:4173/ --slow4g --wait 10
```

探针脚本不落进仓库（一次性验收工具），需要时从本卡工作区取。
