import { SCORE_STYLES } from '../constants/stages'
import { stageScore } from '../utils/scoring'
import DimensionCard from './DimensionCard'

function SkeletonCard({ index }) {
  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 bg-white">
        <span className="text-xs font-bold text-gray-300 uppercase w-6 shrink-0">D{index + 1}</span>
        <div className="flex-1 h-3 bg-gray-200 rounded animate-pulse" />
        <div className="h-5 w-12 bg-gray-200 rounded-full animate-pulse" />
      </div>
      <div className="px-4 pb-4 pt-3 bg-gray-50 border-t border-gray-100 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-full animate-pulse" />
        <div className="h-3 bg-gray-200 rounded w-5/6 animate-pulse" />
        <div className="h-3 bg-gray-200 rounded w-4/6 animate-pulse" />
      </div>
    </div>
  )
}

export default function StagePanel({ stage, result }) {
  const loading = result?.loading ?? true
  const dimensions = result?.dimensions ?? []
  const sc = dimensions.length ? stageScore(dimensions) : null
  const style = sc ? SCORE_STYLES[sc.level] : null

  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-0.5">
            Stage {stage.number}
          </p>
          <h3 className="text-base font-semibold text-gray-800">{stage.name}</h3>
          <p className="text-sm text-gray-500 mt-0.5 italic">{stage.question}</p>
        </div>
        {sc && (
          <div
            className="shrink-0 px-3 py-1.5 rounded-lg border text-sm font-bold"
            style={{ background: style.bg, color: style.text, borderColor: style.border }}
          >
            {sc.rating}
          </div>
        )}
        {loading && !sc && (
          <div className="h-8 w-20 bg-gray-200 rounded-lg animate-pulse shrink-0" />
        )}
      </div>

      {style && (
        <div
          className="rounded-lg border px-4 py-2.5 mb-4 text-xs"
          style={{ background: style.bg, borderColor: style.border, color: style.text }}
        >
          <span className="font-semibold">Interpretation: </span>
          {stage.interpretation[sc.level]}
        </div>
      )}

      <div className="space-y-3">
        {loading && !dimensions.length
          ? stage.dimensions.map((_, i) => <SkeletonCard key={i} index={i} />)
          : stage.dimensions.map((dim, i) => {
              const dimResult = dimensions.find(d => d.id === dim.id)
              return (
                <DimensionCard
                  key={dim.id}
                  index={i}
                  dimension={dim}
                  result={dimResult}
                  loading={false}
                />
              )
            })
        }
      </div>
    </div>
  )
}
