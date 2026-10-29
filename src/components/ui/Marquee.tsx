export default function Marquee({ text, speed = 30 }: { text: string; speed?: number }) {
  const items = Array(4).fill(text)
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee__track" style={{ animationDuration: `${speed}s` }}>
        {items.map((t, i) => (
          <span key={i} className="marquee__item">{t}</span>
        ))}
      </div>
    </div>
  )
}
