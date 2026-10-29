#!/usr/bin/env node
/**
 * 静态首屏壳一致性检查。
 *
 * index.html 里手写了一份「导航 + Hero」的静态壳，用来让 LCP 与 SEO 不依赖 JS。
 * 代价是文案存在两份。这个脚本把壳里的关键文案和 React 组件里的对一遍，
 * 任何一边改了另一边没跟上就 FAIL（不然用户会看到壳 → 挂载后文案跳变）。
 *
 * 用法：node scripts/check-shell.mjs   （npm run check:shell）
 */
import { readFileSync } from 'node:fs'

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')
const html = read('index.html')
const hero = read('src/components/sections/Hero.tsx')
const nav = read('src/components/layout/Navigation.tsx')

/** 去标签、压空白，只留文字 */
const text = (s) => s.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, '')

const shell = html.slice(html.indexOf('<div id="root">'), html.indexOf('<script type="module"'))
const problems = []

function compare(label, shellHtml, componentSrc, extractComponent) {
  const a = text(shellHtml)
  const b = text(extractComponent(componentSrc))
  if (!a.includes(b)) problems.push(`${label}：静态壳里找不到组件文案「${b}」`)
}

// H1（三行拼接后应为「我们把设计变成能运行的产品」）
const shellH1 = (shell.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1] || ''
const heroH1 = (hero.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1] || ''
if (!shellH1 || !heroH1) problems.push('H1：index.html 或 Hero.tsx 里没找到 h1')
else if (text(shellH1) !== text(heroH1)) problems.push(`H1 不一致：壳「${text(shellH1)}」 vs 组件「${text(heroH1)}」`)

// 副标题
compare('Hero 副标题', shell,
  hero, (src) => (src.match(/hero-lead-editorial[^>]*>([\s\S]*?)<\/p>/) || [])[1] || '')

// 导航链接文字集合
const navLabels = [...nav.matchAll(/\{ href: '#[a-z]+', label: '([^']+)' \}/g)].map((m) => m[1])
const shellLinks = [...shell.matchAll(/class="nav__link">([^<]+)</g)].map((m) => m[1])
if (navLabels.join() !== shellLinks.join()) {
  problems.push(`导航不一致：组件 [${navLabels.join(' / ')}] vs 壳 [${shellLinks.join(' / ')}]`)
}

// 主 CTA
compare('主 CTA', shell, hero, (src) => (src.match(/btn--primary[^>]*>\s*<span>([\s\S]*?)<\/span>/) || [])[1] || '')

if (problems.length) {
  console.error('✗ 静态首屏壳与组件不一致：')
  problems.forEach((p) => console.error('  - ' + p))
  process.exit(1)
}
console.log('✓ 静态首屏壳与 Hero / Navigation 文案一致（H1、副标题、导航、CTA）')
