import { useState } from 'react'
import { migrateToSupabase } from '../utils/migrateLocalStorage'

export default function MigrationBanner({ onDone }) {
  const [status, setStatus] = useState('idle') // idle | running | done | error
  const [progress, setProgress] = useState({ done: 0, total: 0, errors: 0 })
  const [result, setResult] = useState(null)

  async function handleMigrate() {
    setStatus('running')
    const res = await migrateToSupabase(p => setProgress(p))
    setResult(res)
    setStatus(res.errors > 0 ? 'error' : 'done')
  }

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #B1B4B6',
      borderLeft: '5px solid #003087',
      padding: '20px 24px',
      marginBottom: '30px',
    }}>
      {status === 'idle' && (
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: '1rem', margin: '0 0 4px', color: '#0B0C0C' }}>
              Locally saved assessments found
            </p>
            <p style={{ margin: 0, fontSize: '0.9375rem', color: '#505A5F' }}>
              Previous assessments are stored in this browser only. Migrate them to the database so they are available everywhere.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexShrink: 0 }}>
            <button
              className="govuk-button govuk-button--nhs"
              style={{ marginBottom: 0 }}
              onClick={handleMigrate}>
              Migrate now
            </button>
            <button
              onClick={onDone}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                fontSize: '0.9375rem', color: '#505A5F', textDecoration: 'underline', padding: 0 }}>
              Dismiss
            </button>
          </div>
        </div>
      )}

      {status === 'running' && (
        <div>
          <p style={{ fontWeight: 700, fontSize: '1rem', margin: '0 0 10px', color: '#0B0C0C' }}>
            Migrating…
          </p>
          <div style={{ background: '#f3f2f1', borderRadius: '2px', height: '8px', width: '100%', overflow: 'hidden' }}>
            <div style={{
              background: '#005EB8',
              height: '100%',
              width: progress.total > 0 ? `${Math.round((progress.done / progress.total) * 100)}%` : '0%',
              transition: 'width 0.2s ease',
            }} />
          </div>
          <p style={{ margin: '8px 0 0', fontSize: '0.875rem', color: '#505A5F' }}>
            {progress.done} of {progress.total} records
          </p>
        </div>
      )}

      {status === 'done' && (
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: '1rem', margin: '0 0 4px', color: '#005a30' }}>
              Migration complete
            </p>
            <p style={{ margin: 0, fontSize: '0.9375rem', color: '#505A5F' }}>
              {result.savedCount > 0 && <>{result.savedCount} completed assessment{result.savedCount !== 1 ? 's' : ''}</>}
              {result.savedCount > 0 && result.inProgressCount > 0 && ' and '}
              {result.inProgressCount > 0 && <>{result.inProgressCount} incomplete assessment{result.inProgressCount !== 1 ? 's' : ''}</>}
              {' '}moved to the database. Your browser copy has been kept as a backup.
            </p>
          </div>
          <button
            className="govuk-button govuk-button--secondary"
            style={{ marginBottom: 0, flexShrink: 0 }}
            onClick={onDone}>
            Done
          </button>
        </div>
      )}

      {status === 'error' && (
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: '1rem', margin: '0 0 4px', color: '#942514' }}>
              Migration completed with errors
            </p>
            <p style={{ margin: 0, fontSize: '0.9375rem', color: '#505A5F' }}>
              {result.done} of {result.total} records migrated successfully. {result.errors} failed — check the browser console for details. Your local data is unchanged.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexShrink: 0 }}>
            <button
              className="govuk-button govuk-button--nhs"
              style={{ marginBottom: 0 }}
              onClick={handleMigrate}>
              Retry
            </button>
            <button
              onClick={onDone}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                fontSize: '0.9375rem', color: '#505A5F', textDecoration: 'underline', padding: 0 }}>
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
