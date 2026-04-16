import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PATTERNS } from '../constants/patterns'
import { getCardStats } from '../adapters/localAdapter'

const DIFFS = ['easy', 'medium', 'hard']

function cardSlug(patId) {
  return { 'sliding-window':'sw','two-pointers':'tp','trees-graphs':'tg','dynamic-programming':'dp','linked-lists':'ll','binary-search':'bs','backtracking':'bt','heap-priority-queue':'hq','stack-monotonic':'sm','string-manipulation':'st' }[patId] || patId
}

function daysSince(dateStr) {
  if (!dateStr) return 999
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
}

export default function ReviewSession({ profileId }) {
  const navigate = useNavigate()
  const [queue, setQueue] = useState([])

  useEffect(() => {
    if (!profileId) return
    const cards = []

    PATTERNS.forEach(pat => {
      DIFFS.forEach(d => [1,2,3].forEach(i => {
        const id = `${cardSlug(pat.id)}-${d[0]}-0${i}`
        const s = getCardStats(profileId, id)
        if (!s) return

        const days = daysSince(s.lastAttemptDate)
        let reason = null

        if (s.practiceMoreFlag) {
          reason = 'Incorrect on 2 consecutive attempts — worth another look'
        } else if (days >= 7 && (s.masteryScore ?? 100) < 80) {
          reason = `Not attempted in ${days} days`
        } else if (s.avgSolRating <= 1 && s.timesCompleted >= 2) {
          reason = 'Verbal explanation needs more practice'
        }

        if (reason) {
          cards.push({
            id, patternId: pat.id, difficulty: d, index: i,
            patternName: pat.name, reason,
            lastAttemptDate: s.lastAttemptDate,
            masteryScore: s.masteryScore,
            days,
          })
        }
      }))
    })

    // Sort: practiceMoreFlag first, then by days stale, cap at 5
    cards.sort((a, b) => {
      if (a.reason.includes('consecutive') && !b.reason.includes('consecutive')) return -1
      if (!a.reason.includes('consecutive') && b.reason.includes('consecutive')) return 1
      return b.days - a.days
    })

    setQueue(cards.slice(0, 5))
  }, [profileId])

  return (
    <div className="page-wrap fade-up">
      <h2 style={{ marginBottom: 4 }}>Practice more</h2>
      <p style={{ marginBottom: 14 }}>
        {queue.length > 0
          ? `${queue.length} card${queue.length > 1 ? 's' : ''} selected to help you grow — based on your recent activity.`
          : 'No cards flagged right now — you\'re on top of everything!'}
      </p>

      {queue.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '24px' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>✓</div>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>All caught up</div>
          <p style={{ fontSize: '0.78rem' }}>Complete more cards and come back to see what needs revisiting.</p>
        </div>
      )}

      {queue.map((c, i) => (
        <div key={c.id}
          className="card"
          style={{ cursor: 'pointer', marginBottom: 8, borderColor: '#BA7517' }}
          onClick={() => navigate(`/card/${c.patternId}/${c.difficulty}/${c.index}`)}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontWeight: 500, fontSize: '0.85rem' }}>{c.patternName}</span>
            <span className="badge" style={{
              background: c.difficulty === 'easy' ? '#E1F5EE' : c.difficulty === 'medium' ? '#FEF9E7' : '#FCEBEB',
              color:      c.difficulty === 'easy' ? '#085041' : c.difficulty === 'medium' ? '#633806' : '#791F1F',
            }}>
              {c.difficulty.charAt(0).toUpperCase() + c.difficulty.slice(1)} {c.index}
            </span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#8B5E0A' }}>{c.reason}</div>
          {c.lastAttemptDate && (
            <div style={{ fontSize: '0.68rem', color: 'var(--color-text-3)', marginTop: 2 }}>
              Last attempted: {c.days === 0 ? 'today' : c.days === 1 ? 'yesterday' : `${c.days} days ago`}
            </div>
          )}
        </div>
      ))}

      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        {queue.length > 0 && (
          <button className="btn-primary"
            onClick={() => navigate(`/card/${queue[0].patternId}/${queue[0].difficulty}/${queue[0].index}`)}>
            Start review →
          </button>
        )}
        <button onClick={() => navigate('/home')}>Back to home</button>
      </div>
    </div>
  )
}
