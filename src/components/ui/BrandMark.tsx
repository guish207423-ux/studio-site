/**
 * 品牌标志「屿」——实心岛体 + 一条通长水线。
 * 两个形状：读作"海上的一座岛"，16px 下轮廓仍成立；不用圆形容器套汉字。
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
      <path d="M4.6 20.8c.5-5.6 4-10 8.4-11.4 1.9-.6 2.6-1.8 3-3.2.5 1.4 1.3 2.6 3.2 3.2 4.4 1.4 7.9 5.8 8.4 11.4z" />
      <rect x="4.6" y="23.4" width="22.8" height="3.2" rx="1.6" />
    </svg>
  )
}
