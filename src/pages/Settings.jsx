import { useNavigate } from 'react-router-dom'

function Toggle({ on, onToggle }) {
  return (
    <div
      style={{
        width: 32, height: 18, borderRadius: 9,
        background: on ? '#534AB7' : 'var(--color-border-md)',
        cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0,
      }}
      onClick={onToggle}
    >
      <div style={{
        position: 'absolute', top: 2, left: 2, width: 14, height: 14,
        background: '#fff', borderRadius: '50%',
        transform: on ? 'translateX(14px)' : 'none',
        transition: 'transform 0.2s',
      }} />
    </div>
  )
}

function SettingRow({ title, desc, value, onToggle }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '10px 0', borderBottom: '0.5px solid var(--color-border)' }}>
      <div style={{ flex: 1, marginRight: 16 }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--color-text)' }}>{title}</div>
        <div style={{ fontSize: '0.72rem', color: 'var(--color-text-3)', marginTop: 2 }}>{desc}</div>
      </div>
      <Toggle on={value} onToggle={onToggle} />
    </div>
  )
}

export default function Settings({ settings, onUpdate, profile, onSwitchProfile }) {
  const navigate = useNavigate()

  return (
    <div className="page-wrap fade-up">
      <h2 style={{ marginBottom: 16 }}>Settings</h2>

      <div className="card" style={{ marginBottom: 10 }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 500, marginBottom: 8 }}>Card display</div>

        <SettingRow
          title="Concept check hidden by default"
          desc="Collapse concept blocks — tap to reveal per card. Promotes active recall."
          value={settings.hideConcepts}
          onToggle={() => onUpdate('hideConcepts', !settings.hideConcepts)}
        />
        <SettingRow
          title="Missing constraints hidden by default"
          desc="Think about what's missing before revealing — better interview preparation."
          value={settings.hideMissing}
          onToggle={() => onUpdate('hideMissing', !settings.hideMissing)}
        />
        <SettingRow
          title="Hide timer"
          desc="Remove reading and solving timers from the card view entirely."
          value={settings.hideTimer}
          onToggle={() => onUpdate('hideTimer', !settings.hideTimer)}
        />
      </div>

      <div className="card" style={{ marginBottom: 10 }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 500, marginBottom: 8 }}>Appearance</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--color-text-2)' }}>Dark mode:</span>
          {['system', 'light', 'dark'].map(v => (
            <button key={v}
              style={{
                fontSize: '0.75rem', padding: '4px 12px',
                background: settings.darkMode === v ? '#EEEDFE' : 'var(--color-bg-subtle)',
                borderColor: settings.darkMode === v ? '#534AB7' : 'var(--color-border)',
                color: settings.darkMode === v ? '#3C3489' : 'var(--color-text-2)',
                borderRadius: 'var(--r-pill)',
              }}
              onClick={() => onUpdate('darkMode', v)}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {profile && (
        <div className="card" style={{ marginBottom: 10 }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 500, marginBottom: 8 }}>Profile</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#EEEDFE', color: '#3C3489', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.82rem', fontWeight: 500, flexShrink: 0 }}>
              {profile.initials}
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{profile.name}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-3)' }}>Active profile</div>
            </div>
            <button style={{ marginLeft: 'auto', fontSize: '0.75rem' }} onClick={() => navigate('/')}>
              Switch profile
            </button>
          </div>
        </div>
      )}

      <div className="card">
        <div style={{ fontSize: '0.82rem', fontWeight: 500, marginBottom: 10 }}>Data</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button style={{ fontSize: '0.75rem' }} onClick={() => alert('Export feature coming in Phase 2')}>
            Export progress (JSON)
          </button>
          <button style={{ fontSize: '0.75rem' }} onClick={() => alert('Import feature coming in Phase 2')}>
            Import progress
          </button>
          <button
            style={{ fontSize: '0.75rem', borderColor: '#E24B4A', color: '#791F1F' }}
            onClick={() => {
              if (confirm('Reset all progress? This cannot be undone.')) {
                localStorage.clear()
                window.location.href = '/'
              }
            }}
          >
            Reset all progress
          </button>
        </div>
      </div>
    </div>
  )
}
