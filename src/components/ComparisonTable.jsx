import { DIMENSIONS, SCORE_STYLES } from '../constants/dimensions'

function ScoreCell({ score }) {
  const style = SCORE_STYLES[score?.toLowerCase()]
  if (!style) return <td className="px-3 py-2 text-center text-gray-300 text-xs">—</td>
  return (
    <td
      className="px-3 py-2 text-center text-xs font-semibold border-l border-gray-100"
      style={{ background: style.bg, color: style.text }}
    >
      {style.label}
    </td>
  )
}

function deriveInsights(assessments) {
  const insights = []

  DIMENSIONS.forEach((dim, i) => {
    const scores = assessments.map(a => a.results[dim.id]?.score?.toLowerCase()).filter(Boolean)
    const allHigh = scores.length > 0 && scores.every(s => s === 'high')
    const allLow = scores.length > 0 && scores.every(s => s === 'low')
    const mixed = scores.length > 1 && !allHigh && !allLow

    if (allHigh) insights.push(`D${i + 1} (${dim.check.slice(0, 40)}…) scores High across all pathways — a consistent strength.`)
    if (allLow) insights.push(`D${i + 1} (${dim.check.slice(0, 40)}…) scores Low across all pathways — a systemic gap.`)
    if (mixed) {
      const highPaths = assessments.filter(a => a.results[dim.id]?.score?.toLowerCase() === 'high').map(a => a.pathway)
      if (highPaths.length) insights.push(`D${i + 1}: ${highPaths.join(', ')} score${highPaths.length === 1 ? 's' : ''} High while others are lower — worth investigating variation.`)
    }
  })

  return insights.slice(0, 4)
}

export default function ComparisonTable({ assessments, onClose }) {
  const insights = deriveInsights(assessments)

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-700">Pathway Comparison</h2>
        <button
          onClick={onClose}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          ✕ Close
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 pr-4 text-gray-600 font-semibold w-36">Dimension</th>
              {assessments.map(a => (
                <th key={a.pathway} className="px-3 py-2 text-center text-gray-700 font-semibold border-l border-gray-100 max-w-28">
                  {a.pathway}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DIMENSIONS.map((dim, i) => (
              <tr key={dim.id} className="border-b border-gray-100">
                <td className="py-2 pr-4 text-gray-600 font-medium align-middle">
                  D{i + 1} — {dim.check.split(' ').slice(0, 5).join(' ')}…
                </td>
                {assessments.map(a => (
                  <ScoreCell key={a.pathway} score={a.results[dim.id]?.score} />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {insights.length > 0 && (
        <div className="mt-4 border-t border-gray-100 pt-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Key Insights</p>
          <ul className="space-y-1.5">
            {insights.map((ins, i) => (
              <li key={i} className="text-xs text-gray-600 flex gap-2">
                <span className="text-blue-400 shrink-0">→</span>
                {ins}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
