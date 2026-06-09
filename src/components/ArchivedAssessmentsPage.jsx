import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { STAGES } from '../constants/stages'
import { overallScore } from '../utils/scoring'
import { getSavedAssessments } from '../utils/assessmentStorage'
import { unarchiveAssessment } from '../utils/archiveStorage'
import { exportAssessmentXlsx } from '../utils/exportXlsx'
import StageTabBar from './StageTabBar'
import StagePanel from './StagePanel'
import OverallScoreCard from './OverallScoreCard'
import AuditTrail from './AuditTrail'

function formatDate(iso) {
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

function formatDateShort(iso) {
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}

function calcOverall(assessment) {
  return overallScore(assessment.stageResults ?? {}, assessment.overrides ?? {})
}

function ScoreTag({ level, label }) {
  const tagClass = level === 'high' ? 'govuk-tag--green' : level === 'medium' ? 'govuk-tag--orange' : 'govuk-tag--red'
  return <span className={`govuk-tag ${tagClass}`}>{label}</span>
}

export default function ArchivedAssessmentsPage() {
  const navigate = useNavigate()
  const [assessments, setAssessments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [activeStage, setActiveStage] = useState('stage1')

  useEffect(() => {
    getSavedAssessments().then(all => {
      setAssessments(all.filter(a => a.isArchived))
      setLoading(false)
    })
  }, [])

  async function handleRestore(a) {
    await unarchiveAssessment(a.id)
    setAssessments(prev => prev.filter(x => x.id !== a.id))
  }

  if (selected) {
    const activeStageData = STAGES.find(s => s.id === activeStage)
    return (
      <div>
        <button className="govuk-back-link" onClick={() => { setSelected(null); setActiveStage('stage1') }}>
          Back to archived assessments
        </button>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          gap: '20px', marginBottom: '25px', flexWrap: 'wrap' }}>
          <div>
            <h1 className="govuk-heading-l" style={{ margin: '0 0 4px' }}>{selected.pathway}</h1>
            <p className="govuk-hint" style={{ margin: 0 }}>
              Saved {formatDate(selected.savedAt)}{selected.savedBy ? ` by ${selected.savedBy}` : ''}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span className="govuk-tag govuk-tag--grey">Archived</span>
            <span className="govuk-tag govuk-tag--grey">Read only</span>
          </div>
        </div>
        <OverallScoreCard stageResults={selected.stageResults} summaryText={selected.summaryText ?? null}
          summaryLoading={false} overrides={selected.overrides} allScored={true} readOnly={true} />
        <StageTabBar activeStage={activeStage} onSelect={setActiveStage}
          stageResults={selected.stageResults} overrides={selected.overrides} />
        {activeStageData && (
          <StagePanel stage={activeStageData} result={selected.stageResults[activeStage]}
            overrides={selected.overrides} onOverride={() => {}} onAssessDimension={() => {}}
            onAssessStage={() => {}} loading={false} readOnly={true} />
        )}
        <AuditTrail entries={selected.auditEntries ?? []} />
      </div>
    )
  }

  return (
    <div>
      <button className="govuk-back-link" onClick={() => navigate('/completed-assessments')}>
        Back to completed assessments
      </button>

      <div style={{ marginBottom: '24px' }}>
        <h1 className="govuk-heading-l" style={{ margin: '0 0 6px' }}>Archived assessments</h1>
        <p className="govuk-body" style={{ color: '#505A5F', margin: 0 }}>
          Archived assessments are hidden from the completed assessments list. Restore an assessment to move it back.
        </p>
      </div>

      {loading ? (
        <div style={{ padding: '30px 0' }}>
          <div className="govuk-skeleton" style={{ height: '20px', width: '40%', marginBottom: '16px' }} />
          <div className="govuk-skeleton" style={{ height: '20px', width: '60%', marginBottom: '16px' }} />
          <div className="govuk-skeleton" style={{ height: '20px', width: '50%' }} />
        </div>
      ) : assessments.length === 0 ? (
        <div style={{ padding: '30px 0' }}>
          <p className="govuk-body" style={{ color: '#505A5F' }}>No archived assessments.</p>
          <button type="button" onClick={() => navigate('/completed-assessments')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              fontSize: '1rem', color: '#005EB8', textDecoration: 'underline', padding: 0 }}>
            Go back to completed assessments
          </button>
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #B1B4B6' }}>
          {/* Column header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 130px 200px',
            gap: '0 16px',
            padding: '10px 20px 10px 16px',
            background: '#f3f2f1',
            borderBottom: '1px solid #B1B4B6',
            alignItems: 'center',
          }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#505A5F' }}>Pathway / condition</span>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#505A5F' }}>Readiness</span>
            <span className="govuk-visually-hidden">Actions</span>
          </div>

          {assessments.map((a, idx) => {
            const overall = calcOverall(a)
            const complete = overall && overall.scoredCount === overall.totalCount
            const label = complete ? (overall.percent >= 75 ? 'Strong' : overall.percent >= 50 ? 'Moderate' : 'Emerging') : null
            const level = complete ? (overall.percent >= 75 ? 'high' : overall.percent >= 50 ? 'medium' : 'low') : null
            const isLast = idx === assessments.length - 1

            return (
              <div key={a.id} style={{
                display: 'grid',
                gridTemplateColumns: '1fr 130px 200px',
                gap: '0 16px',
                padding: '14px 20px 14px 16px',
                borderBottom: isLast ? 'none' : '1px solid #dee0e2',
                alignItems: 'center',
              }}>
                {/* Pathway name + metadata */}
                <div>
                  {a.htgRef && (
                    <span style={{
                      display: 'inline-block', background: '#d2e2f1', color: '#144e81',
                      fontWeight: 700, fontSize: '0.75rem', padding: '1px 6px',
                      marginBottom: '3px', letterSpacing: '0.3px',
                    }}>
                      {a.htgRef}
                    </span>
                  )}
                  <button
                    onClick={() => { setSelected(a); setActiveStage('stage1') }}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontFamily: 'inherit', fontSize: '1rem', fontWeight: 700,
                      color: '#005EB8', textDecoration: 'underline', padding: 0,
                      textAlign: 'left', lineHeight: 1.4, display: 'block',
                    }}
                  >
                    {a.pathway}
                  </button>
                  <p style={{ margin: '3px 0 0', fontSize: '0.8125rem', color: '#505A5F', lineHeight: 1.4 }}>
                    {a.savedBy ? `Completed by ${a.savedBy}` : 'Completed'}
                    {' · '}
                    {formatDateShort(a.savedAt)}
                  </p>
                </div>

                {/* Readiness score */}
                <div>
                  {label && level ? (
                    <>
                      <ScoreTag level={level} label={label} />
                      <span style={{ display: 'block', fontSize: '0.8125rem', color: '#505A5F', marginTop: '4px' }}>
                        {overall.total} / {overall.max}
                      </span>
                    </>
                  ) : (
                    <span style={{ color: '#B1B4B6', fontSize: '0.875rem' }}>—</span>
                  )}
                </div>

                {/* Inline actions */}
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  <button onClick={() => { setSelected(a); setActiveStage('stage1') }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                      fontSize: '0.9375rem', color: '#005EB8', textDecoration: 'underline', padding: 0, whiteSpace: 'nowrap' }}>
                    View
                  </button>
                  <button onClick={() => handleRestore(a)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                      fontSize: '0.9375rem', color: '#005EB8', textDecoration: 'underline', padding: 0, whiteSpace: 'nowrap' }}>
                    Restore
                  </button>
                  <button onClick={() => exportAssessmentXlsx(a)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                      fontSize: '0.9375rem', color: '#005EB8', textDecoration: 'underline', padding: 0, whiteSpace: 'nowrap' }}>
                    Export Excel
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
