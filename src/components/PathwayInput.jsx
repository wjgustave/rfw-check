import { useState } from 'react'
import { EXAMPLE_PATHWAYS } from '../constants/stages'

export default function PathwayInput({ onAssess, loading }) {
  const [value, setValue] = useState('')

  function submit() {
    const trimmed = value.trim()
    if (trimmed && !loading) onAssess(trimmed)
  }

  function handleKey(e) {
    if (e.key === 'Enter') submit()
  }

  function useExample(p) {
    setValue(p)
    if (!loading) onAssess(p)
  }

  return (
    <div className="mb-6">
      <div className="flex gap-2">
        <input
          type="text"
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g. Cardiac Rehabilitation, COPD, Digital Weight Management…"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKey}
          disabled={loading}
        />
        <button
          onClick={submit}
          disabled={loading || !value.trim()}
          className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Assessing…' : 'Assess'}
        </button>
      </div>
      <div className="flex flex-wrap gap-2 mt-3">
        {EXAMPLE_PATHWAYS.map(p => (
          <button
            key={p}
            onClick={() => useExample(p)}
            disabled={loading}
            className="text-xs px-3 py-1 rounded-full border border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  )
}
