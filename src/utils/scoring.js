const SCORE_VALUES = { high: 3, medium: 2, low: 1 }

export function stageScore(dimensions) {
  if (!dimensions?.length) return null
  const scores = dimensions.map(d => SCORE_VALUES[d.score?.toLowerCase()]).filter(Boolean)
  if (!scores.length) return null
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length
  if (avg >= 2.5) return { rating: 'High', level: 'high', numeric: 3, avg }
  if (avg >= 1.5) return { rating: 'Medium', level: 'medium', numeric: 2, avg }
  return { rating: 'Low', level: 'low', numeric: 1, avg }
}

export function overallScore(stageScores) {
  const values = Object.values(stageScores).filter(Boolean)
  if (!values.length) return null
  const total = values.reduce((sum, s) => sum + s.numeric, 0)
  const max = Object.keys(stageScores).length * 3
  return { total, max, percent: Math.round((total / max) * 100) }
}
