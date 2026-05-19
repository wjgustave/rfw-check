import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import PathwayTypeahead from './PathwayTypeahead'
import { NICE_HTG, ACRONYM_MAP } from '../constants/niceHtg'

function entrySearchText(entry) {
  return [entry.htgRef, entry.title, entry.conditionArea, entry.subArea]
    .join(' ').toLowerCase()
}

function isValidSearch(query) {
  if (!query || query.length < 2) return false
  const q = query.toLowerCase().trim()
  const expanded = ACRONYM_MAP[q]
  return NICE_HTG.some(entry => {
    const text = entrySearchText(entry)
    return text.includes(q) || (expanded && text.includes(expanded))
  })
}

const ERROR_MSG = 'Enter a valid NICE HTG reference, guidance title, or condition area'

export default function PathwayInput({ onAssess, loading }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  function submit() {
    const trimmed = value.trim()
    if (!trimmed || loading) return

    if (!isValidSearch(trimmed)) {
      setError(true)
      inputRef.current?.focus()
      return
    }

    setError(false)
    onAssess(trimmed)
  }

  function handleKey(e) {
    if (e.key === 'Enter') submit()
  }

  function handleChange(val) {
    setValue(val)
    if (error) setError(false)
  }

  return (
    <div style={{ marginBottom: '0' }}>

      {/* Error summary */}
      {error && (
        <div className="govuk-error-summary" role="alert" aria-labelledby="error-summary-title">
          <h2 className="govuk-error-summary__title" id="error-summary-title">
            There is a problem
          </h2>
          <div className="govuk-error-summary__body">
            <ul className="govuk-error-summary__list">
              <li>
                <a href="#pathway-input">{ERROR_MSG}</a>
              </li>
            </ul>
          </div>
        </div>
      )}

      <h2 className="govuk-heading-m" style={{ marginBottom: '4px' }}>
        Enter a NICE HTG reference, guidance title, or condition area.
      </h2>
      <p className="govuk-hint" id="pathway-hint" style={{ marginBottom: '12px' }}>
        For example; HTG761, cardiac rehabilitation, or COPD
      </p>

      <div className={`govuk-form-group${error ? ' govuk-form-group--error' : ''}`} style={{ marginBottom: '15px' }}>
        <label className="govuk-label govuk-visually-hidden" htmlFor="pathway-input">
          Start an assessment
        </label>
        {error && (
          <p id="pathway-input-error" className="govuk-error-message">
            <span className="govuk-visually-hidden">Error:</span> {ERROR_MSG}
          </p>
        )}
        <PathwayTypeahead
          id="pathway-input"
          aria-describedby={error ? 'pathway-input-error pathway-hint' : 'pathway-hint'}
          aria-invalid={error ? 'true' : undefined}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKey}
          disabled={loading}
          inputRef={inputRef}
          hasError={error}
        />
      </div>

      <button
        onClick={submit}
        disabled={loading || !value.trim()}
        className="govuk-button govuk-button--nhs"
        style={{ marginBottom: '10px' }}
      >
        {loading ? 'Assessing…' : 'Start'}
      </button>

      <p className="govuk-body" style={{ color: '#505A5F', marginBottom: '8px' }}>Or</p>

      <button
        type="button"
        onClick={() => navigate('/condition-list')}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'inherit',
          fontSize: '1rem',
          color: '#005EB8',
          textDecoration: 'underline',
          padding: 0,
        }}
      >
        Search the condition list
      </button>
    </div>
  )
}
