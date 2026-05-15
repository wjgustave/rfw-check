import { useState, useEffect } from 'react'
import PathwayInput from './PathwayInput'
import ScoringGuide from './ScoringGuide'
import ConfirmModal from './ConfirmModal'
import { getInProgressAssessments, removeInProgress } from '../utils/assessmentStorage'

function formatDate(isoString) {
  if (!isoString) return ''
  const d = new Date(isoString)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

function progressLabel(record) {
  const pct = Math.round((record.completedDimensions / record.totalDimensions) * 100)
  return `${record.completedDimensions} of ${record.totalDimensions} dimensions — ${pct}%`
}

export default function LandingPage({ onAssess, loading, onResume }) {
  const [inProgress, setInProgress] = useState([])
  const [loadingList, setLoadingList] = useState(true)
  const [pendingDelete, setPendingDelete] = useState(null)

  useEffect(() => {
    getInProgressAssessments().then(data => {
      setInProgress(data)
      setLoadingList(false)
    })
  }, [])

  async function handleDeleteConfirm() {
    await removeInProgress(pendingDelete.id)
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
        Use the CRF to assess NHS pathway and condition readiness across six stages of maturity.
      </p>

      <hr className="rfw-divider" />

      <PathwayInput onAssess={onAssess} loading={loading} />

      {!loadingList && inProgress.length > 0 && (
        <>
          <hr className="rfw-divider" />

          <h2 className="govuk-heading-m" style={{ marginBottom: '4px' }}>
            Incomplete assessments
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

      <hr className="rfw-divider" />

      <ScoringGuide />
    </div>
  )
}
