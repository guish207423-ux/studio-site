/**
 * 品牌标志「屿」——低矮的岛形剪影，峰偏左、底边平切。
 * 单一实心形状，没有独立的水线或基座（悬空的线条在 16px 会变成噪点，
 * 对称的圆顶又会被读成帐篷/帽子）。
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
      <path d="M3.6 27c.4-5.4 2.8-9.8 6.8-11.8 2.4-1.2 3.2-3 3.7-5.6.6 2.6 1.6 4.4 4 5.6 4 2 6.4 6.4 6.8 11.8H3.6Z" />
    </svg>
  )
}
