import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PATTERNS } from '../constants/patterns'
import { getPatternProgress, getStreak } from '../adapters/localAdapter'

export default function Home({ profileId }) {
  const navigate = useNavigate()
  const [progresses, setProgresses] = useState({})
  const [streak, setStreak] = useState({ current: 0, longest: 0 })

  useEffect(() => {
    if (!profileId) return
    const p = {}
    PATTERNS.forEach(pat => {
      const cardIds = ['easy', 'medium', 'hard'].flatMap((d, di) =>
        [1, 2, 3].map(i => `${pat.slug.replace('sliding-window', 'sw').replace('two-pointers','tp').replace('trees-graphs','tg').replace('dynamic-programming','dp').replace('linked-lists','ll').replace('binary-search','bs').replace('backtracking','bt').replace('heap-priority-queue','hq').replace('stack-monotonic','sm').replace('string-manipulation','st')}-${d[0]}-0${i}`)
      )
      p[pat.id] = getPatternProgress(profileId, pat.id, cardIds)
    })
    setProgresses(p)
    setStreak(getStreak(profileId) || { current: 0, longest: 0 })
  }, [profileId])

  const totalCompleted = Object.values(progresses).reduce((s, p) => s + (p?.cardsCompleted || 0), 0)
  const patternsStarted = Object.values(progresses).filter(p => p?.cardsCompleted > 0).length

  return (
    <div className="page-wrap fade-up">
      {/* Greeting */}
      <div style={{ marginBottom: 14 }}>
        <h2 style={{ marginBottom: 4 }}>Good morning</h2>
        <p>You've completed {totalCompleted} of 90 cards — keep going.</p>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 14 }}>
        <div className="stat-card">
          <div className="stat-value">{totalCompleted}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#BA7517' }}>{streak.current}</div>
          <div className="stat-label">Day streak</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#1D9E75' }}>{patternsStarted}</div>
          <div className="stat-label">Patterns started</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#534AB7' }}>
            {totalCompleted > 0 ? Math.round(
              Object.values(progresses).filter(p => p?.masteryScore != null)
                .reduce((s, p) => s + p.masteryScore, 0) /
              Math.max(1, Object.values(progresses).filter(p => p?.masteryScore != null).length)
            ) : '—'}%
          </div>
          <div className="stat-label">Avg mastery</div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        <button className="btn-primary" onClick={() => navigate('/session')}>+ New session</button>
        <button onClick={() => navigate('/review')}>Practice more</button>
        <button onClick={() => navigate('/chapter/sliding-window')}>Continue: Sliding Window →</button>
      </div>

      {/* Pattern grid */}
      <div style={{ fontSize: '0.85rem', fontWeight: 500, marginBottom: 8 }}>All patterns</div>
      <div className="grid-2">
        {PATTERNS.map(pat => {
          const prog = progresses[pat.id] || { masteryScore: null, cardsCompleted: 0 }
          const pct = prog.masteryScore ?? 0
          const barColor = pct > 60 ? '#1D9E75' : pct > 30 ? '#BA7517' : '#378ADD'
          const eCompleted = Math.min(3, prog.cardsCompleted)
          const mCompleted = Math.min(3, Math.max(0, prog.cardsCompleted - 3))
          const hCompleted = Math.min(3, Math.max(0, prog.cardsCompleted - 6))
          return (
            <div key={pat.id} className="card" style={{ cursor: 'pointer', marginBottom: 0 }}
              onClick={() => navigate(`/chapter/${pat.id}`)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>{pat.name}</span>
                <span style={{ fontSize: '0.72rem', color: barColor }}>{prog.masteryScore != null ? `${prog.masteryScore}%` : '—'}</span>
              </div>
              <div style={{ display: 'flex', gap: 4, marginBottom: 5, alignItems: 'center' }}>
                {['E', 'M', 'H'].map((l, i) => {
                  const cnt = [eCompleted, mCompleted, hCompleted][i]
                  return (
                    <div key={l} className="ring" style={{
                      width: 18, height: 18, borderRadius: '50%',
                      border: `2px solid ${cnt === 3 ? '#1D9E75' : cnt > 0 ? '#BA7517' : 'var(--color-border)'}`,
                      background: cnt === 3 ? '#E1F5EE' : cnt > 0 ? '#FEF9E7' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.6rem', fontWeight: 500,
                      color: cnt === 3 ? '#085041' : cnt > 0 ? '#633806' : 'var(--color-text-3)',
                    }}>{l}</div>
                  )
                })}
                <span style={{ fontSize: '0.68rem', color: 'var(--color-text-3)', marginLeft: 2 }}>
                  {prog.cardsCompleted}/9
                </span>
              </div>
              <div className="mastery-bar-track">
                <div className="mastery-bar-fill" style={{ width: `${pct}%`, background: barColor }} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Practice more nudge */}
      <div style={{ marginTop: 12, background: 'var(--color-bg)', border: '0.5px solid #BA7517', borderRadius: 'var(--r-lg)', padding: '10px 13px' }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 500, color: '#633806', marginBottom: 3 }}>
          Cards ready for another look
        </div>
        <div style={{ fontSize: '0.75rem', color: '#8B5E0A', marginBottom: 7 }}>
          Based on your progress, some cards may benefit from another attempt.
        </div>
        <button style={{ fontSize: '0.75rem', padding: '5px 12px', background: '#FEF9E7', border: '0.5px solid #BA7517', color: '#633806', borderRadius: 'var(--r-md)' }}
          onClick={() => navigate('/review')}>
          Start review session →
        </button>
      </div>
    </div>
  )
}
