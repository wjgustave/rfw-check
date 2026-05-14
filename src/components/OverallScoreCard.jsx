import { STAGES, MAX_SCORE } from '../constants/stages'
import { stageScore, overallScore, applyOverrides } from '../utils/scoring'

export default function OverallScoreCard({ stageResults, summaryText, summaryLoading, overrides, allScored, onGenerateSummary, readOnly }) {
  const stageScores = {}
  STAGES.forEach(s => {
    const res = stageResults[s.id]
    const dims = res?.dimensions ?? []
    const scoredDims = applyOverrides(dims.filter(d => d.score), overrides)
    const stageFull = dims.length > 0 && dims.every(d => d.score)
    if (stageFull && scoredDims.length) stageScores[s.id] = stageScore(scoredDims)
  })

  const overall = overallScore(stageScores)
  const completedStages = Object.keys(stageScores).length

  const scoreLabel = overall
    ? overall.percent >= 75 ? 'Strong' : overall.percent >= 50 ? 'Moderate' : 'Emerging'
    : null

  const panelBg = overall
    ? overall.percent >= 75 ? '#005a30'
    : overall.percent >= 50 ? '#594d00'
    : '#942514'
    : '#003087'

  const showCompletionPanel = !readOnly && allScored && !summaryLoading && !summaryText
  const showSummaryContent = summaryLoading || summaryText

  return (
    <div style={{ marginBottom: '30px' }}>
      <div style={{ background: panelBg, color: '#FFFFFF', padding: '30px 30px 25px' }}>
        <p style={{ margin: '0 0 5px', fontSize: '1rem', fontWeight: 400, opacity: 0.85 }}>
          Overall readiness score
        </p>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '15px', marginBottom: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '4rem', fontWeight: 700, lineHeight: 1 }}>
            {overall ? overall.total : '—'}
          </span>
          <span style={{ fontSize: '1.5rem', opacity: 0.75, fontWeight: 300, marginBottom: '8px' }}>
            / {MAX_SCORE}
          </span>
          {scoreLabel && (
            <span style={{ fontSize: '1.375rem', fontWeight: 700, marginBottom: '6px',
              borderLeft: '3px solid rgba(255,255,255,0.5)', paddingLeft: '15px' }}>
              {scoreLabel}
            </span>
          )}
        </div>
        {!allScored && (
          <p style={{ margin: 0, fontSize: '0.9375rem', opacity: 0.75 }}>
            {completedStages} of {STAGES.length} stages fully assessed
          </p>
        )}
      </div>

      <div style={{ background: '#f0f4f5', border: '1px solid #B1B4B6', borderTop: 'none', padding: '15px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
          {STAGES.map(stage => {
            const sc = stageScores[stage.id]
            const scoredCount = stageResults[stage.id]?.dimensions?.filter(d => d.score).length ?? 0
            const totalCount = stageResults[stage.id]?.dimensions?.length ?? 0
            const anyLoading = stageResults[stage.id]?.dimensions?.some(d => d.loading) ?? false
            const stageFull = totalCount > 0 && scoredCount === totalCount
            return (
              <div key={stage.id} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.8125rem', color: '#505A5F', fontWeight: 700, marginBottom: '4px' }}>
                  S{stage.number}
                </div>
                {anyLoading && !stageFull && (
                  <span className="govuk-skeleton" style={{ display: 'inline-block', width: '40px', height: '22px' }} />
                )}
                {!stageFull && scoredCount > 0 && !anyLoading && (
                  <span style={{ fontSize: '0.7rem', color: '#505A5F', display: 'block' }}>{scoredCount}/{totalCount}</span>
                )}
                {stageFull && sc && (
                  <span className={`govuk-tag ${sc.level === 'high' ? 'govuk-tag--green' : sc.level === 'medium' ? 'govuk-tag--yellow' : 'govuk-tag--red'}`}
                    style={{ fontSize: '0.75rem', padding: '2px 6px 1px' }}>
                    {sc.rating}
                  </span>
                )}
                {!anyLoading && !sc && scoredCount === 0 && (
                  <span style={{ fontSize: '0.875rem', color: '#B1B4B6' }}>—</span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Assessment complete panel */}
      {showCompletionPanel && (
        <div>
          <div style={{
            background: '#005a30',
            color: '#FFFFFF',
            padding: '25px 30px',
            border: '1px solid #005a30',
            borderTop: 'none',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.375rem', fontWeight: 700, marginBottom: '4px' }}>
              Assessment complete
            </div>
            <p style={{ margin: 0, fontSize: '1rem', opacity: 0.85 }}>
              All {STAGES.length} stages and every dimension have been scored.
            </p>
          </div>
          <div style={{ background: '#FFFFFF', border: '1px solid #B1B4B6', borderTop: 'none', padding: '15px 20px' }}>
            <button onClick={onGenerateSummary} className="govuk-button govuk-button--secondary" style={{ marginBottom: 0 }}>
              Generate summary
            </button>
          </div>
        </div>
      )}

      {/* Summary content */}
      {showSummaryContent && (
        <div style={{ background: '#FFFFFF', border: '1px solid #B1B4B6', borderTop: 'none', padding: '20px' }}>
          {summaryLoading && (
            <div>
              <div className="govuk-skeleton" style={{ height: '16px', width: '100%', marginBottom: '8px' }} />
              <div className="govuk-skeleton" style={{ height: '16px', width: '90%', marginBottom: '8px' }} />
              <div className="govuk-skeleton" style={{ height: '16px', width: '75%' }} />
            </div>
          )}
          {summaryText && !summaryLoading && (
            <p className="govuk-body" style={{ margin: 0 }}>{summaryText}</p>
          )}
          {summaryText && !summaryLoading && !readOnly && onGenerateSummary && (
            <button
              onClick={onGenerateSummary}
              className="govuk-button govuk-button--secondary"
              style={{ marginBottom: 0, marginTop: '12px' }}
            >
              Regenerate summary
            </button>
          )}
        </div>
      )}
    </div>
  )
}
