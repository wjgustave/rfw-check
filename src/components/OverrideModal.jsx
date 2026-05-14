import { useState } from 'react'
import { STAGES, SCORE_STYLES } from '../constants/stages'
import { stageScore, overallScore, applyOverrides } from '../utils/scoring'

export default function OverrideModal({ dimension, stage, result, stageResults, overrides, existingOverride, onConfirm, onClose }) {
  const currentAiScore = result?.score?.toLowerCase() || 'low'
  const [newScore, setNewScore] = useState(existingOverride?.score || currentAiScore)
  const [rationale, setRationale] = useState('')
  const changedBy = (() => { try { return sessionStorage.getItem('rfw_username') || '' } catch { return '' } })()

  const dimIndex = stage.dimensions.findIndex(d => d.id === dimension.id)
  const effectiveCurrentScore = existingOverride?.score || currentAiScore
  const noChange = newScore === effectiveCurrentScore

  function calcImpact(proposedScore) {
    const stageDims = stageResults[stage.id]?.dimensions || []
    const currentStageDims = applyOverrides(stageDims, overrides)
    const currentStageScore = stageScore(currentStageDims)

    const proposedOverrides = { ...overrides, [dimension.id]: { score: proposedScore } }
    const proposedStageDims = applyOverrides(stageDims, proposedOverrides)
    const proposedStageScore = stageScore(proposedStageDims)

    const currentStageScores = {}
    STAGES.forEach(s => {
      const dims = applyOverrides(stageResults[s.id]?.dimensions || [], overrides)
      if (dims.length) currentStageScores[s.id] = stageScore(dims)
    })
    const currentOverall = overallScore(currentStageScores)

    const proposedStageScores = { ...currentStageScores }
    if (proposedStageScore) proposedStageScores[stage.id] = proposedStageScore
    const proposedOverall = overallScore(proposedStageScores)

    return { currentStageScore, proposedStageScore, currentOverall, proposedOverall }
  }

  const impact = calcImpact(newScore)

  function handleConfirm() {
    if (!rationale.trim()) return
    onConfirm({
      score: newScore,
      rationale: rationale.trim(),
      changedBy: changedBy.trim(),
      previousScore: effectiveCurrentScore,
      previousRationale: existingOverride?.rationale || result?.rationale || ''
    })
  }

  const scoreChanged = !noChange
  const fromStyle = SCORE_STYLES[effectiveCurrentScore]
  const toStyle = SCORE_STYLES[newScore]

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(11,12,12,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ background: '#fff', width: '100%', maxWidth: '620px', maxHeight: '90vh', overflowY: 'auto', padding: '30px' }}>
        <h2 className="govuk-heading-m" style={{ marginBottom: '5px' }}>Override score</h2>
        <p className="govuk-body-s" style={{ color: '#505A5F', marginBottom: '20px' }}>
          <strong>D{dimIndex + 1}</strong> — {dimension.check}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', padding: '12px 15px', background: '#f0f4f5', borderLeft: '4px solid #B1B4B6' }}>
          <span style={{ fontSize: '0.875rem', color: '#505A5F' }}>Current score:</span>
          <span className={`govuk-tag ${fromStyle?.tag}`}>{fromStyle?.label}</span>
          {existingOverride && (
            <span style={{ fontSize: '0.8125rem', color: '#505A5F' }}>(already overridden)</span>
          )}
        </div>

        <div className="govuk-form-group" style={{ marginBottom: '20px' }}>
          <fieldset className="govuk-fieldset">
            <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">Change score to</legend>
            <div className="govuk-radios govuk-radios--inline" style={{ marginTop: '10px' }}>
              {['high', 'medium', 'low'].map(level => (
                <div key={level} className="govuk-radios__item">
                  <input className="govuk-radios__input" id={`score-${level}`} type="radio"
                    value={level} checked={newScore === level} onChange={() => setNewScore(level)} />
                  <label className="govuk-label govuk-radios__label" htmlFor={`score-${level}`}
                    style={{ fontWeight: newScore === level ? 700 : 400 }}>
                    {SCORE_STYLES[level].label}
                  </label>
                </div>
              ))}
            </div>
          </fieldset>
        </div>

        {scoreChanged && (
          <div style={{ background: '#f3f0f8', border: '1px solid #3d2375', padding: '12px 15px', marginBottom: '20px', fontSize: '0.9375rem' }}>
            <p style={{ fontWeight: 700, margin: '0 0 6px', color: '#0B0C0C' }}>Score impact</p>
            <p style={{ margin: '0 0 4px', color: '#0B0C0C' }}>
              Stage {stage.number}: <span className={`govuk-tag ${fromStyle?.tag}`} style={{ fontSize: '0.75rem' }}>{impact.currentStageScore?.rating ?? '—'}</span>
              {' '}&rarr;{' '}
              <span className={`govuk-tag ${toStyle?.tag}`} style={{ fontSize: '0.75rem' }}>{impact.proposedStageScore?.rating ?? '—'}</span>
            </p>
            <p style={{ margin: 0, color: '#0B0C0C' }}>
              Overall: <strong>{impact.currentOverall?.total ?? '—'}/{impact.currentOverall?.max ?? 18}</strong>
              {' '}&rarr;{' '}
              <strong>{impact.proposedOverall?.total ?? '—'}/{impact.proposedOverall?.max ?? 18}</strong>
            </p>
          </div>
        )}

        <div className="govuk-form-group" style={{ marginBottom: '20px' }}>
          <label className="govuk-label govuk-label--s" htmlFor="override-name">Overridden by</label>
          <input id="override-name" className="govuk-input" style={{ maxWidth: '300px', background: '#f3f2f1' }}
            value={changedBy} readOnly />
        </div>

        <div className="govuk-form-group" style={{ marginBottom: '25px' }}>
          <label className="govuk-label govuk-label--s" htmlFor="override-rationale">Reason for override</label>
          <textarea id="override-rationale" className="govuk-textarea" rows={6}
            style={{ border: '2px solid #0B0C0C' }}
            value={rationale} onChange={e => setRationale(e.target.value)} />
        </div>

        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <button
            className="govuk-button govuk-button--nhs"
            style={{ marginBottom: 0, opacity: !rationale.trim() ? 0.5 : 1 }}
            onClick={handleConfirm}
            disabled={!rationale.trim()}>
            Confirm override
          </button>
          <button className="govuk-button govuk-button--secondary" style={{ marginBottom: 0 }} onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
