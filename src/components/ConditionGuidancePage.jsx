import { useMemo } from 'react'
import { NICE_HTG } from '../constants/niceHtg'

function groupByConditionArea(entries) {
  const map = new Map()
  for (const entry of entries) {
    const key = entry.conditionArea.trim()
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(entry)
  }
  return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b))
}

export default function ConditionGuidancePage({ onAssess }) {
  const groups = useMemo(() => groupByConditionArea(NICE_HTG), [])

  return (
    <div>
      <h1 className="govuk-heading-xl" style={{ marginBottom: '10px' }}>
        Condition guidance list
      </h1>
      <p className="govuk-body-l" style={{ color: '#505A5F', marginBottom: '10px' }}>
        All NICE digital health technologies guidance (HTG) available for assessment,
        grouped by condition area.
      </p>
      <p className="govuk-body" style={{ marginBottom: '30px' }}>
        Select a guidance entry to start an assessment, or{' '}
        <a href="https://www.nice.org.uk/about/what-we-do/our-programmes/nice-evidence-standards-framework-for-digital-health-technologies"
          target="_blank" rel="noopener noreferrer"
          style={{ color: '#005EB8' }}>
          view the full NICE HTG programme
        </a>.
      </p>

      <hr className="rfw-divider" style={{ marginBottom: '30px' }} />

      {groups.map(([conditionArea, entries]) => (
        <section key={conditionArea} style={{ marginBottom: '35px' }}>
          <h2 className="govuk-heading-m" style={{
            borderBottom: '2px solid #005EB8',
            paddingBottom: '8px',
            marginBottom: '0',
          }}>
            {conditionArea}
          </h2>

          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {entries.map((entry, i) => (
              <li
                key={entry.htgRef}
                style={{
                  borderBottom: '1px solid #B1B4B6',
                  padding: '14px 0',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                }}
              >
                {/* HTG ref badge */}
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '2px 7px',
                  background: '#d2e2f1',
                  color: '#144e81',
                  flexShrink: 0,
                  marginTop: '2px',
                  whiteSpace: 'nowrap',
                }}>
                  {entry.htgRef}
                </span>

                {/* Title + sub-area */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {onAssess ? (
                    <button
                      onClick={() => onAssess(entry.title)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        fontSize: '1rem',
                        fontWeight: 700,
                        color: '#005EB8',
                        textDecoration: 'underline',
                        padding: 0,
                        textAlign: 'left',
                        lineHeight: 1.4,
                      }}
                    >
                      {entry.title}
                    </button>
                  ) : (
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: '#0B0C0C', lineHeight: 1.4 }}>
                      {entry.title}
                    </span>
                  )}
                  {entry.subArea && (
                    <div style={{ fontSize: '0.875rem', color: '#505A5F', marginTop: '3px' }}>
                      {entry.subArea}
                    </div>
                  )}
                </div>

                {/* Published date + NICE link */}
                <div style={{ flexShrink: 0, textAlign: 'right', fontSize: '0.875rem', color: '#505A5F' }}>
                  <div style={{ marginBottom: '4px' }}>{entry.publishedDate}</div>
                  <a
                    href={entry.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#005EB8', fontSize: '0.875rem' }}
                  >
                    NICE guidance ↗
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
