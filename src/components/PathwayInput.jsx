import { useState } from 'react'
import { EXAMPLE_PATHWAYS } from '../constants/stages'

export default function PathwayInput({ onAssess, loading }) {
  const [value, setValue] = useState('')

  function submit() {
    const trimmed = value.trim()
    if (trimmed && !loading) onAssess(trimmed)
  }

  function handleKey(e) {
    if (e.key === 'Enter') submit()
  }

  function useExample(p) {
    setValue(p)
    if (!loading) onAssess(p)
  }

  return (
    <div style={{ marginBottom: '0' }}>
      <div className="govuk-form-group">
        <label className="govuk-label govuk-label--l" htmlFor="pathway-input">
          Enter a clinical pathway or condition
        </label>
        <p className="govuk-hint" id="pathway-hint">
          For example, Cardiac Rehabilitation, COPD, Digital Weight Management, MSK
        </p>
        <input
          id="pathway-input"
          className="govuk-input"
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKey}
          disabled={loading}
          aria-describedby="pathway-hint"
          style={{ maxWidth: '600px' }}
        />
      </div>

      <button
        onClick={submit}
        disabled={loading || !value.trim()}
        className="govuk-button govuk-button--nhs"
        style={{ marginBottom: '20px' }}
      >
        {loading ? 'Assessing…' : 'Assess pathway'}
      </button>

      <div style={{ marginBottom: '10px' }}>
        <p className="govuk-hint" style={{ marginBottom: '10px' }}>Or select an example pathway:</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {EXAMPLE_PATHWAYS.map(p => (
            <button
              key={p}
              onClick={() => useExample(p)}
              disabled={loading}
              className="govuk-button govuk-button--secondary"
              style={{ fontSize: '0.9375rem', padding: '5px 12px 4px', boxShadow: '0 2px 0 #929191', marginBottom: '0' }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
