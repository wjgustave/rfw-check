import { useState } from 'react'
import { STAGES, SCORE_STYLES, SCORE_LEVELS, dimensionBands } from '../constants/stages'

function StageGuide({ stage }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="govuk-accordion__section">
      <button
        className="govuk-accordion__section-button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span>
          <span style={{ color: '#505A5F', fontWeight: 400, marginRight: '8px' }}>Stage {stage.number}</span>
          {stage.name}
        </span>
        <span className="govuk-accordion__icon" aria-hidden="true">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="govuk-accordion__section-content">
          <p className="govuk-hint" style={{ marginBottom: '15px' }}>{stage.question}</p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9375rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #0B0C0C' }}>
                  <th style={{ textAlign: 'left', padding: '8px 12px 8px 0', width: '120px', fontWeight: 700 }}>Dimension</th>
                  {SCORE_LEVELS.map(level => (
                    <th key={level} style={{ textAlign: 'left', padding: '8px 10px', fontWeight: 700, color: SCORE_STYLES[level].text }}>
                      {SCORE_STYLES[level].label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stage.dimensions.map((dim, i) => {
                  const bands = dimensionBands(dim)
                  return (
                    <tr key={dim.id} style={{ borderBottom: '1px solid #B1B4B6' }}>
                      <td style={{ padding: '10px 12px 10px 0', fontWeight: 700, color: '#505A5F', verticalAlign: 'top', fontSize: '0.875rem' }}>
                        D{i + 1}
                      </td>
                      {SCORE_LEVELS.map(level => (
                        <td key={level} style={{
                          padding: '10px',
                          verticalAlign: 'top',
                          background: SCORE_STYLES[level].bg,
                          color: SCORE_STYLES[level].text,
                          fontSize: '0.8125rem',
                          lineHeight: '1.4'
                        }}>
                          {bands[level]}
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ScoringGuide() {
  return (
    <div>
      <h3 className="govuk-heading-s" style={{ marginBottom: '16px' }}>
        Assessed stages and how they are scored
      </h3>
      <div className="govuk-accordion">
        {STAGES.map(stage => <StageGuide key={stage.id} stage={stage} />)}
      </div>
    </div>
  )
}
