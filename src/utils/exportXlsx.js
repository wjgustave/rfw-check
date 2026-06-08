import * as XLSX from 'xlsx'
import { STAGES } from '../constants/stages'
import { stageScore, applyOverrides, overallScore } from './scoring'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toTitleCase(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

function fmtDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function fmtDateShort(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

function safeName(str) {
  return (str ?? 'assessment').replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_').toLowerCase()
}

function calcScores(assessment) {
  const stageScores = {}
  STAGES.forEach(s => {
    const dims = assessment.stageResults[s.id]?.dimensions ?? []
    const withOverrides = applyOverrides(dims, assessment.overrides ?? {})
    const allScored = dims.length > 0 && dims.every(d => d.score)
    if (allScored && withOverrides.length) stageScores[s.id] = stageScore(withOverrides)
  })
  return { stageScores, overall: overallScore(stageScores) }
}

/** Apply bold + NHS-blue fill to a header row */
function styleHeader(ws, row, colCount) {
  for (let c = 0; c < colCount; c++) {
    const addr = XLSX.utils.encode_cell({ r: row, c })
    if (!ws[addr]) continue
    ws[addr].s = {
      font: { bold: true, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '003087' }, patternType: 'solid' },
      alignment: { wrapText: true, vertical: 'top' },
    }
  }
}

/** Set column widths (array of char widths) */
function setCols(ws, widths) {
  ws['!cols'] = widths.map(w => ({ wch: w }))
}

/** Trigger download */
function download(wb, fileName) {
  XLSX.writeFile(wb, fileName)
}

// ─── Single-assessment export ────────────────────────────────────────────────

export function exportAssessmentXlsx(assessment) {
  const { stageScores, overall } = calcScores(assessment)
  const readiness = overall
    ? overall.percent >= 75 ? 'Strong' : overall.percent >= 50 ? 'Moderate' : 'Emerging'
    : ''

  const wb = XLSX.utils.book_new()

  // ── Sheet 1: Summary ────────────────────────────────────────────────────────
  {
    const rows = [
      ['RFW Assessment Summary'],
      [],
      ['Pathway / Condition', assessment.pathway ?? ''],
      ['Date Saved', fmtDate(assessment.savedAt)],
      ['Saved By', assessment.savedBy ?? ''],
      ['Overall Score', overall ? `${overall.total} / ${overall.max}` : 'Incomplete'],
      ['Readiness', readiness],
      [],
      ['Assessment Summary', assessment.summaryText ?? ''],
      [],
      ['── Stage Scores ──'],
    ]

    STAGES.forEach(stage => {
      const sc = stageScores[stage.id]
      rows.push([`Stage ${stage.number} — ${stage.name}`, sc ? `${sc.rating} (${sc.score}/${sc.max})` : 'Not scored'])
    })

    const ws = XLSX.utils.aoa_to_sheet(rows)
    ws['A1'] = { v: 'RFW Assessment Summary', t: 's', s: { font: { bold: true, sz: 14 } } }
    setCols(ws, [32, 80])
    ws['!rows'] = [{ hpt: 24 }]
    XLSX.utils.book_append_sheet(wb, ws, 'Summary')
  }

  // ── Sheet 2: Dimensions ─────────────────────────────────────────────────────
  {
    const headers = [
      'Stage', 'Stage Name', 'Dimension', 'Check / Question',
      'AI Score', 'Effective Score', 'Overridden', 'Overridden By',
      'Override Reason', 'Rationale', 'Sources',
    ]
    const dataRows = []

    STAGES.forEach(stage => {
      const stageDims = assessment.stageResults[stage.id]?.dimensions ?? []
      const sc = stageScores[stage.id]

      stage.dimensions.forEach((dimDef, dimIdx) => {
        const dim = stageDims.find(d => d.id === dimDef.id)
        const override = (assessment.overrides ?? {})[dimDef.id]
        const aiScore = dim?.score ? toTitleCase(dim.score) : ''
        const effectiveScore = override?.score ? toTitleCase(override.score) : aiScore
        const sources = (dim?.sources ?? [])
          .map(s => (typeof s === 'string' ? s : s.title ?? s.url ?? ''))
          .filter(Boolean)
          .join('\n')

        dataRows.push([
          `Stage ${stage.number}`,
          stage.name,
          `D${dimIdx + 1}`,
          dimDef.check,
          aiScore,
          effectiveScore,
          override ? 'Yes' : 'No',
          override?.changedBy ?? '',
          override?.rationale ?? '',
          dim?.rationale ?? '',
          sources,
        ])
      })
    })

    const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows])
    styleHeader(ws, 0, headers.length)
    setCols(ws, [12, 28, 6, 46, 12, 12, 10, 20, 36, 60, 50])
    ws['!rows'] = [{ hpt: 20 }, ...dataRows.map(() => ({ hpt: 60 }))]
    // wrap text in rationale + sources columns
    for (let r = 1; r <= dataRows.length; r++) {
      ;['I', 'J', 'K'].forEach(col => {
        const addr = `${col}${r + 1}`
        if (ws[addr]) ws[addr].s = { alignment: { wrapText: true, vertical: 'top' } }
      })
    }
    XLSX.utils.book_append_sheet(wb, ws, 'Dimensions')
  }

  // ── Sheet 3: Audit Trail ────────────────────────────────────────────────────
  {
    const entries = assessment.auditEntries ?? []
    const headers = ['Timestamp', 'Event', 'Detail', 'User']
    const dataRows = entries.map(e => [
      fmtDate(e.at ?? e.timestamp ?? e.time ?? ''),
      e.event ?? e.type ?? '',
      e.detail ?? e.message ?? '',
      e.user ?? e.by ?? '',
    ])
    const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows])
    styleHeader(ws, 0, headers.length)
    setCols(ws, [22, 28, 70, 24])
    XLSX.utils.book_append_sheet(wb, ws, 'Audit Trail')
  }

  // ── Sheet 4: Sources ────────────────────────────────────────────────────────
  {
    const headers = ['Stage', 'Dimension', 'Check', 'Source Title', 'URL']
    const dataRows = []

    STAGES.forEach(stage => {
      const stageDims = assessment.stageResults[stage.id]?.dimensions ?? []
      stage.dimensions.forEach((dimDef, dimIdx) => {
        const dim = stageDims.find(d => d.id === dimDef.id)
        const sources = dim?.sources ?? []
        sources.forEach(s => {
          const title = typeof s === 'string' ? s : (s.title ?? '')
          const url = typeof s === 'string' ? '' : (s.url ?? '')
          if (title || url) {
            dataRows.push([`Stage ${stage.number} — ${stage.name}`, `D${dimIdx + 1}`, dimDef.check, title, url])
          }
        })
      })
    })

    const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows])
    styleHeader(ws, 0, headers.length)
    setCols(ws, [34, 6, 46, 50, 60])
    XLSX.utils.book_append_sheet(wb, ws, 'Sources')
  }

  const dateStr = assessment.savedAt ? new Date(assessment.savedAt).toISOString().slice(0, 10) : 'export'
  download(wb, `${safeName(assessment.pathway)}_${dateStr}.xlsx`)
}

// ─── Comparison export ───────────────────────────────────────────────────────

export function exportComparisonXlsx(assessments) {
  const wb = XLSX.utils.book_new()

  const scored = assessments.map(a => {
    const { stageScores, overall } = calcScores(a)
    const readiness = overall
      ? overall.percent >= 75 ? 'Strong' : overall.percent >= 50 ? 'Moderate' : 'Emerging'
      : ''
    return { ...a, stageScores, overall, readiness }
  })

  // ── Sheet 1: Summary ────────────────────────────────────────────────────────
  {
    const stageHeaders = STAGES.map(s => `Stage ${s.number} — ${s.name}`)
    const headers = ['Pathway / Condition', 'Date', 'Saved By', 'Overall Score', 'Readiness', ...stageHeaders]

    const dataRows = scored.map(a => [
      a.pathway ?? '',
      fmtDateShort(a.savedAt),
      a.savedBy ?? '',
      a.overall ? `${a.overall.total} / ${a.overall.max}` : '',
      a.readiness,
      ...STAGES.map(s => a.stageScores[s.id]?.rating ?? ''),
    ])

    const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows])
    styleHeader(ws, 0, headers.length)
    setCols(ws, [40, 14, 20, 14, 12, ...STAGES.map(() => 22)])
    XLSX.utils.book_append_sheet(wb, ws, 'Summary')
  }

  // ── Sheet 2: Dimension Scores ────────────────────────────────────────────────
  {
    const pathwayHeaders = scored.map(a => `${a.pathway}\n${fmtDateShort(a.savedAt)}`)
    const headers = ['Stage', 'Dimension', 'Check', ...pathwayHeaders]
    const dataRows = []

    STAGES.forEach(stage => {
      stage.dimensions.forEach((dimDef, dimIdx) => {
        const scores = scored.map(a => {
          const dim = (a.stageResults[stage.id]?.dimensions ?? []).find(d => d.id === dimDef.id)
          const override = (a.overrides ?? {})[dimDef.id]
          const effective = override?.score ?? dim?.score ?? ''
          return effective ? toTitleCase(effective) : ''
        })
        dataRows.push([`Stage ${stage.number} — ${stage.name}`, `D${dimIdx + 1}`, dimDef.check, ...scores])
      })
    })

    const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows])
    styleHeader(ws, 0, headers.length)
    setCols(ws, [30, 6, 50, ...scored.map(() => 22)])
    XLSX.utils.book_append_sheet(wb, ws, 'Dimension Scores')
  }

  // ── Sheet 3: Rationale ───────────────────────────────────────────────────────
  {
    const pathwayHeaders = scored.map(a => `${a.pathway}\n${fmtDateShort(a.savedAt)}`)
    const headers = ['Stage', 'Dimension', 'Check', ...pathwayHeaders]
    const dataRows = []

    STAGES.forEach(stage => {
      stage.dimensions.forEach((dimDef, dimIdx) => {
        const rationales = scored.map(a => {
          const dim = (a.stageResults[stage.id]?.dimensions ?? []).find(d => d.id === dimDef.id)
          return dim?.rationale ?? ''
        })
        dataRows.push([`Stage ${stage.number} — ${stage.name}`, `D${dimIdx + 1}`, dimDef.check, ...rationales])
      })
    })

    const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows])
    styleHeader(ws, 0, headers.length)
    setCols(ws, [30, 6, 50, ...scored.map(() => 60)])
    // Wrap rationale cells
    for (let r = 1; r <= dataRows.length; r++) {
      for (let c = 3; c < headers.length; c++) {
        const addr = XLSX.utils.encode_cell({ r, c })
        if (ws[addr]) ws[addr].s = { alignment: { wrapText: true, vertical: 'top' } }
      }
    }
    ws['!rows'] = [{ hpt: 20 }, ...dataRows.map(() => ({ hpt: 80 }))]
    XLSX.utils.book_append_sheet(wb, ws, 'Rationale')
  }

  // ── Sheet 4: Audit Trail (combined) ─────────────────────────────────────────
  {
    const headers = ['Pathway', 'Date Saved', 'Timestamp', 'Event', 'Detail', 'User']
    const dataRows = []

    scored.forEach(a => {
      const entries = a.auditEntries ?? []
      entries.forEach(e => {
        dataRows.push([
          a.pathway ?? '',
          fmtDateShort(a.savedAt),
          fmtDate(e.at ?? e.timestamp ?? e.time ?? ''),
          e.event ?? e.type ?? '',
          e.detail ?? e.message ?? '',
          e.user ?? e.by ?? '',
        ])
      })
    })

    const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows])
    styleHeader(ws, 0, headers.length)
    setCols(ws, [36, 14, 22, 28, 70, 24])
    XLSX.utils.book_append_sheet(wb, ws, 'Audit Trail')
  }

  // ── Sheet 5: Sources (combined) ─────────────────────────────────────────────
  {
    const headers = ['Pathway', 'Stage', 'Dimension', 'Check', 'Source Title', 'URL']
    const dataRows = []

    scored.forEach(a => {
      STAGES.forEach(stage => {
        const stageDims = a.stageResults[stage.id]?.dimensions ?? []
        stage.dimensions.forEach((dimDef, dimIdx) => {
          const dim = stageDims.find(d => d.id === dimDef.id)
          ;(dim?.sources ?? []).forEach(s => {
            const title = typeof s === 'string' ? s : (s.title ?? '')
            const url = typeof s === 'string' ? '' : (s.url ?? '')
            if (title || url) {
              dataRows.push([
                a.pathway ?? '',
                `Stage ${stage.number} — ${stage.name}`,
                `D${dimIdx + 1}`,
                dimDef.check,
                title,
                url,
              ])
            }
          })
        })
      })
    })

    const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows])
    styleHeader(ws, 0, headers.length)
    setCols(ws, [36, 34, 6, 46, 50, 60])
    XLSX.utils.book_append_sheet(wb, ws, 'Sources')
  }

  const dateStr = new Date().toISOString().slice(0, 10)
  download(wb, `rfw_comparison_${dateStr}.xlsx`)
}
