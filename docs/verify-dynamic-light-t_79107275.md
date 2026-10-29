# 动态光影背景 — 验收记录 (t_79107275)

日期：2026-10-25
组件：`src/components/ui/DynamicLight.tsx`（提交 c677d60，现位于 HEAD）
接线：`src/App.tsx:7` import、`src/App.tsx:131` `<DynamicLight />`
样式：`src/styles/globals.css` 的 `.light-field` / `.light-field__fill` /
`.light-field__grid` / `.light-field__ruler` / `.light-field__drift` / `.light-shadow`

结论：组件已存在、已接线、行为与规格一致。本卡没有新增代码，做的是**真实浏览器验收**
（前几次 run 都被配额墙打断，只留下「已提交」的断言，没有实测）。

---

## 1. 构建 / 静态检查

| 命令 | 结果 |
| --- | --- |
| `npm run build`（`tsc -b && vite build`） | **exit 0**，`✓ built in 2.95s`，dist 17 个 chunk |
| `npm run lint`（oxlint） | 4 条 warning（均为既有：`lib/motion.ts:61` refs-in-render、`hyalite.js` ×2 未用 catch 参数、`CookieConsent.tsx:9` set-state-in-effect），**0 error** |

`dist/assets/index-BrH9TLJQ.css` 中 `.light-field` / `.light-shadow` 规则齐全，
`prefers-reduced-motion` 命中 5 处、`pointer:coarse` 1 处、`prefers-contrast` 2 处 —— 三条降级
媒体查询都进了产物。

## 2. 真实 Chromium 实测（puppeteer-core 23 + /usr/bin/chromium 151，1440×900）

`vite preview` 起本地服务后跑探针，覆盖规格的三条验收项。

### 2.1 滚动视差（真实滚轮，不是 `scrollTo`）

Lenis 开着 smooth wheel，只发 `wheel` 事件（不发 scroll 事件）也应生效：

| 时点 | scrollY | `.light-field__drift` transform |
| --- | --- | --- |
| 顶部 | 0 | `matrix(1,0,0,1,0,-54)` |
| 滚轮滚动后 | 2159 | `matrix(1,0,0,1,0,54)` |
| 页面底部 | 11075 | `matrix(1,0,0,1,0,54)` |

`-54px` ↔ `+54px` 对应 JS 侧 `(scrollP-0.5)*2*SHIFT_DRIFT(6)vh`（900px 视口 → ±54px），
数值与代码常量吻合。

scroll 监听器确实存在且会被高频触发（探针内另挂一个计数器：连续滚动期间 fired=6），
这是停表机制能被叫醒的前提。

### 2.2 指针视差（暗部层）

| 时点 | `.light-shadow` opacity | transform |
| --- | --- | --- |
| 无指针 | 0 | `none` |
| 指针在 (200,200) | 1 | `matrix(1,0,0,1,-83.232,-29.97)` |
| 指针移到 (1200,700) | 1 | `matrix(1,0,0,1,76.752,29.97)` |
| 静止 3.2s 后 | 0 | `none` |

`(-83.2, -30.0)` ↔ `(+76.8, +30.0)` 对应 `(pointer-0.5)*2*SHIFT_SHADOW_X(8)vw / _Y(6)vh`
（1440×900 → ±57.6/±27 px），方向正确、随指针反转。2.4s 空闲淡出（`IDLE_MS`）后 opacity
归 0 且 transform 复位。

### 2.3 性能：空闲帧零样式写入

对 `.light-field__drift` / `.light-shadow` 挂 `MutationObserver(attributeFilter:['style'])`，
空闲 3 秒：**变更数 = 0**。停表（连续两帧无变化即停 rAF）+ 字符串比对跳写两条都成立。
修复前这里约 20 次/秒，等于持续全屏重绘 `blur(28px)` 层。

### 2.4 滚动中抑制暗部

强制 `body.is-scrolling` 期间 `.light-shadow` opacity 读到 `0`，类移除后回到 `1`
（`body.is-scrolling .light-shadow { opacity: 0 !important; }`）。
`is-scrolling` 在滚轮滚动中确实被加过（MutationObserver 看到 `false → true`）。

### 2.5 降级

**prefers-reduced-motion: reduce**（CDP `Emulation.setEmulatedMedia`）：

| 项 | 值 |
| --- | --- |
| `.light-field__drift` transform | `matrix(1,0,0,1,0,0)`（恒等，无视差） |
| `.light-field__drift` animationName | `none` |
| `.light-field__grid` animationName | `none` |
| `.light-field__ruler` animationName | `none` |
| `.light-shadow` display | `none` |
| `.light-field__fill` 静态渐变 | 仍在（兜底背景不空） |

**pointer: coarse（触屏）**：drift 仍随滚动位移（滚动视差保留），`.light-shadow` opacity 恒 0
（无指针视差）。幅度按 `COARSE_FACTOR = 0.5` 收敛。

**无 JS**（`setJavaScriptEnabled(false)`）：React 不挂载，`.light-field` 整层不存在，
`body` 背景为 `rgb(5,5,5)` = `var(--c-ink)`，无残留渐变。这一点是**全站行为**（无 JS 时
内容本身也不渲染），背景不会成为问题。代码注释里「无 JS / 组件未挂载 → `.light-field__fill`
的静态渐变仍在」这句略有夸张：真无 JS 时该层不会被创建，兜底只对「CSS 已加载而 React 未跑完
/ 跑挂」成立。不影响验收，但如果要较真，注释应改成「CSS 已加载而组件未挂载时」。

### 2.6 层级与层叠

```
.light-field   position: fixed, overflow: clip, z-index: -1, pointer-events: none
.light-field__drift   inset: -12vmax (=-172.8px @1440), will-change: transform,
                      pointer-events: none
```

`elementFromPoint(720,450)` 返回 `H1`（内容在背景之上），`overflow: clip` 收住负 inset 的溢出。
只有 drift 层有 `will-change`，静态层不给 —— 常驻合成层的内存开销没有白花。

## 3. 未纳入本卡范围的发现

1. **`src/lib/reveal.ts` 是死代码**（提交 ab60ea9 引入）。它已提交进 HEAD，但
   `grep -rn "revealOnScroll" src/` 在模块自身之外零命中；`globals.css` 的 `.reveal` /
   `.reveal.is-in` / `--reveal-*` 块同样不可达。ab60ea9 选择**保留 GSAP**（11 个 section
   组件重新 `import gsap`），所以这次「GSAP → IntersectionObserver」迁移实际上被放弃了，
   只留下了两截残骸。已另开卡 `t_dec75a66` 做纯删除清理。
2. **并发写入**：本 run 期间工作区被另一个提交者推进了两次（ab60ea9、8c88ac8，本 run 末
   又出现 6bb30db）。动态光影相关的 `DynamicLight.tsx` / `globals.css` 的 `.light-field`
   规则 / `App.tsx` 接线在两个版本间**逐字节相同**（md5 比对一致），所以验收结论对两个
   HEAD 都成立。但工作区并发写入本身是隐患，值得编排侧注意。

## 4. 复现方式

```bash
npm run build && node node_modules/vite/bin/vite.js preview --port 4319 --strictPort &
# 探针脚本（scratch，非仓库文件）：
#   dynlight.mjs   滚动/指针/停表/reduced-motion/coarse 全量
#   dynlight3.mjs  真实滚轮 + is-scrolling + 无 JS + reduced×coarse
```
