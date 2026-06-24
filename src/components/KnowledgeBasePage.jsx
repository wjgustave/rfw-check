import { useState, useEffect } from 'react'
import ConfirmModal from './ConfirmModal'
import { parseDocument, titleFromFilename, ACCEPTED_UPLOAD, SUPPORTED_LABEL } from '../utils/parseDocument'

function BookmarkletCopyBox({ code }) {
  const [copied, setCopied] = useState(false)
  function handleCopy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }
  return (
    <div style={{ display: 'flex', alignItems: 'stretch', gap: 0, border: '1px solid #B1B4B6' }}>
      <div style={{
        flex: 1, padding: '10px 12px', background: '#f3f2f1',
        fontSize: '0.75rem', fontFamily: 'monospace', color: '#505A5F',
        overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
        userSelect: 'all',
      }}>
        {code}
      </div>
      <button onClick={handleCopy} style={{
        flexShrink: 0, padding: '0 16px',
        background: copied ? '#007f3b' : '#005EB8',
        color: '#fff', border: 'none', cursor: 'pointer',
        fontFamily: 'inherit', fontSize: '0.875rem', fontWeight: 700,
        transition: 'background 0.2s',
      }}>
        {copied ? '✓ Copied' : 'Copy'}
      </button>
    </div>
  )
}

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

const ADD_TABS = [
  { id: 'upload',     label: 'Upload',     hint: 'PDF, Word or text file' },
  { id: 'web',        label: 'Web',        hint: 'Capture a browser page' },
  { id: 'confluence', label: 'Confluence', hint: 'Register a sync source' },
]

const linkBtnStyle = {
  background: 'none', border: 'none', padding: 0, color: '#005EB8',
  textDecoration: 'underline', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.875rem',
}

export default function KnowledgeBasePage() {
  const [sources, setSources] = useState([])
  const [capturedPages, setCapturedPages] = useState([])
  const [loading, setLoading] = useState(true)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [error, setError] = useState(null)
  const [appUrl, setAppUrl] = useState('')

  // Which "add" method is active
  const [addMethod, setAddMethod] = useState('upload')

  // Upload / document form state (shared by file upload and paste)
  const [uploadFile, setUploadFile] = useState(null)
  const [parsing, setParsing] = useState(false)
  const [pasteMode, setPasteMode] = useState(false)
  const [docTitle, setDocTitle] = useState('')
  const [docContent, setDocContent] = useState('')
  const [docConditions, setDocConditions] = useState('')
  const [docUrl, setDocUrl] = useState('')
  const [docSaving, setDocSaving] = useState(false)
  const [docSuccess, setDocSuccess] = useState(null)

  // Confluence source form state
  const [label, setLabel] = useState('')
  const [syncType, setSyncType] = useState('space')
  const [pageId, setPageId] = useState('')
  const [spaceKey, setSpaceKey] = useState('')
  const [conditions, setConditions] = useState('')
  const [saving, setSaving] = useState(false)

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

  // ── Upload / document ────────────────────────────────────────────────────
  function selectFile(file) {
    if (!file) return
    setUploadFile(file)
    setError(null)
    setDocSuccess(null)
    if (!docTitle.trim()) setDocTitle(titleFromFilename(file.name))
  }

  function handleFileChange(e) {
    selectFile(e.target.files?.[0])
    e.target.value = '' // allow re-selecting the same file
  }

  function handleDrop(e) {
    e.preventDefault()
    selectFile(e.dataTransfer.files?.[0])
  }

  async function handleDocSubmit(e) {
    e.preventDefault()
    setError(null)
    setDocSuccess(null)
    try {
      let content
      if (pasteMode) {
        content = docContent.trim()
      } else {
        if (!uploadFile) { setError('Choose a file to upload, or switch to paste mode.'); return }
        setParsing(true)
        content = await parseDocument(uploadFile)
        setParsing(false)
      }
      if (!content) throw new Error('No text could be extracted from this document.')

      const title = docTitle.trim() || (uploadFile ? titleFromFilename(uploadFile.name) : 'Untitled document')
      setDocSaving(true)
      const res = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          source_url: docUrl.trim() || null,
          conditions: docConditions.split(',').map(s => s.trim()).filter(Boolean),
        })
      })
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const data = await res.json()
      setDocSuccess(`Saved "${title}" — ${data.chunks} chunks stored`)
      setUploadFile(null); setDocTitle(''); setDocContent(''); setDocConditions(''); setDocUrl(''); setPasteMode(false)
      await loadAll()
    } catch (err) {
      setError(err.message)
    } finally {
      setParsing(false)
      setDocSaving(false)
    }
  }

  // ── Confluence source ──────────────────────────────────────────────────────
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
        body: JSON.stringify({ source_url: page.source_url ?? null, page_title: page.page_title })
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
      <div style={{ marginBottom: '24px' }}>
        <h1 className="govuk-heading-l" style={{ margin: '0 0 6px' }}>Knowledge base</h1>
        <p className="govuk-body" style={{ color: '#505A5F', margin: 0 }}>
          Content stored here — uploaded documents, captured web pages and synced Confluence sources —
          is automatically used to enrich condition assessments.
        </p>
      </div>

      {error && (
        <div className="govuk-error-summary" style={{ marginBottom: '20px' }}>
          <p className="govuk-body" style={{ margin: 0, color: '#d4351c' }}>{error}</p>
        </div>
      )}

      {/* ── Add to knowledge base — tabbed ── */}
      <h2 className="govuk-heading-m" style={{ marginBottom: '12px' }}>Add to the knowledge base</h2>
      <div className="govuk-tabs" style={{ marginBottom: '32px' }}>
        <ul className="govuk-tabs__list">
          {ADD_TABS.map(t => (
            <li key={t.id}>
              <button
                type="button"
                className={`govuk-tabs__tab ${addMethod === t.id ? 'govuk-tabs__tab--selected' : ''}`}
                aria-selected={addMethod === t.id}
                onClick={() => { setAddMethod(t.id); setError(null) }}
              >
                <span>{t.label}</span>
                <span style={{ fontSize: '0.75rem', color: '#505A5F', fontWeight: 400 }}>{t.hint}</span>
              </button>
            </li>
          ))}
        </ul>

        <div className="govuk-tabs__panel">
          {/* ── UPLOAD ── */}
          {addMethod === 'upload' && (
            <div>
              <h3 className="govuk-heading-s" style={{ marginTop: 0, marginBottom: '4px' }}>Upload a document</h3>
              <p className="govuk-body-s" style={{ color: '#505A5F', marginBottom: '20px' }}>
                Add a {SUPPORTED_LABEL} file from your device. The text is extracted in your browser, then chunked and stored.
              </p>

              <form onSubmit={handleDocSubmit}>
                {!pasteMode ? (
                  <div className="govuk-form-group">
                    <label className="govuk-label">Document file</label>
                    <div
                      onDragOver={e => e.preventDefault()}
                      onDrop={handleDrop}
                      style={{
                        border: '2px dashed #B1B4B6', background: '#f8f8f8',
                        padding: '24px', textAlign: 'center', borderRadius: '2px',
                      }}>
                      {uploadFile ? (
                        <p style={{ margin: 0, fontSize: '0.9375rem' }}>
                          <strong>{uploadFile.name}</strong>
                          {' '}
                          <button type="button" onClick={() => setUploadFile(null)} style={{ ...linkBtnStyle, color: '#d4351c' }}>
                            Remove
                          </button>
                        </p>
                      ) : (
                        <p style={{ margin: '0 0 12px', color: '#505A5F' }}>Drag a file here, or choose one:</p>
                      )}
                      <input id="kb-file" type="file" accept={ACCEPTED_UPLOAD}
                        onChange={handleFileChange} style={{ display: 'none' }} />
                      {!uploadFile && (
                        <label htmlFor="kb-file" className="govuk-button govuk-button--secondary"
                          style={{ marginBottom: 0, cursor: 'pointer' }}>
                          Choose file
                        </label>
                      )}
                    </div>
                    <p className="govuk-body-s" style={{ margin: '8px 0 0' }}>
                      <button type="button" onClick={() => { setPasteMode(true); setError(null) }} style={linkBtnStyle}>
                        or paste text instead
                      </button>
                    </p>
                  </div>
                ) : (
                  <div className="govuk-form-group">
                    <label className="govuk-label" htmlFor="kb-content">Document text</label>
                    <p className="govuk-hint" style={{ marginBottom: '6px' }}>
                      Paste the full text — from Word, a PDF, a web page, or anywhere else.
                    </p>
                    <textarea id="kb-content" className="govuk-textarea" rows={10}
                      value={docContent} onChange={e => setDocContent(e.target.value)}
                      placeholder="Paste document text here…" />
                    <p className="govuk-body-s" style={{ margin: '4px 0 0' }}>
                      <button type="button" onClick={() => { setPasteMode(false); setError(null) }} style={linkBtnStyle}>
                        or upload a file instead
                      </button>
                    </p>
                  </div>
                )}

                <div className="govuk-form-group">
                  <label className="govuk-label" htmlFor="kb-up-title">Document title</label>
                  <input id="kb-up-title" className="govuk-input" value={docTitle}
                    onChange={e => setDocTitle(e.target.value)} required
                    placeholder="e.g. NHS England Virtual Ward Framework 2023" />
                </div>

                <div className="govuk-form-group">
                  <label className="govuk-label" htmlFor="kb-up-conditions">
                    Conditions <span style={{ color: '#505A5F', fontWeight: 400 }}>— comma-separated</span>
                  </label>
                  <p className="govuk-hint" style={{ marginBottom: '6px' }}>
                    Assessments for these conditions will draw on this document.
                  </p>
                  <input id="kb-up-conditions" className="govuk-input" value={docConditions}
                    onChange={e => setDocConditions(e.target.value)}
                    placeholder="virtual ward, remote monitoring, frailty" />
                </div>

                <div className="govuk-form-group">
                  <label className="govuk-label" htmlFor="kb-up-url">
                    Source URL <span style={{ color: '#505A5F', fontWeight: 400 }}>— optional</span>
                  </label>
                  <p className="govuk-hint" style={{ marginBottom: '6px' }}>
                    Add a link if the document is available online. Leave blank for internal documents.
                  </p>
                  <input id="kb-up-url" className="govuk-input" value={docUrl}
                    onChange={e => setDocUrl(e.target.value)} placeholder="https://..." />
                </div>

                {docSuccess && (
                  <p className="govuk-body-s" style={{ margin: '0 0 16px', color: '#007f3b', fontWeight: 700 }}>
                    ✓ {docSuccess}
                  </p>
                )}

                <button type="submit" disabled={parsing || docSaving || (!pasteMode && !uploadFile)}
                  className="govuk-button govuk-button--nhs" style={{ marginBottom: 0 }}>
                  {parsing ? 'Extracting text…' : docSaving ? 'Saving…' : 'Add to knowledge base'}
                </button>
              </form>
            </div>
          )}

          {/* ── WEB (bookmarklet) ── */}
          {addMethod === 'web' && (
            <div>
              <h3 className="govuk-heading-s" style={{ marginTop: 0, marginBottom: '8px' }}>
                Capture a page from your browser
              </h3>
              <p className="govuk-body-s" style={{ color: '#505A5F', marginBottom: '20px' }}>
                Use the bookmark below on any web page — including Confluence pages you're logged in to — to add it
                to the knowledge base. It reads the page content directly, so no API key is needed.
              </p>

              <p className="govuk-body-s" style={{ fontWeight: 700, marginBottom: '6px' }}>
                Step 1 — Add the bookmark to Chrome:
              </p>
              <ol className="govuk-list govuk-list--number govuk-body-s" style={{ color: '#505A5F', marginBottom: '16px' }}>
                <li>Make sure your bookmarks bar is visible — press <strong>Cmd+Shift+B</strong> (Mac) or <strong>Ctrl+Shift+B</strong> (Windows)</li>
                <li>Right-click anywhere on the bookmarks bar and select <strong>Add page…</strong> or <strong>Add bookmark…</strong></li>
                <li>Set the <strong>Name</strong> to: <code>Save to CRF Knowledge Base</code></li>
                <li>Delete whatever is in the <strong>URL</strong> field, then paste the code below into it</li>
                <li>Click <strong>Save</strong></li>
              </ol>

              <p className="govuk-body-s" style={{ fontWeight: 700, marginBottom: '6px' }}>
                Bookmark code — click to copy:
              </p>
              <BookmarkletCopyBox code={bookmarklet} />

              <p className="govuk-body-s" style={{ fontWeight: 700, marginBottom: '4px', marginTop: '20px' }}>
                Step 2 — Use it on any page:
              </p>
              <ol className="govuk-list govuk-list--number govuk-body-s" style={{ color: '#505A5F', marginBottom: 0 }}>
                <li>Go to a page you want to capture (if it's Confluence, make sure you're logged in)</li>
                <li>Click the <strong>Save to CRF Knowledge Base</strong> bookmark in your toolbar</li>
                <li>A prompt will ask which conditions to tag the page to — type them separated by commas</li>
                <li>A green confirmation appears on the page when it's saved</li>
              </ol>
            </div>
          )}

          {/* ── CONFLUENCE ── */}
          {addMethod === 'confluence' && (
            <div>
              <h3 className="govuk-heading-s" style={{ marginTop: 0, marginBottom: '8px' }}>Register a Confluence source</h3>
              <p className="govuk-body-s" style={{ color: '#505A5F', marginBottom: '20px' }}>
                Register a Confluence space or page. Registered sources are synced by running{' '}
                <code>node scripts/sync-confluence.js</code> from an NHS network machine — see{' '}
                <code>.env.sync.example</code> for setup.
              </p>

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

                <button type="submit" disabled={saving}
                  className="govuk-button govuk-button--nhs" style={{ marginBottom: 0 }}>
                  {saving ? 'Saving…' : 'Register source'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* ── Stored documents & captured pages ── */}
      <h2 className="govuk-heading-m" style={{ marginBottom: '12px' }}>Documents &amp; captured pages</h2>

      {loading ? (
        <div style={{ padding: '10px 0 24px' }}>
          {[50, 70, 40].map((w, i) => (
            <div key={i} className="govuk-skeleton"
              style={{ height: '18px', width: `${w}%`, marginBottom: '14px' }} />
          ))}
        </div>
      ) : capturedPages.length === 0 ? (
        <p className="govuk-body" style={{ color: '#505A5F', marginBottom: '32px' }}>
          Nothing stored yet. Upload a document, capture a web page, or register a Confluence source above.
        </p>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #B1B4B6', marginBottom: '32px' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 180px 120px',
            gap: '0 16px', padding: '10px 20px 10px 16px',
            background: '#f3f2f1', borderBottom: '1px solid #B1B4B6',
          }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#505A5F' }}>Title</span>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#505A5F' }}>Added</span>
            <span className="govuk-visually-hidden">Actions</span>
          </div>
          {capturedPages.map((page, idx) => (
            <div key={page.source_url ?? page.page_title ?? idx} style={{
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

      {loading ? (
        <div style={{ padding: '10px 0' }}>
          {[60, 45].map((w, i) => (
            <div key={i} className="govuk-skeleton"
              style={{ height: '18px', width: `${w}%`, marginBottom: '14px' }} />
          ))}
        </div>
      ) : sources.length === 0 ? (
        <p className="govuk-body" style={{ color: '#505A5F' }}>
          No sync sources registered yet. Use the <strong>Confluence</strong> tab above to add one.
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
