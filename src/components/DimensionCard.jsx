import { useState } from 'react'
import { SCORE_STYLES } from '../constants/stages'

function ScoreDot({ score }) {
  const style = SCORE_STYLES[score?.toLowerCase()] || {}
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border"
      style={{ background: style.bg, color: style.text, borderColor: style.border }}
    >
      {style.label || score}
    </span>
  )
}

export default function DimensionCard({ index, dimension, result, loading }) {
  const [open, setOpen] = useState(true)
  const score = result?.score?.toLowerCase()
  const style = score ? SCORE_STYLES[score] : null

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={style ? { borderColor: style.border } : { borderColor: '#E5E7EB' }}
    >
      <button
        className="w-full flex items-center gap-3 px-4 py-3 bg-white hover:bg-gray-50 transition-colors text-left"
        onClick={() => setOpen(o => !o)}
      >
        <span className="text-xs font-bold text-gray-400 uppercase w-6 shrink-0">
          D{index + 1}
        </span>
        <span className="flex-1 text-sm font-medium text-gray-800">{dimension.check}</span>
        <div className="flex items-center gap-2 shrink-0">
          {result && <ScoreDot score={result.score} />}
          <span className="text-gray-400 text-sm">{open ? '▲' : '▼'}</span>
        </div>
      </button>

      {open && (
        <div
          className="px-4 pb-4 pt-2 border-t"
          style={style ? { background: style.bg, borderColor: style.border } : { background: '#F9FAFB', borderColor: '#E5E7EB' }}
        >
          {!result && (
            <div className="animate-pulse space-y-2 py-2">
              <div className="h-3 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-full" />
              <div className="h-3 bg-gray-200 rounded w-5/6" />
            </div>
          )}

          {result && (
            <>
              <p className="text-sm leading-relaxed" style={style ? { color: style.text } : {}}>
                {result.rationale}
              </p>
              {result.sources?.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-semibold text-gray-500 mb-1">Evidence sources</p>
                  <ul className="space-y-1">
                    {dimension.evidenceSources.map(src => {
                      const cited = result.sources.some(s =>
                        s.toLowerCase().includes(src.toLowerCase().slice(0, 15))
                      )
                      return (
                        <li key={src} className="flex items-start gap-1.5 text-xs text-gray-600">
                          {cited
                            ? <span className="text-green-600 font-bold shrink-0">✓</span>
                            : <span className="text-gray-300 shrink-0">○</span>
                          }
                          <span className={cited ? 'font-medium text-gray-800' : ''}>{src}</span>
                          {cited && (
                            <span className="ml-1 shrink-0 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-semibold">
                              cited
                            </span>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
