import { useState } from 'react'
import { STAGES } from '../constants/stages'
import StageTabBar from './StageTabBar'
import StagePanel from './StagePanel'
import OverallScoreCard from './OverallScoreCard'
import OverrideModal from './OverrideModal'
import AuditTrail from './AuditTrail'

export default function ResultsPage({ pathway, stageResults, summaryText, summaryLoading, onBack, overrides, onOverride, auditEntries }) {
  const [activeStage, setActiveStage] = useState('stage1')
  const [overrideTarget, setOverrideTarget] = useState(null)

  const activeStageData = STAGES.find(s => s.id === activeStage)

  function handleOpenOverride(dimensionId) {
    const stage = STAGES.find(s => s.dimensions.some(d => d.id === dimensionId))
    const dimension = stage?.dimensions.find(d => d.id === dimensionId)
    if (stage && dimension) setOverrideTarget({ stage, dimension })
  }

  function handleConfirmOverride(overrideData) {
    const { stage, dimension } = overrideTarget
    const dimIndex = stage.dimensions.findIndex(d => d.id === dimension.id)
    const result = stageResults[stage.id]?.dimensions?.find(d => d.id === dimension.id)
    onOverride(dimension.id, overrideData, {
      pathway,
      dimensionId: dimension.id,
      stageNumber: stage.number,
      stageName: stage.name,
      dimIndex,
      dimensionCheck: dimension.check,
      previousScore: overrideData.previousScore,
      newScore: overrideData.score,
      rationale: overrideData.rationale,
      changedBy: overrideData.changedBy
    })
    setOverrideTarget(null)
  }

  const overrideResult = overrideTarget
    ? stageResults[overrideTarget.stage.id]?.dimensions?.find(d => d.id === overrideTarget.dimension.id)
    : null

  return (
    <div>
      <button className="govuk-back-link" onClick={onBack}>Back</button>

      <h1 className="govuk-heading-l" style={{ marginBottom: '25px' }}>{pathway}</h1>

      <OverallScoreCard
        stageResults={stageResults}
        summaryText={summaryText}
        summaryLoading={summaryLoading}
        overrides={overrides}
      />

      <StageTabBar
        activeStage={activeStage}
        onSelect={setActiveStage}
        stageResults={stageResults}
        overrides={overrides}
      />

      {activeStageData && (
        <StagePanel
          stage={activeStageData}
          result={stageResults[activeStage]}
          overrides={overrides}
          onOverride={handleOpenOverride}
        />
      )}

      <AuditTrail entries={auditEntries} />

      {overrideTarget && (
        <OverrideModal
          dimension={overrideTarget.dimension}
          stage={overrideTarget.stage}
          result={overrideResult}
          stageResults={stageResults}
          overrides={overrides}
          existingOverride={overrides?.[overrideTarget.dimension.id]}
          onConfirm={handleConfirmOverride}
          onClose={() => setOverrideTarget(null)}
        />
      )}
    </div>
  )
}
