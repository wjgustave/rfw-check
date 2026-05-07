import { SCORE_STYLES } from '../constants/stages'
import { stageScore, applyOverrides } from '../utils/scoring'
import DimensionCard from './DimensionCard'

export default function StagePanel({ stage, result, overrides, onOverride, onAssessDimension, onAssessStage, loading }) {
  const dims = result?.dimensions ?? []
  const cancelled = result?.cancelled ?? false

  const scoredDims = dims.filter(d => d.score)
  const effectiveDims = applyOverrides(scoredDims, overrides)
  const sc = effectiveDims.length ? stageScore(effectiveDims) : null
  const style = sc ? SCORE_STYLES[sc.level] : null

  const allScored = dims.length > 0 && dims.every(d => d.score)
  const anyLoading = dims.some(d => d.loading)
  const anyUnscored = dims.some(d => !d.score && !d.loading)

  if (cancelled) {
    return (
      <div className="govuk-tabs__panel" role="tabpanel">
        <span className="govuk-caption-m">Stage {stage.number} of 6</span>
        <h2 className="govuk-heading-l">{stage.name}</h2>
        <p className="govuk-body" style={{ color: '#505A5F' }}>
          This stage was not assessed — the assessment was stopped.
        </p>
      </div>
    )
  }

  return (
    <div className="govuk-tabs__panel" role="tabpanel">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px', marginBottom: '20px' }}>
        <div>
          <span className="govuk-caption-m">Stage {stage.number} of 6</span>
          <h2 className="govuk-heading-l" style={{ margin: 0 }}>{stage.name}</h2>
          <p className="govuk-body" style={{ color: '#505A5F', marginTop: '5px', marginBottom: 0 }}>
            {stage.question}
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', flexShrink: 0 }}>
          {sc && style && (
            <span className={`govuk-tag ${style.tag}`} style={{ fontSize: '1rem', padding: '5px 12px 4px' }}>
              {sc.rating}
            </span>
          )}
          {!loading && (anyUnscored || allScored) && (
            <button
              onClick={onAssessStage}
              className="govuk-button govuk-button--secondary"
              style={{ marginBottom: 0, fontSize: '0.875rem', padding: '6px 12px 5px' }}>
              {allScored ? 'Re-assess all' : 'Assess all'}
            </button>
          )}
        </div>
      </div>

      {sc && style && (
        <div className={`govuk-inset-text ${style.inset}`} style={{ marginBottom: '25px' }}>
          <p className="govuk-body-s" style={{ margin: 0, color: style.text, fontWeight: 700 }}>
            {stage.interpretation[sc.level]}
          </p>
        </div>
      )}

      <div>
        {stage.dimensions.map((dim, i) => {
          const dimResult = dims.find(d => d.id === dim.id)
          return (
            <DimensionCard
              key={dim.id}
              index={i}
              dimension={dim}
              result={dimResult}
              override={overrides?.[dim.id]}
              onOverride={onOverride}
              onAssess={() => onAssessDimension(dim.id)}
            />
          )
        })}
      </div>
    </div>
  )
}
