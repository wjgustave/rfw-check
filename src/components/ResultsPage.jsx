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
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors"
        >
          ← Back
        </button>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Assessment</p>
          <h2 className="text-lg font-bold text-gray-900">{pathway}</h2>
        </div>
      </div>

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
