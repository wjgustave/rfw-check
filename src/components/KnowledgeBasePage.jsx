import { useState, useEffect } from 'react'
import ConfirmModal from './ConfirmModal'

function formatDate(iso) {
  if (!iso) return 'Never'
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

// Builds the bookmarklet code pointing at this app's origin
function buildBookmarklet(appUrl) {
  const code = `
(function(){
  var title = (document.querySelector('#title-text') || document.querySelector('h1') || {}).innerText || document.title;
  var content = (
    document.querySelector('#main-content') ||
    document.querySelector('.wiki-content') ||
    document.querySelector('#content-body') ||
    document.querySelector('#content') ||
    document.body
  ).innerText;
  var url = window.location.href;
  var conditions = prompt('Tag this page to conditions (comma-separated):\\ne.g. virtual ward, remote monitoring\\n\\nLeave blank to add no tags:', '');
  if(conditions === null) return;
  var btn = document.createElement('div');
  btn.style.cssText = 'position:fixed;top:20px;right:20px;background:#005EB8;color:#fff;padding:12px 18px;border-radius:4px;font-family:sans-serif;font-size:14px;z-index:99999;box-shadow:0 2px 8px rgba(0,0,0,0.3)';
  btn.innerText = 'Saving to knowledge base…';
  document.body.appendChild(btn);
  fetch('${appUrl}/api/ingest',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({
      title: title.trim(),
      content: content.trim(),
      source_url: url,
      conditions: conditions ? conditions.split(',').map(function(s){return s.trim();}).filter(Boolean) : []
    })
  })
  .then(function(r){return r.json();})
  .then(function(d){
    btn.style.background = '#007f3b';
    btn.innerText = '✓ Saved — ' + d.chunks + ' chunks stored';
    setTimeout(function(){btn.remove();}, 3000);
  })
  .catch(function(e){
    btn.style.background = '#d4351c';
    btn.innerText = '✗ Failed: ' + e.message;
    setTimeout(function(){btn.remove();}, 4000);
  });
})();`
  return 'javascript:' + encodeURIComponent(code.trim())
}

export default function KnowledgeBasePage() {
  const [sources, setSources] = useState([])
  const [capturedPages, setCapturedPages] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [appUrl, setAppUrl] = useState('')

  // Add form state
  const [label, setLabel] = useState('')
  const [syncType, setSyncType] = useState('space')
  const [pageId, setPageId] = useState('')
  const [spaceKey, setSpaceKey] = useState('')
  const [conditions, setConditions] = useState('')

  useEffect(() => {
    setAppUrl(window.location.origin)
    loadAll()
  }, [])

  async function loadAll() {
    setLoading(true)
    try {
      const [sourcesRes, capturedRes] = await Promise.all([
        fetch('/api/confluence-sync'),
        fetch('/api/ingest'),
      ])
      if (!sourcesRes.ok) throw new Error(`Failed to load sources (${sourcesRes.status})`)
      if (!capturedRes.ok) throw new Error(`Failed to load captured pages (${capturedRes.status})`)
      setSources(await sourcesRes.json())
      setCapturedPages(await capturedRes.json())
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
      await loadAll()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteSourceConfirm() {
    try {
      const res = await fetch('/api/confluence-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', source_id: pendingDelete.id })
      })
      if (!res.ok) throw new Error(`Error ${res.status}`)
      setPendingDelete(null)
      await loadAll()
    } catch (e) {
      setError(e.message)
      setPendingDelete(null)
    }
  }

  async function handleDeleteCaptured(page) {
    try {
      await fetch('/api/ingest', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source_url: page.source_url })
      })
      await loadAll()
    } catch (e) {
      setError(e.message)
    }
  }

  const bookmarklet = appUrl ? buildBookmarklet(appUrl) : '#'

  return (
    <div>
      {pendingDelete && (
        <ConfirmModal
          message={`Remove "${pendingDelete.label ?? pendingDelete.page_title}" and all its stored content? This cannot be undone.`}
          onConfirm={pendingDelete.id ? handleDeleteSourceConfirm : () => { handleDeleteCaptured(pendingDelete); setPendingDelete(null) }}
          onCancel={() => setPendingDelete(null)}
        />
      )}

      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        gap: '20px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div>
          <h1 className="govuk-heading-l" style={{ margin: '0 0 6px' }}>Knowledge base</h1>
          <p className="govuk-body" style={{ color: '#505A5F', margin: 0 }}>
            Confluence content stored here is automatically used to enrich condition assessments.
          </p>
        </div>
        <button
          onClick={() => { setShowAdd(s => !s); setError(null) }}
          className="govuk-button govuk-button--secondary"
          style={{ marginBottom: 0, flexShrink: 0 }}>
          {showAdd ? 'Cancel' : 'Register sync source'}
        </button>
      </div>

      {error && (
        <div className="govuk-error-summary" style={{ marginBottom: '20px' }}>
          <p className="govuk-body" style={{ margin: 0, color: '#d4351c' }}>{error}</p>
        </div>
      )}

      {/* ── Bookmarklet section ── */}
      <div style={{ background: '#fff', border: '1px solid #B1B4B6', padding: '24px', marginBottom: '24px' }}>
        <h2 className="govuk-heading-m" style={{ marginTop: 0, marginBottom: '8px' }}>
          Capture a page from your browser
        </h2>
        <p className="govuk-body" style={{ color: '#505A5F', marginBottom: '16px' }}>
          When you are logged in to Confluence in your browser, click the button below on any page
          you want to add to the knowledge base. It reads the page content directly — no API key needed.
        </p>

        <p className="govuk-body-s" style={{ fontWeight: 700, marginBottom: '8px' }}>
          Step 1 — Drag this button to your browser bookmarks toolbar:
        </p>
        <div style={{ marginBottom: '16px' }}>
          <a
            href={bookmarklet}
            onClick={e => e.preventDefault()}
            draggable="true"
            style={{
              display: 'inline-block',
              background: '#005EB8',
              color: '#fff',
              padding: '8px 16px',
              borderRadius: '4px',
              fontFamily: 'inherit',
              fontSize: '0.9375rem',
              fontWeight: 700,
              textDecoration: 'none',
              cursor: 'grab',
              userSelect: 'none',
            }}>
            📋 Save to CRF Knowledge Base
          </a>
          <p className="govuk-hint" style={{ marginTop: '8px', marginBottom: 0 }}>
            Click and drag the button above into your bookmarks bar. If you can't see the bookmarks bar, press <strong>Cmd+Shift+B</strong> (Mac) or <strong>Ctrl+Shift+B</strong> (Windows).
          </p>
        </div>

        <p className="govuk-body-s" style={{ fontWeight: 700, marginBottom: '4px' }}>
          Step 2 — Use it on any Confluence page:
        </p>
        <ol className="govuk-list govuk-list--number govuk-body-s" style={{ color: '#505A5F', marginBottom: 0 }}>
          <li>Go to a Confluence page you want to capture</li>
          <li>Click the <strong>Save to CRF Knowledge Base</strong> bookmark</li>
          <li>A prompt will ask which conditions to tag the page to — type them separated by commas</li>
          <li>A green confirmation will appear on the page when it's saved</li>
        </ol>
      </div>

      {/* ── Captured pages list ── */}
      <h2 className="govuk-heading-m" style={{ marginBottom: '12px' }}>Captured pages</h2>

      {loading ? (
        <div style={{ padding: '10px 0 24px' }}>
          {[50, 70, 40].map((w, i) => (
            <div key={i} className="govuk-skeleton"
              style={{ height: '18px', width: `${w}%`, marginBottom: '14px' }} />
          ))}
        </div>
      ) : capturedPages.length === 0 ? (
        <p className="govuk-body" style={{ color: '#505A5F', marginBottom: '32px' }}>
          No pages captured yet. Use the bookmark above on any Confluence page to add content.
        </p>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #B1B4B6', marginBottom: '32px' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 180px 120px',
            gap: '0 16px', padding: '10px 20px 10px 16px',
            background: '#f3f2f1', borderBottom: '1px solid #B1B4B6',
          }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#505A5F' }}>Page</span>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#505A5F' }}>Captured</span>
            <span className="govuk-visually-hidden">Actions</span>
          </div>
          {capturedPages.map((page, idx) => (
            <div key={page.source_url ?? idx} style={{
              display: 'grid', gridTemplateColumns: '1fr 180px 120px',
              gap: '0 16px', padding: '14px 20px 14px 16px',
              borderBottom: idx === capturedPages.length - 1 ? 'none' : '1px solid #dee0e2',
              alignItems: 'center',
            }}>
              <div>
                <p style={{ margin: '0 0 3px', fontWeight: 700, fontSize: '1rem' }}>
                  {page.source_url
                    ? <a href={page.source_url} target="_blank" rel="noreferrer"
                        style={{ color: '#005EB8' }}>{page.page_title}</a>
                    : page.page_title}
                </p>
                <p style={{ margin: 0, fontSize: '0.8125rem', color: '#505A5F' }}>
                  {page.conditions?.length ? page.conditions.join(', ') : 'No conditions tagged'}
                </p>
              </div>
              <span style={{ fontSize: '0.875rem', color: '#505A5F' }}>
                {formatDate(page.captured_at)}
              </span>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => setPendingDelete(page)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: 'inherit', fontSize: '0.9375rem',
                    color: '#d4351c', textDecoration: 'underline', padding: 0 }}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Registered sync sources ── */}
      <h2 className="govuk-heading-m" style={{ marginBottom: '12px' }}>Registered sync sources</h2>
      <p className="govuk-body-s" style={{ color: '#505A5F', marginBottom: '16px' }}>
        Sources registered here are synced by running <code>node scripts/sync-confluence.js</code> from an NHS network machine.
        See <code>.env.sync.example</code> in the project root for setup instructions.
      </p>

      {/* Add source form */}
      {showAdd && (
        <div style={{ background: '#fff', border: '1px solid #B1B4B6', padding: '24px', marginBottom: '20px' }}>
          <h3 className="govuk-heading-s" style={{ marginTop: 0 }}>Register a Confluence source</h3>
          <form onSubmit={handleAdd}>
            <div className="govuk-form-group">
              <label className="govuk-label" htmlFor="kb-label">
                Label <span style={{ color: '#505A5F', fontWeight: 400 }}>— a friendly name</span>
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
                    <label className="govuk-label govuk-radios__label" htmlFor="type-space">Whole space</label>
                  </div>
                  <div className="govuk-radios__item">
                    <input className="govuk-radios__input" id="type-page" type="radio"
                      value="page" checked={syncType === 'page'} onChange={() => setSyncType('page')} />
                    <label className="govuk-label govuk-radios__label" htmlFor="type-page">Single page</label>
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
              </p>
              <input id="kb-conditions" className="govuk-input" value={conditions}
                onChange={e => setConditions(e.target.value)}
                placeholder="virtual ward, remote monitoring, frailty" />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" disabled={saving}
                className="govuk-button govuk-button--nhs" style={{ marginBottom: 0 }}>
                {saving ? 'Saving…' : 'Register source'}
              </button>
              <button type="button" onClick={() => { setShowAdd(false); setError(null) }}
                className="govuk-button govuk-button--secondary" style={{ marginBottom: 0 }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ padding: '10px 0' }}>
          {[60, 45].map((w, i) => (
            <div key={i} className="govuk-skeleton"
              style={{ height: '18px', width: `${w}%`, marginBottom: '14px' }} />
          ))}
        </div>
      ) : sources.length === 0 ? (
        <p className="govuk-body" style={{ color: '#505A5F' }}>
          No sync sources registered yet.
        </p>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #B1B4B6' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 180px 80px 100px',
            gap: '0 16px', padding: '10px 20px 10px 16px',
            background: '#f3f2f1', borderBottom: '1px solid #B1B4B6',
          }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#505A5F' }}>Source</span>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#505A5F' }}>Last synced</span>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#505A5F' }}>Chunks</span>
            <span className="govuk-visually-hidden">Actions</span>
          </div>
          {sources.map((source, idx) => (
            <div key={source.id} style={{
              display: 'grid', gridTemplateColumns: '1fr 180px 80px 100px',
              gap: '0 16px', padding: '14px 20px 14px 16px',
              borderBottom: idx === sources.length - 1 ? 'none' : '1px solid #dee0e2',
              alignItems: 'center',
            }}>
              <div>
                <p style={{ margin: '0 0 3px', fontWeight: 700, fontSize: '1rem' }}>{source.label}</p>
                <p style={{ margin: 0, fontSize: '0.8125rem', color: '#505A5F', lineHeight: 1.4 }}>
                  {source.space_key ? `Space: ${source.space_key}` : `Page: ${source.page_id}`}
                  {source.conditions?.length ? ` · ${source.conditions.join(', ')}` : ' · No conditions tagged'}
                </p>
              </div>
              <span style={{ fontSize: '0.875rem', color: source.last_synced_at ? '#0B0C0C' : '#B1B4B6' }}>
                {formatDate(source.last_synced_at)}
              </span>
              <span style={{ fontSize: '0.875rem', color: '#505A5F' }}>
                {source.chunk_count ?? 0}
              </span>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => setPendingDelete(source)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: 'inherit', fontSize: '0.9375rem',
                    color: '#d4351c', textDecoration: 'underline', padding: 0 }}>
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
