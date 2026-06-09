import { STAGES, SCORE_POINTS } from '../constants/stages'

// Normalise any score value to one of the five canonical band keys.
// Tolerates case, spaces and hyphens (e.g. "Very High", "very-high" → "very_high").
// Returns null if the value does not map to a known band.
export function normalizeScore(score) {
  if (!score) return null
  const k = String(score).trim().toLowerCase().replace(/[\s-]+/g, '_')
  if (k in SCORE_POINTS) return k
  if (k === 'verylow') return 'very_low'
  if (k === 'veryhigh') return 'very_high'
  return null
}

// Points for a dimension's score, or null if unscored / unrecognised.
export function scorePoints(score) {
  const level = normalizeScore(score)
  return level ? SCORE_POINTS[level] : null
}

export function applyOverrides(dimensions, overrides) {
  if (!overrides || !Object.keys(overrides).length) return dimensions
  return dimensions.map(d =>
    overrides[d.id] ? { ...d, score: overrides[d.id].score } : d
  )
}

// Map an averaged points value (20–100) onto the nearest band for display.
function bandForPoints(points) {
  if (points >= 90) return { level: 'very_high', rating: 'Very High' }
  if (points >= 70) return { level: 'high',      rating: 'High' }
  if (points >= 50) return { level: 'medium',    rating: 'Medium' }
  if (points >= 30) return { level: 'low',       rating: 'Low' }
  return { level: 'very_low', rating: 'Very Low' }
}

// Stage score = average of its scored dimensions' points, mapped to a band.
export function stageScore(dimensions) {
  if (!dimensions?.length) return null
  const pts = dimensions.map(d => scorePoints(d.score)).filter(p => p != null)
  if (!pts.length) return null
  const avg = pts.reduce((a, b) => a + b, 0) / pts.length
  const band = bandForPoints(avg)
  return { ...band, points: Math.round(avg), avg }
}

// Overall score = sum of every scored dimension's points across all stages,
// out of the maximum possible (every dimension × 100). Accepts the raw
// stageResults map plus any overrides and computes the dimension sum directly.
export function overallScore(stageResults, overrides) {
  const totalCount = STAGES.reduce((n, s) => n + s.dimensions.length, 0)
  const max = totalCount * 100

  let total = 0
  let scoredCount = 0
  STAGES.forEach(s => {
    const dims = applyOverrides(stageResults?.[s.id]?.dimensions ?? [], overrides)
    dims.forEach(d => {
      const pts = scorePoints(d.score)
      if (pts != null) { total += pts; scoredCount += 1 }
    })
  })

  if (!scoredCount) return null
  return { total, max, percent: Math.round((total / max) * 100), scoredCount, totalCount }
}

// ─── Overall readiness bands ──────────────────────────────────────────────────
// The overall percent equals the mean dimension points, so the five readiness
// bands reuse the exact dimension rungs: the overall band is always the
// "average dimension band".
const READINESS_LABELS = {
  very_low: 'Nascent', low: 'Emerging', medium: 'Developing', high: 'Established', very_high: 'Mature',
}

// Dark panel backgrounds (white text): two greens, one orange, two reds.
const READINESS_PANEL_BG = {
  very_high: '#005a30', high: '#005a30', medium: '#6e3619', low: '#942514', very_low: '#942514',
}

// Map an overall percentage to a readiness band. `level` is a SCORE_STYLES key
// so callers get matching tag colours (green / orange / red).
export function readinessBand(percent) {
  if (percent == null || Number.isNaN(percent)) return null
  const { level } = bandForPoints(percent)
  return { label: READINESS_LABELS[level], level }
}

export function readinessPanelBg(level) {
  return READINESS_PANEL_BG[level] ?? '#003087'
}
