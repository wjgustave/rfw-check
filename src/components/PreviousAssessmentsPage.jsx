import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { STAGES, SCORE_STYLES, MAX_SCORE } from '../constants/stages'
import { stageScore, overallScore, applyOverrides } from '../utils/scoring'
import { getSavedAssessments, getEditingId } from '../utils/assessmentStorage'
import { archiveAssessment } from '../utils/archiveStorage'
import { exportAssessmentXlsx, exportComparisonXlsx } from '../utils/exportXlsx'
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

function ScoreTag({ level, label, size = 'normal' }) {
  const tagClass = level === 'high' ? 'govuk-tag--green' : level === 'medium' ? 'govuk-tag--orange' : 'govuk-tag--red'
  return (
    <span className={`govuk-tag ${tagClass}`} style={size === 'small' ? { fontSize: '0.75rem', padding: '2px 7px 1px' } : {}}>
      {label}
    </span>
  )
}

// ─── Action dropdown ──────────────────────────────────────────────────────────

function ActionMenu({ items }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    function close(e) { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '5px 10px', background: '#fff', border: '1px solid #B1B4B6',
          cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.875rem',
          fontWeight: 600, color: '#0B0C0C', whiteSpace: 'nowrap',
        }}
        aria-expanded={open}
        aria-haspopup="true"
      >
        Actions
        <span style={{ fontSize: '0.625rem', lineHeight: 1 }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 'calc(100% + 2px)',
          zIndex: 200, background: '#fff', border: '1px solid #B1B4B6',
          boxShadow: '0 4px 12px rgba(11,12,12,0.12)', minWidth: '148px',
        }}>
          {items.map((item, i) => (
            <button
              key={item.label}
              onClick={() => { item.action(); setOpen(false) }}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '10px 14px', background: 'none', border: 'none',
                borderBottom: i < items.length - 1 ? '1px solid #f3f2f1' : 'none',
                cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.9375rem',
                color: item.destructive ? '#d4351c' : '#0B0C0C',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Tooltip system ──────────────────────────────────────────────────────────

function TooltipPopover({ content, pos }) {
  const TOOLTIP_W = 380
  const isAbove = pos.placement === 'above'
  return createPortal(
    <div style={{
      position: 'fixed',
      top: isAbove ? pos.anchorTop - 10 : pos.anchorBottom + 10,
      left: pos.left, width: TOOLTIP_W,
      transform: isAbove ? 'translateY(-100%)' : undefined,
      zIndex: 9999, pointerEvents: 'none',
    }}>
      <div style={{
        position: 'absolute', left: pos.arrowLeft,
        [isAbove ? 'bottom' : 'top']: -6,
        width: 12, height: 12, background: '#fff', border: '1px solid #B1B4B6',
        borderRight: isAbove ? '1px solid #B1B4B6' : 'none',
        borderBottom: isAbove ? 'none' : '1px solid #B1B4B6',
        borderTop: isAbove ? '1px solid #B1B4B6' : 'none',
        borderLeft: isAbove ? 'none' : '1px solid #B1B4B6',
        transform: 'rotate(45deg)', zIndex: 1,
      }} />
      <div style={{
        background: '#fff', border: '1px solid #B1B4B6',
        boxShadow: '0 4px 16px rgba(11,12,12,0.15)',
        padding: '16px 18px', maxHeight: '340px', overflowY: 'auto',
        position: 'relative', zIndex: 2,
      }}>
        {content}
      </div>
    </div>,
    document.body
  )
}

function HoverCard({ children, renderContent, disabled }) {
  const [tooltip, setTooltip] = useState(null)
  const anchorRef = useRef(null)
  const timerRef = useRef(null)

  const show = useCallback(() => {
    if (disabled) return
    timerRef.current = setTimeout(() => {
      if (!anchorRef.current) return
      const rect = anchorRef.current.getBoundingClientRect()
      const TOOLTIP_W = 380
      const GAP = 10
      let left = rect.left + rect.width / 2 - TOOLTIP_W / 2
      left = Math.max(GAP, Math.min(left, window.innerWidth - TOOLTIP_W - GAP))
      const arrowLeft = Math.min(Math.max(rect.left + rect.width / 2 - left - 6, 14), TOOLTIP_W - 26)
      const placement = rect.top > window.innerHeight * 0.55 ? 'above' : 'below'
      setTooltip({ left, arrowLeft, anchorTop: rect.top, anchorBottom: rect.bottom, placement })
    }, 150)
  }, [disabled])

  const hide = useCallback(() => { clearTimeout(timerRef.current); setTooltip(null) }, [])

  return (
    <span ref={anchorRef} onMouseEnter={show} onMouseLeave={hide}
      style={{ cursor: disabled ? undefined : 'help' }}>
      {children}
      {tooltip && <TooltipPopover content={renderContent()} pos={tooltip} />}
    </span>
  )
}

// ─── Tooltip content helpers ─────────────────────────────────────────────────

function SummaryTooltip({ summaryText }) {
  return (
    <div>
      <p style={{ margin: '0 0 8px', fontWeight: 700, fontSize: '0.875rem', color: '#505A5F',
        textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #dee0e2', paddingBottom: '8px' }}>
        Assessment summary
      </p>
      <p style={{ margin: 0, fontSize: '0.875rem', color: '#0B0C0C', lineHeight: 1.6 }}>
        {summaryText}
      </p>
    </div>
  )
}

function StageTooltip({ stage, dims }) {
  return (
    <div>
      <p style={{ margin: '0 0 10px', fontWeight: 700, fontSize: '0.875rem', color: '#0B0C0C',
        borderBottom: '1px solid #dee0e2', paddingBottom: '8px' }}>
        Stage {stage.number} — {stage.name}
      </p>
      {dims.map((item, i) => (
        <div key={item.id} style={{ marginBottom: i < dims.length - 1 ? '12px' : 0,
          paddingBottom: i < dims.length - 1 ? '12px' : 0,
          borderBottom: i < dims.length - 1 ? '1px solid #f3f2f1' : 'none' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '4px' }}>
            <span style={{ background: '#E8EDEE', color: '#505A5F', fontWeight: 700,
              fontSize: '0.6875rem', padding: '1px 5px', flexShrink: 0 }}>
              D{i + 1}
            </span>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#505A5F', lineHeight: 1.3 }}>
              {item.check}
            </span>
            {item.scoreEl}
          </div>
          {item.rationale && (
            <p style={{ margin: 0, fontSize: '0.8125rem', color: '#0B0C0C', lineHeight: 1.55 }}>
              {item.rationale}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}

function DimTooltip({ dimLabel, check, rationale }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '8px',
        borderBottom: '1px solid #dee0e2', paddingBottom: '8px' }}>
        <span style={{ background: '#E8EDEE', color: '#505A5F', fontWeight: 700,
          fontSize: '0.6875rem', padding: '1px 5px', flexShrink: 0 }}>
          {dimLabel}
        </span>
        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0B0C0C', lineHeight: 1.3 }}>
          {check}
        </span>
      </div>
      <p style={{ margin: 0, fontSize: '0.875rem', color: '#0B0C0C', lineHeight: 1.6 }}>
        {rationale}
      </p>
    </div>
  )
}

// ─── Compare view ─────────────────────────────────────────────────────────────

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
  const isComplete = (o) => !!o && o.scoredCount === o.totalCount
  const scoreLabel = (o) => isComplete(o) ? (o.percent >= 75 ? 'Strong' : o.percent >= 50 ? 'Moderate' : 'Emerging') : null
  const panelBg = (o) => isComplete(o) ? (o.percent >= 75 ? '#005a30' : o.percent >= 50 ? '#6e3619' : '#942514') : '#003087'

  return (
    <div>
      <button className="govuk-back-link" onClick={onClose}>Back to completed assessments</button>
      <h1 className="govuk-heading-l" style={{ marginBottom: '30px' }}>Compare assessments</h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${assessments.length}, 1fr)`,
        gap: '16px', marginBottom: '40px'
      }}>
        {assessments.map((a, i) => {
          const overall = overalls[i]
          const label = scoreLabel(overall)
          const bg = panelBg(overall)
          const hasSummary = !!a.summaryText
          return (
            <div key={a.id} style={{ border: '1px solid #B1B4B6', overflow: 'hidden' }}>
              <HoverCard disabled={!hasSummary} renderContent={() => <SummaryTooltip summaryText={a.summaryText} />}>
                <div style={{ background: bg, color: '#fff', padding: '20px 20px 16px', cursor: hasSummary ? 'help' : 'default' }}>
                  <p style={{ margin: '0 0 12px', fontWeight: 700, fontSize: '1.0625rem', lineHeight: 1.3 }}>
                    {a.pathway}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
                    <span style={{ fontSize: '2.5rem', fontWeight: 700, lineHeight: 1 }}>
                      {overall ? overall.total : '—'}
                    </span>
                    <span style={{ fontSize: '1rem', opacity: 0.7, marginBottom: '5px' }}>/ {MAX_SCORE}</span>
                    {label && (
                      <span style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '4px',
                        borderLeft: '2px solid rgba(255,255,255,0.4)', paddingLeft: '10px' }}>
                        {label}
                      </span>
                    )}
                  </div>
                  {hasSummary && (
                    <p style={{ margin: '10px 0 0', fontSize: '0.8125rem', opacity: 0.7 }}>Hover to read summary</p>
                  )}
                </div>
              </HoverCard>
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

      <div style={{ overflowX: 'auto' }}>
        <table className="govuk-table" style={{ tableLayout: 'fixed', width: '100%' }}>
          <colgroup>
            <col style={{ width: '28%' }} />
            {assessments.map(a => <col key={a.id} style={{ width: `${Math.floor(72 / assessments.length)}%` }} />)}
          </colgroup>
          <thead className="govuk-table__head">
            <tr className="govuk-table__row">
              <th className="govuk-table__header" style={{ paddingTop: '12px', paddingBottom: '12px' }}>Stage</th>
              {assessments.map(a => (
                <th key={a.id} className="govuk-table__header" style={{ paddingTop: '12px', paddingBottom: '12px', fontWeight: 700 }}>
                  {a.pathway}
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
                  <tr key={`stage-${stage.id}`} className="govuk-table__row"
                    style={{ background: '#f3f2f1', cursor: 'pointer' }}
                    onClick={() => toggleStage(stage.id)}>
                    <td className="govuk-table__cell" style={{ paddingTop: '14px', paddingBottom: '14px',
                      borderBottom: isExpanded ? '1px solid #dee0e2' : undefined }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ display: 'inline-block', width: '20px', height: '20px',
                          lineHeight: '20px', textAlign: 'center', fontSize: '0.75rem',
                          color: '#505A5F', transition: 'transform 0.15s',
                          transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', flexShrink: 0 }}>▶</span>
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
                      const stageDimData = stageDims.map((dim, dimIdx) => {
                        const d = getDimResult(a, stage.id, dim.id)
                        return { id: dim.id, check: dim.check, rationale: d?.rationale ?? null,
                          scoreEl: d ? <ScoreTag level={d.score} label={d.style?.label} size="small" /> : null }
                      })
                      const hasRationale = stageDimData.some(d => d.rationale)
                      return (
                        <td key={a.id} className="govuk-table__cell" style={{ paddingTop: '14px', paddingBottom: '14px',
                          borderBottom: isExpanded ? '1px solid #dee0e2' : undefined }}
                          onClick={e => e.stopPropagation()}>
                          {sc ? (
                            <HoverCard disabled={!hasRationale}
                              renderContent={() => <StageTooltip stage={stage} dims={stageDimData} />}>
                              <ScoreTag level={sc.level} label={sc.rating} />
                            </HoverCard>
                          ) : (
                            <span style={{ color: '#B1B4B6', fontSize: '0.875rem' }}>Not scored</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                  {isExpanded && stageDims.map((dim, dimIdx) => {
                    const isLastDim = dimIdx === stageDims.length - 1
                    return (
                      <tr key={`dim-${dim.id}`} className="govuk-table__row" style={{ background: '#fff' }}>
                        <td className="govuk-table__cell" style={{ paddingTop: '12px', paddingBottom: '12px',
                          paddingLeft: '44px', borderBottom: isLastDim && !isLast ? '3px solid #dee0e2' : undefined,
                          fontSize: '0.875rem', color: '#0B0C0C' }}>
                          <span style={{ display: 'inline-block', background: '#E8EDEE', color: '#505A5F',
                            fontWeight: 700, fontSize: '0.75rem', padding: '1px 6px', marginRight: '8px' }}>
                            D{dimIdx + 1}
                          </span>
                          {dim.check}
                        </td>
                        {assessments.map(a => {
                          const d = getDimResult(a, stage.id, dim.id)
                          return (
                            <td key={a.id} className="govuk-table__cell" style={{ paddingTop: '12px', paddingBottom: '12px',
                              borderBottom: isLastDim && !isLast ? '3px solid #dee0e2' : undefined, verticalAlign: 'top' }}>
                              {d ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <HoverCard disabled={!d.rationale}
                                    renderContent={() => <DimTooltip dimLabel={`D${dimIdx + 1}`} check={dim.check} rationale={d.rationale} />}>
                                    <ScoreTag level={d.score} label={d.style?.label} size="small" />
                                  </HoverCard>
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

// ─── Main list ─────────────────────────────────────────────────────────────────

export default function PreviousAssessmentsPage({ onBack, onEdit }) {
  const navigate = useNavigate()
  const [assessments, setAssessments] = useState([])
  const [loadingList, setLoadingList] = useState(true)

  useEffect(() => {
    getSavedAssessments().then(all => {
      const editingId = getEditingId()
      setAssessments(
        (editingId ? all.filter(a => a.id !== editingId) : all)
          .filter(a => !a.isArchived)
      )
      setLoadingList(false)
    })
  }, [])

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

  async function handleArchive(a) {
    await archiveAssessment(a.id)
    setAssessments(prev => prev.filter(x => x.id !== a.id))
    setCheckedIds(prev => { const next = new Set(prev); next.delete(a.id); return next })
  }

  const checkedAssessments = assessments.filter(a => checkedIds.has(a.id))

  if (comparing && checkedAssessments.length >= 2) {
    return <CompareView assessments={checkedAssessments} onClose={() => setComparing(false)} />
  }

  if (selected) {
    const activeStageData = STAGES.find(s => s.id === activeStage)
    return (
      <div>
        <button className="govuk-back-link" onClick={() => { setSelected(null); setActiveStage('stage1') }}>
          Back to completed assessments
        </button>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          gap: '20px', marginBottom: '25px', flexWrap: 'wrap' }}>
          <div>
            <h1 className="govuk-heading-l" style={{ margin: '0 0 4px' }}>{selected.pathway}</h1>
            <p className="govuk-hint" style={{ margin: 0 }}>
              Saved {formatDate(selected.savedAt)}{selected.savedBy ? ` by ${selected.savedBy}` : ''}
            </p>
          </div>
          <span className="govuk-tag govuk-tag--grey">Read only</span>
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
      <button className="govuk-back-link" onClick={onBack}>Back</button>

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
        <h1 className="govuk-heading-l" style={{ margin: 0 }}>Completed assessments</h1>
        <button
          type="button"
          onClick={() => navigate('/archived-assessments')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            fontSize: '0.9375rem', color: '#005EB8', textDecoration: 'underline', padding: 0,
            whiteSpace: 'nowrap' }}>
          View archived
        </button>
      </div>

      {loadingList ? (
        <div style={{ padding: '30px 0' }}>
          <div className="govuk-skeleton" style={{ height: '20px', width: '40%', marginBottom: '16px' }} />
          <div className="govuk-skeleton" style={{ height: '20px', width: '60%', marginBottom: '16px' }} />
          <div className="govuk-skeleton" style={{ height: '20px', width: '50%' }} />
        </div>
      ) : assessments.length === 0 ? (
        <div style={{ padding: '30px 0' }}>
          <p className="govuk-body" style={{ color: '#505A5F' }}>No completed assessments yet.</p>
          <button className="govuk-button govuk-button--nhs" onClick={onBack} style={{ marginBottom: 0 }}>
            Start an assessment
          </button>
        </div>
      ) : (
        <>
          {checkedIds.size > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
              padding: '14px 20px', marginBottom: '16px',
              background: '#f0f4f5', border: '1px solid #B1B4B6', borderLeft: '4px solid #005EB8'
            }}>
              <span className="govuk-body-s" style={{ margin: 0, fontWeight: 600, color: '#0B0C0C' }}>
                {checkedIds.size} {checkedIds.size === 1 ? 'assessment' : 'assessments'} selected
              </span>
              {checkedIds.size >= 2 ? (
                <>
                  <button className="govuk-button govuk-button--nhs" style={{ marginBottom: 0 }}
                    onClick={() => setComparing(true)}>
                    Compare selected
                  </button>
                  <button className="govuk-button govuk-button--secondary" style={{ marginBottom: 0 }}
                    onClick={() => exportComparisonXlsx(checkedAssessments)}>
                    Export comparison
                  </button>
                </>
              ) : (
                <span className="govuk-hint" style={{ margin: 0, fontSize: '0.875rem' }}>
                  Select at least 2 to compare
                </span>
              )}
              <button onClick={() => setCheckedIds(new Set())}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                  fontSize: '0.875rem', color: '#505A5F', textDecoration: 'underline', padding: 0, marginLeft: 'auto' }}>
                Clear selection
              </button>
            </div>
          )}

          {/* Task-list style assessment list */}
          <div style={{ background: '#fff', border: '1px solid #B1B4B6' }}>
            {/* Column header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '32px 1fr 130px 120px',
              gap: '0 16px',
              padding: '10px 20px 10px 16px',
              background: '#f3f2f1',
              borderBottom: '1px solid #B1B4B6',
              alignItems: 'center',
            }}>
              <span />
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#505A5F' }}>Pathway / condition</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#505A5F' }}>Readiness</span>
              <span className="govuk-visually-hidden">Actions</span>
            </div>

            {assessments.map((a, idx) => {
              const overall = calcOverall(a)
              const complete = overall && overall.scoredCount === overall.totalCount
              const label = complete ? (overall.percent >= 75 ? 'Strong' : overall.percent >= 50 ? 'Moderate' : 'Emerging') : null
              const level = complete ? (overall.percent >= 75 ? 'high' : overall.percent >= 50 ? 'medium' : 'low') : null
              const isChecked = checkedIds.has(a.id)
              const isLast = idx === assessments.length - 1

              const actionItems = [
                { label: 'View', action: () => { setSelected(a); setActiveStage('stage1') } },
                ...(onEdit ? [{ label: 'Edit', action: () => onEdit(a) }] : []),
                { label: 'Export Excel', action: () => exportAssessmentXlsx(a) },
                { label: 'Archive', action: () => handleArchive(a), destructive: true },
              ]

              return (
                <div
                  key={a.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '32px 1fr 130px 120px',
                    gap: '0 16px',
                    padding: '14px 20px 14px 16px',
                    borderBottom: isLast ? 'none' : '1px solid #dee0e2',
                    alignItems: 'center',
                    background: isChecked ? '#e8f4fe' : '#fff',
                  }}
                >
                  {/* Small checkbox */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <input
                      type="checkbox"
                      id={`check-${a.id}`}
                      checked={isChecked}
                      onChange={() => toggleCheck(a.id)}
                      aria-label={`Select ${a.pathway} for comparison`}
                      style={{
                        appearance: 'auto', width: '18px', height: '18px',
                        cursor: 'pointer', margin: 0, flexShrink: 0,
                      }}
                    />
                  </div>

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
                          {overall.total} / {MAX_SCORE}
                        </span>
                      </>
                    ) : (
                      <span style={{ color: '#B1B4B6', fontSize: '0.875rem' }}>—</span>
                    )}
                  </div>

                  {/* Actions dropdown */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <ActionMenu items={actionItems} />
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
