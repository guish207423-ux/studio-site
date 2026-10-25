import {
  Buildings2,
  Layer,
  Code1,
  Briefcase,
  Wallet3,
  Hierarchy2,
  Timer1,
  ShieldTick,
  Setting2,
  Note1,
  Box1,
  Cpu,
  Sms,
} from 'iconsax-react'

/**
 * 每个区块头部的图标。
 * 统一走 iconsax-react（项目主图标库），不再用「⌁」这种占位字符。
 * 语义对应见 MAP：图标要说明这一块在讲什么，不是为了凑一个图形。
 */
const MAP = {
  about: Buildings2,      // 关于我们 —— 工作室本身
  services: Layer,        // 服务能力 —— 能力分层
  works: Code1,           // 开源生态 —— 代码
  cases: Briefcase,       // 典型场景 —— 业务场景
  pricing: Wallet3,       // 服务定价 —— 钱
  process: Hierarchy2,    // 工作流程 —— 步骤结构
  timeline: Timer1,       // 项目怎么推进 —— 时间
  testimonials: ShieldTick, // 交付承诺 —— 承诺与保障
  partners: Setting2,     // 常用工具链 —— 工具
  blog: Note1,            // 工作笔记 —— 记录
  showcase3d: Box1,       // 3D 展示 —— 立体
  stack: Cpu,             // 技术栈 —— 引擎
  contact: Sms,           // 联系方式 —— 消息
} as const

export type SectionKey = keyof typeof MAP

export default function SectionIcon({
  name,
  size = 18,
}: {
  name: SectionKey
  size?: number
}) {
  const Icon = MAP[name]
  return (
    <span className="section-head__icon" aria-hidden="true">
      <Icon size={size} variant="Linear" color="currentColor" />
    </span>
  )
}
