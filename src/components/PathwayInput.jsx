import { useState } from 'react'

export default function PathwayInput({ onAssess, loading }) {
  const [value, setValue] = useState('')

  function submit() {
    const trimmed = value.trim()
    if (trimmed && !loading) onAssess(trimmed)
  }

  function handleKey(e) {
    if (e.key === 'Enter') submit()
  }

  return (
    <div style={{ marginBottom: '0' }}>
      <div className="govuk-form-group">
        <label className="govuk-label govuk-label--l" htmlFor="pathway-input">
          Enter a clinical pathway or condition
        </label>
        <p className="govuk-hint" id="pathway-hint">
          Search by pathway, condition name, or acronym. For example, Cardiac Rehabilitation, COPD, MSK
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
          autoComplete="off"
          spellCheck={false}
          style={{ maxWidth: '600px', width: '100%' }}
        />
      </div>

      <button
        onClick={submit}
        disabled={loading || !value.trim()}
        className="govuk-button govuk-button--nhs"
        style={{ marginBottom: '20px' }}
      >
        {loading ? 'Assessing…' : 'Start an assessment'}
      </button>
    </div>
  )
}
