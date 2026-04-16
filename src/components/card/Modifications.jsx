import { useState } from 'react'

const TAG_COLORS = {
  'variable-window':    { bg: '#FEF9E7', color: '#633806' },
  'index-tracking':     { bg: '#EEEDFE', color: '#3C3489' },
  '2d-extension':       { bg: '#F3EEF9', color: '#6B3FA0' },
  'at-most-k':          { bg: '#E1F5EE', color: '#085041' },
  'replace-k':          { bg: '#E8F0FB', color: '#0C447C' },
  'with-negatives':     { bg: '#FCEBEB', color: '#791F1F' },
  'exactly-k':          { bg: '#FEF9E7', color: '#633806' },
  'unicode':            { bg: '#E8F0FB', color: '#0C447C' },
  'generalised-replacement': { bg: '#F3EEF9', color: '#6B3FA0' },
  'impossible-case':    { bg: '#E1F5EE', color: '#085041' },
  'generalised-k-chars':{ bg: '#EEEDFE', color: '#3C3489' },
  'min-and-max':        { bg: '#E8F0FB', color: '#0C447C' },
}

function ModCard({ mod, index }) {
  const [open, setOpen] = useState(false)
  const tagStyle = TAG_COLORS[mod.tag] || { bg: '#F5F5F5', color: '#444' }

  return (
    <div className="mod-card">
      <span className="mod-tag" style={{ background: tagStyle.bg, color: tagStyle.color }}>
        Modification {index + 1} · {mod.tag}
      </span>
      <p className="mod-q">"{mod.question}"</p>

      {open ? (
        <>
          <p className="mod-approach">{mod.approach}</p>
          <pre className="mod-code">{mod.codeChunk}</pre>
        </>
      ) : (
        <button
          className="tb-btn"
          style={{ fontSize: '0.75rem', marginTop: 4 }}
          onClick={() => setOpen(true)}
        >
          Reveal approach + code chunk
        </button>
      )}
    </div>
  )
}

export default function Modifications({ modifications }) {
  const [showAll, setShowAll] = useState(false)

  if (!modifications?.length) return null

  // Show one random mod initially (seeded by first mod's question length for consistency)
  const primaryIdx = modifications[0].question.length % modifications.length
  const primary = modifications[primaryIdx]
  const rest = modifications.filter((_, i) => i !== primaryIdx)

  return (
    <div>
      <div className="slabel">Optional — interviewer follow-up</div>
      <ModCard mod={primary} index={0} />

      {rest.length > 0 && (
        <>
          {showAll && rest.map((m, i) => <ModCard key={i} mod={m} index={i + 1} />)}
          <button
            className="tb-btn"
            style={{ fontSize: '0.75rem', width: '100%', marginTop: 4 }}
            onClick={() => setShowAll(v => !v)}
          >
            {showAll ? 'Show less' : `See all ${modifications.length} modifications`}
          </button>
        </>
      )}
    </div>
  )
}
