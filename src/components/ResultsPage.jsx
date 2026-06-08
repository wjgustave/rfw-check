import { useState } from 'react'
import { STAGES } from '../constants/stages'
import StageTabBar from './StageTabBar'
import StagePanel from './StagePanel'
import OverallScoreCard from './OverallScoreCard'
import OverrideModal from './OverrideModal'
import AuditTrail from './AuditTrail'

export default function ResultsPage({
  pathway, htgRef, stageResults, summaryText, summaryLoading,
  onBack, overrides, onOverride, auditEntries,
  loading, onCancel,
  onAssessDimension, onAssessStage, onReassessStage, onAssessAll, onContinueAll, onGenerateSummary,
  onSaveAssessment, onSaveAndExit,
  isEditingFromSaved, onExitWithoutSaving
}) {
  const [activeStage, setActiveStage] = useState('stage1')
  const [overrideTarget, setOverrideTarget] = useState(null)

  const activeStageData = STAGES.find(s => s.id === activeStage)

  const anyScored = STAGES.some(s =>
    stageResults[s.id]?.dimensions?.some(d => d.score)
  )
  const allScored = STAGES.every(s =>
    stageResults[s.id]?.dimensions?.every(d => d.score)
  )

  function handleOpenOverride(dimensionId) {
    const stage = STAGES.find(s => s.dimensions.some(d => d.id === dimensionId))
    const dimension = stage?.dimensions.find(d => d.id === dimensionId)
    if (stage && dimension) setOverrideTarget({ stage, dimension })
  }

  function handleConfirmOverride(overrideData) {
    const { stage, dimension } = overrideTarget
    const dimIndex = stage.dimensions.findIndex(d => d.id === dimension.id)
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

  const BottomActions = () => (
    <div style={{ marginTop: '30px' }}>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {!loading && allScored && summaryText && onSaveAssessment && (
          <button onClick={onSaveAssessment} className="govuk-button govuk-button--nhs" style={{ marginBottom: 0 }}>
            Save assessment
          </button>
        )}
        {!loading && anyScored && !allScored && onSaveAndExit && (
          <button onClick={onSaveAndExit} className="govuk-button govuk-button--secondary" style={{ marginBottom: 0 }}>
            Save &amp; exit
          </button>
        )}
        {isEditingFromSaved && onExitWithoutSaving && (
          <button onClick={onExitWithoutSaving} className="govuk-button govuk-button--secondary" style={{ marginBottom: 0 }}>
            Exit without saving
          </button>
        )}
      </div>
      {allScored && !summaryText && !loading && (
        <p className="govuk-hint">Generate a summary above to complete and save this assessment.</p>
      )}
    </div>
  )

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px', marginBottom: '25px', flexWrap: 'wrap' }}>
        <div>
          {htgRef && (
            <span style={{
              display: 'inline-block', background: '#d2e2f1', color: '#144e81',
              fontWeight: 700, fontSize: '0.8125rem', padding: '2px 8px',
              marginBottom: '6px', letterSpacing: '0.3px',
            }}>
              {htgRef}
            </span>
          )}
          <h1 className="govuk-heading-l" style={{ margin: 0 }}>{pathway}</h1>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', flexShrink: 0 }}>
          {!loading && !anyScored && (
            <button onClick={onAssessAll} className="govuk-button govuk-button--nhs" style={{ marginBottom: 0 }}>
              Assess all
            </button>
          )}
          {!loading && anyScored && !allScored && (
            <>
              <button onClick={onContinueAll} className="govuk-button govuk-button--nhs" style={{ marginBottom: 0 }}>
                Continue assessment
              </button>
              <button onClick={onAssessAll} className="govuk-button govuk-button--secondary" style={{ marginBottom: 0 }}>
                Re-assess all
              </button>
            </>
          )}
          {!loading && allScored && (
            <button onClick={onAssessAll} className="govuk-button govuk-button--secondary" style={{ marginBottom: 0 }}>
              Re-assess all
            </button>
          )}
          {loading && (
            <>
              <button onClick={onCancel} className="govuk-button govuk-button--warning" style={{ marginBottom: 0 }}>
                Stop assessment
              </button>
              <p className="govuk-hint" style={{ margin: 0, fontSize: '0.875rem', textAlign: 'right' }}>
                Current dimension will still complete
              </p>
            </>
          )}
          {!loading && allScored && summaryText && onSaveAssessment && (
            <button onClick={onSaveAssessment} className="govuk-button govuk-button--nhs" style={{ marginBottom: 0 }}>
              Save assessment
            </button>
          )}
          {!loading && anyScored && !allScored && onSaveAndExit && (
            <button onClick={onSaveAndExit} className="govuk-button govuk-button--secondary" style={{ marginBottom: 0 }}>
              Save &amp; exit
            </button>
          )}
        </div>
      </div>

      <OverallScoreCard
        stageResults={stageResults}
        summaryText={summaryText}
        summaryLoading={summaryLoading}
        overrides={overrides}
        allScored={allScored}
        onGenerateSummary={onGenerateSummary}
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
          onAssessDimension={(dimensionId) => onAssessDimension(activeStage, dimensionId)}
          onAssessStage={() => onAssessStage(activeStage)}
          onReassessStage={() => onReassessStage(activeStage)}
          loading={loading}
        />
      )}

      <AuditTrail entries={auditEntries} />

      <BottomActions />

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
