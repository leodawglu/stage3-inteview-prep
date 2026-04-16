import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MAX_LOCAL_PROFILES } from '../constants'

export default function ProfileSelector({ profiles, activeId, onSelect, onAdd }) {
  const navigate = useNavigate()
  const [newName, setNewName] = useState('')
  const [adding, setAdding] = useState(false)

  const AVATAR_COLORS = [
    { bg: '#EEEDFE', color: '#3C3489' },
    { bg: '#E1F5EE', color: '#085041' },
    { bg: '#E8F0FB', color: '#0C447C' },
    { bg: '#FEF9E7', color: '#633806' },
    { bg: '#FDE8F0', color: '#A0295A' },
  ]

  const handleContinue = (id) => {
    onSelect(id)
    navigate('/home')
  }

  const handleAdd = () => {
    if (!newName.trim()) return
    const p = onAdd(newName)
    if (p) {
      setNewName('')
      setAdding(false)
      handleContinue(p.id)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 500, color: 'var(--color-text)', marginBottom: 6 }}>
            prep.dev
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--color-text-2)' }}>
            Who's studying? Progress is saved per profile.
          </div>
        </div>

        {profiles.map((p, i) => {
          const av = AVATAR_COLORS[i % AVATAR_COLORS.length]
          return (
            <div key={p.id}
              className="card"
              style={{
                display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
                marginBottom: 8,
                borderColor: activeId === p.id ? '#534AB7' : undefined,
                background: activeId === p.id ? '#EEEDFE' : undefined,
              }}
              onClick={() => handleContinue(p.id)}
            >
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: av.bg, color: av.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 500, flexShrink: 0 }}>
                {p.initials}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, color: 'var(--color-text)' }}>{p.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-3)' }}>
                  {activeId === p.id ? 'Last active' : 'Tap to switch'}
                </div>
              </div>
              {activeId === p.id && (
                <span className="badge" style={{ background: '#E1F5EE', color: '#085041' }}>Active</span>
              )}
            </div>
          )
        })}

        {profiles.length < MAX_LOCAL_PROFILES && (
          adding ? (
            <div className="card" style={{ marginBottom: 8 }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 500, marginBottom: 8 }}>New profile</div>
              <input
                type="text"
                placeholder="Your name"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                autoFocus
                style={{ marginBottom: 8 }}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-primary" style={{ flex: 1 }} onClick={handleAdd}>Create</button>
                <button style={{ flex: 1 }} onClick={() => setAdding(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <div className="card"
              style={{ textAlign: 'center', cursor: 'pointer', borderStyle: 'dashed', marginBottom: 8, padding: '14px' }}
              onClick={() => setAdding(true)}>
              <span style={{ fontSize: '1.1rem', color: 'var(--color-text-3)', marginRight: 6 }}>+</span>
              <span style={{ fontSize: '0.82rem', color: 'var(--color-text-3)' }}>
                Add profile ({profiles.length}/{MAX_LOCAL_PROFILES})
              </span>
            </div>
          )
        )}

        {profiles.length === 0 && !adding && (
          <p style={{ textAlign: 'center', fontSize: '0.82rem', marginTop: 8 }}>
            Create your first profile to get started.
          </p>
        )}
      </div>
    </div>
  )
}
