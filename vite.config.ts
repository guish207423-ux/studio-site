import react from '@vitejs/plugin-react'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'path'
import { defineConfig, type Plugin } from 'vite'

/**
 * 构建期生成 dist/404.html。
 *
 * 背景（线上事故 t_703efef3）：public/404.html 曾是 index.html 的手抄副本，里面写着
 * 某一次构建的 hash（/studio-site/assets/index-B6Z5G3w0.css 等）和两个早已不存在的
 * archivo-black 字体。构建产物一换代，Pages 对任意不存在路径返回的就是这一页：
 * 0 条可读 CSS、body 透明、Times New Roman、全白。
 *
 * 两条纪律，缺一不可：
 *
 * 1) 404 页不引用构建产物。模板 templates/404.html 全内联（CSS + SVG data URI +
 *    系统字体栈），零 assets/*.js|css|woff2 依赖，hash 再怎么变都与它无关。
 *
 * 2) 但深链接下的相对引用不可用 —— Pages 返回 404.html 时地址栏 URL 不变，
 *    /studio-site/a/b 里的 ./x 会解析成 /studio-site/a/x。所以站内链接必须在构建期
 *    带上 base。模板里写 %BASE%，这里替换成本次构建的 base，base 一改（'/' ↔ 子路径）
 *    页面自动跟着走，不需要手改 HTML。
 *
 * 写盘前逐条校验，任何一条不过就让构建失败 —— 宁可不出包，也不把坏页发上线。
 */
function pages404Plugin(): Plugin {
  let base = '/'
  return {
    name: 'studio-pages-404',
    apply: 'build',
    configResolved(config) {
      base = config.base.endsWith('/') ? config.base : `${config.base}/`
    },
    closeBundle() {
      const templatePath = resolve(__dirname, 'templates/404.html')
      const outputPath = resolve(__dirname, 'dist/404.html')

      if (!existsSync(templatePath)) {
        throw new Error(`[404] 找不到模板：${templatePath}`)
      }

      const template = readFileSync(templatePath, 'utf8')

      // 1) 不许引用构建产物：hash 会漂，404 页一旦依赖它就会再次全白。
      const assetRef = template.match(/(?:src|href)\s*=\s*["'][^"']*\bassets\//i)
      if (assetRef) {
        throw new Error(
          `[404] templates/404.html 不得引用 assets/*（构建产物 hash 会变）：${assetRef[0]}`,
        )
      }

      const html = template.split('%BASE%').join(base)

      // 2) 占位符必须全部替换掉，否则线上会露出 %BASE% 字面量。
      if (html.includes('%BASE%')) {
        throw new Error('[404] 模板里仍有未替换的 %BASE% 占位符')
      }

      // 3) 站内引用必须落在本次 base 下：相对路径在深链接里会解析错（Pages 返回
      //    404.html 时 URL 不变），根绝对 /assets/* 在子路径部署下必 404 —— 两种都拦。
      const urlAttrs = [...html.matchAll(/(?:src|href)\s*=\s*"([^"]*)"/gi)].map((m) => m[1])
      const allowed = (value: string) =>
        value.startsWith(base) ||
        value.startsWith('data:') ||
        value.startsWith('mailto:') ||
        value.startsWith('https://') ||
        value.startsWith('#')
      const offenders = urlAttrs.filter((value) => !allowed(value))
      if (offenders.length > 0) {
        throw new Error(
          `[404] 站内引用必须以 ${base} 开头（相对 / 根绝对在深链接或子路径下会 404）：${offenders.join(', ')}`,
        )
      }

      writeFileSync(outputPath, html)
      console.log(
        `[404] dist/404.html 已生成（base=${base}，内联零外部资源，${Buffer.byteLength(html)} B）`,
      )
    },
  }
}

export default defineConfig({
  // GitHub Pages 项目站点部署在子路径 /studio-site/ 下（cname: null），
  // base 必须与之一致，否则 dist/index.html 里的 /assets/* 会解析到
  // https://guish207423-ux.github.io/assets/* → 404（线上只剩无样式骨架）。
  base: '/studio-site/',
  plugins: [react(), pages404Plugin()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'vendor'
            if (id.includes('gsap')) return 'gsap'
            if (id.includes('lenis')) return 'lenis'
            if (id.includes('framer-motion')) return 'motion'
          }
        },
      },
    },
  },
})
