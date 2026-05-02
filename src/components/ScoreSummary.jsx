import { DIMENSIONS, SCORE_STYLES } from '../constants/dimensions'

export default function ScoreSummary({ results }) {
  return (
    <div className="grid grid-cols-5 gap-2 mb-6">
      {DIMENSIONS.map((dim, i) => {
        const result = results[dim.id]
        const score = result?.score?.toLowerCase()
        const style = score ? SCORE_STYLES[score] : null

        return (
          <div
            key={dim.id}
            className="rounded-lg border p-2.5 text-center"
            style={
              style
                ? { background: style.bg, borderColor: style.border }
                : { background: '#F9FAFB', borderColor: '#E5E7EB' }
            }
          >
            <div className="text-xs font-bold text-gray-400 uppercase mb-1">D{i + 1}</div>
            {style ? (
              <div
                className="text-sm font-semibold"
                style={{ color: style.text }}
              >
                {style.label}
              </div>
            ) : (
              <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto w-10" />
            )}
          </div>
        )
      })}
    </div>
  )
}
