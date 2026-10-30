/**
 * 首屏右侧的「设计 → 代码」对照片。
 *
 * 为什么是它：评审说首屏右侧 384px 全空、视觉重心落在左下 CTA 与 cookie 面板上，
 * 于是整屏只剩「大标题 + 按钮」——这类构图正是 AI 落地页最标准的排版。
 * 但补视觉锚点不能编：不能放假客户 logo、假产品截图（用户的硬规矩：不编假信息）。
 *
 * 唯一诚实且能自证的视觉是**本页自身**：左边是站点真实在用的 CSS 片段
 * （就是从 globals.css 里摘出来的 .btn--primary 与玻璃令牌），右边是用这些令牌
 * 当场渲染出的同一个按钮。看得见「这段代码 = 这个按钮」，正是这句 slogan
 * 「我们把设计变成能运行的产品」的字面证明。
 */
export default function HeroSpecimen() {
  return (
    <figure className="specimen" aria-label="设计与代码对照：左边是本站真实使用的样式，右边是它渲染出的按钮">
      <figcaption className="specimen__cap">
        <span className="specimen__dot" aria-hidden="true" />
        本站真实样式 · 就地渲染
      </figcaption>

      <div className="specimen__pane specimen__pane--code">
        <pre>
          <code>
            <span className="tok-sel">.btn--primary</span> {'{'}
            {'\n'}  <span className="tok-prop">background</span>: <span className="tok-val">var(--c-accent)</span>;
            {'\n'}  <span className="tok-prop">color</span>: <span className="tok-val">var(--c-accent-ink)</span>;
            {'\n'}  <span className="tok-prop">border-radius</span>: <span className="tok-val">var(--r-md)</span>;
            {'\n'}  <span className="tok-prop">transition</span>: <span className="tok-val">240ms var(--ease-out-expo)</span>;
            {'\n'}{'}'}
          </code>
        </pre>
      </div>

      <div className="specimen__pane specimen__pane--live">
        <span className="specimen__label">渲染结果</span>
        <a href="#contact" className="btn btn--lg btn--primary specimen__button" tabIndex={-1} aria-hidden="true">
          <span>预约咨询</span>
        </a>
      </div>
    </figure>
  )
}
