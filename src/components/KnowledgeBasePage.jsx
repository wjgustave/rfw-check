import { useState, useEffect } from 'react'
import ConfirmModal from './ConfirmModal'

function formatDate(iso) {
  if (!iso) return 'Never'
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

export default function KnowledgeBasePage() {
  const [sources, setSources] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  // Add form state
  const [label, setLabel] = useState('')
  const [syncType, setSyncType] = useState('space')
  const [pageId, setPageId] = useState('')
  const [spaceKey, setSpaceKey] = useState('')
  const [conditions, setConditions] = useState('')

  useEffect(() => { loadSources() }, [])

  async function loadSources() {
    setLoading(true)
    try {
      const res = await fetch('/api/confluence-sync')
      if (!res.ok) throw new Error(`Failed to load sources (${res.status})`)
      setSources(await res.json())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleAdd(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/confluence-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add',
          label: label.trim(),
          page_id: syncType === 'page' ? pageId.trim() : null,
          space_key: syncType === 'space' ? spaceKey.trim().toUpperCase() : null,
          conditions: conditions.split(',').map(s => s.trim()).filter(Boolean),
          created_by: sessionStorage.getItem('rfw_username') ?? null,
        })
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? `Error ${res.status}`)
      }
      setLabel(''); setPageId(''); setSpaceKey(''); setConditions('')
      setShowAdd(false)
      await loadSources()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteConfirm() {
    try {
      const res = await fetch('/api/confluence-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', source_id: pendingDelete.id })
      })
      if (!res.ok) throw new Error(`Error ${res.status}`)
      setPendingDelete(null)
      await loadSources()
    } catch (e) {
      setError(e.message)
      setPendingDelete(null)
    }
  }

  return (
    <div>
      {pendingDelete && (
        <ConfirmModal
          message={`Remove "${pendingDelete.label}" and all its stored content? This cannot be undone.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setPendingDelete(null)}
        />
      )}

      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        gap: '20px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div>
          <h1 className="govuk-heading-l" style={{ margin: '0 0 6px' }}>Knowledge base</h1>
          <p className="govuk-body" style={{ color: '#505A5F', margin: 0 }}>
            Confluence sources synced into the knowledge base. Assessments automatically use
            relevant content from these sources.
          </p>
        </div>
        <button
          onClick={() => { setShowAdd(s => !s); setError(null) }}
          className="govuk-button govuk-button--nhs"
          style={{ marginBottom: 0, flexShrink: 0 }}>
          {showAdd ? 'Cancel' : 'Add source'}
        </button>
      </div>

      {error && (
        <div className="govuk-error-summary" style={{ marginBottom: '20px' }}>
          <p className="govuk-body" style={{ margin: 0, color: '#d4351c' }}>{error}</p>
        </div>
      )}

      {/* Add source form */}
      {showAdd && (
        <div style={{ background: '#fff', border: '1px solid #B1B4B6', padding: '24px', marginBottom: '24px' }}>
          <h2 className="govuk-heading-m" style={{ marginTop: 0 }}>Add Confluence source</h2>
          <form onSubmit={handleAdd}>

            <div className="govuk-form-group">
              <label className="govuk-label" htmlFor="kb-label">
                Label <span style={{ color: '#505A5F', fontWeight: 400 }}>— a friendly name for this source</span>
              </label>
              <input id="kb-label" className="govuk-input" value={label}
                onChange={e => setLabel(e.target.value)} required
                placeholder="e.g. DTx in NHS App — Full Space" />
            </div>

            <div className="govuk-form-group">
              <fieldset className="govuk-fieldset">
                <legend className="govuk-fieldset__legend">What do you want to sync?</legend>
                <div className="govuk-radios govuk-radios--inline">
                  <div className="govuk-radios__item">
                    <input className="govuk-radios__input" id="type-space" type="radio"
                      value="space" checked={syncType === 'space'} onChange={() => setSyncType('space')} />
                    <label className="govuk-label govuk-radios__label" htmlFor="type-space">
                      Whole space
                    </label>
                  </div>
                  <div className="govuk-radios__item">
                    <input className="govuk-radios__input" id="type-page" type="radio"
                      value="page" checked={syncType === 'page'} onChange={() => setSyncType('page')} />
                    <label className="govuk-label govuk-radios__label" htmlFor="type-page">
                      Single page
                    </label>
                  </div>
                </div>
              </fieldset>
            </div>

            {syncType === 'space' ? (
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="kb-space">Space key</label>
                <p className="govuk-hint" style={{ marginBottom: '6px' }}>
                  Found in the space URL: /spaces/<strong>DTX</strong>
                </p>
                <input id="kb-space" className="govuk-input govuk-input--width-10"
                  value={spaceKey} onChange={e => setSpaceKey(e.target.value)}
                  required placeholder="DTX" style={{ textTransform: 'uppercase' }} />
              </div>
            ) : (
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="kb-page">Page ID</label>
                <p className="govuk-hint" style={{ marginBottom: '6px' }}>
                  Found in the page URL: /pages/<strong>1135293316</strong>/Page-Title
                </p>
                <input id="kb-page" className="govuk-input govuk-input--width-20"
                  value={pageId} onChange={e => setPageId(e.target.value)}
                  required placeholder="1135293316" />
              </div>
            )}

            <div className="govuk-form-group">
              <label className="govuk-label" htmlFor="kb-conditions">
                Conditions <span style={{ color: '#505A5F', fontWeight: 400 }}>— comma-separated</span>
              </label>
              <p className="govuk-hint" style={{ marginBottom: '6px' }}>
                Assessments for these conditions will use content from this source.
                Use the same terms as the pathway name — e.g. <em>virtual ward, remote monitoring</em>
              </p>
              <input id="kb-conditions" className="govuk-input" value={conditions}
                onChange={e => setConditions(e.target.value)}
                placeholder="virtual ward, remote monitoring, frailty" />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button type="submit" disabled={saving}
                className="govuk-button govuk-button--nhs" style={{ marginBottom: 0 }}>
                {saving ? 'Saving…' : 'Add source'}
              </button>
              <button type="button" onClick={() => { setShowAdd(false); setError(null) }}
                className="govuk-button govuk-button--secondary" style={{ marginBottom: 0 }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* How to sync callout */}
      <div style={{ background: '#f3f2f1', border: '1px solid #B1B4B6',
        padding: '16px 20px', marginBottom: '24px' }}>
        <p className="govuk-body-s" style={{ margin: '0 0 6px', fontWeight: 700 }}>
          How to sync
        </p>
        <p className="govuk-body-s" style={{ margin: '0 0 8px', color: '#505A5F' }}>
          Syncing must be run from a machine on the NHS network. Open a terminal in the project
          folder and run:
        </p>
        <code style={{ display: 'block', background: '#0B0C0C', color: '#fff',
          padding: '10px 14px', fontSize: '0.875rem', borderRadius: '2px' }}>
          node scripts/sync-confluence.js
        </code>
        <p className="govuk-body-s" style={{ margin: '8px 0 0', color: '#505A5F' }}>
          To sync a single source: <code>node scripts/sync-confluence.js &lt;source-id&gt;</code>
          <br />See <code>.env.sync.example</code> in the project root for the required credentials file.
        </p>
      </div>

      {/* Sources list */}
      {loading ? (
        <div style={{ padding: '20px 0' }}>
          {[40, 60, 50].map((w, i) => (
            <div key={i} className="govuk-skeleton"
              style={{ height: '20px', width: `${w}%`, marginBottom: '16px' }} />
          ))}
        </div>
      ) : sources.length === 0 ? (
        <div style={{ padding: '20px 0' }}>
          <p className="govuk-body" style={{ color: '#505A5F' }}>
            No sources added yet. Click <strong>Add source</strong> to register your first Confluence source.
          </p>
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #B1B4B6' }}>
          {/* Column headers */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 180px 80px 100px',
            gap: '0 16px',
            padding: '10px 20px 10px 16px',
            background: '#f3f2f1',
            borderBottom: '1px solid #B1B4B6',
          }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#505A5F' }}>Source</span>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#505A5F' }}>Last synced</span>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#505A5F' }}>Chunks</span>
            <span className="govuk-visually-hidden">Actions</span>
          </div>

          {sources.map((source, idx) => (
            <div key={source.id} style={{
              display: 'grid',
              gridTemplateColumns: '1fr 180px 80px 100px',
              gap: '0 16px',
              padding: '14px 20px 14px 16px',
              borderBottom: idx === sources.length - 1 ? 'none' : '1px solid #dee0e2',
              alignItems: 'center',
            }}>
              {/* Label + meta */}
              <div>
                <p style={{ margin: '0 0 3px', fontWeight: 700, fontSize: '1rem' }}>
                  {source.label}
                </p>
                <p style={{ margin: 0, fontSize: '0.8125rem', color: '#505A5F', lineHeight: 1.4 }}>
                  {source.space_key ? `Space: ${source.space_key}` : `Page: ${source.page_id}`}
                  {source.conditions?.length
                    ? ` · ${source.conditions.join(', ')}`
                    : ' · No conditions tagged'}
                </p>
              </div>

              {/* Last synced */}
              <span style={{ fontSize: '0.875rem', color: source.last_synced_at ? '#0B0C0C' : '#B1B4B6' }}>
                {formatDate(source.last_synced_at)}
              </span>

              {/* Chunk count */}
              <span style={{ fontSize: '0.875rem', color: '#505A5F' }}>
                {source.chunk_count ?? 0}
              </span>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setPendingDelete(source)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: 'inherit', fontSize: '0.9375rem',
                    color: '#d4351c', textDecoration: 'underline', padding: 0,
                  }}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
