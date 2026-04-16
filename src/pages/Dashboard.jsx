import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PATTERNS } from '../constants/patterns'
import { getCardStats, getStreak } from '../adapters/localAdapter'

const DIFFS = ['easy', 'medium', 'hard']

function cardSlug(patId) {
  return { 'sliding-window':'sw','two-pointers':'tp','trees-graphs':'tg','dynamic-programming':'dp','linked-lists':'ll','binary-search':'bs','backtracking':'bt','heap-priority-queue':'hq','stack-monotonic':'sm','string-manipulation':'st' }[patId] || patId
}

export default function Dashboard({ profileId }) {
  const navigate = useNavigate()
  const [masteries, setMasteries] = useState({})
  const [streak, setStreak] = useState({ current: 0, longest: 0 })
  const [totals, setTotals] = useState({ completed: 0, correct1st: 0, studyMs: 0, avgRating: 0 })

  useEffect(() => {
    if (!profileId) return
    const m = {}
    let totalCompleted = 0, totalCorrect = 0, totalMs = 0, ratingSum = 0, ratingCount = 0

    PATTERNS.forEach(pat => {
      const scores = []
      DIFFS.forEach(d => [1,2,3].forEach(i => {
        const id = `${cardSlug(pat.id)}-${d[0]}-0${i}`
        const s = getCardStats(profileId, id)
        if (s) {
          if (s.timesCompleted > 0) totalCompleted++
          if (s.timesCorrectFirstTry > 0) totalCorrect++
          totalMs += s.avgSolvingTimeMs * s.timesCompleted
          if (s.avgSolRating) { ratingSum += s.avgSolRating; ratingCount++ }
          if (s.masteryScore != null) scores.push(s.masteryScore)
        }
      }))
      m[pat.id] = scores.length ? Math.round(scores.reduce((a,b)=>a+b,0)/scores.length) : null
    })

    setMasteries(m)
    setStreak(getStreak(profileId) || { current: 0, longest: 0 })
    setTotals({
      completed: totalCompleted,
      correct1st: totalCompleted > 0 ? Math.round(totalCorrect / totalCompleted * 100) : 0,
      studyMs: totalMs,
      avgRating: ratingCount > 0 ? (ratingSum / ratingCount).toFixed(1) : '—',
    })
  }, [profileId])

  const fmtTime = ms => {
    const h = Math.floor(ms / 3600000)
    const m = Math.floor((ms % 3600000) / 60000)
    return h > 0 ? `${h}h ${m}m` : `${m}m`
  }

  const sortedPatterns = [...PATTERNS].sort((a,b) => (masteries[b.id] || 0) - (masteries[a.id] || 0))
  const strongest = sortedPatterns.find(p => masteries[p.id] != null)
  const growthOpp = [...sortedPatterns].reverse().find(p => masteries[p.id] != null)

  return (
    <div className="page-wrap fade-up">
      <h2 style={{ marginBottom: 14 }}>Your progress</h2>

      {/* Growth insights */}
      <div className="grid-2" style={{ marginBottom: 10 }}>
        <div className="card" style={{ margin: 0 }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 500, marginBottom: 8 }}>Growth highlights</div>
          {strongest && (
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-2)', margin: '4px 0', paddingLeft: 14, position: 'relative' }}>
              <span style={{ position: 'absolute', left: 0, color: '#1D9E75', fontSize: '0.7rem' }}>↑</span>
              Strongest area: {strongest.name}
            </div>
          )}
          {growthOpp && growthOpp.id !== strongest?.id && (
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-2)', margin: '4px 0', paddingLeft: 14, position: 'relative' }}>
              <span style={{ position: 'absolute', left: 0, color: '#BA7517', fontSize: '0.7rem' }}>→</span>
              Growth opportunity: {growthOpp.name}
            </div>
          )}
          {totals.completed === 0 && (
            <p style={{ fontSize: '0.78rem' }}>Complete some cards to see your growth highlights.</p>
          )}
        </div>

        <div className="card" style={{ margin: 0 }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 500, marginBottom: 8 }}>Mastery by pattern</div>
          {PATTERNS.slice(0, 6).map(pat => {
            const pct = masteries[pat.id] ?? 0
            const bar = pct > 60 ? '#1D9E75' : pct > 30 ? '#BA7517' : '#378ADD'
            return (
              <div key={pat.id} style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-2)', minWidth: 80 }}>
                  {pat.name.split(' ')[0]}
                </span>
                <div style={{ flex: 1, height: 5, background: 'var(--color-bg-muted)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: bar, borderRadius: 3, transition: 'width 0.5s' }} />
                </div>
                <span style={{ fontSize: '0.68rem', color: 'var(--color-text-3)', minWidth: 28, textAlign: 'right' }}>
                  {masteries[pat.id] != null ? `${pct}%` : '—'}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Streak + stats */}
      <div className="grid-2" style={{ marginBottom: 10 }}>
        <div className="card" style={{ margin: 0 }}>
          <div style={{ textAlign: 'center', background: '#FEF9E7', border: '0.5px solid #BA7517', borderRadius: 'var(--r-md)', padding: 10, marginBottom: 10 }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 500, color: '#633806' }}>{streak.current}</div>
            <div style={{ fontSize: '0.72rem', color: '#8B5E0A' }}>
              {streak.current > 0 ? 'day streak — keep going' : 'start your streak today'}
            </div>
          </div>
          <div className="grid-2">
            {[
              { v: totals.completed, l: 'Cards completed' },
              { v: `${totals.correct1st}%`, l: 'First-try correct' },
              { v: totals.studyMs > 0 ? fmtTime(totals.studyMs) : '0m', l: 'Study time' },
              { v: totals.avgRating, l: 'Avg verbal rating' },
            ].map(({ v, l }) => (
              <div key={l} className="stat-card">
                <div className="stat-value" style={{ fontSize: '1.2rem' }}>{v}</div>
                <div className="stat-label">{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ margin: 0 }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 500, marginBottom: 8 }}>Friends activity</div>
          {[
            { i: 'AS', n: 'Alex S.',  a: 'Completed Trees & Graphs — Hard · 2h ago' },
            { i: 'MK', n: 'Maya K.',  a: '5-day streak · DP mastery improving' },
            { i: 'JL', n: 'James L.', a: 'Switched to Interview mode' },
          ].map(f => (
            <div key={f.n} className="friend-row">
              <div className="friend-av" style={{ background: '#EEEDFE', color: '#3C3489' }}>{f.i}</div>
              <div>
                <div className="friend-name">{f.n}</div>
                <div className="friend-act">{f.a}</div>
              </div>
            </div>
          ))}
          <button style={{ fontSize: '0.72rem', marginTop: 8, padding: '5px 12px' }}
            onClick={() => alert('Friend system coming in Phase 3')}>
            + Invite a friend
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn-primary" onClick={() => navigate('/session')}>New session</button>
        <button onClick={() => navigate('/review')}>Practice more</button>
        <button onClick={() => navigate('/home')}>Back to home</button>
      </div>
    </div>
  )
}
