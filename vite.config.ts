import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { resolve } from 'path'



export default defineConfig({
  // GitHub Pages 项目站点部署在子路径 /studio-site/ 下（cname: null），
  // base 必须与之一致，否则 dist/index.html 里的 /assets/* 会解析到
  // https://guish207423-ux.github.io/assets/* → 404（线上只剩无样式骨架）。
  base: '/studio-site/',
  plugins: [react()],
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
