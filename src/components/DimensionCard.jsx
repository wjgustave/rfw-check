import { useState } from 'react'
import { SCORE_STYLES, SCORE_LEVELS, dimensionBands } from '../constants/stages'
import { scorePoints } from '../utils/scoring'

function ScoringCriteria({ dimension }) {
  const bands = dimensionBands(dimension)
  return (
    <details className="govuk-details" style={{ marginTop: '15px' }}>
      <summary className="govuk-details__summary">
        <span className="govuk-details__summary-text">Scoring criteria</span>
      </summary>
      <div className="govuk-details__text" style={{ padding: '12px 0 0', border: 'none' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {SCORE_LEVELS.map(level => {
            const s = SCORE_STYLES[level]
            return (
              <div key={level} style={{
                background: s.bg,
                borderLeft: `4px solid ${s.border}`,
                padding: '10px 12px',
                borderRadius: '2px',
              }}>
                <span style={{
                  display: 'inline-block',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: s.text,
                  marginBottom: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}>
                  {s.label}
                </span>
                <p style={{ margin: 0, fontSize: '0.875rem', color: s.text, lineHeight: '1.4' }}>
                  {bands[level]}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </details>
  )
}

function SourceLink({ src }) {
  const title = typeof src === 'string' ? src : src.title
  const url = typeof src === 'string' ? null : src.url
  if (url) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer"
        style={{ color: '#005EB8', fontSize: '0.9375rem', wordBreak: 'break-word' }}>
        {title}
      </a>
    )
  }
  return <span style={{ fontSize: '0.9375rem', color: '#0B0C0C' }}>{title}</span>
}

export default function DimensionCard({ index, dimension, result, override, onOverride, onAssess, readOnly }) {
  const [open, setOpen] = useState(true)

  const isLoading = result?.loading ?? false
  const hasError = !!result?.error && !result?.score
  const errorMessage = typeof result?.error === 'string' ? result.error : null
  const isScored = !!result?.score
  const effectiveScore = override?.score || result?.score?.toLowerCase()
  const style = effectiveScore ? SCORE_STYLES[effectiveScore] : null
  const effectivePoints = effectiveScore ? scorePoints(effectiveScore) : null
  const isOverridden = !!override
  const aiStyle = result?.score ? SCORE_STYLES[result.score.toLowerCase()] : null

  return (
    <div className="govuk-summary-card" style={{ marginBottom: '15px' }}>
      <div className="govuk-summary-card__title-wrapper">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#505A5F',
            background: '#E8EDEE', padding: '2px 7px', flexShrink: 0, marginTop: '1px' }}>
            D{index + 1}
          </span>
          <span style={{ fontWeight: 700, fontSize: '1rem', color: '#0B0C0C', lineHeight: 1.3 }}>
            {dimension.check}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {isLoading && (
            <span className="govuk-skeleton" style={{ display: 'inline-block', width: '50px', height: '22px' }} />
          )}
          {!isLoading && isOverridden && aiStyle && (
            <span className={`govuk-tag ${aiStyle.tag}`}
              style={{ fontSize: '0.75rem', padding: '2px 6px 1px', opacity: 0.45, textDecoration: 'line-through' }}>
              {aiStyle.label}
            </span>
          )}
          {!isLoading && style && (
            <span className={`govuk-tag ${style.tag}`}>{style.label}</span>
          )}
          {!isLoading && style && effectivePoints != null && (
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: style.text }}>
              {effectivePoints}<span style={{ color: '#505A5F', fontWeight: 400 }}>/100</span>
            </span>
          )}
          {!isLoading && isOverridden && (
            <span className="govuk-tag govuk-tag--purple" style={{ fontSize: '0.75rem', padding: '2px 6px 1px' }}>
              Overridden
            </span>
          )}
          {!readOnly && !isLoading && isScored && (
            <button onClick={() => onOverride(dimension.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                fontSize: '0.875rem', color: '#005EB8', textDecoration: 'underline', padding: 0, flexShrink: 0 }}>
              Override
            </button>
          )}
          {!readOnly && !isLoading && isScored && (
            <button onClick={onAssess}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                fontSize: '0.875rem', color: '#505A5F', textDecoration: 'underline', padding: 0, flexShrink: 0 }}>
              Re-assess
            </button>
          )}
          {!readOnly && !isLoading && hasError && (
            <button onClick={onAssess} className="govuk-button govuk-button--warning"
              style={{ marginBottom: 0, fontSize: '0.875rem', padding: '6px 12px 5px' }}>
              Retry
            </button>
          )}
          {!readOnly && !isLoading && !isScored && !hasError && (
            <button onClick={onAssess} className="govuk-button govuk-button--nhs"
              style={{ marginBottom: 0, fontSize: '0.875rem', padding: '6px 12px 5px' }}>
              Assess
            </button>
          )}
          {isScored && (
            <button onClick={() => setOpen(o => !o)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                fontSize: '0.875rem', color: '#005EB8', textDecoration: 'underline', padding: 0, flexShrink: 0 }}>
              {open ? 'Hide' : 'Show'}
            </button>
          )}
        </div>
      </div>

      {!isLoading && hasError && (
        <div className="govuk-summary-card__content">
          <p className="govuk-body-s" style={{ color: '#942514', margin: 0 }}>
            Assessment failed — click Retry to try again.
            {errorMessage && <> <span style={{ fontFamily: 'monospace' }}>({errorMessage})</span></>}
          </p>
          <ScoringCriteria dimension={dimension} />
        </div>
      )}

      {isLoading && (
        <div className="govuk-summary-card__content">
          {result?.notice && (
            <p className="govuk-body-s" style={{ margin: '0 0 10px', color: '#594d00', fontWeight: 700 }}>
              ⏳ {result.notice}
            </p>
          )}
          <div className="govuk-skeleton" style={{ height: '16px', width: '70%', marginBottom: '8px' }} />
          <div className="govuk-skeleton" style={{ height: '16px', width: '100%', marginBottom: '8px' }} />
          <div className="govuk-skeleton" style={{ height: '16px', width: '85%' }} />
        </div>
      )}

      {!isLoading && isScored && open && (
        <div className="govuk-summary-card__content">
          {isOverridden && (
            <div style={{ background: '#f3f0f8', border: '1px solid #3d2375', padding: '10px 15px', marginBottom: '15px', fontSize: '0.875rem' }}>
              <p style={{ margin: '0 0 4px', fontWeight: 700, color: '#0B0C0C' }}>
                Overridden by {override.changedBy}
                {override.changedAt && (
                  <span style={{ fontWeight: 400 }}> &bull; {new Date(override.changedAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                )}
              </p>
              <p style={{ margin: 0, color: '#0B0C0C' }}>{override.rationale}</p>
            </div>
          )}

          {style && (
            <div className={`govuk-inset-text ${style.inset}`} style={{ marginBottom: '15px' }}>
              <p className="govuk-body-s" style={{ margin: 0, color: '#212b32' }}>{result.rationale}</p>
            </div>
          )}
          {!style && (
            <p className="govuk-body-s" style={{ color: '#212b32', marginBottom: '15px' }}>{result.rationale}</p>
          )}

          {result.sources?.length > 0 && (
            <div>
              <p className="govuk-body-s" style={{ fontWeight: 700, marginBottom: '8px', color: '#505A5F' }}>Sources</p>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                {result.sources.map((src, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ color: '#005a30', fontWeight: 700, fontSize: '0.875rem', flexShrink: 0, marginTop: '2px' }}>↗</span>
                    <SourceLink src={src} />
                  </li>
                ))}
              </ul>
            </div>
          )}

          <ScoringCriteria dimension={dimension} />
        </div>
      )}

      {!isLoading && !isScored && !hasError && (
        <div className="govuk-summary-card__content">
          <ScoringCriteria dimension={dimension} />
        </div>
      )}
    </div>
  )
}
