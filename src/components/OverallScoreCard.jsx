import { STAGES, SCORE_STYLES, MAX_SCORE } from '../constants/stages'
import { stageScore, overallScore } from '../utils/scoring'

export default function OverallScoreCard({ stageResults, summaryText, summaryLoading }) {
  const stageScores = {}
  STAGES.forEach(s => {
    const res = stageResults[s.id]
    if (res?.dimensions?.length) {
      stageScores[s.id] = stageScore(res.dimensions)
    }
  })

  const overall = overallScore(stageScores)
  const completedCount = Object.keys(stageScores).length
  const allComplete = completedCount === STAGES.length

  const scoreColor = overall
    ? overall.percent >= 75 ? '#3B6D11' : overall.percent >= 50 ? '#854F0B' : '#A32D2D'
    : '#6B7280'

  const scoreBg = overall
    ? overall.percent >= 75 ? '#EAF3DE' : overall.percent >= 50 ? '#FAEEDA' : '#FCEBEB'
    : '#F9FAFB'

  const scoreBorder = overall
    ? overall.percent >= 75 ? '#97C459' : overall.percent >= 50 ? '#EF9F27' : '#E24B4A'
    : '#E5E7EB'

  return (
    <div className="rounded-xl border p-5 mb-6" style={{ background: scoreBg, borderColor: scoreBorder }}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
            Overall Readiness Score
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black" style={{ color: scoreColor }}>
              {overall ? overall.total : '—'}
            </span>
            <span className="text-lg font-semibold text-gray-400">/ {MAX_SCORE}</span>
          </div>
          {!allComplete && (
            <p className="text-xs text-gray-400 mt-1">
              {completedCount} of {STAGES.length} stages complete
            </p>
          )}
        </div>

        {overall && (
          <div className="shrink-0">
            <div className="w-20 h-20 relative">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#E5E7EB" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="15.9" fill="none"
                  stroke={scoreColor} strokeWidth="3"
                  strokeDasharray={`${overall.percent} ${100 - overall.percent}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold" style={{ color: scoreColor }}>{overall.percent}%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-6 gap-1.5 mt-4">
        {STAGES.map(stage => {
          const sc = stageScores[stage.id]
          const loading = stageResults[stage.id]?.loading
          const style = sc ? SCORE_STYLES[sc.level] : null
          return (
            <div
              key={stage.id}
              className="rounded-lg border p-1.5 text-center"
              style={style ? { background: '#fff', borderColor: style.border } : { background: '#fff', borderColor: '#E5E7EB' }}
            >
              <div className="text-xs text-gray-400 font-semibold">S{stage.number}</div>
              {loading && !sc && (
                <div className="h-3 bg-gray-200 rounded animate-pulse mt-1 mx-auto w-8" />
              )}
              {sc && (
                <div className="text-xs font-bold" style={{ color: style.text }}>{sc.rating}</div>
              )}
              {!loading && !sc && (
                <div className="text-xs text-gray-300">—</div>
              )}
            </div>
          )
        })}
      </div>

      {(summaryLoading || summaryText) && (
        <div className="mt-4 pt-4 border-t" style={{ borderColor: scoreBorder }}>
          {summaryLoading && (
            <div className="animate-pulse space-y-2">
              <div className="h-3 bg-gray-200 rounded w-full" />
              <div className="h-3 bg-gray-200 rounded w-5/6" />
              <div className="h-3 bg-gray-200 rounded w-4/6" />
            </div>
          )}
          {summaryText && !summaryLoading && (
            <p className="text-sm leading-relaxed" style={{ color: scoreColor }}>{summaryText}</p>
          )}
        </div>
      )}
    </div>
  )
}
