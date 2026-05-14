import { useState } from 'react'
import { STAGES, SCORE_STYLES } from '../constants/stages'
import { stageScore, applyOverrides } from '../utils/scoring'
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

function CompareView({ assessments, onClose }) {
  const [expandedStages, setExpandedStages] = useState({})

  function toggleStage(stageId) {
    setExpandedStages(prev => ({ ...prev, [stageId]: !prev[stageId] }))
  }

  function getStageScore(assessment, stageId) {
    const dims = assessment.stageResults[stageId]?.dimensions ?? []
    const withOverrides = applyOverrides(dims, assessment.overrides ?? {})
    const allScored = dims.length > 0 && dims.every(d => d.score)
    if (!allScored) return null
    return stageScore(withOverrides)
  }

  function getDimScore(assessment, stageId, dimId) {
    const dims = assessment.stageResults[stageId]?.dimensions ?? []
    const overrides = assessment.overrides ?? {}
    const dim = dims.find(d => d.id === dimId)
    if (!dim?.score) return null
    const override = overrides[dimId]
    const score = (override?.score || dim.score).toLowerCase()
    return { score, style: SCORE_STYLES[score], isOverridden: !!override }
  }

  const colCount = assessments.length
  const colWidth = `${Math.floor(85 / colCount)}%`

  return (
    <div>
      <button className="govuk-back-link" onClick={onClose}>Back to saved assessments</button>
      <h1 className="govuk-heading-l">Compare assessments</h1>

      <div style={{ overflowX: 'auto' }}>
        <table className="govuk-table" style={{ minWidth: '600px' }}>
          <thead className="govuk-table__head">
            <tr className="govuk-table__row">
              <th className="govuk-table__header" style={{ width: '15%' }}>Stage</th>
              {assessments.map(a => (
                <th key={a.id} className="govuk-table__header" style={{ width: colWidth }}>
                  <span style={{ fontWeight: 700 }}>{a.pathway}</span>
                  <span className="govuk-hint" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 400, margin: 0 }}>
                    {formatDate(a.savedAt)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="govuk-table__body">
            {STAGES.map(stage => {
              const isExpanded = !!expandedStages[stage.id]
              const stageDims = stage.dimensions
              return (
                <>
                  <tr key={stage.id} className="govuk-table__row" style={{ background: '#f3f2f1' }}>
                    <td className="govuk-table__cell" style={{ verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>S{stage.number} {stage.name}</span>
                        <button
                          onClick={() => toggleStage(stage.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                            fontSize: '0.8125rem', color: '#005EB8', textDecoration: 'underline', padding: 0, flexShrink: 0 }}>
                          {isExpanded ? 'Hide dimensions' : 'Show dimensions'}
                        </button>
                      </div>
                    </td>
                    {assessments.map(a => {
                      const sc = getStageScore(a, stage.id)
                      return (
                        <td key={a.id} className="govuk-table__cell" style={{ verticalAlign: 'middle' }}>
                          {sc ? (
                            <span className={`govuk-tag ${sc.level === 'high' ? 'govuk-tag--green' : sc.level === 'medium' ? 'govuk-tag--yellow' : 'govuk-tag--red'}`}>
                              {sc.rating}
                            </span>
                          ) : (
                            <span style={{ color: '#B1B4B6', fontSize: '0.875rem' }}>Not scored</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                  {isExpanded && stageDims.map((dim, dimIdx) => (
                    <tr key={dim.id} className="govuk-table__row">
                      <td className="govuk-table__cell" style={{ paddingLeft: '24px', fontSize: '0.875rem', color: '#505A5F' }}>
                        <span style={{ fontWeight: 600, marginRight: '6px' }}>D{dimIdx + 1}</span>
                        {dim.check}
                      </td>
                      {assessments.map(a => {
                        const d = getDimScore(a, stage.id, dim.id)
                        return (
                          <td key={a.id} className="govuk-table__cell" style={{ verticalAlign: 'middle' }}>
                            {d ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span className={`govuk-tag ${d.style?.tag}`} style={{ fontSize: '0.75rem', padding: '2px 6px 1px' }}>
                                  {d.style?.label}
                                </span>
                                {d.isOverridden && (
                                  <span className="govuk-tag govuk-tag--purple" style={{ fontSize: '0.7rem', padding: '2px 5px 1px' }}>
                                    Override
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span style={{ color: '#B1B4B6', fontSize: '0.875rem' }}>—</span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function PreviousAssessmentsPage({ onBack, onEdit }) {
  const [assessments] = useState(() => getSavedAssessments())
  const [selected, setSelected] = useState(null)
  const [activeStage, setActiveStage] = useState('stage1')
  const [checkedIds, setCheckedIds] = useState(new Set())
  const [comparing, setComparing] = useState(false)

  function toggleCheck(id) {
    setCheckedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const checkedAssessments = assessments.filter(a => checkedIds.has(a.id))

  if (comparing && checkedAssessments.length >= 2) {
    return (
      <CompareView
        assessments={checkedAssessments}
        onClose={() => setComparing(false)}
      />
    )
  }

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
        <>
          {checkedIds.size >= 2 && (
            <div style={{ marginBottom: '20px' }}>
              <button
                className="govuk-button govuk-button--nhs"
                style={{ marginBottom: 0 }}
                onClick={() => setComparing(true)}>
                Compare selected ({checkedIds.size})
              </button>
            </div>
          )}
          <table className="govuk-table">
            <thead className="govuk-table__head">
              <tr className="govuk-table__row">
                <th className="govuk-table__header" style={{ width: '40px' }}>
                  <span className="govuk-visually-hidden">Select</span>
                </th>
                <th className="govuk-table__header">Condition</th>
                <th className="govuk-table__header">Saved</th>
                <th className="govuk-table__header">Saved by</th>
                <th className="govuk-table__header"></th>
              </tr>
            </thead>
            <tbody className="govuk-table__body">
              {assessments.map(a => (
                <tr key={a.id} className="govuk-table__row" style={{ background: checkedIds.has(a.id) ? '#e8f4fe' : undefined }}>
                  <td className="govuk-table__cell" style={{ verticalAlign: 'middle' }}>
                    <div className="govuk-checkboxes__item" style={{ margin: 0 }}>
                      <input
                        className="govuk-checkboxes__input"
                        id={`check-${a.id}`}
                        type="checkbox"
                        checked={checkedIds.has(a.id)}
                        onChange={() => toggleCheck(a.id)}
                        style={{ margin: 0 }}
                      />
                      <label className="govuk-label govuk-checkboxes__label" htmlFor={`check-${a.id}`}
                        style={{ padding: 0, width: '20px', height: '20px' }}>
                        <span className="govuk-visually-hidden">{a.pathway}</span>
                      </label>
                    </div>
                  </td>
                  <td className="govuk-table__cell" style={{ fontWeight: 600 }}>{a.pathway}</td>
                  <td className="govuk-table__cell" style={{ whiteSpace: 'nowrap' }}>{formatDate(a.savedAt)}</td>
                  <td className="govuk-table__cell">{a.savedBy ?? '—'}</td>
                  <td className="govuk-table__cell">
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <button
                        onClick={() => { setSelected(a); setActiveStage('stage1') }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                          color: '#005EB8', textDecoration: 'underline', fontSize: '1rem', padding: 0 }}>
                        View
                      </button>
                      {onEdit && (
                        <button
                          onClick={() => onEdit(a)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                            color: '#005EB8', textDecoration: 'underline', fontSize: '1rem', padding: 0 }}>
                          Edit
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  )
}
