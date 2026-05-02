import { useState } from 'react'
import { STAGES, SCORE_STYLES } from '../constants/stages'

function StageGuide({ stage }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <span className="text-sm font-medium text-gray-700">
          <span className="text-gray-400 font-semibold mr-2">S{stage.number}</span>
          {stage.name}
        </span>
        <span className="text-gray-400 text-xs">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="p-4 overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr>
                <th className="text-left pb-2 pr-4 text-gray-500 font-semibold w-32">Dimension</th>
                {['Low', 'Medium', 'High'].map(l => (
                  <th key={l} className="text-left pb-2 pr-4 font-semibold" style={{ color: SCORE_STYLES[l.toLowerCase()].text }}>
                    {l}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stage.dimensions.map((dim, i) => (
                <tr key={dim.id} className="border-t border-gray-100">
                  <td className="py-2 pr-4 font-medium text-gray-600 align-top">D{i + 1}</td>
                  {['low', 'medium', 'high'].map(level => (
                    <td key={level} className="py-2 pr-4 align-top leading-relaxed" style={{ color: SCORE_STYLES[level].text }}>
                      {dim.criteria[level]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function ScoringGuide() {
  const [open, setOpen] = useState(false)

  return (
    <div className="mb-6">
      <button
        onClick={() => setOpen(o => !o)}
        className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
      >
        <span className="text-base leading-none">?</span>
        <span>Scoring guide — all 6 stages</span>
        <span className="text-xs">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="mt-3 space-y-2">
          {STAGES.map(stage => <StageGuide key={stage.id} stage={stage} />)}
        </div>
      )}
    </div>
  )
}
