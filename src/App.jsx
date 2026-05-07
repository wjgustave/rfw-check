import { useState, useCallback, useRef } from 'react'
import Login from './components/Login'
import Header from './components/Header'
import LandingPage from './components/LandingPage'
import ResultsPage from './components/ResultsPage'
import { STAGES } from './constants/stages'
import { stageScore } from './utils/scoring'
import { addAuditEntry, getAuditEntries } from './utils/auditStorage'

async function assessStage(pathway, stage, signal) {
  const res = await fetch('/api/assess', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'stage', pathway, stage }),
    signal
  })
  const text = await res.text()
  const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  const parsed = JSON.parse(clean)
  return parsed.map((d, i) => ({
    ...d,
    id: d.id || stage.dimensions[i]?.id || `${stage.id}_d${i + 1}`
  }))
}

async function fetchSummary(pathway, stageResults, signal) {
  const response = await fetch('/api/assess', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'summary', pathway, stageResults: STAGES.map(stage => ({
      number: stage.number,
      name: stage.name,
      score: stageScore(stageResults[stage.id]?.dimensions ?? [])?.rating ?? 'Unknown',
      rationale: stageResults[stage.id]?.dimensions?.[0]?.rationale?.slice(0, 100) ?? ''
    })) }),
    signal
  })
  return await response.text()
}

function markRemainingCancelled(setStageResults) {
  setStageResults(prev => {
    const updated = { ...prev }
    Object.keys(updated).forEach(id => {
      if (updated[id]?.loading) {
        updated[id] = { loading: false, dimensions: [], cancelled: true }
      }
    })
    return updated
  })
}

function Assessor({ onSignOut }) {
  const [view, setView] = useState('landing')
  const [pathway, setPathway] = useState('')
  const [stageResults, setStageResults] = useState({})
  const [summaryText, setSummaryText] = useState(null)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [overrides, setOverrides] = useState({})
  const [auditEntries, setAuditEntries] = useState([])
  const abortRef = useRef(null)

  const handleAssess = useCallback(async (newPathway) => {
    const controller = new AbortController()
    abortRef.current = controller

    setPathway(newPathway)
    setView('results')
    setSummaryText(null)
    setSummaryLoading(false)
    setLoading(true)
    setOverrides({})
    setAuditEntries(getAuditEntries(newPathway))
    window.scrollTo(0, 0)

    const initial = {}
    STAGES.forEach(s => { initial[s.id] = { loading: true, dimensions: [] } })
    setStageResults(initial)

    const finalResults = { ...initial }

    for (const stage of STAGES) {
      if (controller.signal.aborted) {
        markRemainingCancelled(setStageResults)
        break
      }

      try {
        const dimensions = await assessStage(newPathway, stage, controller.signal)
        finalResults[stage.id] = { loading: false, dimensions }
        setStageResults(prev => ({ ...prev, [stage.id]: { loading: false, dimensions } }))
      } catch (e) {
        if (controller.signal.aborted) {
          markRemainingCancelled(setStageResults)
          break
        }
        const fallback = stage.dimensions.map(d => ({
          id: d.id,
          score: 'low',
          rationale: 'Assessment failed — please retry.',
          sources: []
        }))
        finalResults[stage.id] = { loading: false, dimensions: fallback }
        setStageResults(prev => ({ ...prev, [stage.id]: { loading: false, dimensions: fallback } }))
      }
    }

    setLoading(false)

    if (!controller.signal.aborted) {
      setSummaryLoading(true)
      try {
        const summary = await fetchSummary(newPathway, finalResults, controller.signal)
        setSummaryText(summary)
      } catch (e) {
        if (!controller.signal.aborted) {
          setSummaryText('Unable to generate summary — please retry.')
        }
      } finally {
        setSummaryLoading(false)
      }
    }
  }, [])

  function handleCancel() {
    abortRef.current?.abort()
  }

  function handleOverride(dimensionId, overrideData, auditData) {
    setOverrides(prev => ({ ...prev, [dimensionId]: overrideData }))
    addAuditEntry(auditData)
    setAuditEntries(getAuditEntries(pathway))
  }

  function handleBack() {
    abortRef.current?.abort()
    setView('landing')
    setStageResults({})
    setSummaryText(null)
    setLoading(false)
    setOverrides({})
    setAuditEntries([])
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f5' }}>
      <Header onSignOut={onSignOut} />
      <div className="rfw-wrapper">
        {view === 'landing' && (
          <LandingPage onAssess={handleAssess} loading={loading} />
        )}
        {view === 'results' && (
          <ResultsPage
            pathway={pathway}
            stageResults={stageResults}
            summaryText={summaryText}
            summaryLoading={summaryLoading}
            onBack={handleBack}
            overrides={overrides}
            onOverride={handleOverride}
            auditEntries={auditEntries}
            loading={loading}
            onCancel={handleCancel}
          />
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
