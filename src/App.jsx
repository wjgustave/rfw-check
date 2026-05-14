import { useState, useCallback, useRef, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Login from './components/Login'
import Header from './components/Header'
import ServiceNav from './components/ServiceNav'
import LandingPage from './components/LandingPage'
import ResultsPage from './components/ResultsPage'
import PreviousAssessmentsPage from './components/PreviousAssessmentsPage'
import { STAGES } from './constants/stages'
import { stageScore } from './utils/scoring'
import { addAuditEntry, getAuditEntries } from './utils/auditStorage'
import { saveAssessment, saveInProgress, removeInProgress, removeSavedAssessment, generateId } from './utils/assessmentStorage'
import { getLinkedEvidence } from './utils/linkedEvidence'

const TOTAL_DIMENSIONS = STAGES.reduce((acc, s) => acc + s.dimensions.length, 0)

async function callAssessDimension(pathway, linkedEvidence, stage, dimension, signal, attempt = 0) {
  const res = await fetch('/api/assess', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'dimension',
      pathway,
      linkedEvidence: linkedEvidence.length ? linkedEvidence : undefined,
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
    return callAssessDimension(pathway, linkedEvidence, stage, dimension, signal, attempt + 1)
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`API error ${res.status}${body ? ': ' + body.slice(0, 200) : ''}`)
  }

  const text = await res.text()
  const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  const match = clean.match(/\{[\s\S]*\}/)
  if (!match) throw new Error(`No JSON in response: ${clean.slice(0, 100)}`)
  const data = JSON.parse(match[0])
  if (data.rationale) data.rationale = data.rationale.replace(/<\/?cite[^>]*>/g, '').replace(/\s{2,}/g, ' ').trim()
  return data
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

function countCompleted(stageResults) {
  return STAGES.reduce((acc, s) =>
    acc + (stageResults[s.id]?.dimensions?.filter(d => d.score).length ?? 0), 0)
}

function Assessor({ onSignOut }) {
  const username = sessionStorage.getItem('rfw_username') ?? ''
  const navigate = useNavigate()

  const [pathway, setPathway] = useState('')
  const [stageResults, setStageResults] = useState({})
  const [summaryText, setSummaryText] = useState(null)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [overrides, setOverrides] = useState({})
  const [auditEntries, setAuditEntries] = useState([])
  const [currentInProgressId, setCurrentInProgressId] = useState(null)
  const [linkedEvidence, setLinkedEvidence] = useState([])
  const abortRef = useRef(null)
  const [originalSavedRecord, setOriginalSavedRecord] = useState(null)
  const [summaryOutdated, setSummaryOutdated] = useState(false)

  // Refs so async handlers always see fresh values without stale closures
  const stageResultsRef = useRef({})
  const pathwayRef = useRef('')
  const overridesRef = useRef({})
  const auditEntriesRef = useRef([])
  const linkedEvidenceRef = useRef([])
  const inProgressIdRef = useRef(null)

  useEffect(() => { stageResultsRef.current = stageResults }, [stageResults])
  useEffect(() => { pathwayRef.current = pathway }, [pathway])
  useEffect(() => { overridesRef.current = overrides }, [overrides])
  useEffect(() => { auditEntriesRef.current = auditEntries }, [auditEntries])
  useEffect(() => { linkedEvidenceRef.current = linkedEvidence }, [linkedEvidence])
  useEffect(() => { inProgressIdRef.current = currentInProgressId }, [currentInProgressId])

  function saveProgressSnapshot(newStageResults) {
    if (!pathwayRef.current) return
    const completed = countCompleted(newStageResults)
    const id = inProgressIdRef.current || generateId()
    saveInProgress({
      id,
      savedAt: new Date().toISOString(),
      savedBy: username,
      pathway: pathwayRef.current,
      completedDimensions: completed,
      totalDimensions: TOTAL_DIMENSIONS,
      stageResults: newStageResults,
      overrides: overridesRef.current,
      auditEntries: auditEntriesRef.current
    })
    if (!inProgressIdRef.current) {
      inProgressIdRef.current = id
      setCurrentInProgressId(id)
    }
  }

  // Navigate to results with fresh state
  const handleNavigate = useCallback((newPathway) => {
    abortRef.current?.abort()
    setPathway(newPathway)
    setOverrides({})
    setAuditEntries(getAuditEntries(newPathway))
    setSummaryText(null)
    setSummaryLoading(false)
    setLoading(false)
    setStageResults(initStageResults())
    setCurrentInProgressId(null)
    setLinkedEvidence(getLinkedEvidence(newPathway))
    setOriginalSavedRecord(null)
    setSummaryOutdated(false)
    navigate('/assess')
    window.scrollTo(0, 0)
  }, [navigate])

  // Load a saved assessment back into the editor (removes from saved)
  function handleEditAssessment(record) {
    abortRef.current?.abort()
    removeSavedAssessment(record.id)
    setOriginalSavedRecord(record)
    setSummaryOutdated(false)
    setPathway(record.pathway)
    setLinkedEvidence(getLinkedEvidence(record.pathway))
    setStageResults(record.stageResults)
    setOverrides(record.overrides ?? {})
    setAuditEntries(record.auditEntries ?? [])
    setSummaryText(record.summaryText ?? null)
    setSummaryLoading(false)
    setLoading(false)
    setCurrentInProgressId(null)
    inProgressIdRef.current = null
    navigate('/assess')
    window.scrollTo(0, 0)
  }

  function handleExitEditWithoutSaving() {
    abortRef.current?.abort()
    // Restore the original completed record to saved
    if (originalSavedRecord) {
      saveAssessment(originalSavedRecord)
    }
    // Remove any auto-created in-progress record
    if (inProgressIdRef.current) {
      removeInProgress(inProgressIdRef.current)
    }
    setOriginalSavedRecord(null)
    setCurrentInProgressId(null)
    inProgressIdRef.current = null
    setLoading(false)
    navigate('/completed-assessments')
    window.scrollTo(0, 0)
  }

  // Resume an in-progress assessment
  function handleResumeAssessment(record) {
    abortRef.current?.abort()
    setPathway(record.pathway)
    setLinkedEvidence(getLinkedEvidence(record.pathway))
    setStageResults(record.stageResults)
    setOverrides(record.overrides ?? {})
    setAuditEntries(record.auditEntries ?? [])
    setSummaryText(null)
    setSummaryLoading(false)
    setLoading(false)
    setCurrentInProgressId(record.id)
    navigate('/assess')
    window.scrollTo(0, 0)
  }

  // Save completed assessment and go to previous assessments page
  function handleSaveAssessment() {
    const record = {
      id: generateId(),
      savedAt: new Date().toISOString(),
      savedBy: username,
      pathway,
      stageResults,
      overrides,
      auditEntries,
      summaryText
    }
    saveAssessment(record)
    if (currentInProgressId) removeInProgress(currentInProgressId)
    setCurrentInProgressId(null)
    setOriginalSavedRecord(null)
    setSummaryOutdated(false)
    navigate('/completed-assessments')
    window.scrollTo(0, 0)
  }

  // Save in-progress state and return to landing
  function handleSaveAndExit() {
    const id = currentInProgressId || generateId()
    const completed = countCompleted(stageResults)
    const record = {
      id,
      savedAt: new Date().toISOString(),
      savedBy: username,
      pathway,
      completedDimensions: completed,
      totalDimensions: TOTAL_DIMENSIONS,
      stageResults,
      overrides,
      auditEntries
    }
    saveInProgress(record)
    setCurrentInProgressId(id)
    setOriginalSavedRecord(null)
    setSummaryOutdated(false)
    abortRef.current?.abort()
    setLoading(false)
    navigate('/')
    window.scrollTo(0, 0)
  }

  // Assess a single dimension
  async function handleAssessDimension(stageId, dimensionId) {
    const stage = STAGES.find(s => s.id === stageId)
    const dimension = stage?.dimensions.find(d => d.id === dimensionId)
    if (!stage || !dimension) return

    const signal = abortRef.current?.signal

    const withLoading = updateDimension(stageResultsRef.current, stageId, dimensionId, { loading: true, error: false })
    stageResultsRef.current = withLoading
    setStageResults(withLoading)

    try {
      const result = await callAssessDimension(pathwayRef.current, linkedEvidenceRef.current, stage, dimension, signal)
      const newResults = updateDimension(stageResultsRef.current, stageId, dimensionId, {
        loading: false,
        score: result.score,
        rationale: result.rationale,
        sources: result.sources ?? []
      })
      stageResultsRef.current = newResults
      setStageResults(newResults)
      setSummaryOutdated(true)
      saveProgressSnapshot(newResults)
    } catch (e) {
      if (e.name === 'AbortError') {
        const reset = updateDimension(stageResultsRef.current, stageId, dimensionId, { loading: false })
        stageResultsRef.current = reset
        setStageResults(reset)
        return
      }
      console.error('Assessment failed:', e)
      const errResult = updateDimension(stageResultsRef.current, stageId, dimensionId, { loading: false, error: e.message || 'Unknown error' })
      stageResultsRef.current = errResult
      setStageResults(errResult)
    }
  }

  // Assess all unscored dimensions in a stage sequentially
  async function handleAssessStage(stageId) {
    const controller = new AbortController()
    abortRef.current = controller
    setLoading(true)

    const stage = STAGES.find(s => s.id === stageId)

    for (const dimension of stage.dimensions) {
      if (controller.signal.aborted) break

      // Skip already-scored dimensions
      const current = stageResultsRef.current
      const dim = current[stageId]?.dimensions?.find(d => d.id === dimension.id)
      if (dim?.score) continue

      const withLoading = updateDimension(stageResultsRef.current, stageId, dimension.id, { loading: true })
      stageResultsRef.current = withLoading
      setStageResults(withLoading)

      try {
        const result = await callAssessDimension(pathwayRef.current, linkedEvidenceRef.current, stage, dimension, controller.signal)
        const newResults = updateDimension(stageResultsRef.current, stageId, dimension.id, {
          loading: false,
          score: result.score,
          rationale: result.rationale,
          sources: result.sources ?? []
        })
        stageResultsRef.current = newResults
        setStageResults(newResults)
        setSummaryOutdated(true)
        saveProgressSnapshot(newResults)
      } catch (e) {
        if (controller.signal.aborted) {
          const reset = updateDimension(stageResultsRef.current, stageId, dimension.id, { loading: false })
          stageResultsRef.current = reset
          setStageResults(reset)
          break
        }
        console.error('Assessment failed:', e)
        const errResult = updateDimension(stageResultsRef.current, stageId, dimension.id, { loading: false, error: e.message || 'Unknown error' })
        stageResultsRef.current = errResult
        setStageResults(errResult)
      }
    }

    setLoading(false)
  }

  // Assess all dimensions across all stages sequentially
  async function handleAssessAll() {
    const controller = new AbortController()
    abortRef.current = controller
    setLoading(true)
    setSummaryText(null)
    setSummaryOutdated(false)

    for (const stage of STAGES) {
      if (controller.signal.aborted) break

      for (const dimension of stage.dimensions) {
        if (controller.signal.aborted) break

        const withLoading = updateDimension(stageResultsRef.current, stage.id, dimension.id, { loading: true })
        stageResultsRef.current = withLoading
        setStageResults(withLoading)

        try {
          const result = await callAssessDimension(pathwayRef.current, linkedEvidenceRef.current, stage, dimension, controller.signal)
          const newResults = updateDimension(stageResultsRef.current, stage.id, dimension.id, {
            loading: false,
            score: result.score,
            rationale: result.rationale,
            sources: result.sources ?? []
          })
          stageResultsRef.current = newResults
          setStageResults(newResults)
          saveProgressSnapshot(newResults)
        } catch (e) {
          if (controller.signal.aborted) {
            const reset = updateDimension(stageResultsRef.current, stage.id, dimension.id, { loading: false })
            stageResultsRef.current = reset
            setStageResults(reset)
            break
          }
          console.error('Assessment failed:', e)
          const errResult = updateDimension(stageResultsRef.current, stage.id, dimension.id, { loading: false, error: e.message || 'Unknown error' })
          stageResultsRef.current = errResult
          setStageResults(errResult)
        }
      }
    }

    setLoading(false)
  }

  // Generate summary from current scored results
  async function handleGenerateSummary() {
    const controller = new AbortController()
    abortRef.current = controller
    setSummaryLoading(true)
    setSummaryText(null)
    try {
      const summary = await callFetchSummary(pathwayRef.current, stageResultsRef.current, controller.signal)
      setSummaryText(summary)
      setSummaryOutdated(false)
    } catch (e) {
      if (!controller.signal.aborted) setSummaryText('Unable to generate summary — please retry.')
    } finally {
      setSummaryLoading(false)
    }
  }

  function handleCancel() {
    abortRef.current?.abort()
    setLoading(false)
  }

  function handleOverride(dimensionId, overrideData, auditData) {
    setSummaryOutdated(true)
    setOverrides(prev => ({ ...prev, [dimensionId]: overrideData }))
    addAuditEntry(auditData)
    setAuditEntries(getAuditEntries(pathway))
  }

  function handleBack() {
    abortRef.current?.abort()
    setStageResults({})
    setSummaryText(null)
    setLoading(false)
    setOverrides({})
    setAuditEntries([])
    setCurrentInProgressId(null)
    navigate('/')
    window.scrollTo(0, 0)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f5' }}>
      <Header onSignOut={onSignOut} username={username} />
      <ServiceNav />
      <div className="rfw-wrapper">
        <Routes>
          <Route path="/" element={
            <LandingPage
              onAssess={handleNavigate}
              loading={loading}
              onResume={handleResumeAssessment}
            />
          } />
          <Route path="/assess" element={
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
              onSaveAssessment={handleSaveAssessment}
              onSaveAndExit={handleSaveAndExit}
              isEditingFromSaved={!!originalSavedRecord}
              onExitWithoutSaving={originalSavedRecord ? handleExitEditWithoutSaving : null}
              summaryOutdated={summaryOutdated}
            />
          } />
          <Route path="/completed-assessments" element={
            <PreviousAssessmentsPage
              onBack={() => { navigate('/'); window.scrollTo(0, 0) }}
              onEdit={handleEditAssessment}
              username={username}
            />
          } />
        </Routes>
      </div>
    </div>
  )
}

export default function App() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('rfw_auth') === '1')

  function handleSignOut() {
    sessionStorage.removeItem('rfw_auth')
    sessionStorage.removeItem('rfw_username')
    setAuthed(false)
  }

  if (!authed) return <Login onSuccess={() => setAuthed(true)} />
  return <Assessor onSignOut={handleSignOut} />
}
