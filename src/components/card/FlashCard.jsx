import { useNavigate } from 'react-router-dom'
import { CARD_STEPS, CONFIDENCE_MODES, DIFFICULTIES } from '../../constants'
import ConceptBlock from './ConceptBlock'
import ChoiceGrid from './ChoiceGrid'
import SayOutLoud from './SayOutLoud'
import CodeReveal from './CodeReveal'
import NotesPad from './NotesPad'
import Modifications from './Modifications'
import MasteryScore from './MasteryScore'

const STEP_LABELS = {
  [CARD_STEPS.PROBLEM]:      '1 — Problem',
  [CARD_STEPS.SELECT]:       '2 — Approach',
  [CARD_STEPS.SAY_APPROACH]: '3a — Say it',
  [CARD_STEPS.CHECK]:        '3b — Check',
  [CARD_STEPS.CODE]:         '4 — Code',
  [CARD_STEPS.SUMMARY]:      '5 — Summary',
  [CARD_STEPS.TITLE_MODS]:   '6 — Reveal',
}

function StepDots({ current }) {
  return (
    <div className="step-dots">
      {Object.values(CARD_STEPS).map(s => (
        <div key={s}
          className={`step-dot${s < current ? ' done' : s === current ? ' active' : ''}`} />
      ))}
      <span style={{ fontSize: '0.65rem', color: 'var(--color-text-3)', marginLeft: 4 }}>
        {current}/7
      </span>
    </div>
  )
}

function TimerRow({ timer, onHide }) {
  if (timer.hidden) return null
  const solCls = timer.solvingUrgency === 'red' ? 'timer-red'
               : timer.solvingUrgency === 'amber' ? 'timer-amber' : 'timer-normal'
  return (
    <div className="timer-row">
      <span className="timer-pill timer-reading">Reading: {timer.readingFormatted}</span>
      {timer.solvingActive && (
        <span className={`timer-pill ${solCls}`}>Solving: {timer.solvingFormatted}</span>
      )}
      <button className="timer-hide-btn" onClick={onHide}>hide</button>
    </div>
  )
}

function DifficultyRow({ current, onChange }) {
  return (
    <div className="diff-row">
      {[DIFFICULTIES.EASY, DIFFICULTIES.MEDIUM, DIFFICULTIES.HARD].map(d => (
        <button key={d}
          className={`diff-btn ${d}${current === d ? ' active' : ''}`}
          onClick={() => onChange(d)}
        >
          {d[0].toUpperCase()}
        </button>
      ))}
    </div>
  )
}

export default function FlashCard({
  card, patternId, difficulty, cardIndex, totalCards,
  mode, settings, timer, cardState,
  onDifficultyChange, onComplete, onNext, onBack,
}) {
  const navigate = useNavigate()
  const isGuided   = mode === CONFIDENCE_MODES.GUIDED
  const isPractice = mode === CONFIDENCE_MODES.PRACTICE
  const isInterview = mode === CONFIDENCE_MODES.INTERVIEW
  const isHard     = difficulty === DIFFICULTIES.HARD
  const step       = cardState.step

  // ── helpers ──────────────────────────────────────────────────────────────
  const advance = (s) => cardState.advanceTo(s)

  const handleSubmitAnswer = () => {
    advance(CARD_STEPS.SAY_APPROACH)
  }

  const handleCodeReveal = () => {
    if (!timer.solvingActive) timer.startSolving(isInterview ? 120000 : null)
    advance(CARD_STEPS.CODE)
  }

  const handleComplete = () => {
    timer.stopAll()
    const attempt = {
      firstChoiceCorrect: isHard
        ? (cardState.mm1 === card.choices.hard_part1?.options.findIndex(o => o.correct) &&
           cardState.mm2 === card.choices.hard_part2?.options.findIndex(o => o.correct))
        : (card.choices.easy_medium?.[cardState.selectedChoice]?.type === 'correct'),
      incorrectAttempts: 0,
      solRating: cardState.solRating,
      timerExpired: timer.expired,
      modificationViewed: cardState.modOpen,
      notes: cardState.notes,
    }
    onComplete(attempt)
    advance(CARD_STEPS.TITLE_MODS)
  }

  const canSubmit = isHard ? cardState.canAdvanceFromHardSelect : cardState.canAdvanceFromSelect

  // ── keyword rendering ─────────────────────────────────────────────────────
  function renderProblemText(text, keywords) {
    if (!isGuided || !keywords?.length) return <span>{text}</span>

    let result = text
    const parts = []
    let lastIndex = 0

    // Sort keywords by position in text
    const positions = keywords
      .map(kw => ({ ...kw, idx: text.toLowerCase().indexOf(kw.word.toLowerCase()) }))
      .filter(kw => kw.idx >= 0)
      .sort((a, b) => a.idx - b.idx)

    positions.forEach(kw => {
      if (kw.idx > lastIndex) parts.push(text.slice(lastIndex, kw.idx))
      parts.push(
        <span key={kw.idx}>
          <span className="kw">{text.slice(kw.idx, kw.idx + kw.word.length)}</span>
          {isGuided && <span className="kw-lbl">{kw.explanation}</span>}
        </span>
      )
      lastIndex = kw.idx + kw.word.length
    })
    if (lastIndex < text.length) parts.push(text.slice(lastIndex))
    return <>{parts}</>
  }

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="card fade-up">
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span className="badge" style={{
            background: difficulty === 'easy' ? '#E1F5EE' : difficulty === 'medium' ? '#FEF9E7' : '#FCEBEB',
            color:      difficulty === 'easy' ? '#085041' : difficulty === 'medium' ? '#633806' : '#791F1F',
          }}>
            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
          </span>
          <DifficultyRow current={difficulty} onChange={onDifficultyChange} />
          <span style={{ fontSize: '0.7rem', color: 'var(--color-text-3)' }}>
            Card {cardIndex} of {totalCards}
          </span>
          {card.conceptTags?.map(tag => (
            <span key={tag} className="badge" style={{ background: '#EEEDFE', color: '#3C3489', fontSize: '0.65rem' }}>
              {tag}
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <StepDots current={step} />
          {step > CARD_STEPS.PROBLEM && (
            <button className="tb-btn" style={{ fontSize: '0.7rem', padding: '2px 8px' }}
              onClick={() => advance(step - 1)}>← back</button>
          )}
        </div>
      </div>

      {/* Timer */}
      {!isGuided && (
        <TimerRow timer={timer} onHide={() => timer.hideTimer?.() } />
      )}

      {/* Title hidden/revealed */}
      {step < CARD_STEPS.TITLE_MODS ? (
        <div className="title-hidden">??? — title revealed at the end</div>
      ) : (
        <div className="title-revealed">
          <div className="title-revealed-label">Problem name:</div>
          <div className="title-revealed-name">{card.id.replace(/-/g, ' ').replace(/[a-z0-9]+ [a-z]+[0-9]+ [0-9]+/i, '')}
            {/* actual title comes from a separate field in full implementation */}
          </div>
        </div>
      )}

      {/* ── STEP 1: Problem ── */}
      {step === CARD_STEPS.PROBLEM && (
        <>
          <div className="prob-box">
            {renderProblemText(card.problem.text, card.problem.keywords)}
            {!isInterview && card.problem.hasMissingConstraints && (
              <div style={{ marginTop: 5 }}>
                <span className="mis-tag" style={{ fontSize: '0.72rem' }}>⚠ missing constraints — see below</span>
              </div>
            )}
          </div>

          {!isInterview && (
            <>
              {card.concepts?.length > 0 && (
                <>
                  <div className="slabel">Concept check</div>
                  {card.concepts.map((c, i) => (
                    <ConceptBlock
                      key={i}
                      concept={c}
                      alwaysOpen={isGuided || !settings.hideConcepts}
                      open={isGuided || !settings.hideConcepts || cardState.conceptsOpen[i]}
                      onToggle={() => cardState.toggleConcept(i)}
                    />
                  ))}
                </>
              )}

              <div className="slabel">Missing constraints — ask before coding</div>
              {isGuided || !settings.hideMissing ? (
                card.problem.hasMissingConstraints ? (
                  <div className="missing-box">
                    {card.problem.missingConstraints.map((m, i) => (
                      <div key={i} className="missing-item">{m}</div>
                    ))}
                  </div>
                ) : (
                  <div className="missing-none">
                    No missing constraints — problem is fully specified. Confirm assumptions with the interviewer.
                  </div>
                )
              ) : (
                <div>
                  <div className="coll-header"
                    style={{ borderRadius: cardState.missingOpen ? '8px 8px 0 0' : undefined }}
                    onClick={cardState.toggleMissing}>
                    <span>{cardState.missingOpen ? 'Missing constraints' : 'Think first — what\'s missing? Then reveal'}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-3)' }}>
                      {cardState.missingOpen ? '▲' : '▼ reveal'}
                    </span>
                  </div>
                  {cardState.missingOpen && (
                    <div className="coll-body">
                      {card.problem.hasMissingConstraints ? (
                        <div className="missing-box" style={{ border: 'none', padding: 0 }}>
                          {card.problem.missingConstraints.map((m, i) => (
                            <div key={i} className="missing-item">{m}</div>
                          ))}
                        </div>
                      ) : (
                        <div className="missing-none" style={{ border: 'none' }}>
                          No missing constraints — problem is fully specified.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          <NotesPad
            value={cardState.notes}
            onChange={cardState.updateNotes}
            scaffold={card.guidedScaffold}
            isGuided={isGuided}
          />

          <button className="btn-primary btn-full" style={{ marginTop: 10 }}
            onClick={() => { timer.startSolving(); advance(CARD_STEPS.SELECT) }}>
            I'm ready — start solving →
          </button>
        </>
      )}

      {/* ── STEP 2: Select approach ── */}
      {step === CARD_STEPS.SELECT && (
        <>
          <div className="prob-box" style={{ marginBottom: 8 }}>
            {card.problem.keywords.map(kw => (
              <span key={kw.word} className="kw" style={{ marginRight: 4 }}>{kw.word}</span>
            ))}
          </div>

          <ChoiceGrid
            card={card}
            difficulty={difficulty}
            selected={cardState.selectedChoice}
            mm1={cardState.mm1} mm2={cardState.mm2}
            onSelect={cardState.selectChoice}
            onMM1={cardState.selectMM1} onMM2={cardState.selectMM2}
            revealed={false}
            isGuided={isGuided}
            onSubmit={handleSubmitAnswer}
            canSubmit={canSubmit}
          />

          <NotesPad value={cardState.notes} onChange={cardState.updateNotes} isGuided={false} />
        </>
      )}

      {/* ── STEP 3a: Say approach ── */}
      {step === CARD_STEPS.SAY_APPROACH && (
        <>
          <div className="slabel">Say your approach out loud — before seeing if you're right</div>
          <SayOutLoud
            text={card.sayApproach}
            type="approach"
            isGuided={isGuided}
            open={cardState.approachModelOpen}
            onToggle={cardState.toggleApproachModel}
          />
          <NotesPad value={cardState.notes} onChange={cardState.updateNotes} isGuided={false} />
          <button className="btn-ghost btn-full" style={{ marginTop: 8 }}
            onClick={() => advance(CARD_STEPS.CHECK)}>
            See if I was right →
          </button>
        </>
      )}

      {/* ── STEP 3b: Check answer ── */}
      {step === CARD_STEPS.CHECK && (
        <>
          <div className="slabel">Answer</div>
          <ChoiceGrid
            card={card} difficulty={difficulty}
            selected={cardState.selectedChoice}
            mm1={cardState.mm1} mm2={cardState.mm2}
            onSelect={() => {}} onMM1={() => {}} onMM2={() => {}}
            revealed={true}
            isGuided={isGuided}
            onSubmit={() => {}} canSubmit={false}
          />
          <NotesPad value={cardState.notes} onChange={cardState.updateNotes} isGuided={false} />
          <button className="btn-ghost btn-full" style={{ marginTop: 8 }}
            onClick={handleCodeReveal}>
            Reveal code →
          </button>
        </>
      )}

      {/* ── STEP 4: Code + narrate ── */}
      {step === CARD_STEPS.CODE && (
        <>
          <div className="slabel">Write + narrate — as if coding live in an interview</div>
          <CodeReveal lines={card.code.lines} showNarration={!isInterview} />
          <div className="complexity-row">
            <span className="complexity-pill" style={{ background: '#E1F5EE', color: '#085041' }}>
              Time: {card.complexity.time}
            </span>
            <span className="complexity-pill" style={{ background: '#E8F0FB', color: '#0C447C' }}>
              Space: {card.complexity.space}
            </span>
          </div>
          <NotesPad value={cardState.notes} onChange={cardState.updateNotes} isGuided={false} />
          <button className="btn-ghost btn-full" style={{ marginTop: 8 }}
            onClick={() => advance(CARD_STEPS.SUMMARY)}>
            Verbal summary →
          </button>
        </>
      )}

      {/* ── STEP 5: Verbal summary + rating ── */}
      {step === CARD_STEPS.SUMMARY && (
        <>
          <div className="slabel">Say out loud — final summary to the interviewer</div>
          <SayOutLoud
            text={card.verbalSummary}
            type="summary"
            isGuided={isGuided}
            open={cardState.summaryModelOpen}
            onToggle={cardState.toggleSummaryModel}
          />

          <div className="slabel">How did I do?</div>
          <div className="criteria-list">
            {card.solRatingCriteria.map((c, i) => (
              <div key={i} className="criteria-item">{c}</div>
            ))}
          </div>

          <div className="rating-row">
            {[
              { val: 1, label: 'Covered most',  sub: 'missed 1–2 points' },
              { val: 2, label: 'Covered all',   sub: 'hit every bullet'  },
              { val: 3, label: 'Nailed it',     sub: 'fluent, no pause'  },
            ].map(r => (
              <button key={r.val}
                className={`rating-btn${cardState.solRating === r.val ? ' selected' : ''}`}
                onClick={() => cardState.setRating(r.val)}>
                {r.label}<br />
                <span style={{ fontSize: '0.68rem', opacity: 0.7 }}>{r.sub}</span>
              </button>
            ))}
          </div>

          <NotesPad value={cardState.notes} onChange={cardState.updateNotes} isGuided={false} />

          <button
            className="btn-ghost btn-full"
            style={{ marginTop: 8 }}
            onClick={handleComplete}
          >
            Reveal problem name →
          </button>
        </>
      )}

      {/* ── STEP 6: Title + mastery + mods ── */}
      {step === CARD_STEPS.TITLE_MODS && (
        <>
          {/* Mastery score breakdown — shown with the attempt data */}
          {onComplete._lastAttempt && (
            <>
              <div className="slabel">Mastery score</div>
              <MasteryScore attempt={onComplete._lastAttempt} />
            </>
          )}

          <Modifications modifications={card.modifications} />

          <NotesPad value={cardState.notes} onChange={cardState.updateNotes} isGuided={false} />

          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button className="btn-ghost" style={{ flex: 1 }}
              onClick={() => navigate(`/chapter/${patternId}`)}>
              Back to chapter
            </button>
            <button className="btn-green" style={{ flex: 1 }} onClick={onNext}>
              Next card →
            </button>
          </div>
        </>
      )}
    </div>
  )
}
