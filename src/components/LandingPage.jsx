import { useState } from 'react'
import PathwayInput from './PathwayInput'
import ScoringGuide from './ScoringGuide'
import ConfirmModal from './ConfirmModal'
import { getInProgressAssessments, getSavedAssessments, removeInProgress } from '../utils/assessmentStorage'

function formatDate(isoString) {
  if (!isoString) return ''
  const d = new Date(isoString)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

function progressLabel(record) {
  const pct = Math.round((record.completedDimensions / record.totalDimensions) * 100)
  return `${record.completedDimensions} of ${record.totalDimensions} dimensions — ${pct}%`
}

export default function LandingPage({ onAssess, loading, onResume, onViewPreviousAssessments }) {
  const [inProgress, setInProgress] = useState(() => getInProgressAssessments())
  const [hasSaved] = useState(() => getSavedAssessments().length > 0)
  const [pendingDelete, setPendingDelete] = useState(null) // record to confirm deletion

  function handleDeleteConfirm() {
    removeInProgress(pendingDelete.id)
    setInProgress(prev => prev.filter(r => r.id !== pendingDelete.id))
    setPendingDelete(null)
  }

  return (
    <div>
      {pendingDelete && (
        <ConfirmModal
          message="This action cannot be undone."
          onConfirm={handleDeleteConfirm}
          onCancel={() => setPendingDelete(null)}
        />
      )}

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

      {inProgress.length > 0 && (
        <>
          <hr className="rfw-divider" />

          <h2 className="govuk-heading-m" style={{ marginBottom: '4px' }}>
            Ongoing assessments
          </h2>
          <p className="govuk-hint" style={{ marginBottom: '16px' }}>
            Resume a saved assessment to continue where you left off.
          </p>

          <ul className="rfw-task-list" aria-label="Ongoing assessments">
            {inProgress.map((record, i) => {
              const statusId = `task-status-${i}`
              const isComplete = record.completedDimensions === record.totalDimensions
              return (
                <li key={record.id} className="rfw-task-list__item">
                  <div className="rfw-task-list__name-and-hint">
                    <button
                      className="rfw-task-list__link"
                      onClick={() => onResume(record)}
                      aria-describedby={statusId}
                    >
                      {record.pathway}
                    </button>
                    <div className="rfw-task-list__hint">
                      Saved {formatDate(record.savedAt)}
                      {record.savedBy ? ` by ${record.savedBy}` : ''}
                    </div>
                  </div>
                  <div className="rfw-task-list__status" id={statusId}>
                    {isComplete
                      ? <strong className="govuk-tag govuk-tag--blue">Complete</strong>
                      : <strong className="govuk-tag govuk-tag--yellow">{progressLabel(record)}</strong>
                    }
                    <div style={{ marginTop: '6px', textAlign: 'right' }}>
                      <button
                        onClick={() => setPendingDelete(record)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          fontSize: '0.9375rem',
                          color: '#005EB8',
                          textDecoration: 'underline',
                          padding: 0,
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </>
      )}

      {hasSaved && (
        <>
          <hr className="rfw-divider" />
          <h2 className="govuk-heading-m" style={{ marginBottom: '4px' }}>Saved assessments</h2>
          <p className="govuk-hint" style={{ marginBottom: '16px' }}>
            View completed assessments saved by your team.
          </p>
          <button
            onClick={onViewPreviousAssessments}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'inherit', padding: 0
            }}
          >
            <span style={{ color: '#005EB8', textDecoration: 'underline', fontSize: '1.1875rem', fontWeight: 700 }}>
              View previous assessments
            </span>
          </button>
        </>
      )}

      <hr className="rfw-divider" />

      <ScoringGuide />
    </div>
  )
}
