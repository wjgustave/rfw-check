import { useState, useCallback } from 'react'
import Login from './components/Login'
import Header from './components/Header'
import PathwayInput from './components/PathwayInput'
import DimensionCard from './components/DimensionCard'
import ScoreSummary from './components/ScoreSummary'
import OverallSummary from './components/OverallSummary'
import ComparisonTable from './components/ComparisonTable'
import ScoringGuide from './components/ScoringGuide'
import { DIMENSIONS } from './constants/dimensions'
import { overallMaturity } from './utils/scoring'

async function assessDimension(pathway, dimension) {
  const res = await fetch('/api/assess', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      pathway,
      check: dimension.check,
      evidenceSources: dimension.evidenceSources
    })
  })
  const text = await res.text()
  const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  return JSON.parse(clean)
}

async function fetchSummary(pathway, results) {
  const dimensionResults = DIMENSIONS.map(dim => ({
    id: dim.id,
    check: dim.check,
    score: results[dim.id]?.score || '',
    rationale: results[dim.id]?.rationale || ''
  }))

  const res = await fetch('/api/assess', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pathway, type: 'summary', results: dimensionResults })
  })
  return await res.text()
}

function Assessor({ onSignOut }) {
  const [pathway, setPathway] = useState(null)
  const [results, setResults] = useState({})
  const [loadingDims, setLoadingDims] = useState({})
  const [summaryText, setSummaryText] = useState(null)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [assessments, setAssessments] = useState([])
  const [showComparison, setShowComparison] = useState(false)
  const [globalLoading, setGlobalLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleAssess = useCallback(async (newPathway) => {
    setPathway(newPathway)
    setResults({})
    setSummaryText(null)
    setSummaryLoading(false)
    setError(null)
    setGlobalLoading(true)

    const initialLoading = {}
    DIMENSIONS.forEach(d => { initialLoading[d.id] = true })
    setLoadingDims(initialLoading)

    const finalResults = {}

    await Promise.all(
      DIMENSIONS.map(async (dim) => {
        try {
          const result = await assessDimension(newPathway, dim)
          finalResults[dim.id] = result
          setResults(prev => ({ ...prev, [dim.id]: result }))
        } catch {
          finalResults[dim.id] = { score: 'low', rationale: 'Assessment failed — please retry.', sources: [] }
          setResults(prev => ({ ...prev, [dim.id]: finalResults[dim.id] }))
        } finally {
          setLoadingDims(prev => ({ ...prev, [dim.id]: false }))
        }
      })
    )

    setGlobalLoading(false)

    const maturity = overallMaturity(finalResults)
    if (maturity) {
      setSummaryLoading(true)
      try {
        const summary = await fetchSummary(newPathway, finalResults)
        setSummaryText(summary)
      } catch {
        setSummaryText('Unable to generate summary — please retry.')
      } finally {
        setSummaryLoading(false)
      }

      setAssessments(prev => {
        const filtered = prev.filter(a => a.pathway !== newPathway)
        const next = [{ pathway: newPathway, results: finalResults }, ...filtered]
        return next.slice(0, 4)
      })
    }
  }, [])

  const hasResults = Object.keys(results).length > 0
  const allComplete = DIMENSIONS.every(d => !loadingDims[d.id] && results[d.id])
  const canCompare = assessments.length >= 2

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <Header onSignOut={onSignOut} />
        <PathwayInput onAssess={handleAssess} loading={globalLoading} />
        <ScoringGuide />

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {showComparison && assessments.length >= 2 && (
          <ComparisonTable
            assessments={assessments}
            onClose={() => setShowComparison(false)}
          />
        )}

        {hasResults && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-700">{pathway}</h2>
              {canCompare && !showComparison && (
                <button
                  onClick={() => setShowComparison(true)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium border border-blue-200 px-3 py-1 rounded-full"
                >
                  Compare ({assessments.length})
                </button>
              )}
            </div>

            <ScoreSummary results={results} />

            {allComplete && (
              <OverallSummary
                results={results}
                summaryText={summaryText}
                summaryLoading={summaryLoading}
              />
            )}

            <div className="space-y-3">
              {DIMENSIONS.map((dim, i) => (
                <DimensionCard
                  key={dim.id}
                  index={i}
                  dimension={dim}
                  result={results[dim.id]}
                  loading={!!loadingDims[dim.id]}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function App() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('rfw_auth') === '1')

  function handleSignOut() {
    sessionStorage.removeItem('rfw_auth')
    setAuthed(false)
  }

  if (!authed) {
    return <Login onSuccess={() => setAuthed(true)} />
  }

  return <Assessor onSignOut={handleSignOut} />
}
