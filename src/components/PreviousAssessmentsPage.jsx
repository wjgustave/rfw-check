import { useState } from 'react'
import { STAGES, SCORE_STYLES, MAX_SCORE } from '../constants/stages'
import { stageScore, overallScore, applyOverrides } from '../utils/scoring'
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

function formatDateShort(iso) {
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}

function calcOverall(assessment) {
  const stageScores = {}
  STAGES.forEach(s => {
    const dims = assessment.stageResults[s.id]?.dimensions ?? []
    const withOverrides = applyOverrides(dims, assessment.overrides ?? {})
    const allScored = dims.length > 0 && dims.every(d => d.score)
    if (allScored && withOverrides.length) stageScores[s.id] = stageScore(withOverrides)
  })
  return overallScore(stageScores)
}

function ScoreTag({ level, label, size = 'normal' }) {
  const tagClass = level === 'high' ? 'govuk-tag--green' : level === 'medium' ? 'govuk-tag--yellow' : 'govuk-tag--red'
  return (
    <span className={`govuk-tag ${tagClass}`} style={size === 'small' ? { fontSize: '0.75rem', padding: '2px 7px 1px' } : {}}>
      {label}
    </span>
  )
}

// ─── Compare view ────────────────────────────────────────────────────────────

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

  function getDimResult(assessment, stageId, dimId) {
    const dims = assessment.stageResults[stageId]?.dimensions ?? []
    const overrides = assessment.overrides ?? {}
    const dim = dims.find(d => d.id === dimId)
    if (!dim?.score) return null
    const override = overrides[dimId]
    const score = (override?.score || dim.score).toLowerCase()
    return { score, style: SCORE_STYLES[score], isOverridden: !!override, rationale: dim.rationale }
  }

  const overalls = assessments.map(a => calcOverall(a))
  const scoreLabel = (o) => o ? (o.percent >= 75 ? 'Strong' : o.percent >= 50 ? 'Moderate' : 'Emerging') : null
  const panelBg = (o) => o ? (o.percent >= 75 ? '#005a30' : o.percent >= 50 ? '#594d00' : '#942514') : '#003087'

  return (
    <div>
      <button className="govuk-back-link" onClick={onClose}>Back to completed assessments</button>
      <h1 className="govuk-heading-l" style={{ marginBottom: '30px' }}>Compare assessments</h1>

      {/* Assessment summary cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${assessments.length}, 1fr)`,
        gap: '16px',
        marginBottom: '40px'
      }}>
        {assessments.map((a, i) => {
          const overall = overalls[i]
          const label = scoreLabel(overall)
          const bg = panelBg(overall)
          return (
            <div key={a.id} style={{ border: '1px solid #B1B4B6', overflow: 'hidden' }}>
              <div style={{ background: bg, color: '#fff', padding: '20px 20px 16px' }}>
                <p style={{ margin: '0 0 10px', fontSize: '0.8125rem', opacity: 0.8, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  Assessment {i + 1}
                </p>
                <p style={{ margin: '0 0 12px', fontWeight: 700, fontSize: '1.0625rem', lineHeight: 1.3 }}>{a.pathway}</p>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 700, lineHeight: 1 }}>
                    {overall ? overall.total : '—'}
                  </span>
                  <span style={{ fontSize: '1rem', opacity: 0.7, marginBottom: '5px' }}>/ {MAX_SCORE}</span>
                  {label && (
                    <span style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '4px', borderLeft: '2px solid rgba(255,255,255,0.4)', paddingLeft: '10px' }}>
                      {label}
                    </span>
                  )}
                </div>
              </div>
              <div style={{ background: '#f3f2f1', padding: '10px 16px' }}>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#505A5F' }}>
                  {formatDateShort(a.savedAt)}
                  {a.savedBy ? <span> &bull; {a.savedBy}</span> : null}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Comparison table */}
      <div style={{ overflowX: 'auto' }}>
        <table className="govuk-table" style={{ tableLayout: 'fixed', width: '100%' }}>
          <colgroup>
            <col style={{ width: '28%' }} />
            {assessments.map(a => <col key={a.id} style={{ width: `${Math.floor(72 / assessments.length)}%` }} />)}
          </colgroup>
          <thead className="govuk-table__head">
            <tr className="govuk-table__row">
              <th className="govuk-table__header" style={{ paddingTop: '12px', paddingBottom: '12px' }}>Stage</th>
              {assessments.map((a, i) => (
                <th key={a.id} className="govuk-table__header" style={{ paddingTop: '12px', paddingBottom: '12px' }}>
                  Assessment {i + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="govuk-table__body">
            {STAGES.map((stage, stageIdx) => {
              const isExpanded = !!expandedStages[stage.id]
              const stageDims = stage.dimensions
              const isLast = stageIdx === STAGES.length - 1

              return (
                <>
                  {/* Stage row */}
                  <tr
                    key={`stage-${stage.id}`}
                    className="govuk-table__row"
                    style={{ background: '#f3f2f1', cursor: 'pointer' }}
                    onClick={() => toggleStage(stage.id)}
                  >
                    <td className="govuk-table__cell" style={{ paddingTop: '14px', paddingBottom: '14px', borderBottom: isExpanded ? '1px solid #dee0e2' : undefined }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{
                          display: 'inline-block', width: '20px', height: '20px',
                          lineHeight: '20px', textAlign: 'center',
                          fontSize: '0.75rem', color: '#505A5F', transition: 'transform 0.15s',
                          transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                          flexShrink: 0
                        }}>▶</span>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: '#505A5F', display: 'block', marginBottom: '2px' }}>
                            Stage {stage.number}
                          </span>
                          <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#0B0C0C' }}>{stage.name}</span>
                        </div>
                      </div>
                    </td>
                    {assessments.map(a => {
                      const sc = getStageScore(a, stage.id)
                      return (
                        <td key={a.id} className="govuk-table__cell" style={{ paddingTop: '14px', paddingBottom: '14px', borderBottom: isExpanded ? '1px solid #dee0e2' : undefined }}>
                          {sc ? (
                            <ScoreTag level={sc.level} label={sc.rating} />
                          ) : (
                            <span style={{ color: '#B1B4B6', fontSize: '0.875rem' }}>Not scored</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>

                  {/* Dimension rows (expanded) */}
                  {isExpanded && stageDims.map((dim, dimIdx) => {
                    const isLastDim = dimIdx === stageDims.length - 1
                    return (
                      <tr key={`dim-${dim.id}`} className="govuk-table__row" style={{ background: '#fff' }}>
                        <td className="govuk-table__cell" style={{
                          paddingTop: '12px', paddingBottom: '12px',
                          paddingLeft: '44px',
                          borderBottom: isLastDim && !isLast ? '3px solid #dee0e2' : undefined,
                          fontSize: '0.875rem', color: '#0B0C0C'
                        }}>
                          <span style={{ display: 'inline-block', background: '#E8EDEE', color: '#505A5F',
                            fontWeight: 700, fontSize: '0.75rem', padding: '1px 6px', marginRight: '8px', flexShrink: 0 }}>
                            D{dimIdx + 1}
                          </span>
                          {dim.check}
                        </td>
                        {assessments.map(a => {
                          const d = getDimResult(a, stage.id, dim.id)
                          return (
                            <td key={a.id} className="govuk-table__cell" style={{
                              paddingTop: '12px', paddingBottom: '12px',
                              borderBottom: isLastDim && !isLast ? '3px solid #dee0e2' : undefined,
                              verticalAlign: 'top'
                            }}>
                              {d ? (
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: d.rationale ? '6px' : 0 }}>
                                    <ScoreTag level={d.score} label={d.style?.label} size="small" />
                                    {d.isOverridden && (
                                      <span className="govuk-tag govuk-tag--purple" style={{ fontSize: '0.7rem', padding: '2px 5px 1px' }}>Override</span>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <span style={{ color: '#B1B4B6', fontSize: '0.875rem' }}>—</span>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })}
                </>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Main list ────────────────────────────────────────────────────────────────

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
        onClose={() => { setComparing(false) }}
      />
    )
  }

  if (selected) {
    const activeStageData = STAGES.find(s => s.id === activeStage)
    return (
      <div>
        <button className="govuk-back-link" onClick={() => { setSelected(null); setActiveStage('stage1') }}>
          Back to completed assessments
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
      <h1 className="govuk-heading-l">Completed assessments</h1>

      {assessments.length === 0 ? (
        <div style={{ padding: '30px 0' }}>
          <p className="govuk-body" style={{ color: '#505A5F' }}>No completed assessments yet.</p>
          <button className="govuk-button govuk-button--nhs" onClick={onBack} style={{ marginBottom: 0 }}>
            Start an assessment
          </button>
        </div>
      ) : (
        <>
          {/* Selection action bar */}
          {checkedIds.size > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
              padding: '14px 20px', marginBottom: '20px',
              background: '#f0f4f5', border: '1px solid #B1B4B6',
              borderLeft: '4px solid #005EB8'
            }}>
              <span className="govuk-body-s" style={{ margin: 0, fontWeight: 600, color: '#0B0C0C' }}>
                {checkedIds.size} {checkedIds.size === 1 ? 'assessment' : 'assessments'} selected
              </span>
              {checkedIds.size >= 2 && (
                <button
                  className="govuk-button govuk-button--nhs"
                  style={{ marginBottom: 0 }}
                  onClick={() => setComparing(true)}>
                  Compare selected
                </button>
              )}
              {checkedIds.size < 2 && (
                <span className="govuk-hint" style={{ margin: 0, fontSize: '0.875rem' }}>
                  Select at least 2 to compare
                </span>
              )}
              <button
                onClick={() => setCheckedIds(new Set())}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                  fontSize: '0.875rem', color: '#505A5F', textDecoration: 'underline', padding: 0, marginLeft: 'auto' }}>
                Clear selection
              </button>
            </div>
          )}

          <table className="govuk-table">
            <thead className="govuk-table__head">
              <tr className="govuk-table__row">
                <th className="govuk-table__header" style={{ width: '48px', paddingRight: '8px' }}>
                  <span className="govuk-visually-hidden">Select for comparison</span>
                </th>
                <th className="govuk-table__header">Pathway / condition</th>
                <th className="govuk-table__header" style={{ width: '120px' }}>Readiness</th>
                <th className="govuk-table__header" style={{ width: '160px' }}>Date saved</th>
                <th className="govuk-table__header" style={{ width: '140px' }}>Saved by</th>
                <th className="govuk-table__header" style={{ width: '110px' }}>
                  <span className="govuk-visually-hidden">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="govuk-table__body">
              {assessments.map(a => {
                const overall = calcOverall(a)
                const label = overall ? (overall.percent >= 75 ? 'Strong' : overall.percent >= 50 ? 'Moderate' : 'Emerging') : null
                const level = overall ? (overall.percent >= 75 ? 'high' : overall.percent >= 50 ? 'medium' : 'low') : null
                const isChecked = checkedIds.has(a.id)
                return (
                  <tr
                    key={a.id}
                    className="govuk-table__row"
                    style={{ background: isChecked ? '#e8f4fe' : undefined }}
                  >
                    <td className="govuk-table__cell" style={{ verticalAlign: 'middle', paddingRight: '8px' }}>
                      <input
                        className="govuk-checkboxes__input"
                        id={`check-${a.id}`}
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleCheck(a.id)}
                        aria-label={`Select ${a.pathway} for comparison`}
                        style={{ position: 'static', marginTop: 0, marginLeft: 0, width: '38px', height: '38px', cursor: 'pointer' }}
                      />
                    </td>
                    <td className="govuk-table__cell" style={{ fontWeight: 600, paddingTop: '18px', paddingBottom: '18px' }}>
                      {a.pathway}
                    </td>
                    <td className="govuk-table__cell" style={{ paddingTop: '18px', paddingBottom: '18px', whiteSpace: 'nowrap' }}>
                      {label && level ? (
                        <div>
                          <ScoreTag level={level} label={label} />
                          <span style={{ display: 'block', fontSize: '0.8125rem', color: '#505A5F', marginTop: '4px' }}>
                            {overall.total} / {MAX_SCORE}
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: '#B1B4B6' }}>—</span>
                      )}
                    </td>
                    <td className="govuk-table__cell" style={{ paddingTop: '18px', paddingBottom: '18px', whiteSpace: 'nowrap', color: '#505A5F' }}>
                      {formatDate(a.savedAt)}
                    </td>
                    <td className="govuk-table__cell" style={{ paddingTop: '18px', paddingBottom: '18px', color: '#505A5F' }}>
                      {a.savedBy ?? <span style={{ color: '#B1B4B6' }}>—</span>}
                    </td>
                    <td className="govuk-table__cell" style={{ paddingTop: '18px', paddingBottom: '18px' }}>
                      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                        <button
                          onClick={() => { setSelected(a); setActiveStage('stage1') }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                            color: '#005EB8', textDecoration: 'underline', fontSize: '1rem', padding: 0, whiteSpace: 'nowrap' }}>
                          View
                        </button>
                        {onEdit && (
                          <button
                            onClick={() => onEdit(a)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                              color: '#005EB8', textDecoration: 'underline', fontSize: '1rem', padding: 0, whiteSpace: 'nowrap' }}>
                            Edit
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </>
      )}
    </div>
  )
}
