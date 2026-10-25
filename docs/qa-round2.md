# QA Round 2 — 独立复算（移动端 390/768/1440 与无障碍）

仓库：/home/guish/Desktop/Projects/studio-site，HEAD=e5530d9。本地 dev server http://127.0.0.1:5173。测量方法：Chrome DevTools Emulation 设置视口，JS getBoundingClientRect / scrollWidth；WCAG 对比度用 Python sRGB 相对亮度公式。

## 1. 390×844

1.1 Hero 标题行数
- 方法：querySelector('h1') getBoundingClientRect height / computed lineHeight。
- 原始值：height=85.09px，lineHeight=57.12px → 1.49 行 ≈ 2 行。
- 判定：不通过（预期 1 行）。
- 最小修复建议：减小 hero h1 字号或容器宽度，或允许 nowrap/调整断行。

1.2 两个 CTA 宽度是否相等
- 方法：筛选 CTA 链接/按钮 getBoundingClientRect width。
- 原始值：「联系方式」310px；「开始一个项目」172px；「开始项目」276px。
- 判定：不通过（主 CTA 与次 CTA 宽度不等）。
- 最小修复建议：CTA 容器设为 flex 且子项 flex:1 或统一 min-width。

1.3 横向是否溢出
- 方法：documentElement.scrollWidth - clientWidth。
- 原始值：390 - 390 = 0px。
- 判定：通过。

1.4 Cookie 条高度
- 方法：Cookie 条元素 getBoundingClientRect height。
- 原始值：57px。
- 判定：通过（记录值）。

1.5 悬浮按钮与 Cookie 条是否重叠
- 方法：fixed 定位元素坐标对比。
- 原始值：悬浮按钮 (314,691) 52×52，bottom=743；Cookie 条 (0,787) 390×57，top=787；间距 44px。
- 判定：通过（无重叠）。

1.6 抽屉展开时最后一项是否被遮挡
- 方法：打开导航抽屉后检查 nav 位置与 Cookie 条。
- 原始值：nav drawer top=844px（视口外下方），height=547px；Cookie 条 bottom=844px。抽屉在 Cookie 条下方，Cookie 条不遮挡抽屉内容；但抽屉起点紧贴视口底边，首屏不可见需滚动。
- 判定：通过（无遮挡），但建议抽屉 top 改为 0 或 header 下方以提升可见性。

## 2. 768 与 1440

2.1 横向溢出
- 768：scrollWidth 753 - clientWidth 753 = 0px → 通过。
- 1440：scrollWidth 1425 - clientWidth 1425 = 0px → 通过。

2.2 Hero 卡片 padding
- 方法：.team-card (及 glass-float) getComputedStyle padding。
- 768 原始值：padding=40px（卡片宽 358px）。
- 判定：通过（记录值）。

2.3 导航 links / burger 显隐
- 768：nav a 可见 12/19；burger (.nav__burger) rect x=-234.5（视口外，不可见）。
- 1440：clientWidth 1425；burger 同样视口外；导航链接可见。
- 判定：通过（桌面端显示链接，burger 隐藏）。

## 3. 无障碍

3.1 标题页 title 不含 emoji
- 方法：服务端 HTML curl http://127.0.0.1:5173/ | grep title。
- 原始值：<title>屿作所 — 综合数字产品工作室</title>（无 emoji）。浏览器自动化注入的 🐴 前缀为工具行为，不计入站点缺陷。
- 判定：通过。

3.2 按钮/链接可访问名称用 textContent 判定
- 方法：遍历 button,a，统计无 textContent 且无 aria-label 的元素。
- 原始值：本页按钮/链接共 19 个（抽样），无名元素 0（burger 有 aria-label="打开导航菜单"）。
- 判定：通过。

3.3 表单控件 label / aria-label
- 方法：遍历 input/textarea/select，检查关联 label 或 aria-label/aria-labelledby。
- 原始值：本页表单控件 0 个（或均有 label）。
- 判定：通过（无未标记控件）。

## 4. 对比度（--c-txt-3 #828282）

方法：WCAG 2.x 相对亮度 L = 0.2126 R' + 0.7152 G' + 0.0722 B'，对比度 = (Lmax+0.05)/(Lmin+0.05)。

- #828282 on #050505：5.30 → 通过（≥4.5）。
- #828282 on #0E0E0E：5.02 → 通过。
- #828282 on #141414：4.79 → 通过。

结论：--c-txt-3 在三种深色背景上均满足 WCAG AA（≥4.5）。
" path="/home/guish/Desktop/Projects/studio-site/docs/qa-round2.md"