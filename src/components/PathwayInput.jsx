import { useState } from 'react'
import PathwayTypeahead from './PathwayTypeahead'

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
        <PathwayTypeahead
          id="pathway-input"
          aria-describedby="pathway-hint"
          value={value}
          onChange={setValue}
          onKeyDown={handleKey}
          disabled={loading}
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
