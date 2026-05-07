import { useState } from 'react'
import PathwayInput from './PathwayInput'
import ScoringGuide from './ScoringGuide'
import { getInProgressAssessments, getSavedAssessments } from '../utils/assessmentStorage'

export default function LandingPage({ onAssess, loading, onResume, onViewPreviousAssessments }) {
  const [inProgress] = useState(() => getInProgressAssessments())
  const [hasSaved] = useState(() => getSavedAssessments().length > 0)

  return (
    <div>
      <h1 className="govuk-heading-xl" style={{ marginBottom: '10px' }}>
        Condition Readiness Framework (CRF)
      </h1>
      <p className="govuk-body-l" style={{ color: '#505A5F', marginBottom: '30px' }}>
        Assess NHS pathway readiness across six stages of maturity — from service establishment
        and national evidence through to supplier market health, programme advocacy,
        commissioning standards, and strategic priority alignment.
      </p>

      <hr className="rfw-divider" />

      <PathwayInput onAssess={onAssess} loading={loading} />

      {(inProgress.length > 0 || hasSaved) && (
        <>
          <hr className="rfw-divider" />
          <div>
            {inProgress.length > 0 && (
              <div style={{ marginBottom: hasSaved ? '25px' : '0' }}>
                <h2 className="govuk-heading-m" style={{ marginBottom: '12px' }}>Ongoing assessments</h2>
                <ul className="govuk-list" style={{ margin: 0 }}>
                  {inProgress.map(record => (
                    <li key={record.id} style={{ marginBottom: '8px' }}>
                      <button
                        onClick={() => onResume(record)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0, textAlign: 'left' }}
                      >
                        <span style={{ color: '#005EB8', textDecoration: 'underline', fontSize: '1rem' }}>
                          {record.pathway}
                        </span>
                        <span style={{ color: '#505A5F', fontSize: '0.9375rem', marginLeft: '8px' }}>
                          — {record.completedDimensions} of {record.totalDimensions} dimensions completed
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {hasSaved && (
              <div>
                <h2 className="govuk-heading-m" style={{ marginBottom: '12px' }}>Saved assessments</h2>
                <button
                  onClick={onViewPreviousAssessments}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}
                >
                  <span style={{ color: '#005EB8', textDecoration: 'underline', fontSize: '1rem' }}>
                    View previous assessments
                  </span>
                </button>
              </div>
            )}
          </div>
        </>
      )}

      <hr className="rfw-divider" />

      <ScoringGuide />
    </div>
  )
}
