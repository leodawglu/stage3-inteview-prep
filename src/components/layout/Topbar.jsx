import { Link, useNavigate } from 'react-router-dom'
import { CONFIDENCE_MODES } from '../../constants'

export default function Topbar({ mode, onModeChange, profile }) {
  const navigate = useNavigate()

  return (
    <div className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Link to="/home" style={{ textDecoration: 'none' }}>
          <span className="topbar-logo">prep.dev</span>
        </Link>
      </div>

      <div className="topbar-right">
        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-3)' }}>Mode:</span>

        {[
          { key: CONFIDENCE_MODES.GUIDED,    label: 'Guided' },
          { key: CONFIDENCE_MODES.PRACTICE,  label: 'Practice' },
          { key: CONFIDENCE_MODES.INTERVIEW, label: 'Interview' },
        ].map(({ key, label }) => (
          <button
            key={key}
            className={`mode-btn ${key}${mode === key ? ' active' : ''}`}
            onClick={() => onModeChange(key)}
          >
            {label}
          </button>
        ))}

        <button className="tb-btn" onClick={() => navigate('/dashboard')}
          style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
          Dashboard
        </button>

        <button className="tb-btn" onClick={() => navigate('/settings')}
          style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
          Settings
        </button>

        {profile && (
          <div
            className="profile-av"
            style={{ background: '#EEEDFE', color: '#3C3489' }}
            onClick={() => navigate('/')}
            title={`${profile.name} — switch profile`}
          >
            {profile.initials}
          </div>
        )}
      </div>
    </div>
  )
}
