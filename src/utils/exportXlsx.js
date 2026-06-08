// ExcelJS is loaded on-demand so it doesn't bloat the initial bundle.
import { STAGES } from '../constants/stages'
import { stageScore, applyOverrides, overallScore } from './scoring'

// ─── Color palette (ARGB 8-char format required by ExcelJS) ──────────────────
const C = {
  nhsBlue:      'FF003087',  // NHS Blue — header background
  white:        'FFFFFFFF',
  black:        'FF0B0C0C',
  midGrey:      'FF505A5F',
  altRow:       'FFF3F2F1',  // alternating row tint
  borderColor:  'FFDEE0E2',
  // Score colours (match the GOV.UK/NHS tags in the app)
  highBg:       'FFCCE2D8', highText:    'FF005A30',
  medBg:        'FFFFF7BF', medText:     'FF594D00',
  lowBg:        'FFF6D7D2', lowText:     'FF942514',
  // Override highlight
  overrideBg:   'FFECE5FB', overrideText:'FF3D1A78',
  // Hyperlink
  linkBlue:     'FF005EB8',
}

// ─── Style building-blocks ────────────────────────────────────────────────────

function solidFill(argb) {
  return { type: 'pattern', pattern: 'solid', fgColor: { argb } }
}

function colorForLevel(level) {
  const l = (level ?? '').toLowerCase()
  if (l === 'high')   return { bg: C.highBg,   text: C.highText }
  if (l === 'medium') return { bg: C.medBg,    text: C.medText }
  if (l === 'low')    return { bg: C.lowBg,    text: C.lowText }
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

    // Key–value pairs
    const kvPairs = [
      ['Pathway / Condition', assessment.pathway ?? ''],
      ['Date Saved',          fmtDate(assessment.savedAt)],
      ['Saved By',            assessment.savedBy ?? ''],
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
    // Colour the readiness cell to match the score
    const readinessRow = ws.lastRow
    if (overall) styleScoreCell(readinessRow.getCell(2), readinessLevel(overall))

    // Summary text
    const sumRow = ws.addRow(['Assessment Summary', assessment.summaryText ?? ''])
    sumRow.height = 80
    sumRow.getCell(1).font      = { bold: true, color: { argb: C.midGrey }, size: 11 }
    sumRow.getCell(1).fill      = solidFill(C.altRow)
    sumRow.getCell(1).alignment = { vertical: 'top' }
    wrapCell(sumRow.getCell(2))

    ws.addRow([])

    // Stage scores mini-table
    const stageHdr = ws.addRow(['Stage', 'Score'])
    styleHeaderRow(stageHdr)

    STAGES.forEach((stage, idx) => {
      const sc = stageScores[stage.id]
      const row = ws.addRow([`Stage ${stage.number} — ${stage.name}`, sc ? sc.rating : 'Not scored'])
      row.height = 18
      if (idx % 2 === 0) row.getCell(1).fill = solidFill(C.altRow)
      if (sc) {
        styleScoreCell(row.getCell(2), sc.level)
      } else {
        row.getCell(2).font = { color: { argb: 'FFB1B4B6' }, size: 11 }
        row.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' }
      }
    })
  }

  // ── Sheet 2: Dimensions ─────────────────────────────────────────────────────
  {
    const ws = wb.addWorksheet('Dimensions')
    ws.columns = [
      { width: 12 }, { width: 26 }, { width: 6 }, { width: 44 },
      { width: 12 }, { width: 12 }, { width: 10 }, { width: 20 },
      { width: 34 }, { width: 60 }, { width: 50 },
    ]

    const hRow = ws.addRow([
      'Stage', 'Stage Name', 'Dim', 'Check / Question',
      'AI Score', 'Effective Score', 'Overridden', 'Overridden By',
      'Override Reason', 'Rationale', 'Sources',
    ])
    styleHeaderRow(hRow)
    ws.views = [{ state: 'frozen', ySplit: 1 }]

    let dataIdx = 0
    STAGES.forEach(stage => {
      const stageDims = assessment.stageResults[stage.id]?.dimensions ?? []

      stage.dimensions.forEach((dimDef, dimIdx) => {
        dataIdx++
        const dim      = stageDims.find(d => d.id === dimDef.id)
        const override = (assessment.overrides ?? {})[dimDef.id]
        const aiScore  = dim?.score ? toTitleCase(dim.score) : ''
        const effScore = override?.score ? toTitleCase(override.score) : aiScore
        const sources  = (dim?.sources ?? [])
          .map(s => (typeof s === 'string' ? s : (s.title ?? s.url ?? '')))
          .filter(Boolean)
          .join('\n')

        const row = ws.addRow([
          `Stage ${stage.number}`, stage.name, `D${dimIdx + 1}`, dimDef.check,
          aiScore, effScore,
          override ? 'Yes' : 'No',
          override?.changedBy  ?? '',
          override?.rationale  ?? '',
          dim?.rationale       ?? '',
          sources,
        ])
        row.height = 60

        // Base shading: override rows get purple tint; others get alternating grey
        if (override) {
          row.eachCell({ includeEmpty: true }, cell => {
            cell.fill = solidFill(C.overrideBg)
            cell.font = { color: { argb: C.overrideText }, size: 11 }
          })
          row.getCell(7).font = { bold: true, color: { argb: C.overrideText }, size: 11 }
        } else {
          altShade(row, dataIdx)
        }

        // Score cells always get their colour on top of any base shading
        if (aiScore)  styleScoreCell(row.getCell(5), aiScore)
        if (effScore) styleScoreCell(row.getCell(6), effScore)

        // Wrap long-text columns
        wrapCell(row.getCell(4))   // check
        wrapCell(row.getCell(9))   // override reason
        wrapCell(row.getCell(10))  // rationale
        wrapCell(row.getCell(11))  // sources
      })
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
          // Clickable hyperlink for URLs
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
  await triggerDownload(wb, `${fileSlug(assessment.pathway)}_${dateStr}.xlsx`)
}

// ─── Comparison export ────────────────────────────────────────────────────────

export async function exportComparisonXlsx(assessments) {
  const ExcelJS = (await import('exceljs')).default
  const wb = new ExcelJS.Workbook()
  wb.creator = 'RFW Check'
  wb.created = new Date()

  // Pre-compute scores for every assessment
  const scored = assessments.map(a => {
    const { stageScores, overall } = calcScores(a)
    return { ...a, stageScores, overall, readiness: readinessLabel(overall) }
  })

  // ── Sheet 1: Summary ────────────────────────────────────────────────────────
  {
    const ws = wb.addWorksheet('Summary')
    ws.columns = [
      { width: 40 }, { width: 14 }, { width: 20 }, { width: 14 }, { width: 12 },
      ...STAGES.map(() => ({ width: 20 })),
    ]

    const hRow = ws.addRow([
      'Pathway / Condition', 'Date', 'Saved By', 'Score', 'Readiness',
      ...STAGES.map(s => `Stage ${s.number}\n${s.name}`),
    ])
    styleHeaderRow(hRow)
    hRow.height = 32
    hRow.eachCell({ includeEmpty: true }, cell => {
      cell.alignment = { wrapText: true, vertical: 'middle', horizontal: 'left' }
    })
    ws.views = [{ state: 'frozen', ySplit: 1 }]

    scored.forEach((a, idx) => {
      const row = ws.addRow([
        a.pathway ?? '',
        fmtDateShort(a.savedAt),
        a.savedBy ?? '',
        a.overall ? `${a.overall.total} / ${a.overall.max}` : '',
        a.readiness,
        ...STAGES.map(s => a.stageScores[s.id]?.rating ?? ''),
      ])
      row.height = 20
      altShade(row, idx + 1)

      // Colour readiness + stage score cells (override any alt shading)
      if (a.overall) styleScoreCell(row.getCell(5), readinessLevel(a.overall))
      STAGES.forEach((s, sIdx) => {
        const sc = a.stageScores[s.id]
        if (sc) styleScoreCell(row.getCell(6 + sIdx), sc.level)
      })
    })
  }

  // ── Sheet 2: Dimension Scores ────────────────────────────────────────────────
  {
    const ws = wb.addWorksheet('Dimension Scores')
    ws.columns = [
      { width: 30 }, { width: 6 }, { width: 50 },
      ...scored.map(() => ({ width: 22 })),
    ]

    const hRow = ws.addRow([
      'Stage', 'Dim', 'Check',
      ...scored.map(a => `${a.pathway}\n${fmtDateShort(a.savedAt)}`),
    ])
    styleHeaderRow(hRow)
    hRow.height = 32
    hRow.eachCell({ includeEmpty: true }, cell => {
      cell.alignment = { wrapText: true, vertical: 'middle', horizontal: 'left' }
    })
    ws.views = [{ state: 'frozen', xSplit: 3, ySplit: 1 }]

    let dataIdx = 0
    STAGES.forEach(stage => {
      stage.dimensions.forEach((dimDef, dimIdx) => {
        dataIdx++
        const scores = scored.map(a => {
          const dim      = (a.stageResults[stage.id]?.dimensions ?? []).find(d => d.id === dimDef.id)
          const override = (a.overrides ?? {})[dimDef.id]
          const effective = override?.score ?? dim?.score ?? ''
          return effective ? toTitleCase(effective) : ''
        })

        const row = ws.addRow([
          `Stage ${stage.number} — ${stage.name}`, `D${dimIdx + 1}`, dimDef.check,
          ...scores,
        ])
        row.height = 18
        altShade(row, dataIdx)

        // Colour each score cell
        scores.forEach((score, sIdx) => {
          if (score) styleScoreCell(row.getCell(4 + sIdx), score)
        })
      })
    })
  }

  // ── Sheet 3: Rationale ───────────────────────────────────────────────────────
  {
    const ws = wb.addWorksheet('Rationale')
    ws.columns = [
      { width: 30 }, { width: 6 }, { width: 50 },
      ...scored.map(() => ({ width: 60 })),
    ]

    const hRow = ws.addRow([
      'Stage', 'Dim', 'Check',
      ...scored.map(a => `${a.pathway}\n${fmtDateShort(a.savedAt)}`),
    ])
    styleHeaderRow(hRow)
    hRow.height = 32
    hRow.eachCell({ includeEmpty: true }, cell => {
      cell.alignment = { wrapText: true, vertical: 'middle', horizontal: 'left' }
    })
    ws.views = [{ state: 'frozen', xSplit: 3, ySplit: 1 }]

    let dataIdx = 0
    STAGES.forEach(stage => {
      stage.dimensions.forEach((dimDef, dimIdx) => {
        dataIdx++
        const rationales = scored.map(a => {
          const dim = (a.stageResults[stage.id]?.dimensions ?? []).find(d => d.id === dimDef.id)
          return dim?.rationale ?? ''
        })

        const row = ws.addRow([
          `Stage ${stage.number} — ${stage.name}`, `D${dimIdx + 1}`, dimDef.check,
          ...rationales,
        ])
        row.height = 80
        altShade(row, dataIdx)
        wrapCell(row.getCell(3))
        for (let c = 4; c < 4 + scored.length; c++) wrapCell(row.getCell(c))
      })
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
          a.pathway ?? '',
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
