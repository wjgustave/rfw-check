import { SCORE_STYLES } from '../constants/dimensions'
import { overallMaturity } from '../utils/scoring'

export default function OverallSummary({ results, summaryText, summaryLoading }) {
  const maturity = overallMaturity(results)
  if (!maturity) return null

  const style = SCORE_STYLES[maturity.level]

  return (
    <div
      className="rounded-xl border p-5 mb-6"
      style={{ background: style.bg, borderColor: style.border }}
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-700">Overall Maturity</h2>
        <span
          className="text-sm font-bold px-3 py-1 rounded-full border"
          style={{ background: '#fff', color: style.text, borderColor: style.border }}
        >
          {maturity.rating}
        </span>
      </div>

      {summaryLoading && (
        <div className="animate-pulse space-y-2">
          <div className="h-3 bg-gray-200 rounded w-full" />
          <div className="h-3 bg-gray-200 rounded w-5/6" />
          <div className="h-3 bg-gray-200 rounded w-4/6" />
        </div>
      )}

      {summaryText && !summaryLoading && (
        <p className="text-sm leading-relaxed" style={{ color: style.text }}>
          {summaryText}
        </p>
      )}
    </div>
  )
}
