// ExcelJS is loaded on-demand so it doesn't bloat the initial bundle.
import { STAGES } from '../constants/stages'
import { stageScore, applyOverrides, overallScore } from './scoring'

// ─── Color palette (ARGB 8-char format required by ExcelJS) ──────────────────
const C = {
  nhsBlue:       'FF003087',  // NHS Blue — header background
  white:         'FFFFFFFF',
  black:         'FF0B0C0C',
  midGrey:       'FF505A5F',
  altRow:        'FFF3F2F1',  // alternating row tint
  borderColor:   'FFDEE0E2',
  stageLabelBg:  'FFE8EDEE',  // stage group label cell
  stageLabelText:'FF003087',
  // Score colours (match the GOV.UK/NHS tags in the app)
  highBg:        'FFCCE2D8', highText: 'FF005A30',
  medBg:         'FFFFF7BF', medText:  'FF594D00',
  lowBg:         'FFF6D7D2', lowText:  'FF942514',
  // Override highlight
  overrideBg:    'FFECE5FB', overrideText: 'FF3D1A78',
  // Hyperlink
  linkBlue:      'FF005EB8',
}

// ─── Style building-blocks ────────────────────────────────────────────────────

function solidFill(argb) {
  return { type: 'pattern', pattern: 'solid', fgColor: { argb } }
}

function colorForLevel(level) {
  const l = (level ?? '').toLowerCase()
  if (l === 'high')   return { bg: C.highBg, text: C.highText }
  if (l === 'medium') return { bg: C.medBg,  text: C.medText  }
  if (l === 'low')    return { bg: C.lowBg,  text: C.lowText  }
  return null
}

/** Navy header row — white bold text, bottom border */
function styleHeaderRow(row) {
  row.height = 22
  row.eachCell({ includeEmpty: true }, cell => {
    cell.font      = { bold: true, color: { argb: C.white }, size: 11 }
    cell.fill      = solidFill(C.nhsBlue)
    cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: false }
    cell.border    = { bottom: { style: 'thin', color: { argb: C.borderColor } } }
  })
}

/** Green / amber / red score pill */
function styleScoreCell(cell, level) {
  const colors = colorForLevel(level)
  if (!colors) return
  cell.fill      = solidFill(colors.bg)
  cell.font      = { bold: true, color: { argb: colors.text }, size: 11 }
  cell.alignment = { horizontal: 'center', vertical: 'middle' }
}

/** Text wrap + top-align */
function wrapCell(cell) {
  cell.alignment = { wrapText: true, vertical: 'top', horizontal: 'left' }
}

/** Apply alternating row shading to every cell in a row (1-based data index) */
function altShade(row, dataIdx) {
  if (dataIdx % 2 !== 0) return   // shade odd data rows (1, 3, 5 …)
  row.eachCell({ includeEmpty: true }, cell => {
    cell.fill = solidFill(C.altRow)
  })
}

/**
 * Seal a stage group on a sheet:
 *  - Merge the stage column (col 1) across all rows in the group
 *  - Style the merged cell (light blue-grey bg, NHS blue bold text, centred)
 *  - Add a thick NHS-blue bottom border across the entire last row to
 *    visually separate this stage from the next
 */
function sealStageGroup(ws, startRow, endRow, stageLabel, totalCols) {
  if (endRow > startRow) ws.mergeCells(startRow, 1, endRow, 1)
  const cell = ws.getCell(startRow, 1)
  cell.value     = stageLabel
  cell.fill      = solidFill(C.stageLabelBg)
  cell.font      = { bold: true, color: { argb: C.stageLabelText }, size: 10 }
  cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
  // Thick divider at the bottom of the last row in this stage
  const lastRow = ws.getRow(endRow)
  for (let c = 1; c <= totalCols; c++) {
    const lc   = lastRow.getCell(c)
    const prev = lc.border ?? {}
    lc.border  = { ...prev, bottom: { style: 'medium', color: { argb: C.nhsBlue } } }
  }
}

// ─── Shared utilities ─────────────────────────────────────────────────────────

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

function fileSlug(str) {
  return (str ?? 'assessment').replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_').toLowerCase()
}

/** Full display label for an assessment: "HTG761 — Cardiac Rehabilitation" or just "Cardiac Rehabilitation" */
function pathwayLabel(assessment) {
  const { htgRef, pathway } = assessment
  return htgRef ? `${htgRef} — ${pathway}` : (pathway ?? '')
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

function readinessLabel(overall) {
  if (!overall) return ''
  return overall.percent >= 75 ? 'Strong' : overall.percent >= 50 ? 'Moderate' : 'Emerging'
}

function readinessLevel(overall) {
  if (!overall) return null
  return overall.percent >= 75 ? 'high' : overall.percent >= 50 ? 'medium' : 'low'
}

async function triggerDownload(wb, fileName) {
  const buffer = await wb.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ─── Single-assessment export ─────────────────────────────────────────────────

export async function exportAssessmentXlsx(assessment) {
  const ExcelJS = (await import('exceljs')).default
  const { stageScores, overall } = calcScores(assessment)
  const readiness = readinessLabel(overall)

  const wb = new ExcelJS.Workbook()
  wb.creator = 'RFW Check'
  wb.created = new Date()

  // ── Sheet 1: Summary ────────────────────────────────────────────────────────
  {
    const ws = wb.addWorksheet('Summary')
    ws.columns = [{ width: 28 }, { width: 72 }]

    // Banner title
    const titleRow = ws.addRow(['RFW Condition Readiness Assessment', ''])
    ws.mergeCells(titleRow.number, 1, titleRow.number, 2)
    titleRow.height = 30
    const titleCell = titleRow.getCell(1)
    titleCell.font      = { bold: true, size: 14, color: { argb: C.white } }
    titleCell.fill      = solidFill(C.nhsBlue)
    titleCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }

    ws.addRow([])

    // Key–value section — "Saved By" moved to bottom of sheet
    const kvPairs = [
      ['Pathway / Condition', pathwayLabel(assessment)],
      ['Date Saved',          fmtDate(assessment.savedAt)],
      ['Overall Score',       overall ? `${overall.total} / ${overall.max}` : 'Incomplete'],
      ['Readiness',           readiness],
    ]
    kvPairs.forEach(([k, v]) => {
      const row = ws.addRow([k, v])
      row.height = 18
      row.getCell(1).font = { bold: true, color: { argb: C.midGrey }, size: 11 }
      row.getCell(1).fill = solidFill(C.altRow)
      row.getCell(2).font = { size: 11 }
    })
    // Colour the readiness cell
    if (overall) styleScoreCell(ws.lastRow.getCell(2), readinessLevel(overall))

    ws.addRow([])

    // Stage scores mini-table
    const stageHdr = ws.addRow(['Stage', 'Score'])
    styleHeaderRow(stageHdr)

    STAGES.forEach((stage, idx) => {
      const sc = stageScores[stage.id]
      const row = ws.addRow([
        `Stage ${stage.number} — ${stage.name}`,
        sc ? sc.rating : 'Not scored',
      ])
      row.height = 18
      if (idx % 2 === 0) row.getCell(1).fill = solidFill(C.altRow)
      if (sc) {
        styleScoreCell(row.getCell(2), sc.level)
      } else {
        row.getCell(2).font      = { color: { argb: 'FFB1B4B6' }, size: 11 }
        row.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' }
      }
    })

    // ── Summary rationale row — added after Stage 6 ──────────────────────────
    const sumRow = ws.addRow(['Summary rationale', assessment.summaryText ?? '(not generated)'])
    sumRow.height = 80
    sumRow.getCell(1).font      = { bold: true, color: { argb: C.stageLabelText }, size: 11 }
    sumRow.getCell(1).fill      = solidFill(C.stageLabelBg)
    sumRow.getCell(1).alignment = { vertical: 'top' }
    wrapCell(sumRow.getCell(2))
    // Thick top border to separate from stage score rows
    ;[1, 2].forEach(c => {
      const cell  = sumRow.getCell(c)
      const prev  = cell.border ?? {}
      cell.border = { ...prev, top: { style: 'medium', color: { argb: C.nhsBlue } } }
    })

    ws.addRow([])

    // ── Saved By — moved to the end ──────────────────────────────────────────
    const savedRow = ws.addRow(['Saved By', assessment.savedBy ?? ''])
    savedRow.height = 18
    savedRow.getCell(1).font = { bold: true, color: { argb: C.midGrey }, size: 11 }
    savedRow.getCell(1).fill = solidFill(C.altRow)
    savedRow.getCell(2).font = { size: 11 }
  }

  // ── Sheet 2: Dimensions ─────────────────────────────────────────────────────
  {
    const ws = wb.addWorksheet('Dimensions')
    // Stage col is merged — removed separate Stage Name col; stage name lives in the merged cell label
    const TOTAL_COLS = 10
    ws.columns = [
      { width: 14 }, // Stage (merged)
      { width: 6  }, // Dim
      { width: 44 }, // Check
      { width: 12 }, // AI Score
      { width: 12 }, // Effective Score
      { width: 10 }, // Overridden
      { width: 20 }, // Overridden By
      { width: 34 }, // Override Reason
      { width: 60 }, // Rationale
      { width: 50 }, // Sources
    ]

    const hRow = ws.addRow([
      'Stage', 'Dim', 'Check / Question',
      'AI Score', 'Effective Score', 'Overridden', 'Overridden By',
      'Override Reason', 'Rationale', 'Sources',
    ])
    styleHeaderRow(hRow)
    ws.views = [{ state: 'frozen', ySplit: 1 }]

    let nextDataRow = 2  // row 1 = header

    STAGES.forEach(stage => {
      const stageStart   = nextDataRow
      const stageDims    = assessment.stageResults[stage.id]?.dimensions ?? []

      stage.dimensions.forEach((dimDef, dimIdx) => {
        const dim      = stageDims.find(d => d.id === dimDef.id)
        const override = (assessment.overrides ?? {})[dimDef.id]
        const aiScore  = dim?.score ? toTitleCase(dim.score) : ''
        const effScore = override?.score ? toTitleCase(override.score) : aiScore
        const sources  = (dim?.sources ?? [])
          .map(s => (typeof s === 'string' ? s : (s.title ?? s.url ?? '')))
          .filter(Boolean)
          .join('\n')

        const row = ws.addRow([
          '',              // stage col — filled by sealStageGroup
          `D${dimIdx + 1}`,
          dimDef.check,
          aiScore,
          effScore,
          override ? 'Yes' : 'No',
          override?.changedBy  ?? '',
          override?.rationale  ?? '',
          dim?.rationale       ?? '',
          sources,
        ])
        row.height = 60

        // Base shading: override rows purple, others alternating grey
        if (override) {
          row.eachCell({ includeEmpty: true }, cell => {
            cell.fill = solidFill(C.overrideBg)
            cell.font = { color: { argb: C.overrideText }, size: 11 }
          })
          row.getCell(6).font = { bold: true, color: { argb: C.overrideText }, size: 11 }
        } else {
          altShade(row, dimIdx + 1)
        }

        // Score cells always get their colour on top of any base shading
        if (aiScore)  styleScoreCell(row.getCell(4), aiScore)
        if (effScore) styleScoreCell(row.getCell(5), effScore)

        // Wrap long-text columns
        wrapCell(row.getCell(3))   // check
        wrapCell(row.getCell(8))   // override reason
        wrapCell(row.getCell(9))   // rationale
        wrapCell(row.getCell(10))  // sources

        nextDataRow++
      })

      // Merge stage column + thick border
      sealStageGroup(ws, stageStart, nextDataRow - 1, `Stage ${stage.number}\n${stage.name}`, TOTAL_COLS)
    })
  }

  // ── Sheet 3: Audit Trail ────────────────────────────────────────────────────
  {
    const ws = wb.addWorksheet('Audit Trail')
    ws.columns = [{ width: 22 }, { width: 30 }, { width: 70 }, { width: 24 }]

    const hRow = ws.addRow(['Timestamp', 'Event', 'Detail', 'User'])
    styleHeaderRow(hRow)
    ws.views = [{ state: 'frozen', ySplit: 1 }]

    ;(assessment.auditEntries ?? []).forEach((e, idx) => {
      const row = ws.addRow([
        fmtDate(e.at ?? e.timestamp ?? e.time ?? ''),
        e.event ?? e.type ?? '',
        e.detail ?? e.message ?? '',
        e.user ?? e.by ?? '',
      ])
      row.height = 18
      wrapCell(row.getCell(3))
      altShade(row, idx + 1)
    })
  }

  // ── Sheet 4: Sources ────────────────────────────────────────────────────────
  {
    const ws = wb.addWorksheet('Sources')
    ws.columns = [{ width: 34 }, { width: 6 }, { width: 46 }, { width: 50 }, { width: 60 }]

    const hRow = ws.addRow(['Stage', 'Dim', 'Check', 'Source Title', 'URL'])
    styleHeaderRow(hRow)
    ws.views = [{ state: 'frozen', ySplit: 1 }]

    let rowIdx = 0
    STAGES.forEach(stage => {
      const stageDims = assessment.stageResults[stage.id]?.dimensions ?? []
      stage.dimensions.forEach((dimDef, dimIdx) => {
        const dim = stageDims.find(d => d.id === dimDef.id)
        ;(dim?.sources ?? []).forEach(s => {
          const title = typeof s === 'string' ? s : (s.title ?? '')
          const url   = typeof s === 'string' ? '' : (s.url ?? '')
          if (!title && !url) return
          rowIdx++
          const row = ws.addRow([
            `Stage ${stage.number} — ${stage.name}`,
            `D${dimIdx + 1}`,
            dimDef.check,
            title,
            url,
          ])
          row.height = 18
          altShade(row, rowIdx)
          if (url && url.startsWith('http')) {
            const cell = row.getCell(5)
            cell.value = { text: url, hyperlink: url }
            cell.font  = { color: { argb: C.linkBlue }, underline: true, size: 11 }
          }
        })
      })
    })
  }

  const dateStr = assessment.savedAt ? new Date(assessment.savedAt).toISOString().slice(0, 10) : 'export'
  const slug = assessment.htgRef
    ? `${fileSlug(assessment.htgRef)}_${fileSlug(assessment.pathway)}`
    : fileSlug(assessment.pathway)
  await triggerDownload(wb, `${slug}_${dateStr}.xlsx`)
}

// ─── Comparison export ────────────────────────────────────────────────────────

export async function exportComparisonXlsx(assessments) {
  const ExcelJS = (await import('exceljs')).default
  const wb = new ExcelJS.Workbook()
  wb.creator = 'RFW Check'
  wb.created = new Date()

  const scored = assessments.map(a => {
    const { stageScores, overall } = calcScores(a)
    return { ...a, stageScores, overall, readiness: readinessLabel(overall) }
  })

  // ── Sheet 1: Summary ────────────────────────────────────────────────────────
  // Column order: Pathway | Date | Score | Readiness | Stage 1–6 | Summary rationale | Saved By
  {
    const ws = wb.addWorksheet('Summary')
    ws.columns = [
      { width: 40 }, // Pathway
      { width: 14 }, // Date
      { width: 14 }, // Score
      { width: 12 }, // Readiness
      ...STAGES.map(() => ({ width: 20 })), // Stage 1-6
      { width: 60 }, // Summary rationale
      { width: 20 }, // Saved By (moved to end)
    ]

    const hRow = ws.addRow([
      'Pathway / Condition', 'Date', 'Score', 'Readiness',
      ...STAGES.map(s => `Stage ${s.number}\n${s.name}`),
      'Summary rationale',
      'Saved By',
    ])
    styleHeaderRow(hRow)
    hRow.height = 32
    hRow.eachCell({ includeEmpty: true }, cell => {
      cell.alignment = { wrapText: true, vertical: 'middle', horizontal: 'left' }
    })
    ws.views = [{ state: 'frozen', ySplit: 1 }]

    scored.forEach((a, idx) => {
      const row = ws.addRow([
        pathwayLabel(a),
        fmtDateShort(a.savedAt),
        a.overall ? `${a.overall.total} / ${a.overall.max}` : '',
        a.readiness,
        ...STAGES.map(s => a.stageScores[s.id]?.rating ?? ''),
        a.summaryText ?? '',
        a.savedBy ?? '',
      ])
      row.height = 20
      altShade(row, idx + 1)

      // Colour readiness + stage score cells (override any alt shading)
      if (a.overall) styleScoreCell(row.getCell(4), readinessLevel(a.overall))
      STAGES.forEach((s, sIdx) => {
        const sc = a.stageScores[s.id]
        if (sc) styleScoreCell(row.getCell(5 + sIdx), sc.level)
      })

      // Wrap summary rationale text
      const summaryCol = 5 + STAGES.length
      wrapCell(row.getCell(summaryCol))
      row.height = 60
    })
  }

  // ── Sheet 2: Dimension Scores ─────────────────────────────────────────────
  {
    const ws = wb.addWorksheet('Dimension Scores')
    const TOTAL_COLS = 3 + scored.length
    ws.columns = [
      { width: 14 }, // Stage (merged)
      { width: 6  }, // Dim
      { width: 50 }, // Check
      ...scored.map(() => ({ width: 22 })),
    ]

    const hRow = ws.addRow([
      'Stage', 'Dim', 'Check',
      ...scored.map(a => `${pathwayLabel(a)}\n${fmtDateShort(a.savedAt)}`),
    ])
    styleHeaderRow(hRow)
    hRow.height = 32
    hRow.eachCell({ includeEmpty: true }, cell => {
      cell.alignment = { wrapText: true, vertical: 'middle', horizontal: 'left' }
    })
    ws.views = [{ state: 'frozen', xSplit: 3, ySplit: 1 }]

    let nextDataRow = 2

    STAGES.forEach(stage => {
      const stageStart = nextDataRow

      stage.dimensions.forEach((dimDef, dimIdx) => {
        const scores = scored.map(a => {
          const dim      = (a.stageResults[stage.id]?.dimensions ?? []).find(d => d.id === dimDef.id)
          const override = (a.overrides ?? {})[dimDef.id]
          const effective = override?.score ?? dim?.score ?? ''
          return effective ? toTitleCase(effective) : ''
        })

        const row = ws.addRow([
          '',              // stage col — filled by sealStageGroup
          `D${dimIdx + 1}`,
          dimDef.check,
          ...scores,
        ])
        row.height = 18
        altShade(row, dimIdx + 1)

        // Colour each score cell
        scores.forEach((score, sIdx) => {
          if (score) styleScoreCell(row.getCell(4 + sIdx), score)
        })

        nextDataRow++
      })

      sealStageGroup(ws, stageStart, nextDataRow - 1, `Stage ${stage.number}\n${stage.name}`, TOTAL_COLS)
    })
  }

  // ── Sheet 3: Rationale ───────────────────────────────────────────────────────
  {
    const ws = wb.addWorksheet('Rationale')
    const TOTAL_COLS = 3 + scored.length
    ws.columns = [
      { width: 14 }, // Stage (merged)
      { width: 6  }, // Dim
      { width: 50 }, // Check
      ...scored.map(() => ({ width: 60 })),
    ]

    const hRow = ws.addRow([
      'Stage', 'Dim', 'Check',
      ...scored.map(a => `${pathwayLabel(a)}\n${fmtDateShort(a.savedAt)}`),
    ])
    styleHeaderRow(hRow)
    hRow.height = 32
    hRow.eachCell({ includeEmpty: true }, cell => {
      cell.alignment = { wrapText: true, vertical: 'middle', horizontal: 'left' }
    })
    ws.views = [{ state: 'frozen', xSplit: 3, ySplit: 1 }]

    let nextDataRow = 2

    STAGES.forEach(stage => {
      const stageStart = nextDataRow

      stage.dimensions.forEach((dimDef, dimIdx) => {
        const rationales = scored.map(a => {
          const dim = (a.stageResults[stage.id]?.dimensions ?? []).find(d => d.id === dimDef.id)
          return dim?.rationale ?? ''
        })

        // Effective scores — used to colour-code the rationale text
        const effectiveLevels = scored.map(a => {
          const dim      = (a.stageResults[stage.id]?.dimensions ?? []).find(d => d.id === dimDef.id)
          const override = (a.overrides ?? {})[dimDef.id]
          return ((override?.score ?? dim?.score) ?? '').toLowerCase()
        })

        const row = ws.addRow([
          '',              // stage col — filled by sealStageGroup
          `D${dimIdx + 1}`,
          dimDef.check,
          ...rationales,
        ])
        row.height = 80
        altShade(row, dimIdx + 1)
        wrapCell(row.getCell(3))

        // Colour rationale text by score — accessible dark tones on white/alt bg
        rationales.forEach((rationale, sIdx) => {
          const cell  = row.getCell(4 + sIdx)
          wrapCell(cell)
          if (rationale && effectiveLevels[sIdx]) {
            const colors = colorForLevel(effectiveLevels[sIdx])
            if (colors) cell.font = { color: { argb: colors.text }, size: 11 }
          }
        })

        nextDataRow++
      })

      sealStageGroup(ws, stageStart, nextDataRow - 1, `Stage ${stage.number}\n${stage.name}`, TOTAL_COLS)
    })
  }

  // ── Sheet 4: Audit Trail (combined) ─────────────────────────────────────────
  {
    const ws = wb.addWorksheet('Audit Trail')
    ws.columns = [
      { width: 36 }, { width: 14 }, { width: 22 }, { width: 30 }, { width: 70 }, { width: 24 },
    ]

    const hRow = ws.addRow(['Pathway', 'Date Saved', 'Timestamp', 'Event', 'Detail', 'User'])
    styleHeaderRow(hRow)
    ws.views = [{ state: 'frozen', ySplit: 1 }]

    let rowIdx = 0
    scored.forEach(a => {
      ;(a.auditEntries ?? []).forEach(e => {
        rowIdx++
        const row = ws.addRow([
          pathwayLabel(a),
          fmtDateShort(a.savedAt),
          fmtDate(e.at ?? e.timestamp ?? e.time ?? ''),
          e.event ?? e.type ?? '',
          e.detail ?? e.message ?? '',
          e.user ?? e.by ?? '',
        ])
        row.height = 18
        wrapCell(row.getCell(5))
        altShade(row, rowIdx)
      })
    })
  }

  // ── Sheet 5: Sources (combined) ─────────────────────────────────────────────
  {
    const ws = wb.addWorksheet('Sources')
    ws.columns = [
      { width: 36 }, { width: 30 }, { width: 6 }, { width: 46 }, { width: 50 }, { width: 60 },
    ]

    const hRow = ws.addRow(['Pathway', 'Stage', 'Dim', 'Check', 'Source Title', 'URL'])
    styleHeaderRow(hRow)
    ws.views = [{ state: 'frozen', ySplit: 1 }]

    let rowIdx = 0
    scored.forEach(a => {
      STAGES.forEach(stage => {
        const stageDims = a.stageResults[stage.id]?.dimensions ?? []
        stage.dimensions.forEach((dimDef, dimIdx) => {
          const dim = stageDims.find(d => d.id === dimDef.id)
          ;(dim?.sources ?? []).forEach(s => {
            const title = typeof s === 'string' ? s : (s.title ?? '')
            const url   = typeof s === 'string' ? '' : (s.url ?? '')
            if (!title && !url) return
            rowIdx++
            const row = ws.addRow([
              a.pathway ?? '',
              `Stage ${stage.number} — ${stage.name}`,
              `D${dimIdx + 1}`,
              dimDef.check,
              title,
              url,
            ])
            row.height = 18
            altShade(row, rowIdx)
            if (url && url.startsWith('http')) {
              const cell = row.getCell(6)
              cell.value = { text: url, hyperlink: url }
              cell.font  = { color: { argb: C.linkBlue }, underline: true, size: 11 }
            }
          })
        })
      })
    })
  }

  const dateStr = new Date().toISOString().slice(0, 10)
  await triggerDownload(wb, `rfw_comparison_${dateStr}.xlsx`)
}
