import { useState } from 'react'
import StageTabBar from './StageTabBar'
import StagePanel from './StagePanel'
import OverallScoreCard from './OverallScoreCard'
import { STAGES } from '../constants/stages'

export default function ResultsPage({ pathway, stageResults, summaryText, summaryLoading, onBack }) {
  const [activeStage, setActiveStage] = useState('stage1')
  const activeStageData = STAGES.find(s => s.id === activeStage)

  return (
    <div>
      <button className="govuk-back-link" onClick={onBack}>
        Back
      </button>

      <h1 className="govuk-heading-l" style={{ marginBottom: '25px' }}>{pathway}</h1>

      <OverallScoreCard
        stageResults={stageResults}
        summaryText={summaryText}
        summaryLoading={summaryLoading}
      />

      <StageTabBar
        activeStage={activeStage}
        onSelect={setActiveStage}
        stageResults={stageResults}
      />

      {activeStageData && (
        <StagePanel
          stage={activeStageData}
          result={stageResults[activeStage]}
        />
      )}
    </div>
  )
}
