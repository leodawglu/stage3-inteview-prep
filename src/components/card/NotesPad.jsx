import { useRef, useEffect } from 'react'

export default function NotesPad({ value, onChange, scaffold, isGuided }) {
  const ref = useRef(null)

  // Tab → 4 spaces (cross-platform fix — Windows Tab moves focus by default)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const handler = (e) => {
      if (e.key === 'Tab') {
        e.preventDefault()
        const start = el.selectionStart
        const end   = el.selectionEnd
        const next  = el.value.substring(0, start) + '    ' + el.value.substring(end)
        el.value = next
        el.selectionStart = el.selectionEnd = start + 4
        onChange(next)
      }
    }
    el.addEventListener('keydown', handler)
    return () => el.removeEventListener('keydown', handler)
  }, [onChange])

  const placeholder = isGuided && scaffold
    ? scaffold
    : '// pseudocode, notes, or code...'

  return (
    <div className="notes-wrap">
      <div className="notes-label">
        <span>Scratchpad{isGuided && scaffold ? ' — scaffold pre-filled' : ''}</span>
        <span style={{ fontSize: '0.65rem' }}>persists across all steps</span>
      </div>
      <textarea
        ref={ref}
        className="notes-textarea"
        value={value}
        placeholder={value ? '' : placeholder}
        onChange={e => onChange(e.target.value)}
        rows={5}
        spellCheck={false}
      />
    </div>
  )
}
