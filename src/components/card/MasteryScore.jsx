import { MASTERY_WEIGHTS } from '../../constants'

const W = MASTERY_WEIGHTS

export default function MasteryScore({ attempt }) {
  if (!attempt) return null

  const rows = [
    { label: 'First choice correct',  pts: W.FIRST_CHOICE_CORRECT, earned: attempt.firstChoiceCorrect },
    { label: 'Verbal rating × 20',    pts: attempt.solRating === 3 ? W.SOL_RATING_3 : attempt.solRating === 2 ? W.SOL_RATING_2 : 0, earned: attempt.solRating >= 2 },
    { label: 'Solved on first try',   pts: W.SINGLE_ATTEMPT,       earned: attempt.incorrectAttempts === 0 },
    { label: 'Timer not expired',     pts: W.TIMER_NOT_EXPIRED,     earned: !attempt.timerExpired },
    { label: 'Viewed modification',   pts: W.MODIFICATION_VIEWED,   earned: attempt.modificationViewed },
  ]

  const total = rows.reduce((s, r) => s + (r.earned ? r.pts : 0), 0)
  const barColor = total >= 70 ? '#1D9E75' : total >= 40 ? '#BA7517' : '#378ADD'

  return (
    <div className="mastery-wrap">
      {rows.map((r, i) => (
        <div key={i} className="mastery-row">
          <div className="mastery-check"
            style={{ background: r.earned ? '#E1F5EE' : '#FCEBEB', color: r.earned ? '#085041' : '#791F1F' }}>
            {r.earned ? '✓' : '–'}
          </div>
          <span style={{ flex: 1, fontSize: '0.78rem', color: 'var(--color-text-2)' }}>{r.label}</span>
          <span style={{ fontSize: '0.78rem', fontWeight: 500, color: r.earned ? '#1D9E75' : 'var(--color-text-3)' }}>
            +{r.pts}
          </span>
        </div>
      ))}

      <div className="mastery-total-row">
        <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>Mastery score</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="mastery-bar-outer">
            <div className="mastery-bar-inner" style={{ width: `${total}%`, background: barColor }} />
          </div>
          <span style={{ fontSize: '1rem', fontWeight: 500, color: barColor }}>{total}</span>
        </div>
      </div>
    </div>
  )
}
