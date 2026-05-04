import { STAGES, MAX_SCORE } from '../constants/stages'
import { stageScore, overallScore } from '../utils/scoring'

export default function OverallScoreCard({ stageResults, summaryText, summaryLoading }) {
  const stageScores = {}
  STAGES.forEach(s => {
    const res = stageResults[s.id]
    if (res?.dimensions?.length) stageScores[s.id] = stageScore(res.dimensions)
  })

  const overall = overallScore(stageScores)
  const completedCount = Object.keys(stageScores).length
  const allComplete = completedCount === STAGES.length

  const scoreLabel = overall
    ? overall.percent >= 75 ? 'Strong' : overall.percent >= 50 ? 'Moderate' : 'Emerging'
    : null

  const panelBg = overall
    ? overall.percent >= 75 ? '#005a30'
    : overall.percent >= 50 ? '#594d00'
    : '#942514'
    : '#003087'

  return (
    <div style={{ marginBottom: '30px' }}>
      {/* Score panel */}
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
            <span style={{
              fontSize: '1.375rem',
              fontWeight: 700,
              marginBottom: '6px',
              borderLeft: '3px solid rgba(255,255,255,0.5)',
              paddingLeft: '15px'
            }}>
              {scoreLabel}
            </span>
          )}
        </div>

        {!allComplete && (
          <p style={{ margin: 0, fontSize: '0.9375rem', opacity: 0.75 }}>
            {completedCount} of {STAGES.length} stages complete
          </p>
        )}
      </div>

      {/* Stage score grid */}
      <div style={{ background: '#F3F2F1', border: '1px solid #B1B4B6', borderTop: 'none', padding: '15px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
          {STAGES.map(stage => {
            const sc = stageScores[stage.id]
            const loading = stageResults[stage.id]?.loading
            return (
              <div key={stage.id} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.8125rem', color: '#505A5F', fontWeight: 700, marginBottom: '4px' }}>
                  S{stage.number}
                </div>
                {loading && !sc && (
                  <span className="govuk-skeleton" style={{ display: 'inline-block', width: '40px', height: '22px' }} />
                )}
                {sc && (
                  <span className={`govuk-tag ${sc.level === 'high' ? 'govuk-tag--green' : sc.level === 'medium' ? 'govuk-tag--yellow' : 'govuk-tag--red'}`}
                    style={{ fontSize: '0.75rem', padding: '2px 6px 1px' }}>
                    {sc.rating}
                  </span>
                )}
                {!loading && !sc && (
                  <span style={{ fontSize: '0.875rem', color: '#B1B4B6' }}>—</span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Summary */}
      {(summaryLoading || summaryText) && (
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
        </div>
      )}
    </div>
  )
}
