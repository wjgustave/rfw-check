import { SCORE_STYLES } from '../constants/stages'
import { stageScore, applyOverrides } from '../utils/scoring'
import DimensionCard from './DimensionCard'

function SkeletonCard() {
  return (
    <div className="govuk-summary-card" style={{ marginBottom: '15px' }}>
      <div className="govuk-summary-card__title-wrapper">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
          <span className="govuk-skeleton" style={{ width: '28px', height: '22px', display: 'inline-block', flexShrink: 0 }} />
          <span className="govuk-skeleton" style={{ flex: 1, height: '16px', display: 'inline-block' }} />
        </div>
        <span className="govuk-skeleton" style={{ width: '50px', height: '22px', display: 'inline-block', flexShrink: 0 }} />
      </div>
      <div className="govuk-summary-card__content" style={{ padding: '15px' }}>
        <div className="govuk-skeleton" style={{ height: '14px', width: '80%', marginBottom: '8px' }} />
        <div className="govuk-skeleton" style={{ height: '14px', width: '100%', marginBottom: '8px' }} />
        <div className="govuk-skeleton" style={{ height: '14px', width: '65%' }} />
      </div>
    </div>
  )
}

export default function StagePanel({ stage, result, overrides, onOverride }) {
  const loading = result?.loading ?? true
  const rawDimensions = result?.dimensions ?? []
  const dimensions = applyOverrides(rawDimensions, overrides)
  const sc = dimensions.length ? stageScore(dimensions) : null
  const style = sc ? SCORE_STYLES[sc.level] : null

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
        <div style={{ flexShrink: 0 }}>
          {sc && style ? (
            <span className={`govuk-tag ${style.tag}`} style={{ fontSize: '1rem', padding: '5px 12px 4px' }}>
              {sc.rating}
            </span>
          ) : loading && (
            <span className="govuk-skeleton" style={{ display: 'inline-block', width: '70px', height: '30px' }} />
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
        {loading && !rawDimensions.length
          ? stage.dimensions.map((_, i) => <SkeletonCard key={i} />)
          : stage.dimensions.map((dim, i) => (
              <DimensionCard
                key={dim.id}
                index={i}
                dimension={dim}
                result={rawDimensions.find(d => d.id === dim.id)}
                override={overrides?.[dim.id]}
                onOverride={onOverride}
              />
            ))
        }
      </div>
    </div>
  )
}
