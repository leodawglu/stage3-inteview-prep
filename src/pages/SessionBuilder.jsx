import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SESSION_TYPES, DIFFICULTIES } from '../constants'
import { CONCEPT_TAGS, PATTERNS } from '../constants/patterns'

const SESSIONS = [
  { key: SESSION_TYPES.RANDOM,        label: 'Randomized — surprise me',        desc: 'Random 5 cards from all patterns and difficulties' },
  { key: SESSION_TYPES.WEAKEST,       label: 'Weakest patterns first',          desc: 'Cards from your lowest-mastery patterns' },
  { key: SESSION_TYPES.BY_DIFFICULTY, label: 'Specific difficulty',             desc: 'All Easy, Medium, or Hard cards across all patterns' },
  { key: SESSION_TYPES.BY_TAG,        label: 'By concept tag',                  desc: 'Filter by HashMap, Prefix Sum, Memoization and more' },
  { key: SESSION_TYPES.PATTERN_DIVE,  label: 'Pattern deep dive',               desc: 'All 9 cards from one pattern in sequence' },
  { key: SESSION_TYPES.QUICK_DRILL,   label: 'Quick drill — 5 min',             desc: '3 easy cards, timed. Interview mode.' },
]

export default function SessionBuilder() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState(SESSION_TYPES.RANDOM)
  const [difficulty, setDifficulty] = useState(DIFFICULTIES.EASY)
  const [tags, setTags] = useState([])
  const [pattern, setPattern] = useState(PATTERNS[0].id)

  const toggleTag = t => setTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])

  const handleStart = () => {
    // Build session URL params and navigate to card page
    const params = new URLSearchParams({ type: selected })
    if (selected === SESSION_TYPES.BY_DIFFICULTY) params.set('difficulty', difficulty)
    if (selected === SESSION_TYPES.BY_TAG)        params.set('tags', tags.join(','))
    if (selected === SESSION_TYPES.PATTERN_DIVE)  params.set('pattern', pattern)
    navigate(`/card/sliding-window/easy/1?${params}`)
  }

  return (
    <div className="page-wrap fade-up">
      <h2 style={{ marginBottom: 4 }}>New session</h2>
      <p style={{ marginBottom: 14 }}>What do you want to practise?</p>

      {SESSIONS.map(s => (
        <div key={s.key}
          className="card"
          style={{
            marginBottom: 7, cursor: 'pointer',
            borderColor: selected === s.key ? '#534AB7' : undefined,
            background: selected === s.key ? '#EEEDFE' : undefined,
          }}
          onClick={() => setSelected(s.key)}
        >
          <div style={{ fontWeight: 500, marginBottom: 2, color: selected === s.key ? '#3C3489' : 'var(--color-text)' }}>{s.label}</div>
          <div style={{ fontSize: '0.78rem', color: selected === s.key ? '#534AB7' : 'var(--color-text-3)' }}>{s.desc}</div>
        </div>
      ))}

      {/* Difficulty picker */}
      {selected === SESSION_TYPES.BY_DIFFICULTY && (
        <div className="card" style={{ marginBottom: 7 }}>
          <div className="slabel" style={{ marginTop: 0 }}>Difficulty</div>
          <div className="diff-row">
            {Object.values(DIFFICULTIES).map(d => (
              <button key={d} className={`diff-btn ${d}${difficulty === d ? ' active' : ''}`}
                onClick={() => setDifficulty(d)}>
                {d.charAt(0).toUpperCase() + d.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tag filter */}
      {selected === SESSION_TYPES.BY_TAG && (
        <div className="card" style={{ marginBottom: 7 }}>
          <div className="slabel" style={{ marginTop: 0 }}>Select concept tags</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {CONCEPT_TAGS.map(t => (
              <span key={t}
                style={{
                  display: 'inline-block', fontSize: '0.75rem', padding: '3px 10px', borderRadius: 'var(--r-pill)',
                  border: `0.5px solid ${tags.includes(t) ? '#534AB7' : 'var(--color-border)'}`,
                  background: tags.includes(t) ? '#EEEDFE' : 'var(--color-bg-subtle)',
                  color: tags.includes(t) ? '#3C3489' : 'var(--color-text-2)',
                  cursor: 'pointer',
                }}
                onClick={() => toggleTag(t)}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Pattern picker */}
      {selected === SESSION_TYPES.PATTERN_DIVE && (
        <div className="card" style={{ marginBottom: 7 }}>
          <div className="slabel" style={{ marginTop: 0 }}>Select pattern</div>
          <select value={pattern} onChange={e => setPattern(e.target.value)}
            style={{ width: '100%', padding: '8px 10px', fontSize: '0.82rem', borderRadius: 'var(--r-md)', border: '0.5px solid var(--color-border)', background: 'var(--color-bg-subtle)', color: 'var(--color-text)' }}>
            {PATTERNS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button className="btn-primary" onClick={handleStart}>Start session →</button>
        <button onClick={() => navigate('/home')}>Cancel</button>
      </div>
    </div>
  )
}
