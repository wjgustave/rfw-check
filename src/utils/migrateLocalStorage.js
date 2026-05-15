import { supabase } from './supabase'

const SAVED_KEY = 'rfw_saved_assessments'
const INPROGRESS_KEY = 'rfw_inprogress_assessments'
const MIGRATED_KEY = 'rfw_migrated_to_supabase'

export function hasLocalDataToMigrate() {
  try {
    if (localStorage.getItem(MIGRATED_KEY) === '1') return false
    const saved = JSON.parse(localStorage.getItem(SAVED_KEY) || '[]')
    const inProgress = JSON.parse(localStorage.getItem(INPROGRESS_KEY) || '[]')
    return saved.length > 0 || inProgress.length > 0
  } catch { return false }
}

export async function migrateToSupabase(onProgress) {
  let saved = []
  let inProgress = []

  try { saved = JSON.parse(localStorage.getItem(SAVED_KEY) || '[]') } catch {}
  try { inProgress = JSON.parse(localStorage.getItem(INPROGRESS_KEY) || '[]') } catch {}

  const total = saved.length + inProgress.length
  let done = 0
  let errors = 0

  for (const record of saved) {
    const { error } = await supabase
      .from('completed_assessments')
      .upsert({
        id: record.id,
        saved_at: record.savedAt,
        saved_by: record.savedBy ?? null,
        pathway: record.pathway,
        stage_results: record.stageResults,
        overrides: record.overrides ?? {},
        audit_entries: record.auditEntries ?? [],
        summary_text: record.summaryText ?? null,
      }, { onConflict: 'id' })

    if (error) {
      console.error('[migration] completed_assessments:', record.pathway, error)
      errors++
    } else {
      done++
    }
    onProgress?.({ done, total, errors })
  }

  for (const record of inProgress) {
    const { error } = await supabase
      .from('inprogress_assessments')
      .upsert({
        id: record.id,
        saved_at: record.savedAt,
        saved_by: record.savedBy ?? null,
        pathway: record.pathway,
        completed_dimensions: record.completedDimensions,
        total_dimensions: record.totalDimensions,
        stage_results: record.stageResults,
        overrides: record.overrides ?? {},
        audit_entries: record.auditEntries ?? [],
      }, { onConflict: 'id' })

    if (error) {
      console.error('[migration] inprogress_assessments:', record.pathway, error)
      errors++
    } else {
      done++
    }
    onProgress?.({ done, total, errors })
  }

  if (errors === 0) {
    // Mark migration complete so the banner never shows again
    localStorage.setItem(MIGRATED_KEY, '1')
  }

  return { done, total, errors, savedCount: saved.length, inProgressCount: inProgress.length }
}
