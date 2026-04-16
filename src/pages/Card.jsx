import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import FlashCard from '../components/card/FlashCard'
import CommBanner from '../components/layout/CommBanner'
import { useCardState } from '../hooks/useCardState'
import { useTimer } from '../hooks/useTimer'
import { useProgress } from '../hooks/useProgress'
import { CARD_STEPS } from '../constants'

export default function CardPage({ profileId, mode, settings }) {
  const { patternId, difficulty, index } = useParams()
  const navigate = useNavigate()
  const [cardData, setCardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [timerHidden, setTimerHidden] = useState(settings?.hideTimer || false)
  const lastAttemptRef = useRef(null)

  const idx = parseInt(index, 10) || 1
  const cardId = `${patternId.replace('sliding-window','sw').replace('two-pointers','tp').replace('trees-graphs','tg').replace('dynamic-programming','dp').replace('linked-lists','ll').replace('binary-search','bs').replace('backtracking','bt').replace('heap-priority-queue','hq').replace('stack-monotonic','sm').replace('string-manipulation','st')}-${difficulty[0]}-0${idx}`

  const cardState = useCardState(profileId, cardId)
  const timer = useTimer(timerHidden)
  const progress = useProgress(profileId)

  // Lazy-load card data
  useEffect(() => {
    setLoading(true)
    import(`../data/${patternId}.json`)
      .then(mod => {
        const data = mod.default || mod
        const card = data.cards.find(c => c.difficulty === difficulty && c.index === idx)
        setCardData(card || null)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [patternId, difficulty, idx])

  const handleComplete = (attempt) => {
    const full = {
      ...attempt,
      confidenceMode: mode,
      readingTimeMs: timer.readingMs,
      solvingTimeMs: timer.solvingMs,
      timerHidden,
      choiceSequence: [],
      notes: cardState.notes,
      missingConstraintsRevealed: cardState.missingOpen,
      conceptsRevealed: Object.entries(cardState.conceptsOpen)
        .filter(([, v]) => v).map(([k]) => `concept_${k}`),
      cardCompleted: true,
      date: new Date().toISOString().split('T')[0],
      dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
    }
    lastAttemptRef.current = full
    progress.recordAttempt(cardData, { ...full, confidenceMode: mode }, timer)
  }

  // Attach last attempt to onComplete for MasteryScore display
  handleComplete._lastAttempt = lastAttemptRef.current

  const handleNext = () => {
    cardState.reset()
    timer.reset()
    lastAttemptRef.current = null
    const nextIdx = idx + 1
    if (nextIdx <= 3) {
      navigate(`/card/${patternId}/${difficulty}/${nextIdx}`)
    } else {
      // Advance difficulty or go back to chapter
      const diffs = ['easy', 'medium', 'hard']
      const nextDiff = diffs[diffs.indexOf(difficulty) + 1]
      if (nextDiff) {
        navigate(`/card/${patternId}/${nextDiff}/1`)
      } else {
        navigate(`/chapter/${patternId}`)
      }
    }
  }

  const handleDifficultyChange = (newDiff) => {
    cardState.reset()
    timer.reset()
    navigate(`/card/${patternId}/${newDiff}/1`)
  }

  if (loading) {
    return (
      <div className="page-wrap">
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-3)' }}>
          Loading card...
        </div>
      </div>
    )
  }

  if (!cardData) {
    return (
      <div className="page-wrap">
        <p>Card not found: {cardId}</p>
        <button onClick={() => navigate(`/chapter/${patternId}`)}>Back to chapter</button>
      </div>
    )
  }

  return (
    <>
      <CommBanner currentStep={cardState.step} />
      <div className="page-wrap">
        <FlashCard
          card={cardData}
          patternId={patternId}
          difficulty={difficulty}
          cardIndex={idx}
          totalCards={3}
          mode={mode}
          settings={{ ...settings, hideTimer: timerHidden }}
          timer={{ ...timer, hidden: timerHidden, hideTimer: () => setTimerHidden(true) }}
          cardState={cardState}
          onDifficultyChange={handleDifficultyChange}
          onComplete={handleComplete}
          onNext={handleNext}
          onBack={() => navigate(`/chapter/${patternId}`)}
        />
      </div>
    </>
  )
}
