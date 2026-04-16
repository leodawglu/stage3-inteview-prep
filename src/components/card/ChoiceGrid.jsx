// Easy / Medium: A/B/C radio-style buttons
function EasyMediumChoices({ choices, selected, onSelect, revealed, isGuided }) {
  const display = isGuided ? choices.filter(c => c.type !== 'wrong').slice(0, 2) : choices

  return (
    <div>
      {display.map((c, i) => {
        let cls = 'choice-btn'
        if (revealed) {
          cls += c.type === 'correct' ? ' correct' : c.type === 'plausible' ? ' plausible' : ' wrong'
        } else if (selected === i) {
          cls += ' selected'
        }

        return (
          <div key={c.id}>
            <button
              className={cls}
              onClick={() => !revealed && onSelect(i)}
              disabled={revealed}
            >
              {c.id}) {c.text}
            </button>
            {revealed && c.explanation && (
              <div className="why-note" style={{
                background: c.type === 'correct' ? '#E1F5EE' : c.type === 'plausible' ? '#FEF9E7' : '#FCEBEB',
                color:      c.type === 'correct' ? '#085041' : c.type === 'plausible' ? '#633806' : '#791F1F',
              }}>
                {c.explanation}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// Hard: 2-column mix-and-match
function MixMatchChoices({ part1, part2, sel1, sel2, onSel1, onSel2, revealed }) {
  const renderCol = (col, sel, onSel) => (
    <div className="mm-col">
      <div className="mm-col-title">{col.label}</div>
      {col.options.map((opt, i) => {
        let cls = 'mm-opt'
        if (revealed) {
          cls += opt.correct ? ' mm-correct' : ' mm-wrong'
        } else if (sel === i) {
          cls += ' mm-selected'
        }
        return (
          <button key={opt.id} className={cls} onClick={() => !revealed && onSel(i)} disabled={revealed}>
            {opt.text}
          </button>
        )
      })}
    </div>
  )

  return (
    <div className="mm-grid">
      {renderCol(part1, sel1, onSel1)}
      {renderCol(part2, sel2, onSel2)}
    </div>
  )
}

export default function ChoiceGrid({
  card, difficulty,
  selected, mm1, mm2,
  onSelect, onMM1, onMM2,
  revealed, isGuided,
  onSubmit, canSubmit,
}) {
  const isHard = difficulty === 'hard'

  return (
    <div>
      <div className="slabel">What approach?</div>

      {isHard ? (
        <>
          <p style={{ fontSize: '0.78rem', color: 'var(--color-text-2)', marginBottom: 8 }}>
            Pick one from each column — identify both the traversal strategy and the tracking structure.
          </p>
          <MixMatchChoices
            part1={card.choices.hard_part1}
            part2={card.choices.hard_part2}
            sel1={mm1} sel2={mm2}
            onSel1={onMM1} onSel2={onMM2}
            revealed={revealed}
          />
        </>
      ) : (
        <EasyMediumChoices
          choices={card.choices.easy_medium}
          selected={selected}
          onSelect={onSelect}
          revealed={revealed}
          isGuided={isGuided}
        />
      )}

      {!revealed && (
        <button
          className="btn-primary"
          style={{ marginTop: 6 }}
          onClick={onSubmit}
          disabled={!canSubmit}
        >
          Check answer
        </button>
      )}
    </div>
  )
}
