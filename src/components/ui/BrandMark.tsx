/**
 * 品牌标志：两块错位叠合 + 一处 45° 斜切。
 *
 * 立意：后块是设计稿，前块是跑起来的界面——实现比稿子大一圈，
 * 重叠处深一层；前块右下被斜切掉一角，像从稿子里「切」出来的一块。
 *
 * 构造取舍（都经过 16/22/32/64px 实测）：
 * - 不用岛形/山丘：圆顶剪影在 16px 会被读成帐篷或帽子，悬空的水线
 *   会被读成日出；几何叠块没有这种歧义。
 * - 切口必须够大（约 6/32）才能在 16px 存活，直角切口则会被抗锯齿吃掉。
 * - 后块用 0.62 透明度：太低（0.45）在深底上会消失。
 */
export default function BrandMark({
  size = 32,
  className,
  style,
  title,
}: {
  size?: number | string
  className?: string
  style?: React.CSSProperties
  title?: string
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={className}
      style={style}
      fill="currentColor"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      <rect x="15.8" y="2.6" width="13.8" height="13.8" rx="5" opacity="0.62" />
      <path d="M6.8 11.4h9.2a3.6 3.6 0 0 1 3.6 3.6v6.6l-6 6H6.8a3.6 3.6 0 0 1-3.6-3.6v-9A3.6 3.6 0 0 1 6.8 11.4z" />
    </svg>
  )
}
