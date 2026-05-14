import { STAGES, SCORE_STYLES } from '../constants/stages'
import { stageScore, applyOverrides } from '../utils/scoring'

export default function StageTabBar({ activeStage, onSelect, stageResults, overrides }) {
  return (
    <ul className="govuk-tabs__list" role="tablist">
      {STAGES.map(stage => {
        const res = stageResults[stage.id]
        const dims = res?.dimensions ?? []
        const scoredDims = applyOverrides(dims.filter(d => d.score), overrides)
        const sc = scoredDims.length ? stageScore(scoredDims) : null
        const anyLoading = dims.some(d => d.loading)
        const cancelled = res?.cancelled ?? false
        const isActive = activeStage === stage.id
        const style = sc ? SCORE_STYLES[sc.level] : null
        const scoredCount = dims.filter(d => d.score).length
        const totalCount = dims.length

        return (
          <li key={stage.id} role="presentation">
            <button role="tab" aria-selected={isActive} onClick={() => onSelect(stage.id)}
              className={`govuk-tabs__tab${isActive ? ' govuk-tabs__tab--selected' : ''}`}>
              <span style={{ fontSize: '0.8125rem', color: isActive ? '#505A5F' : '#505A5F', fontWeight: 400 }}>
                Stage {stage.number}
              </span>
              <span style={{ fontWeight: isActive ? 700 : 400, fontSize: '0.9375rem', color: isActive ? '#0B0C0C' : '#005EB8' }}>
                {stage.name}
              </span>
              <span style={{ minHeight: '22px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {anyLoading && scoredCount < totalCount && (
                  <span className="govuk-skeleton" style={{ display: 'inline-block', width: '40px', height: '14px' }} />
                )}
                {scoredCount > 0 && scoredCount < totalCount && !anyLoading && (
                  <span style={{ fontSize: '0.75rem', color: '#505A5F', background: '#E8EDEE', padding: '2px 6px', borderRadius: '2px' }}>
                    {scoredCount}/{totalCount}
                  </span>
                )}
                {!anyLoading && sc && style && scoredCount === totalCount && totalCount > 0 && (
                  <span className={`govuk-tag ${style.tag}`} style={{ fontSize: '0.75rem', padding: '2px 6px 1px' }}>
                    {sc.rating}
                  </span>
                )}
                {cancelled && (
                  <span style={{ fontSize: '0.75rem', color: '#505A5F' }}>Stopped</span>
                )}
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
