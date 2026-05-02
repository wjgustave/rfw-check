import { STAGES, SCORE_STYLES } from '../constants/stages'
import { stageScore } from '../utils/scoring'

export default function StageTabBar({ activeStage, onSelect, stageResults }) {
  return (
    <div className="flex gap-1 overflow-x-auto pb-1 mb-6 border-b border-gray-200">
      {STAGES.map(stage => {
        const res = stageResults[stage.id]
        const dims = res?.dimensions ?? []
        const sc = dims.length ? stageScore(dims) : null
        const loading = res?.loading ?? true
        const isActive = activeStage === stage.id
        const style = sc ? SCORE_STYLES[sc.level] : null

        return (
          <button
            key={stage.id}
            onClick={() => onSelect(stage.id)}
            className={`shrink-0 flex flex-col items-center px-4 py-2.5 rounded-t-lg border-b-2 transition-all text-left ${
              isActive
                ? 'border-blue-600 bg-blue-50'
                : 'border-transparent hover:bg-gray-50'
            }`}
          >
            <span className={`text-xs font-semibold ${isActive ? 'text-blue-700' : 'text-gray-400'}`}>
              S{stage.number}
            </span>
            <span className={`text-xs mt-0.5 font-medium leading-tight text-center max-w-20 ${isActive ? 'text-blue-800' : 'text-gray-600'}`}>
              {stage.name}
            </span>
            <div className="mt-1.5 h-4 flex items-center">
              {loading && !sc && (
                <div className="w-8 h-2 bg-gray-200 rounded-full animate-pulse" />
              )}
              {sc && (
                <span
                  className="text-xs px-1.5 py-0.5 rounded-full font-semibold border"
                  style={{ background: style.bg, color: style.text, borderColor: style.border, fontSize: '10px' }}
                >
                  {sc.rating}
                </span>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}
