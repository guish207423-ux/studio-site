import SectionIcon from '../ui/SectionIcon'

const tools = [
  { name: 'React 19', note: '组件与渲染' },
  { name: 'TypeScript', note: '类型安全' },
  { name: 'Vite 7', note: '构建与开发' },
  { name: 'GSAP 3.15', note: '唯一动效引擎' },
  { name: 'Lenis', note: '平滑滚动' },
  { name: 'Hyalite', note: '液态玻璃折射' },
  { name: 'Node 22+', note: '运行时' },
  { name: 'pnpm', note: '包管理' },
]

export default function Partners() {
  return (
    <section className="section zone" id="partners" aria-labelledby="partners-title">
      <div className="container">
        <header className="section-head">
          <h2 id="partners-title" className="section-head__title">常用工具链</h2>
          <p className="section-head__sub"><SectionIcon name="partners" size={16} /> 我们实际在用的栈，不是罗列 buzzword</p>
        </header>

        <div className="partners-strip" role="list" aria-label="技术栈（横向滚动）" tabIndex={0}>
          {tools.map((t) => (
            <div key={t.name} className="partner-chip" role="listitem">
              <span className="partner-chip__name">{t.name}</span>
              <span className="partner-chip__note">{t.note}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
