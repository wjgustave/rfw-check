import { useEffect } from 'react'

export default function ConfirmModal({ message, onConfirm, onCancel }) {
  // Close on Escape key
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onCancel() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  return (
    <div className="rfw-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="rfw-modal">
        <h2 className="govuk-heading-m" id="modal-title" style={{ marginBottom: '12px' }}>
          Are you sure?
        </h2>
        <p className="govuk-body" style={{ color: '#505A5F', marginBottom: '24px' }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            className="govuk-button govuk-button--warning"
            style={{ marginBottom: 0 }}
            onClick={onConfirm}
            autoFocus
          >
            Yes, delete
          </button>
          <button
            className="govuk-button govuk-button--secondary"
            style={{ marginBottom: 0 }}
            onClick={onCancel}
          >
            No, go back
          </button>
        </div>
      </div>
    </div>
  )
}
