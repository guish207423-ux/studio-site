# 玻璃增强验收 — t_4ddf753b（2026-11-02）

基线：`d7cca17`（master）｜增强：`83e692e`（= d7cca17 + 本卡）
机器：Arch Linux x86_64 · Chromium headless（swiftshader）· 1440×900 与 390×844
复算脚本与原始 JSON：本目录（用法见文末）。

## 0. 结论（先说哪条被判死）

| 项 | 基线实测 | 增强实测 | 判定 |
|---|---|---|---|
| 折射实例数 | **1**（只有 `.glass-contact`） | **2**（`nav.glass-nav` + `glass.glass-contact`） | 恢复 DECISIONS §7 的「两处」 |
| rim 0–4px 位移 mean / max | 8.92 / 56 | **11.73 / 64** | +31% / +14% |
| 弯折带 10–20px max | 71 | **77** | +8% |
| 弯折带 20–40px max | 33 | **50** | +52% |
| 中心带（不该被加工） | mean 1.39 / max 7 | mean 1.42 / max 7 | 不变 |
| `.glass` 阴影层数 | 7（5 层自有 + hyalite edge） | **9** | 深度栈 +2 |
| hover 浮起 translate | **none（从未生效过）** | **0px -10px** | 修复伪修复 |
| 导航文字对比度 | — | 7.99–8.57:1 | ≥ AA |
| 移动端 390×844 | — | 折射 1 处（仅导航）、零横向溢出 | 降级符合设计 |
| Slow4G LCP | 880 ms | 872 ms | 无回退（噪声内） |
| CLS | 0.00031 | 0.00031 | 不变 |

## 1. 吸出来的三个真问题

### 1.1 `.glass-nav` 从 DOM 里消失了，决策文档与代码都对不上

`docs/DECISIONS.md` §7 写「hyalite 折射只保留 `.glass-nav` 与 `.glass-contact`」，
`src/main.tsx` 的 `panelSelector` 也一直在找 `.glass-nav` —— 但 `537b0ec` 重写导航时
把 `glass glass-nav` 类名一起丢了，DOM 里只剩 `.nav`。于是：

- 全站折射实例实际只有 **1**（不是决策里说的 2）；
- 没有任何报错：`Hyalite.watch()` 匹配到空集合是合法的，玻璃静默停在 CSS 兜底档。

实测（基线 `d7cca17`，1440×900）：

```
hyaliteInstances 1   sels ['.glass.glass-contact']   filterNodes 1
nav.backdropFilter  none（未滚动）/ blur(8px) saturate(1.2)（滚动后）
```

修复后：

```
hyaliteInstances 2   sels ['.nav.glass-nav', '.glass.glass-contact']   filterNodes 2
nav.backdropFilter  url("#hyalite-1")（未滚动）/ url("#hyalite-6")（滚动后）
nav.backgroundColor rgba(16,16,16,.55) / rgba(8,8,8,.655)（滚动后）
```

导航只有 66px 高，面板档 bevel 会被 clamp 到短边一半（33px）——整条导航都会落在弯折带里，
所以单独给了 `hyaliteParams('nav')`（bevel 18 / thickness 52 / dispersion 1.8），
靠厚度与色散出折射感，不靠加宽弯折带。

### 1.2 CSS hover 浮起「代码在、就是没生效」——真因是 GSAP 的内联中和

`Contact.tsx` 用 `gsap.fromTo(formRef, { y: 40, opacity: 0 }, …)` 做入场。GSAP 在它补间的
元素上会写内联 `translate: none; rotate: none; scale: none`，用来中和 CSS 单属性变换
（它自己走 transform 矩阵）。内联样式优先级高于任何选择器，所以：

```css
.glass-contact:hover { translate: 0 -6px; }   /* 旧写法：永远不生效 */
```

实测 `getComputedStyle(el).translate` 恒为 `none`，而 `el.style.translate === 'none'`。
**基线里 −6px 的浮起从来没有渲染过**，属于「grep 得到、注释写着、就是不工作」那类伪修复。

修法：hover 用 `!important` 抢回（GSAP 不驱动 translate/scale 本身，两者在同元素上独立叠加），
`prefers-reduced-motion` 里同权重、更靠后地降级。

实测（分步移动指针 10 步、等 1.4s）：

```
before  translate=none        scale=none
hover   translate=0px -10px   scale=1.02 1.012   matches(':hover')=true
reset   translate=none        scale=none
reduced-motion + hover          translate=none  scale=none   ← 降级有效
```

### 1.3 hover 着色用 `background` shorthand 会连背景图一起重置

`.glass` 的顶面高光写在 `background-image` 上，hover 原来写 `background: var(--glass-bg-hover)` ——
shorthand 会把 `background-image` 重置成 none，高光在 hover 瞬间消失。改成
`background-color:`（可插值），背景图保留。

## 2. 折射参数不是拍脑袋定的：同页扫档

`sweep_params.py` 用 `Hyalite.setOpts()` 在同一页面逐档重建滤镜，每档做一次
折射 on/off 差分（对照组把 `--hyalite` 换成 `blur(16px) saturate(160%) brightness(108%)`），
分 0-4 / 4-10 / 10-20 / 20-40 / 40-70px 带统计（mean/max，单位是 0–255 通道差）：

| 档位 bevel/thickness/slope/disp | rim 0-4 | 4-10 | 10-20 | 20-40 | center |
|---|---|---|---|---|---|
| 46/84/3.4/2.4（旧） | 6.84/48 | 0.95/60 | 0.54/64 | 1.0/31 | 0.4/1 |
| 56/118/3.6/3.1 | 10.12/61 | 1.03/72 | 0.58/76 | 1.09/46 | 0.4/1 |
| **62/150/2.9/3.0（采用）** | **10.63/63** | **1.16/74** | 0.58/78 | 1.1/50 | 0.4/1 |
| 58/132/2.4/2.8 | 10.13/60 | 1.15/72 | 0.58/76 | 1.09/46 | 0.4/1 |
| 70/160/2.6/3.2 | 11.17/66 | 1.06/75 | 0.66/81 | 1.1/53 | 0.4/1 |

采用 `62/150/2.9/3.0` 的理由：屏值已接近最高档，但 bevel 62 相对面板宽 634px 仍克制
（再加宽会把弯折伸进 40px 内边距里的文字区域），4-10px 带的均值最高（1.16）——
那一带才是「背景里的直线被弯折」最可读的位置。

最终基线 vs 增强（同帧同滚动位，`bands-base3.json` / `bands-final3.json`）：

```
band     baseline mean/max   enhanced mean/max
0-4      8.92 / 56           11.73 / 64
4-10     2.41 / 69           2.68 / 74
10-20    1.94 / 71           2.05 / 77
20-40    2.12 / 33           2.43 / 50
40-70    2.59 / 54           2.42 / 63
center   1.39 / 7            1.42 / 7      ← 中心不被加工
bg_band  0.00 / 0            0.00 / 0      ← 同帧非玻璃区无差（排除环境噪声）
```

对照组自证：两组 `refraction_off` 回读均为 `blur(16px) saturate(1.6) brightness(1.08)`，
即「折射真的被关掉了」，不是两个方案互相比较。

> 备注：center 带在基线也有 ~4% / max 7 的差，两组数值一致 —— 那是 `.light-field__drift`
> 的 JS 视差在两次截图之间还在跑（CSS 动画已被 `getAnimations().pause()` 停住，rAF 写的
> transform 停不住），属于背景噪声，不是参数差异。

## 3. 深度栈

`.glass` 自有阴影 5 → 7 层（+内环剖面 `inset 0 0 0 1px`、+底部体吸收
`inset 0 -20px 30px -24px`、+接触影 `0 2px 4px`），hover 再深一档；
计算值层数 7 → 9（含 hyalite 注入的 `--hyalite-edge` 两段）。

## 4. 降级路径（两条都必须可读）

- **移动端 390×844**：折射只挂导航（面板在 <767px 下短边被 bevel clamp 削掉大半，
  折射读不出来），`.glass-contact` 回落到 `blur(16px) saturate(1.6) brightness(1.08)`；
  `scrollWidth - innerWidth = 0`（零横向溢出）。
- **prefers-reduced-motion**：hover 浮起 `translate/scale` 均为 none；
  背景层与光晕动画由既有规则 `animation: none` 停住，hyalite 折射保留（它是静态材质，不是动画）。

## 5. 构建与性能

```
npm run build        tsc -b + vite build  ✓（master 83e692e 上重跑 2.35s）
npm run check:shell  ✓ 静态壳与 Hero/Navigation 文案一致
npm run lint         oxlint 0 error（4 条既有 warning，与本卡无关）
LCP (Slow4G)         880 → 872 ms      CLS 0.00031（不变）
```

## 6. 未做 / 留给下游

- `body.is-scrolling .glass { backdrop-filter: blur(12px) … }` 这条滚动期降级没动：
  滚动中玻璃会暂时退回纯模糊（折射消失、停下即恢复）。它是有意的滚动性能阀，
  本次没实测「保留折射」对滚动帧的影响，因此不擅自删除 —— 若 QA 认为滚动时
  玻璃观感断裂，可用 `probe_bands.py` 的对照组手法再测一轮。
- `.hero-panel` 在 DOM 里不存在（只有 CSS 规则），相关 hover/降级规则是死代码，
  未清理（不在本卡范围）。

## 7. 复算

```bash
# 需要 chromium + python3 + Pillow
cd docs/verify-glass-t_4ddf753b
python3 probe_bands.py   http://<base>/   --json bands-base.json      # 基线
python3 probe_bands.py   http://<enhanced>/ --json bands-after.json   # 增强
python3 compare_bands.py bands-base.json bands-after.json
python3 sweep_params.py  http://<enhanced>/ --json sweep.json         # 参数扫档
python3 accept_glass.py  http://<enhanced>/ --json accept.json        # 桌面/移动/reduced-motion
python3 probe_hover.py   http://<enhanced>/ hover.json                # hover 浮起
```

`verify_atmosphere.py` / `verify_glass_ab.py` 是被 import 的 CDP 取帧工具
（`CDP`、`screenshot`、`diff_stats`、`SCROLL_JS`、`WARM_JS`、`FREEZE_JS`），
与 `t_dec95ed7` 的验收脚本同源，一并归档保证可复算。
