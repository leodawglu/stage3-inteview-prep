export default function SayOutLoud({
  text,
  label = 'Say out loud',
  type = 'approach',   // 'approach' | 'summary'
  isGuided,
  open,
  onToggle,
}) {
  const cls = type === 'summary' ? 'sol-box sol-summary' : 'sol-box sol-guided'

  if (isGuided) {
    return (
      <div className={cls}>
        <span className="sol-lbl">Model answer — guided mode</span>
        {text}
      </div>
    )
  }

  return (
    <div>
      <p style={{ fontSize: '0.78rem', color: 'var(--color-text-3)', background: 'var(--color-bg-subtle)', borderRadius: 'var(--r-md)', padding: '8px 11px', marginBottom: 7 }}>
        {type === 'approach'
          ? 'Say your approach out loud first — explain the pattern and why. Then reveal the model answer to compare.'
          : 'Summarise your solution — approach, complexity, edge cases — as you\'d close out with an interviewer.'}
      </p>
      <div>
        <div className="coll-header" onClick={onToggle}
          style={{ borderRadius: open ? '8px 8px 0 0' : undefined }}>
          <span>{open ? 'Model answer' : `Reveal model ${type}`}</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--color-text-3)' }}>{open ? '▲' : '▼'}</span>
        </div>
        {open && (
          <div className="coll-body">
            <div className={cls} style={{ margin: 0 }}>
              <span className="sol-lbl">Model {type}</span>
              {text}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
