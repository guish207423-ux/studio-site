# 屿作所 — 交付说明文档

## 项目概述

**屿作所（YU STUDIO）** — 综合数字产品工作室官网。

Awwwards 获奖站风格，液态玻璃（Liquid Glass）视觉，React 19 + TypeScript + Vite 5 技术栈。

## 交付状态

| 项目 | 状态 | 备注 |
|------|------|------|
| QA v3 验收 | PASS | 5 BLOCKER 全部修复 + 6 非回归项保持 |
| 构建产物 (dist/) | 完整 | 7.9MB，142 文件，可部署 |
| 源码 (src/) | 完整 | Vite + React 19 + TypeScript |
| 响应式 | 通过 | 10 档视口 (280-1440px) 零溢出 |
| 微动效 | 通过 | 739 监听器，7 组微交互全部生效 |

## 目录结构

```
studio-site/
├── src/                    # 源码
│   ├── components/         # 组件 (layout/ sections/)
│   ├── styles/             # 全局样式
│   ├── App.tsx             # 主应用
│   ├── main.tsx            # 入口
│   └── microInteractions.ts # 微动效系统
├── public/                 # 静态资源 (videos/ hyalite.js icons.svg)
├── dist/                   # 构建产物 ★ 部署此目录
│   ├── index.html          # 入口 HTML
│   ├── assets/             # JS/CSS/字体 (按 chunk 分割)
│   ├── videos/             # 6 WebM + 6 poster
│   ├── hyalite.js          # 液态玻璃引擎
│   └── icons.svg           # 图标雪碧
├── package.json
├── vite.config.ts
└── HANDOFF.md              # 本文档
```

## 技术栈

- **框架**: React 19.2 + TypeScript 5.6
- **构建**: Vite 5.4 (Oxlint)
- **动效**: GSAP 3.15 + Lenis 1.3 + Framer Motion 14
- **液态玻璃**: liquid-glass-react 1.1 + hyalite.js
- **图标**: iconsax-react + morphicons
- **字体**: Noto Sans SC (可变) + Archivo Black + JetBrains Mono

## 构建与部署

### 本地构建

```bash
npm install
npm run build        # 输出 dist/
npm run preview      # 本地预览
```

### Vercel 部署

1. 导入 GitHub 仓库
2. 构建设置：
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
3. 无需额外配置（纯静态 SPA）

### 其他静态托管

`dist/` 为纯静态产物，可直接部署至：
- Netlify（拖拽 dist/ 即可）
- GitHub Pages（推送 dist/ 到 gh-pages 分支）
- 任意 Nginx/Apache 静态目录

## 性能与验收指标

| 指标 | 实测值 | 基准 |
|------|--------|------|
| LCP | 192ms | < 2500ms |
| 横向溢出 | 0px (10 档视口) | 0px |
| 微动效监听器 | 739 个 | 全站覆盖 |
| 服务图标 | 8/8 SVG | 8/8 |
| 作品媒体 | 6/6 WebM + poster | 6/6 |

## 参考文档

- 需求规格: `/home/guish/.omh/specs/studio-site-spec.md`
- QA 验收报告: `dist/QA-REPORT-t_7795889e.md`
- 修复历程: 返工 v3 → v4 → v5（见 kanban 任务历史）

## 待补充

- [ ] 联系方式（表单后端 endpoint、邮箱、微信号/二维码）
- [ ] 自定义域名（如需）
- [ ]  Analytics（如需）
