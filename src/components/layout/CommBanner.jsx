import { CARD_STEPS } from '../../constants'

const STEPS = ['Clarify', 'State approach', 'Code + narrate', 'Test', 'Complexity']

const STEP_MAP = {
  [CARD_STEPS.PROBLEM]:      'Clarify',
  [CARD_STEPS.SELECT]:       'Clarify',
  [CARD_STEPS.SAY_APPROACH]: 'State approach',
  [CARD_STEPS.CHECK]:        'State approach',
  [CARD_STEPS.CODE]:         'Code + narrate',
  [CARD_STEPS.SUMMARY]:      'Complexity',
  [CARD_STEPS.TITLE_MODS]:   'Complexity',
}

export default function CommBanner({ currentStep }) {
  const active = STEP_MAP[currentStep] || 'Clarify'

  return (
    <div className="comm-banner">
      <span style={{ fontSize: '0.7rem', fontWeight: 500, color: '#534AB7', marginRight: 4 }}>
        Interview framework:
      </span>
      {STEPS.map((s, i) => (
        <span key={s}>
          <span className={`comm-step${active === s ? ' active' : ''}`}>{s}</span>
          {i < STEPS.length - 1 && (
            <span style={{ fontSize: '0.7rem', color: '#AFA9EC', margin: '0 2px' }}>→</span>
          )}
        </span>
      ))}
    </div>
  )
}
