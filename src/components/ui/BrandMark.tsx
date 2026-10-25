/**
 * 品牌标志 —— 等高线岛（polish-round3 规格 §一 方案 A）。
 *
 * 立意：把「屿」抽象成一组同心的、略偏心的闭合曲线，像地形等高线，
 * 暗指「在数字平面上隆起的一块土地」。标志本身就是图形，不是容器里塞一个字。
 *
 * 规格（docs/polish-round3.md §一 方案 A）：
 * - viewBox 0 0 24 24，三条闭合 path
 * - 半径 10.5 / 7 / 3.5，圆心分别偏移 (12,12) / (11.2,12.4) / (12.6,11.6)
 * - stroke-width 1.25，fill none，stroke currentColor
 * - 单色可用；三圈间距 3.5（= 2.33px @16px），缩到 16px 仍能分辨三层
 *
 * 几何说明：半径 10.5 的外圈加 1.25 描边后最外缘落在 23.125，仍在 24 内，
 * 不需要额外留边；三圈偏心量（≤1.4）保证任意角度都不会读成同心圆靶心。
 */
export default function BrandMark({
  size = 24,
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
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      style={style}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      {/* 外圈 r=10.5 @ (12,12) */}
      <path d="M1.5 12a10.5 10.5 0 1 0 21 0a10.5 10.5 0 1 0-21 0" />
      {/* 中圈 r=7 @ (11.2,12.4) */}
      <path d="M4.2 12.4a7 7 0 1 0 14 0a7 7 0 1 0-14 0" />
      {/* 内圈 r=3.5 @ (12.6,11.6) */}
      <path d="M9.1 11.6a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0-7 0" />
    </svg>
  )
}
