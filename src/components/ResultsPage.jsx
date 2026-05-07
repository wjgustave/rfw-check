import { useState } from 'react'
import { STAGES } from '../constants/stages'
import StageTabBar from './StageTabBar'
import StagePanel from './StagePanel'
import OverallScoreCard from './OverallScoreCard'
import OverrideModal from './OverrideModal'
import AuditTrail from './AuditTrail'

export default function ResultsPage({ pathway, stageResults, summaryText, summaryLoading, onBack, overrides, onOverride, auditEntries, loading, onCancel }) {
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

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', marginBottom: '25px', flexWrap: 'wrap' }}>
        <h1 className="govuk-heading-l" style={{ margin: 0 }}>{pathway}</h1>
        {loading && (
          <div style={{ flexShrink: 0 }}>
            <button
              onClick={onCancel}
              className="govuk-button govuk-button--warning"
              style={{ marginBottom: 0 }}>
              Stop assessment
            </button>
            <p className="govuk-hint" style={{ margin: '4px 0 0', fontSize: '0.875rem', textAlign: 'right' }}>
              Current stage will still complete
            </p>
          </div>
        )}
      </div>

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
