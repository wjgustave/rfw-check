import { useState } from 'react'
import { STAGES } from '../constants/stages'
import { getSavedAssessments } from '../utils/assessmentStorage'
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

export default function PreviousAssessmentsPage({ onBack }) {
  const [assessments] = useState(() => getSavedAssessments())
  const [selected, setSelected] = useState(null)
  const [activeStage, setActiveStage] = useState('stage1')

  if (selected) {
    const activeStageData = STAGES.find(s => s.id === activeStage)
    return (
      <div>
        <button className="govuk-back-link" onClick={() => { setSelected(null); setActiveStage('stage1') }}>
          Back to saved assessments
        </button>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px', marginBottom: '25px', flexWrap: 'wrap' }}>
          <div>
            <h1 className="govuk-heading-l" style={{ margin: '0 0 4px' }}>{selected.pathway}</h1>
            <p className="govuk-hint" style={{ margin: 0 }}>
              Saved {formatDate(selected.savedAt)}{selected.savedBy ? ` by ${selected.savedBy}` : ''}
            </p>
          </div>
          <span className="govuk-tag govuk-tag--grey">Read only</span>
        </div>

        <OverallScoreCard
          stageResults={selected.stageResults}
          summaryText={selected.summaryText ?? null}
          summaryLoading={false}
          overrides={selected.overrides}
          allScored={true}
          readOnly={true}
        />

        <StageTabBar
          activeStage={activeStage}
          onSelect={setActiveStage}
          stageResults={selected.stageResults}
          overrides={selected.overrides}
        />

        {activeStageData && (
          <StagePanel
            stage={activeStageData}
            result={selected.stageResults[activeStage]}
            overrides={selected.overrides}
            onOverride={() => {}}
            onAssessDimension={() => {}}
            onAssessStage={() => {}}
            loading={false}
            readOnly={true}
          />
        )}

        <AuditTrail entries={selected.auditEntries ?? []} />
      </div>
    )
  }

  return (
    <div>
      <button className="govuk-back-link" onClick={onBack}>Back</button>
      <h1 className="govuk-heading-l">Saved assessments</h1>

      {assessments.length === 0 ? (
        <p className="govuk-body" style={{ color: '#505A5F' }}>No saved assessments yet.</p>
      ) : (
        <table className="govuk-table">
          <thead className="govuk-table__head">
            <tr className="govuk-table__row">
              <th className="govuk-table__header">Condition</th>
              <th className="govuk-table__header">Saved</th>
              <th className="govuk-table__header">Saved by</th>
              <th className="govuk-table__header"></th>
            </tr>
          </thead>
          <tbody className="govuk-table__body">
            {assessments.map(a => (
              <tr key={a.id} className="govuk-table__row">
                <td className="govuk-table__cell" style={{ fontWeight: 600 }}>{a.pathway}</td>
                <td className="govuk-table__cell" style={{ whiteSpace: 'nowrap' }}>{formatDate(a.savedAt)}</td>
                <td className="govuk-table__cell">{a.savedBy ?? '—'}</td>
                <td className="govuk-table__cell">
                  <button
                    onClick={() => { setSelected(a); setActiveStage('stage1') }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                      color: '#005EB8', textDecoration: 'underline', fontSize: '1rem', padding: 0 }}>
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
