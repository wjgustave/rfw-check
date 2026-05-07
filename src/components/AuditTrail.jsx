import { useState } from 'react'
import { SCORE_STYLES } from '../constants/stages'

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  } catch { return iso }
}

export default function AuditTrail({ entries }) {
  const [open, setOpen] = useState(false)
  if (!entries?.length) return null

  return (
    <div style={{ marginTop: '30px', borderTop: '2px solid #B1B4B6', paddingTop: '20px' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#005EB8',
          textDecoration: 'underline', fontFamily: 'inherit', fontSize: '1rem', padding: 0 }}>
        {open ? 'Hide' : 'Show'} audit trail ({entries.length} {entries.length === 1 ? 'change' : 'changes'})
      </button>

      {open && (
        <div style={{ marginTop: '15px' }}>
          {entries.map(entry => {
            const fromStyle = SCORE_STYLES[entry.previousScore]
            const toStyle = SCORE_STYLES[entry.newScore]
            return (
              <div key={entry.id} style={{ borderLeft: '4px solid #005EB8', paddingLeft: '15px', marginBottom: '20px' }}>
                <p style={{ margin: '0 0 4px', fontSize: '0.9375rem', fontWeight: 700 }}>
                  Stage {entry.stageNumber} — D{entry.dimIndex + 1}: {entry.dimensionCheck}
                </p>
                <p style={{ margin: '0 0 6px', fontSize: '0.875rem', color: '#505A5F' }}>
                  {formatDate(entry.changedAt)} &bull; <strong>{entry.changedBy}</strong>
                </p>
                <p style={{ margin: '0 0 6px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span className={`govuk-tag ${fromStyle?.tag}`} style={{ fontSize: '0.75rem' }}>{fromStyle?.label}</span>
                  <span style={{ color: '#505A5F' }}>&rarr;</span>
                  <span className={`govuk-tag ${toStyle?.tag}`} style={{ fontSize: '0.75rem' }}>{toStyle?.label}</span>
                </p>
                <p style={{ margin: 0, fontSize: '0.9375rem', color: '#0B0C0C' }}>{entry.rationale}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
