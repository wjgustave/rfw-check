import { useState, useEffect } from 'react'
import PathwayInput from './PathwayInput'
import ScoringGuide from './ScoringGuide'
import ConfirmModal from './ConfirmModal'
import { getInProgressAssessments, removeInProgress } from '../utils/assessmentStorage'
import { htgRefForPathway } from '../constants/niceHtg'

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
        Assess NICE HTG conditions across six stages of maturity to baseline their readiness for the HealthStore.
      </p>

      <PathwayInput onAssess={onAssess} loading={loading} />

      {!loadingList && inProgress.length > 0 && (
        <>
          <hr className="rfw-divider" />

          <h3 className="govuk-heading-s" style={{ marginBottom: '12px' }}>
            Incomplete assessments
          </h3>

          <div style={{ background: '#fff', border: '1px solid #B1B4B6' }}>
            {/* Column header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 180px 140px',
              gap: '0 16px',
              padding: '10px 20px 10px 16px',
              background: '#f3f2f1',
              borderBottom: '1px solid #B1B4B6',
            }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#505A5F' }}>Pathway / condition</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#505A5F' }}>Progress</span>
              <span className="govuk-visually-hidden">Actions</span>
            </div>

            {inProgress.map((record, idx) => {
              const isComplete = record.completedDimensions === record.totalDimensions
              const isLast = idx === inProgress.length - 1
              const htg = record.htgRef || htgRefForPathway(record.pathway)
              return (
                <div key={record.id} style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 180px 140px',
                  gap: '0 16px',
                  padding: '14px 20px 14px 16px',
                  borderBottom: isLast ? 'none' : '1px solid #dee0e2',
                  alignItems: 'center',
                }}>
                  {/* Pathway + meta */}
                  <div>
                    {htg && (
                      <span style={{
                        display: 'inline-block', background: '#d2e2f1', color: '#144e81',
                        fontWeight: 700, fontSize: '0.75rem', padding: '1px 6px',
                        marginBottom: '3px', letterSpacing: '0.3px',
                      }}>
                        {htg}
                      </span>
                    )}
                    <button
                      onClick={() => onResume(record)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontFamily: 'inherit', fontSize: '1rem', fontWeight: 700,
                        color: '#005EB8', textDecoration: 'underline', padding: 0,
                        textAlign: 'left', lineHeight: 1.4, display: 'block',
                      }}
                    >
                      {record.pathway}
                    </button>
                    <p style={{ margin: '3px 0 0', fontSize: '0.8125rem', color: '#505A5F', lineHeight: 1.4 }}>
                      {record.savedBy ? `Saved by ${record.savedBy}` : 'Saved'}
                      {' · '}
                      {formatDate(record.savedAt)}
                    </p>
                  </div>

                  {/* Progress tag */}
                  <div>
                    {isComplete
                      ? <strong className="govuk-tag govuk-tag--blue">Ready to save</strong>
                      : <strong className="govuk-tag govuk-tag--yellow">{progressLabel(record)}</strong>
                    }
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => onResume(record)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontFamily: 'inherit', fontSize: '0.9375rem',
                        color: '#005EB8', textDecoration: 'underline', padding: 0,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Resume
                    </button>
                    <button
                      onClick={() => setPendingDelete(record)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontFamily: 'inherit', fontSize: '0.9375rem',
                        color: '#d4351c', textDecoration: 'underline', padding: 0,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      <hr className="rfw-divider" />

      <ScoringGuide />
    </div>
  )
}
