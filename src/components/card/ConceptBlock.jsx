export default function ConceptBlock({ concept, open, onToggle, alwaysOpen }) {
  if (alwaysOpen) {
    return (
      <div className="concept-box" style={{ marginBottom: 6 }}>
        <div className="concept-term">{concept.term}</div>
        <div className="concept-def">{concept.definition}</div>
        <code className="concept-eg">{concept.example}</code>
      </div>
    )
  }

  return (
    <div style={{ marginBottom: 5 }}>
      <div className={`coll-header`} onClick={onToggle}
        style={{ borderRadius: open ? '8px 8px 0 0' : undefined }}>
        <span>{concept.term} — tap to review</span>
        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-3)' }}>{open ? '▲' : '▼'}</span>
      </div>
      {open && (
        <div className="coll-body">
          <div className="concept-box" style={{ border: 'none', padding: 0, background: 'transparent' }}>
            <div className="concept-term">{concept.term}</div>
            <div className="concept-def">{concept.definition}</div>
            <code className="concept-eg">{concept.example}</code>
          </div>
        </div>
      )}
    </div>
  )
}
