import { useParams, Link } from 'react-router-dom'

const projects: Record<string, { name: string; desc: string; tags: string[]; stars: string; license: string; category: string; video: string; poster: string; github: string; demo: string; detail: string }> = {
  'liquid-glass-react': {
    name: 'liquid-glass-react',
    desc: 'React 液态玻璃组件库，SVG feDisplacementMap 驱动',
    tags: ['React', 'TypeScript', 'SVG', 'WebGL'],
    stars: '4.2k',
    license: 'MIT',
    category: 'UI 组件',
    video: './videos/liquid-glass-react.webm',
    poster: './videos/liquid-glass-react-poster.jpg',
    github: 'https://github.com/nousresearch/liquid-glass-react',
    demo: 'https://www.nousresearch.com',
    detail: 'liquid-glass-react 是一个 React 组件库，使用 SVG feDisplacementMap 滤镜实现真实折射效果。支持 5 种玻璃变体（panel、button、modal、card、badge），全站 10+ 实例。采用 TypeScript 编写，提供完整的类型定义和文档。',
  },
  'Blender': {
    name: 'Blender',
    desc: '开源 3D 创作套件，建模 / 动画 / 渲染全流程',
    tags: ['3D', '建模', '渲染'],
    stars: '12.3k',
    license: 'GPL',
    category: '3D 创作',
    video: './videos/blender.webm',
    poster: './videos/blender-poster.jpg',
    github: 'https://github.com/blender/blender',
    demo: 'https://www.blender.org',
    detail: 'Blender 是开源 3D 创作套件，涵盖建模、动画、渲染、合成、运动追踪、视频编辑等全流程。我们为 Blender 开发了自动化建模插件和渲染管线优化工具，提升团队协作效率 40%。',
  },
}

export default function WorkDetail() {
  const { name } = useParams()
  const project = name ? projects[decodeURIComponent(name)] : null

  if (!project) {
    return (
      <div style={{ padding: '80px 24px', textAlign: 'center', color: 'var(--c-txt)' }}>
        <h1>作品未找到</h1>
        <Link to="/" style={{ color: 'var(--c-accent)' }}>返回首页</Link>
      </div>
    )
  }

  return (
    <div style={{ padding: '80px 24px', maxWidth: 900, margin: '0 auto', color: 'var(--c-txt)' }}>
      <Link to="/#works" style={{ color: 'var(--c-accent)', textDecoration: 'none', marginBottom: 24, display: 'inline-block' }}>← 返回作品列表</Link>
      <h1 style={{ fontSize: 36, fontWeight: 900, marginBottom: 16 }}>{project.name}</h1>
      <p style={{ color: 'var(--c-txt-2)', marginBottom: 24, lineHeight: 1.6 }}>{project.detail}</p>
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        {project.tags.map(t => (
          <span key={t} style={{ padding: '4px 12px', background: 'var(--c-panel)', borderRadius: 20, fontSize: 12, border: '1px solid var(--c-line)' }}>{t}</span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <a href={project.github} target="_blank" rel="noopener noreferrer" className="btn btn--md btn--primary">GitHub</a>
        <a href={project.demo} target="_blank" rel="noopener noreferrer" className="btn btn--md btn--secondary">在线演示</a>
      </div>
      <video
        controls
        muted
        loop
        playsInline
        poster={project.poster}
        style={{ width: '100%', borderRadius: 12, marginTop: 32 }}
      >
        <source src={project.video} type="video/webm" />
      </video>
    </div>
  )
}
