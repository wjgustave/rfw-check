import { useState, useRef, useEffect } from 'react'
import { NICE_HTG, ACRONYM_MAP } from '../constants/niceHtg'

function entrySearchText(entry) {
  return [
    entry.htgRef,
    entry.title,
    entry.conditionArea,
    entry.subArea,
  ].join(' ').toLowerCase()
}

function matchEntries(query) {
  if (!query || query.length < 2) return []
  const q = query.toLowerCase().trim()

  // Expand acronym if the whole query is a known abbreviation
  const expanded = ACRONYM_MAP[q]

  return NICE_HTG.filter(entry => {
    const text = entrySearchText(entry)
    // Direct match on any field
    if (text.includes(q)) return true
    // Acronym-expanded match (e.g. "msk" → "musculoskeletal")
    if (expanded && text.includes(expanded)) return true
    return false
  }).slice(0, 8)
}

export default function PathwayTypeahead({ value, onChange, onKeyDown, disabled, id, 'aria-describedby': ariaDescribedBy, 'aria-invalid': ariaInvalid, inputRef: externalRef, hasError }) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const suggestions = matchEntries(value)
  const internalRef = useRef(null)
  const inputRef = externalRef || internalRef

  useEffect(() => { setActiveIndex(-1) }, [value])

  function handleKeyDown(e) {
    if (!open || suggestions.length === 0) {
      onKeyDown?.(e)
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(i => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(i => Math.max(i - 1, -1))
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0) {
        e.preventDefault()
        onChange(suggestions[activeIndex].title)
        setOpen(false)
        setActiveIndex(-1)
      } else {
        onKeyDown?.(e)
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
      setActiveIndex(-1)
    } else {
      onKeyDown?.(e)
    }
  }

  function select(entry) {
    onChange(entry.title)
    setOpen(false)
    setActiveIndex(-1)
    inputRef.current?.focus()
  }

  return (
    <div style={{ position: 'relative', maxWidth: '600px' }}>
      <input
        ref={inputRef}
        id={id}
        className={`govuk-input${hasError ? ' govuk-input--error' : ''}`}
        type="text"
        value={value}
        onChange={e => { onChange(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
        aria-autocomplete="list"
        aria-expanded={open && suggestions.length > 0}
        aria-activedescendant={activeIndex >= 0 ? `htg-option-${activeIndex}` : undefined}
        role="combobox"
        autoComplete="off"
        spellCheck={false}
        style={{ width: '100%' }}
      />

      {open && suggestions.length > 0 && (
        <ul
          role="listbox"
          style={{
            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
            background: '#fff', border: '2px solid #0B0C0C', borderTop: '1px solid #B1B4B6',
            margin: 0, padding: 0, listStyle: 'none',
            boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
          }}
        >
          {suggestions.map((entry, i) => {
            const isActive = i === activeIndex
            return (
              <li
                key={entry.htgRef}
                id={`htg-option-${i}`}
                role="option"
                aria-selected={isActive}
                onMouseDown={() => select(entry)}
                style={{
                  padding: '10px 14px',
                  cursor: 'pointer',
                  background: isActive ? '#005EB8' : '#fff',
                  borderBottom: i < suggestions.length - 1 ? '1px solid #f0f4f5' : 'none',
                }}
              >
                {/* Row 1: HTG ref badge + title */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '3px' }}>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '1px 6px',
                    flexShrink: 0,
                    background: isActive ? 'rgba(255,255,255,0.25)' : '#d2e2f1',
                    color: isActive ? '#fff' : '#144e81',
                  }}>
                    {entry.htgRef}
                  </span>
                  <span style={{
                    fontSize: '0.9375rem',
                    fontWeight: 700,
                    color: isActive ? '#fff' : '#0B0C0C',
                    lineHeight: 1.3,
                  }}>
                    {entry.title}
                  </span>
                </div>
                {/* Row 2: condition area — sub-area */}
                <div style={{
                  fontSize: '0.875rem',
                  color: isActive ? 'rgba(255,255,255,0.8)' : '#505A5F',
                  paddingLeft: '2px',
                }}>
                  {entry.conditionArea}
                  {entry.subArea && (
                    <span style={{ opacity: 0.75 }}> — {entry.subArea}</span>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
