import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PATTERN_MAP } from '../constants/patterns'
import { getCardStats, getNudgeDismissed, setNudgeDismissed } from '../adapters/localAdapter'
import { CONFIDENCE_MODES } from '../constants'

const DIFFS = ['easy', 'medium', 'hard']

function cardId(patSlug, diff, idx) {
  const code = {
    'sliding-window': 'sw', 'two-pointers': 'tp', 'trees-graphs': 'tg',
    'dynamic-programming': 'dp', 'linked-lists': 'll', 'binary-search': 'bs',
    'backtracking': 'bt', 'heap-priority-queue': 'hq', 'stack-monotonic': 'sm',
    'string-manipulation': 'st',
  }
  return `${code[patSlug] || patSlug}-${diff[0]}-0${idx}`
}

export default function Chapter({ profileId, mode, onModeChange }) {
  const { patternId } = useParams()
  const navigate = useNavigate()
  const pattern = PATTERN_MAP[patternId]
  const [stats, setStats] = useState({})
  const [nudgeDismissed, setNudgeDismissedState] = useState(false)

  useEffect(() => {
    if (!profileId || !pattern) return
    const s = {}
    DIFFS.forEach(d => [1, 2, 3].forEach(i => {
      const id = cardId(patternId, d, i)
      s[id] = getCardStats(profileId, id)
    }))
    setStats(s)
    setNudgeDismissedState(getNudgeDismissed(profileId, patternId))
  }, [profileId, patternId])

  if (!pattern) return <div className="page-wrap"><p>Pattern not found.</p></div>

  const allDiffCompleted = (diff) => [1, 2, 3].every(i => stats[cardId(patternId, diff, i)]?.timesCompleted > 0)
  const totalCompleted = DIFFS.reduce((s, d) => s + [1,2,3].filter(i => stats[cardId(patternId, d, i)]?.timesCompleted > 0).length, 0)
  const avgMastery = (() => {
    const scores = Object.values(stats).filter(s => s?.masteryScore != null).map(s => s.masteryScore)
    return scores.length ? Math.round(scores.reduce((a,b)=>a+b,0)/scores.length) : null
  })()

  const showNudge = mode === CONFIDENCE_MODES.GUIDED && !nudgeDismissed && (avgMastery ?? 0) >= 70

  const handleDismissNudge = () => {
    setNudgeDismissed(profileId, patternId)
    setNudgeDismissedState(true)
  }

  return (
    <div className="page-wrap fade-up">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h2 style={{ marginBottom: 3 }}>{pattern.name}</h2>
          <p style={{ fontSize: '0.78rem' }}>
            {avgMastery != null ? `Mastery: ${avgMastery}%` : 'Not started'} · {totalCompleted} of 9 cards completed
          </p>
        </div>
        <button onClick={() => navigate('/home')}>← All patterns</button>
      </div>

      {/* Mode upgrade nudge */}
      {showNudge && (
        <div className="nudge-banner">
          <div className="nudge-banner-text">
            <div className="nudge-banner-title">You're doing well in Guided mode — mastery: {avgMastery}%</div>
            <div className="nudge-banner-body">Ready for a challenge? Practice mode removes the scaffolding while keeping concept checks available on tap.</div>
          </div>
          <div className="nudge-banner-actions">
            <button style={{ fontSize: '0.75rem', padding: '4px 10px', background: '#1A56B0', color: '#fff', border: 'none', borderRadius: 'var(--r-md)' }}
              onClick={() => onModeChange(CONFIDENCE_MODES.PRACTICE)}>
              Try Practice
            </button>
            <button style={{ fontSize: '0.75rem', padding: '4px 10px', background: 'none', border: '0.5px solid #378ADD', color: '#1A56B0', borderRadius: 'var(--r-md)' }}
              onClick={handleDismissNudge}>
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Pattern anatomy */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>Pattern anatomy</span>
          <span style={{ fontSize: '0.72rem', color: 'var(--color-text-3)' }}>
            Signals: {pattern.signalPhrases.slice(0,3).join(' · ')}
          </span>
        </div>
        <p style={{ fontSize: '0.78rem', marginBottom: 8 }}>
          {pattern.id === 'sliding-window' && 'Use when: contiguous elements, optimise over a range. Expand right, conditionally shrink left. Fixed window = shrink when size > k. Variable = shrink when condition violated.'}
          {pattern.id === 'two-pointers' && 'Use when: sorted array, pair/triplet problems, palindrome checks. Two pointers converge or one chases the other (fast/slow for cycles).'}
          {pattern.id === 'trees-graphs' && 'BFS for shortest path / level order. DFS for path existence, tree traversal, connected components. Use a visited set for graphs.'}
          {pattern.id === 'dynamic-programming' && 'Use when: optimal substructure + overlapping subproblems. Top-down (memoization) or bottom-up (tabulation). Define state carefully.'}
          {pattern.id === 'linked-lists' && 'Use when: in-place reversal, cycle detection (fast/slow pointers), merge operations, finding nth from end.'}
          {pattern.id === 'binary-search' && 'Use when: sorted data, search space can be halved. Classic: find target. Advanced: binary search on the answer (not just the array).'}
          {pattern.id === 'backtracking' && 'Use when: enumerate all combinations/permutations/subsets. Choose → Explore → Unchoose. Prune early when constraint is violated.'}
          {pattern.id === 'heap-priority-queue' && 'Use when: top K elements, streaming min/max, merge K sorted lists. Min-heap for top K largest. Max-heap for top K smallest.'}
          {pattern.id === 'stack-monotonic' && 'Use when: next greater/smaller element, temperature span, largest rectangle. Maintain a stack in monotonic order — pop when invariant breaks.'}
          {pattern.id === 'string-manipulation' && 'Use when: anagram detection, palindrome, pattern matching. HashMap for frequency counting. Two-pointer for palindrome. Sliding window for substring problems.'}
        </p>
        <div className="code-block" style={{ padding: '8px 10px' }}>
          {pattern.skeletonCode.map((line, i) => (
            <div key={i} style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#cdd6f4', lineHeight: 1.6 }}>{line}</div>
          ))}
        </div>
      </div>

      {/* Card slots by difficulty */}
      {DIFFS.map(diff => {
        const diffLabel = diff.charAt(0).toUpperCase() + diff.slice(1)
        const diffColor = diff === 'easy' ? '#1D9E75' : diff === 'medium' ? '#BA7517' : '#E24B4A'
        return (
          <div key={diff} style={{ marginBottom: 12 }}>
            <div className="slabel">{diffLabel}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {[1, 2, 3].map(idx => {
                const id = cardId(patternId, diff, idx)
                const s = stats[id]
                const done = s?.timesCompleted > 0
                const ms = s?.masteryScore
                return (
                  <div key={idx}
                    className="card"
                    style={{
                      cursor: 'pointer', margin: 0,
                      borderColor: done ? '#1D9E75' : 'var(--color-border)',
                      background: done ? '#f0fdf8' : 'var(--color-bg)',
                    }}
                    onClick={() => navigate(`/card/${patternId}/${diff}/${idx}`)}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 500, color: done ? '#085041' : 'var(--color-text)', marginBottom: 3 }}>
                      {diffLabel[0]}{idx}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: done ? '#1D9E75' : 'var(--color-text-3)', marginBottom: 6 }}>
                      {done ? (ms != null ? `${ms}% mastery` : 'done') : s?.timesAttempted > 0 ? 'in progress' : 'not started'}
                    </div>
                    <div style={{ display: 'flex', gap: 2 }}>
                      {[1,2,3,4,5,6,7].map(step => (
                        <div key={step} style={{ height: 2, flex: 1, borderRadius: 1, background: done ? '#1D9E75' : 'var(--color-bg-muted)' }} />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      <button className="btn-primary" style={{ width: '100%', marginTop: 4 }}
        onClick={() => navigate(`/card/${patternId}/easy/1`)}>
        Start pattern →
      </button>
    </div>
  )
}
