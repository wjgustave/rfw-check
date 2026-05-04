import { useState } from 'react'
import { SCORE_STYLES } from '../constants/stages'

export default function DimensionCard({ index, dimension, result }) {
  const [open, setOpen] = useState(true)
  const score = result?.score?.toLowerCase()
  const style = score ? SCORE_STYLES[score] : null

  return (
    <div className="govuk-summary-card">
      {/* Title bar */}
      <div className="govuk-summary-card__title-wrapper">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', flex: 1, minWidth: 0 }}>
          <span style={{
            fontSize: '0.8125rem',
            fontWeight: 700,
            color: '#505A5F',
            background: '#E8EDEE',
            padding: '2px 7px',
            flexShrink: 0,
            marginTop: '1px'
          }}>
            D{index + 1}
          </span>
          <span style={{ fontWeight: 700, fontSize: '1rem', color: '#0B0C0C', lineHeight: 1.3 }}>
            {dimension.check}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          {style && (
            <span className={`govuk-tag ${style.tag}`}>{style.label}</span>
          )}
          <button
            onClick={() => setOpen(o => !o)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '0.875rem',
              color: '#005EB8',
              textDecoration: 'underline',
              padding: 0,
              flexShrink: 0
            }}
          >
            {open ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>

      {/* Content */}
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
                    Evidence sources
                  </p>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                    {dimension.evidenceSources.map(src => {
                      const cited = result.sources.some(s =>
                        s.toLowerCase().includes(src.toLowerCase().slice(0, 15))
                      )
                      return (
                        <li key={src} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
                          {cited ? (
                            <span style={{ color: '#005a30', fontWeight: 700, fontSize: '0.875rem', flexShrink: 0, marginTop: '1px' }}>✓</span>
                          ) : (
                            <span style={{ color: '#B1B4B6', fontSize: '0.875rem', flexShrink: 0, marginTop: '1px' }}>—</span>
                          )}
                          <span style={{ fontSize: '0.9375rem', color: cited ? '#0B0C0C' : '#505A5F', fontWeight: cited ? 700 : 400 }}>
                            {src}
                            {cited && (
                              <span className="govuk-tag govuk-tag--green" style={{ marginLeft: '8px', fontSize: '0.75rem', padding: '1px 6px' }}>
                                cited
                              </span>
                            )}
                          </span>
                        </li>
                      )
                    })}
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
