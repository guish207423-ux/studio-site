# 全站优化取证（t_6404dc9d · 2026-11-02）

所有数字来自真实 Chromium（Playwright 1.62，`/usr/bin/chromium`）对 `vite preview` 生产构建的实测，
不是估算。脚本：`docs/review/opt-20261102/probe.py`；原始输出：`baseline.json`（改动前）与
`final.json`（改动后）—— 同一份脚本、同一台机器、同一构建链路，只有源码不同。

```
python3 docs/review/opt-20261102/probe.py <label>     # 产物 <label>.json
```

## 一、结果对照

| 指标 | 改动前 | 改动后 | 说明 |
|---|---|---|---|
| axe 违规 | **1**（`scrollable-region-focusable` × 1，`.partners-strip`） | **0** | 上一版 Partners 横滑带键盘用户无法滚动 |
| axe 未判定 | 2（contrast 126 / video-caption 6） | 1（contrast 126） | 视频标 `aria-hidden` 后不再被当作「无字幕媒体」 |
| 首屏视频请求 | **6 条** | **0 条** | `preload="none"` + 视口外 400px 才升级 metadata |
| 请求总数 | 31 | **25** | 少 6 条视频 + 少一个 chunk 之外的差异 |
| DCL | 813 ms | **447 ms** | 本地回环；主要来自减少的 6 个请求 |
| LCP / FCP | 116 ms | 120 ms | 静态首屏壳决定，未回退（噪声范围内） |
| CLS | 0.0003 | 0.0003 | 未回退 |
| Tab 停靠点 | 73，其中 **7 个不可见/不可点** | 68，其中 **1 个**（skip-link，设计上在视口外直到聚焦） | 见下表 |
| 390px 下 <44px 可交互元素 | **18 / 83** | **0 / 84** | 触控目标 |
| 部署产物里的死资源 | 166 KB（`liquid-glass-react.webm` 145 KB + poster 21 KB，零引用） | 0 | 已删除 |
| 构建 | pass | pass（tsc -b + vite build，1.7s） | |
| oxlint | 4 warnings / 0 errors | 4 warnings / 0 errors | 无新增告警 |
| `check:shell` | pass | pass | 静态首屏壳与 Hero/Nav 文案仍一致 |

### 不可用停靠点（1440，真实 Tab 遍历）

| 改动前 | 改动后 |
|---|---|
| `process-step__trigger` × 5 —— 桌面端 `pointer-events:none`，能聚焦、点不动 | 桌面端渲染成 `<div>`，不再是按钮（实测 5 个 `div`、0 个 button） |
| `fab` —— 整组 `opacity:0` + `pointer-events:none`，却仍是最后一个停靠点 | `.fab-group` 未到滚动位时 `inert`，实测 `tabbable:false` |

### 焦点与语义

| 项 | 改动前 | 改动后 |
|---|---|---|
| 移动端抽屉打开 | 焦点留在汉堡按钮（`activeInDrawer:false`） | 焦点进入抽屉首个链接（`a.drawer__link`） |
| 抽屉 Esc 关闭 | 焦点靠「从未移动」侥幸停在汉堡 | 显式归还汉堡按钮 |
| FAB 打开 / Esc | 无 Esc 处理，`aria-expanded` 卡在 true | 打开 `true` + 菜单出现；Esc 关闭 `false` + 菜单移除 + 焦点回 FAB |
| 筛选器 | `role=tablist` / `role=tab` / `aria-selected`，但没有 tabpanel、没有方向键 | `role=group` + `aria-pressed`（6 个）+ `role=status` 播报结果条数 |
| cookie 按钮 | 40px 高 | 44px 高 |
| 视频 | 未声明装饰性 | `aria-hidden` + `tabIndex=-1` + `preload="none"` |

### 顺手修掉的真实功能 bug

`FloatingToolbar` 的滚动监听被 `if (!consent) return` 提前跳过 —— **首次访问（还没点过 cookie 同意）的用户，
整个会话都拿不到「联系我们 / 回到顶部」这组浮动按钮**（`scrolled` 恒为 false，整组 `opacity:0`）。
原先审计只记到「FAB 能聚焦但鼠标点不到」，根因在这里。现在定时器与滚动监听各管各的。

## 二、量过但**没做**的改动（附理由）

1. **把 GSAP 挪出关键路径**：`Hero.tsx` 静态 import gsap，只为一段「静态壳存在时就 return」的入场动画。
   看似白扛 45 KB(gzip)。但 8 个 section 全部 `lazy()` 又**同时挂载**（`App` 里一次性渲染），
   每个都静态依赖 gsap —— 实测首屏 3 秒内 11 条 `modulepreload` 全部就位，等于代码分割没有产生任何延迟收益。
   单独把 Hero 改成动态 import 只会把 gsap 从「与入口并行」推后到「等入口执行完」，TBT 更可能变差。
   真正的解法是把 section 挂载或 GSAP 依赖推迟（换掉 `ScrollTrigger.batch` → IntersectionObserver，
   约 15 KB gzip），跨 7 个文件的动效重写，超出本卡「small focused task」范围，且会与 QA 卡的验收耦合。
2. **重压 `blender.webm`**：源是 640×360 VP9 430 kbps（1.07 MB），其余 5 条同分辨率只有 49–217 kbps，
   看起来像异常编码。实测 `-crf 36` 两遍重压只到 983 KB（−8%），因为源本身已是高质量 VP9；
   要真降就得掉分辨率（卡片在 retina 上会糊）或砍时长（改内容是内容决策）。
   **结论：不动二进制素材**，只做加载侧优化（`preload="none"`）。
3. **200% 缩放下三处容器内横滑**（`.services-bento` / `.works-grid` / `.pricing-grid`）—— 属于布局意图，
   改动会动全站排版，不属本次范围。

## 三、遗留（建议另开卡）

- `ScrollTrigger.batch` 全站替换为 IntersectionObserver，可同时拿掉 `gsap/ScrollTrigger`（≈15 KB gzip）
  并让 section 延迟挂载真正生效（当前 `lazy()` 无延迟收益）。
- `.partners-strip` 目前靠 `tabIndex=0` 可聚焦横滑；补左右方向键滚动体验更完整（axe 已不报）。
- axe 仍有 126 处 `color-contrast` 判为 incomplete（渐变/图片背景，axe 主动放弃判定）。
  推荐报价卡已用像素法复测通过（8.57:1 / 5.38:1），其余 126 处未逐一复算。
