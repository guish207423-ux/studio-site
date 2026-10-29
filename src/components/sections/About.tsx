import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SectionIcon from '../ui/SectionIcon'
import { useReducedMotion } from '../../lib/motion'

gsap.registerPlugin(ScrollTrigger)

// 不编人。只讲做事的方式。
const principles = [
  {
    mark: '01',
    title: '需求先行',
    desc: '项目启动前明确目标、受众与验收标准，确保双方对交付范围达成一致。',
  },
  {
    mark: '02',
    title: '进度透明',
    desc: '按周提供可交互的预览版本，方向偏差当周调整，不等到交付末期。',
  },
  {
    mark: '03',
    title: '文档交付',
    desc: '设计稿、组件说明与部署文档一并交付，便于后续维护与交接。',
  },
  {
    mark: '04',
    title: '能力边界',
    desc: '超出能力范围的项目直接说明，不接无法交付的委托。已接项目负责到上线。',
  },
]

const facts = [
  { label: '服务范围', value: '品牌 · 界面 · 前端 · 动效' },
  { label: '交付周期', value: '4–12 周' },
  { label: '协作方式', value: '远程 · 每周可见' },
  { label: '技术栈', value: 'React 19 · Vite · GSAP' },
]

/**
 * polish-round3 §三：关于我们去卡片化。
 *
 * 原来这里是一组等宽卡片（team-card，带 --c-panel 底 + 描边 + 圆角 + 48px 编号块），
 * 读起来像仪表盘而不像一间工作室的介绍。改成编辑式长文 + 编号列表：
 * 单栏 680px 最大宽度，段落就是段落，四条原则用 mono 编号 + border-bottom 分隔，
 * 概况收成一张两列事实行。768px 以下本来就是单栏，不需要额外断点。
 *
 * 入场动画的挂钩类从 .team-card 改名为 .principle-item（它不再是卡片），
 * 同步更新了 src/lib/motion.ts 与 src/App.tsx 里的选择器列表。
 */
export default function About() {
  const listRef = useRef<HTMLOListElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (!listRef.current || reduced) return

    const items = listRef.current.querySelectorAll('.principle-item')
    const ctx = gsap.context(() => {
      gsap.set(items, { y: 24, opacity: 0 })
      ScrollTrigger.batch(items, {
        start: 'top 90%',
        once: true,
        onEnter: (batch) => {
          gsap.to(batch, { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'expo.out' })
        },
      })
    })
    return () => ctx.revert()
  }, [reduced])

  return (
    <section className="section zone" id="about" aria-labelledby="about-title">
      <div className="container">
        <header className="section-head">
          <h2 id="about-title" className="section-head__title">关于我们</h2>
          <p className="section-head__sub"><SectionIcon name="about" size={16} /> 小型数字产品工作室</p>
        </header>

        <div className="about-wrap">
          <p className="about-lead">
            屿作所是小型数字产品工作室，专注于界面设计与前端开发。核心团队固定，
            按项目规模灵活组队，不设冗余岗位。
          </p>
          <p className="about-body">
            主要服务三类项目：品牌官网、动效界面、设计稿落地。每个项目由实际执行人
            直接对接，无中间管理层。
          </p>

          <ol ref={listRef} className="principle-list">
            {principles.map((item) => (
              <li key={item.mark} className="principle-item">
                <span className="principle-num">{item.mark}</span>
                <div>
                  <h3 className="principle-title">{item.title}</h3>
                  <p className="principle-desc">{item.desc}</p>
                </div>
              </li>
            ))}
          </ol>

          <dl className="fact-list">
            {facts.map(item => (
              <div key={item.label} className="fact-row">
                <dt className="fact-label">{item.label}</dt>
                <dd className="fact-value">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
