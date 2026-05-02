import { useState } from 'react'
import { DIMENSIONS, SCORE_STYLES } from '../constants/dimensions'

export default function ScoringGuide() {
  const [open, setOpen] = useState(false)

  return (
    <div className="mb-6">
      <button
        onClick={() => setOpen(o => !o)}
        className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
      >
        <span className="text-base leading-none">?</span>
        <span>Scoring guide</span>
        <span className="text-xs">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-4 overflow-x-auto">
          <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">
            Scoring criteria — Low / Medium / High
          </p>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr>
                <th className="text-left pb-2 pr-4 text-gray-600 font-semibold w-32">Dimension</th>
                {['Low', 'Medium', 'High'].map(l => (
                  <th
                    key={l}
                    className="text-left pb-2 pr-4 font-semibold"
                    style={{ color: SCORE_STYLES[l.toLowerCase()].text }}
                  >
                    {l}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DIMENSIONS.map((dim, i) => (
                <tr key={dim.id} className="border-t border-gray-200">
                  <td className="py-2 pr-4 font-medium text-gray-700 align-top">
                    D{i + 1}
                  </td>
                  {['low', 'medium', 'high'].map(level => (
                    <td
                      key={level}
                      className="py-2 pr-4 align-top leading-relaxed"
                      style={{ color: SCORE_STYLES[level].text }}
                    >
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
