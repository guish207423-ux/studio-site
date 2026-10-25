// polish-round3 §二 图标系统验收：SectionIcon.tsx 的 13 个 iconsax-react 名称必须存在
import * as icons from 'iconsax-react'

const required = [
  'Buildings2', 'Layer', 'Code1', 'Briefcase', 'Wallet3', 'Hierarchy2',
  'Timer1', 'ShieldTick', 'Setting2', 'Note1', 'Box1', 'Cpu', 'Sms',
]
const missing = required.filter((n) => !(n in icons))

console.log('iconsax-react exports:', Object.keys(icons).length)
if (missing.length) {
  console.error('MISSING:', missing.join(', '))
  process.exit(1)
}
console.log('All 13 SectionIcon names verified:', required.join(', '))
