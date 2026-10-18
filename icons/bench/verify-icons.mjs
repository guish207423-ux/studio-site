// iconsax-react icon name existence check — BRAND §5.3 命名陷阱防御
// Verifies that all 8 service icon names used in Services.tsx exist in iconsax-react@0.0.8
import * as icons from 'iconsax-react'

const required = ['PenTool', 'Brush', 'Code', 'VideoPlay', 'Mobile', 'Command', 'GlobalSearch', 'Cpu']
const missing = required.filter(name => !(name in icons))

if (missing.length > 0) {
  console.error('MISSING ICONS:', missing)
  process.exit(1)
} else {
  console.log('All 8 icons verified:', required.join(', '))
}
