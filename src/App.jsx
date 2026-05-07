import { useState, useCallback, useRef } from 'react'
import Login from './components/Login'
import Header from './components/Header'
import LandingPage from './components/LandingPage'
import ResultsPage from './components/ResultsPage'
import { STAGES } from './constants/stages'
import { stageScore } from './utils/scoring'
import { addAuditEntry, getAuditEntries } from './utils/auditStorage'

async function callAssessDimension(pathway, stage, dimension, signal, attempt = 0) {
  const res = await fetch('/api/assess', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'dimension',
      pathway,
      stage: { number: stage.number, name: stage.name, question: stage.question },
      dimension: {
        id: dimension.id,
        check: dimension.check,
        evidenceSources: dimension.evidenceSources,
        criteria: dimension.criteria
      }
    }),
    signal
  })

  if (res.status === 429 && attempt < 2) {
    await new Promise((resolve, reject) => {
      const t = setTimeout(resolve, 30000)
      signal?.addEventListener('abort', () => { clearTimeout(t); reject(new DOMException('Aborted', 'AbortError')) })
    })
    return callAssessDimension(pathway, stage, dimension, signal, attempt + 1)
  }

  if (!res.ok) throw new Error(`API error ${res.status}`)

  const text = await res.text()
  const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  return JSON.parse(clean)
}

async function callFetchSummary(pathway, stageResults, signal) {
  const response = await fetch('/api/assess', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'summary',
      pathway,
      stageResults: STAGES.map(stage => ({
        number: stage.number,
        name: stage.name,
        score: stageScore(stageResults[stage.id]?.dimensions ?? [])?.rating ?? 'Unknown',
        rationale: stageResults[stage.id]?.dimensions?.[0]?.rationale?.slice(0, 100) ?? ''
      }))
    }),
    signal
  })
  return await response.text()
}

function initStageResults() {
  const initial = {}
  STAGES.forEach(s => {
    initial[s.id] = {
      dimensions: s.dimensions.map(d => ({ id: d.id, loading: false, score: null, rationale: null, sources: [] }))
    }
  })
  return initial
}

function updateDimension(prev, stageId, dimensionId, patch) {
  return {
    ...prev,
    [stageId]: {
      ...prev[stageId],
      dimensions: prev[stageId].dimensions.map(d =>
        d.id === dimensionId ? { ...d, ...patch } : d
      )
    }
  }
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

  // Navigate to results with empty state — no auto-assessment
  const handleNavigate = useCallback((newPathway) => {
    abortRef.current?.abort()
    setPathway(newPathway)
    setView('results')
    setOverrides({})
    setAuditEntries(getAuditEntries(newPathway))
    setSummaryText(null)
    setSummaryLoading(false)
    setLoading(false)
    setStageResults(initStageResults())
    window.scrollTo(0, 0)
  }, [])

  // Assess a single dimension (called from DimensionCard)
  const handleAssessDimension = useCallback(async (stageId, dimensionId) => {
    const stage = STAGES.find(s => s.id === stageId)
    const dimension = stage?.dimensions.find(d => d.id === dimensionId)
    if (!stage || !dimension) return

    const signal = abortRef.current?.signal

    setStageResults(prev => updateDimension(prev, stageId, dimensionId, { loading: true, error: false }))

    try {
      const result = await callAssessDimension(pathway, stage, dimension, signal)
      setStageResults(prev => updateDimension(prev, stageId, dimensionId, {
        loading: false,
        score: result.score,
        rationale: result.rationale,
        sources: result.sources ?? []
      }))
    } catch (e) {
      if (e.name === 'AbortError') {
        setStageResults(prev => updateDimension(prev, stageId, dimensionId, { loading: false }))
        return
      }
      setStageResults(prev => updateDimension(prev, stageId, dimensionId, { loading: false, error: true }))
    }
  }, [pathway])

  // Assess all unscored dimensions in a stage sequentially
  const handleAssessStage = useCallback(async (stageId) => {
    const controller = new AbortController()
    abortRef.current = controller
    setLoading(true)

    const stage = STAGES.find(s => s.id === stageId)

    for (const dimension of stage.dimensions) {
      if (controller.signal.aborted) break

      setStageResults(prev => {
        const dim = prev[stageId]?.dimensions?.find(d => d.id === dimension.id)
        if (dim?.score) return prev // skip already scored
        return updateDimension(prev, stageId, dimension.id, { loading: true })
      })

      // Read current state to check if already scored
      let alreadyScored = false
      setStageResults(prev => {
        const dim = prev[stageId]?.dimensions?.find(d => d.id === dimension.id)
        alreadyScored = !!dim?.score && !dim?.loading
        return prev
      })

      try {
        const result = await callAssessDimension(pathway, stage, dimension, controller.signal)
        setStageResults(prev => updateDimension(prev, stageId, dimension.id, {
          loading: false,
          score: result.score,
          rationale: result.rationale,
          sources: result.sources ?? []
        }))
      } catch (e) {
        if (controller.signal.aborted) {
          setStageResults(prev => updateDimension(prev, stageId, dimension.id, { loading: false }))
          break
        }
        setStageResults(prev => updateDimension(prev, stageId, dimension.id, { loading: false, error: true }))
      }
    }

    setLoading(false)
  }, [pathway])

  // Assess all dimensions across all stages sequentially
  const handleAssessAll = useCallback(async () => {
    const controller = new AbortController()
    abortRef.current = controller
    setLoading(true)
    setSummaryText(null)

    const snapshot = {}

    for (const stage of STAGES) {
      if (controller.signal.aborted) break

      for (const dimension of stage.dimensions) {
        if (controller.signal.aborted) break

        setStageResults(prev => updateDimension(prev, stage.id, dimension.id, { loading: true }))

        try {
          const result = await callAssessDimension(pathway, stage, dimension, controller.signal)
          snapshot[stage.id] = snapshot[stage.id] || { dimensions: [] }
          snapshot[stage.id].dimensions.push({ id: dimension.id, ...result })
          setStageResults(prev => updateDimension(prev, stage.id, dimension.id, {
            loading: false,
            score: result.score,
            rationale: result.rationale,
            sources: result.sources ?? []
          }))
        } catch (e) {
          if (controller.signal.aborted) {
            setStageResults(prev => updateDimension(prev, stage.id, dimension.id, { loading: false }))
            break
          }
          setStageResults(prev => updateDimension(prev, stage.id, dimension.id, { loading: false, error: true }))
        }
      }
    }

    setLoading(false)

    if (!controller.signal.aborted) {
      setSummaryLoading(true)
      try {
        const summary = await callFetchSummary(pathway, snapshot, controller.signal)
        setSummaryText(summary)
      } catch (e) {
        if (!controller.signal.aborted) setSummaryText('Unable to generate summary — please retry.')
      } finally {
        setSummaryLoading(false)
      }
    }
  }, [pathway])

  // Generate summary from current scored results
  const handleGenerateSummary = useCallback(async () => {
    const controller = new AbortController()
    abortRef.current = controller
    setSummaryLoading(true)
    setSummaryText(null)
    try {
      const summary = await callFetchSummary(pathway, stageResults, controller.signal)
      setSummaryText(summary)
    } catch (e) {
      if (!controller.signal.aborted) setSummaryText('Unable to generate summary — please retry.')
    } finally {
      setSummaryLoading(false)
    }
  }, [pathway, stageResults])

  function handleCancel() {
    abortRef.current?.abort()
    setLoading(false)
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
          <LandingPage onAssess={handleNavigate} loading={loading} />
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
            onAssessDimension={handleAssessDimension}
            onAssessStage={handleAssessStage}
            onAssessAll={handleAssessAll}
            onGenerateSummary={handleGenerateSummary}
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

  if (!authed) return <Login onSuccess={() => setAuthed(true)} />
  return <Assessor onSignOut={handleSignOut} />
}
