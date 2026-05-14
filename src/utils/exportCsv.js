import { STAGES } from '../constants/stages'
import { stageScore, applyOverrides, overallScore } from './scoring'

function cell(val) {
  if (val == null || val === '') return ''
  const str = String(val).replace(/\r\n/g, ' ').replace(/\n/g, ' ')
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"'
  }
  return str
}

function csvRow(cells) {
  return cells.map(cell).join(',')
}

function calcOverallForExport(assessment) {
  const stageScores = {}
  STAGES.forEach(s => {
    const dims = assessment.stageResults[s.id]?.dimensions ?? []
    const withOverrides = applyOverrides(dims, assessment.overrides ?? {})
    const allScored = dims.length > 0 && dims.every(d => d.score)
    if (allScored && withOverrides.length) stageScores[s.id] = stageScore(withOverrides)
  })
  return { stageScores, overall: overallScore(stageScores) }
}

function toTitleCase(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export function exportAssessmentCsv(assessment) {
  const { stageScores, overall } = calcOverallForExport(assessment)
  const readiness = overall
    ? overall.percent >= 75 ? 'Strong' : overall.percent >= 50 ? 'Moderate' : 'Emerging'
    : ''

  const headers = [
    'Pathway / Condition',
    'Date Saved',
    'Saved By',
    'Overall Score',
    'Maximum Score',
    'Readiness',
    'Assessment Summary',
    'Stage Number',
    'Stage Name',
    'Stage Score',
    'Dimension',
    'Check / Question',
    'AI Score',
    'Effective Score',
    'Overridden',
    'Overridden By',
    'Override Reason',
    'Rationale',
    'Sources',
  ]

  const rows = [csvRow(headers)]

  STAGES.forEach(stage => {
    const stageDims = assessment.stageResults[stage.id]?.dimensions ?? []
    const sc = stageScores[stage.id]

    stage.dimensions.forEach((dimDef, dimIdx) => {
      const dim = stageDims.find(d => d.id === dimDef.id)
      const overrides = assessment.overrides ?? {}
      const override = overrides[dimDef.id]

      const aiScore = dim?.score ? toTitleCase(dim.score) : ''
      const effectiveScore = override?.score ? toTitleCase(override.score) : aiScore

      const sources = (dim?.sources ?? [])
        .map(s => (typeof s === 'string' ? s : s.title))
        .join('; ')

      rows.push(csvRow([
        assessment.pathway,
        assessment.savedAt
          ? new Date(assessment.savedAt).toLocaleString('en-GB', {
              day: '2-digit', month: 'short', year: 'numeric',
              hour: '2-digit', minute: '2-digit'
            })
          : '',
        assessment.savedBy ?? '',
        overall ? overall.total : '',
        overall ? overall.max : '',
        readiness,
        assessment.summaryText ?? '',
        stage.number,
        stage.name,
        sc?.rating ?? '',
        `D${dimIdx + 1}`,
        dimDef.check,
        aiScore,
        effectiveScore,
        override ? 'Yes' : 'No',
        override?.changedBy ?? '',
        override?.rationale ?? '',
        dim?.rationale ?? '',
        sources,
      ]))
    })
  })

  const csv = '﻿' + rows.join('\r\n') // BOM for Excel UTF-8 compatibility
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url

  const safeName = assessment.pathway.replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_').toLowerCase()
  const dateStr = assessment.savedAt
    ? new Date(assessment.savedAt).toISOString().slice(0, 10)
    : 'unknown'
  a.download = `${safeName}_${dateStr}.csv`

  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
