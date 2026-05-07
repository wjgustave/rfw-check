import { useState } from 'react'
import { SCORE_STYLES } from '../constants/stages'

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

export default function DimensionCard({ index, dimension, result, override, onOverride }) {
  const [open, setOpen] = useState(true)

  const effectiveScore = override?.score || result?.score?.toLowerCase()
  const style = effectiveScore ? SCORE_STYLES[effectiveScore] : null
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
          {isOverridden && aiStyle && (
            <span className={`govuk-tag ${aiStyle.tag}`}
              style={{ fontSize: '0.75rem', padding: '2px 6px 1px', opacity: 0.45, textDecoration: 'line-through' }}>
              {aiStyle.label}
            </span>
          )}
          {style && (
            <span className={`govuk-tag ${style.tag}`}>{style.label}</span>
          )}
          {isOverridden && (
            <span className="govuk-tag govuk-tag--purple" style={{ fontSize: '0.75rem', padding: '2px 6px 1px' }}>
              Overridden
            </span>
          )}
          {result && (
            <button onClick={() => onOverride(dimension.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                fontSize: '0.875rem', color: '#005EB8', textDecoration: 'underline', padding: 0, flexShrink: 0 }}>
              Override
            </button>
          )}
          <button onClick={() => setOpen(o => !o)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              fontSize: '0.875rem', color: '#005EB8', textDecoration: 'underline', padding: 0, flexShrink: 0 }}>
            {open ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>

      {open && (
        <div className="govuk-summary-card__content">
          {!result && (
            <div style={{ padding: '10px 0' }}>
              <div className="govuk-skeleton" style={{ height: '16px', width: '70%', marginBottom: '8px' }} />
              <div className="govuk-skeleton" style={{ height: '16px', width: '100%', marginBottom: '8px' }} />
              <div className="govuk-skeleton" style={{ height: '16px', width: '85%' }} />
            </div>
          )}

          {result && (
            <>
              {isOverridden && (
                <div style={{ background: '#fff7bf', border: '1px solid #FFB81C', padding: '10px 15px', marginBottom: '15px', fontSize: '0.875rem' }}>
                  <p style={{ margin: '0 0 4px', fontWeight: 700, color: '#594d00' }}>
                    Overridden by {override.changedBy}
                    {override.changedAt && (
                      <span style={{ fontWeight: 400 }}> &bull; {new Date(override.changedAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    )}
                  </p>
                  <p style={{ margin: 0, color: '#594d00' }}>{override.rationale}</p>
                </div>
              )}

              {style && (
                <div className={`govuk-inset-text ${style.inset}`} style={{ marginBottom: '15px' }}>
                  <p className="govuk-body-s" style={{ margin: 0, color: style.text }}>
                    {result.rationale}
                  </p>
                </div>
              )}
              {!style && (
                <p className="govuk-body-s" style={{ color: '#505A5F', marginBottom: '15px' }}>
                  {result.rationale}
                </p>
              )}

              {result.sources?.length > 0 && (
                <div>
                  <p className="govuk-body-s" style={{ fontWeight: 700, marginBottom: '8px', color: '#505A5F' }}>
                    Sources
                  </p>
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
            </>
          )}
        </div>
      )}
    </div>
  )
}
