import { STAGES, SCORE_STYLES } from '../constants/stages'
import { stageScore, applyOverrides } from '../utils/scoring'

export default function StageTabBar({ activeStage, onSelect, stageResults, overrides }) {
  return (
    <ul className="govuk-tabs__list" role="tablist">
      {STAGES.map(stage => {
        const res = stageResults[stage.id]
        const rawDims = res?.dimensions ?? []
        const dims = applyOverrides(rawDims, overrides)
        const sc = dims.length ? stageScore(dims) : null
        const loading = res?.loading ?? true
        const isActive = activeStage === stage.id
        const style = sc ? SCORE_STYLES[sc.level] : null

        return (
          <li key={stage.id} role="presentation">
            <button role="tab" aria-selected={isActive} onClick={() => onSelect(stage.id)}
              className={`govuk-tabs__tab${isActive ? ' govuk-tabs__tab--selected' : ''}`}>
              <span style={{ fontSize: '0.8125rem', color: isActive ? '#505A5F' : '#768692', fontWeight: 400 }}>
                Stage {stage.number}
              </span>
              <span style={{ fontWeight: isActive ? 700 : 400, fontSize: '0.9375rem', color: isActive ? '#0B0C0C' : '#005EB8' }}>
                {stage.name}
              </span>
              <span style={{ minHeight: '22px', display: 'flex', alignItems: 'center' }}>
                {loading && !sc && (
                  <span className="govuk-skeleton" style={{ display: 'inline-block', width: '40px', height: '14px' }} />
                )}
                {sc && style && (
                  <span className={`govuk-tag ${style.tag}`} style={{ fontSize: '0.75rem', padding: '2px 6px 1px' }}>
                    {sc.rating}
                  </span>
                )}
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
