const SCORE_VALUES = { high: 3, medium: 2, low: 1 }

export function overallMaturity(results) {
  const scores = Object.values(results)
    .map(r => SCORE_VALUES[r?.score?.toLowerCase()])
    .filter(Boolean)

  if (scores.length === 0) return null

  const avg = scores.reduce((a, b) => a + b, 0) / scores.length

  if (avg >= 2.5) return { rating: 'High Maturity', level: 'high', avg }
  if (avg >= 1.5) return { rating: 'Medium Maturity', level: 'medium', avg }
  return { rating: 'Low Maturity', level: 'low', avg }
}
