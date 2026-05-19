import { useMemo, useState } from 'react'
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
  const [conditionFilter, setConditionFilter] = useState('')
  const [subFilter, setSubFilter] = useState('')

  const allGroups = useMemo(() => groupByConditionArea(NICE_HTG), [])

  // Unique condition areas for the first filter
  const conditionOptions = useMemo(() => allGroups.map(([area]) => area), [allGroups])

  // Sub-areas available for the selected condition (or all if none selected)
  const subOptions = useMemo(() => {
    const source = conditionFilter
      ? allGroups.filter(([area]) => area === conditionFilter)
      : allGroups
    const subs = new Set()
    for (const [, entries] of source) {
      for (const e of entries) {
        if (e.subArea) subs.add(e.subArea.trim())
      }
    }
    return Array.from(subs).sort()
  }, [allGroups, conditionFilter])

  // Filtered and grouped results
  const filteredGroups = useMemo(() => {
    return allGroups
      .filter(([area]) => !conditionFilter || area === conditionFilter)
      .map(([area, entries]) => [
        area,
        entries.filter(e => !subFilter || e.subArea?.trim() === subFilter),
      ])
      .filter(([, entries]) => entries.length > 0)
  }, [allGroups, conditionFilter, subFilter])

  const totalVisible = filteredGroups.reduce((n, [, e]) => n + e.length, 0)

  function clearFilters() {
    setConditionFilter('')
    setSubFilter('')
  }

  const isFiltered = conditionFilter || subFilter

  return (
    <div>
      <h1 className="govuk-heading-xl" style={{ marginBottom: '10px' }}>
        Condition list
      </h1>
      <p className="govuk-body-l" style={{ color: '#505A5F', marginBottom: '30px' }}>
        All NICE digital health technologies guidance (HTG) available for assessment.
      </p>

      {/* Filters */}
      <div style={{
        background: '#f0f4f5',
        border: '1px solid #B1B4B6',
        padding: '20px',
        marginBottom: '30px',
        display: 'flex',
        gap: '20px',
        flexWrap: 'wrap',
        alignItems: 'flex-end',
      }}>
        <div className="govuk-form-group" style={{ margin: 0, flex: '1 1 220px' }}>
          <label className="govuk-label" htmlFor="filter-condition" style={{ fontWeight: 700 }}>
            Filter by condition
          </label>
          <select
            id="filter-condition"
            className="govuk-input"
            value={conditionFilter}
            onChange={e => { setConditionFilter(e.target.value); setSubFilter('') }}
            style={{ height: '44px', cursor: 'pointer' }}
          >
            <option value="">All conditions</option>
            {conditionOptions.map(area => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>
        </div>

        <div className="govuk-form-group" style={{ margin: 0, flex: '1 1 220px' }}>
          <label className="govuk-label" htmlFor="filter-sub" style={{ fontWeight: 700 }}>
            Filter by sub-condition
          </label>
          <select
            id="filter-sub"
            className="govuk-input"
            value={subFilter}
            onChange={e => setSubFilter(e.target.value)}
            style={{ height: '44px', cursor: 'pointer' }}
            disabled={subOptions.length === 0}
          >
            <option value="">All sub-conditions</option>
            {subOptions.map(sub => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
        </div>

        {isFiltered && (
          <div style={{ flexShrink: 0, alignSelf: 'flex-end', paddingBottom: '1px' }}>
            <button
              type="button"
              onClick={clearFilters}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '1rem',
                color: '#005EB8',
                textDecoration: 'underline',
                padding: 0,
              }}
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Result count */}
      <p className="govuk-body-s" style={{ color: '#505A5F', marginBottom: '20px' }}>
        Showing {totalVisible} {totalVisible === 1 ? 'entry' : 'entries'}
        {isFiltered && ' (filtered)'}
      </p>

      <hr className="rfw-divider" style={{ marginBottom: '25px' }} />

      {filteredGroups.length === 0 ? (
        <p className="govuk-body" style={{ color: '#505A5F' }}>No entries match the selected filters.</p>
      ) : (
        filteredGroups.map(([conditionArea, entries]) => (
          <section key={conditionArea} style={{ marginBottom: '35px' }}>
            <h2 className="govuk-heading-m" style={{
              borderBottom: '2px solid #005EB8',
              paddingBottom: '8px',
              marginBottom: '0',
            }}>
              {conditionArea}
            </h2>

            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              {entries.map(entry => (
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
        ))
      )}
    </div>
  )
}
