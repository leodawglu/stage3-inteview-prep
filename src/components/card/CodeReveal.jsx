// Parses annotation field and wraps code text with highlight spans
function annotatedSpan(text, annotation) {
  const cls = annotation === 'requirement' ? 'ann-req'
            : annotation === 'constraint'  ? 'ann-con'
            : annotation === 'pattern'     ? 'ann-pat'
            : null

  if (!cls) return <span className="code-text">{text}</span>
  return <span className={`code-text ${cls}`}>{text}</span>
}

export default function CodeReveal({ lines, showNarration = true }) {
  return (
    <div>
      <div className="ann-legend">
        <span className="ann-leg" style={{ background: '#2a3a2a', color: '#a6e3a1' }}>requirement</span>
        <span className="ann-leg" style={{ background: '#3a2a1a', color: '#fab387' }}>constraint</span>
        <span className="ann-leg" style={{ background: '#2a2a3e', color: '#cba6f7' }}>pattern</span>
      </div>

      <div className="code-block">
        {lines.map((line, i) => (
          <div key={i} className="code-line">
            {annotatedSpan(line.text, line.annotation)}
            {showNarration && line.narration && (
              <span className="code-narr">// {line.narration}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
