import { supabase } from './supabase'

function noClient(fn) {
  console.warn(`[rfw] Supabase not configured — ${fn} skipped.`)
}

// ─── Column mapping helpers ───────────────────────────────────────────────────

function toDbCompleted(record) {
  return {
    id: record.id,
    saved_at: record.savedAt,
    saved_by: record.savedBy ?? null,
    pathway: record.pathway,
    stage_results: record.stageResults,
    overrides: record.overrides ?? {},
    audit_entries: record.auditEntries ?? [],
    summary_text: record.summaryText ?? null,
    is_archived: record.isArchived ?? false,
  }
}

function fromDbCompleted(row) {
  return {
    id: row.id,
    savedAt: row.saved_at,
    savedBy: row.saved_by,
    pathway: row.pathway,
    stageResults: row.stage_results,
    overrides: row.overrides ?? {},
    auditEntries: row.audit_entries ?? [],
    summaryText: row.summary_text,
    isArchived: row.is_archived ?? false,
  }
}

function toDbInProgress(record) {
  return {
    id: record.id,
    saved_at: record.savedAt,
    saved_by: record.savedBy ?? null,
    pathway: record.pathway,
    completed_dimensions: record.completedDimensions,
    total_dimensions: record.totalDimensions,
    stage_results: record.stageResults,
    overrides: record.overrides ?? {},
    audit_entries: record.auditEntries ?? [],
  }
}

function fromDbInProgress(row) {
  return {
    id: row.id,
    savedAt: row.saved_at,
    savedBy: row.saved_by,
    pathway: row.pathway,
    completedDimensions: row.completed_dimensions,
    totalDimensions: row.total_dimensions,
    stageResults: row.stage_results,
    overrides: row.overrides ?? {},
    auditEntries: row.audit_entries ?? [],
  }
}

// ─── Completed assessments ────────────────────────────────────────────────────

export async function getSavedAssessments() {
  if (!supabase) { noClient('getSavedAssessments'); return [] }
  const { data, error } = await supabase
    .from('completed_assessments')
    .select('*')
    .order('saved_at', { ascending: false })
  if (error) { console.error('getSavedAssessments:', error); return [] }
  return data.map(fromDbCompleted)
}

export async function saveAssessment(record) {
  if (!supabase) { noClient('saveAssessment'); return }
  const { error } = await supabase
    .from('completed_assessments')
    .insert(toDbCompleted(record))
  if (error) console.error('saveAssessment:', error)
}

export async function removeSavedAssessment(id) {
  if (!supabase) { noClient('removeSavedAssessment'); return }
  const { error } = await supabase
    .from('completed_assessments')
    .delete()
    .eq('id', id)
  if (error) console.error('removeSavedAssessment:', error)
}

// ─── In-progress assessments ──────────────────────────────────────────────────

export async function getInProgressAssessments() {
  if (!supabase) { noClient('getInProgressAssessments'); return [] }
  const { data, error } = await supabase
    .from('inprogress_assessments')
    .select('*')
    .order('saved_at', { ascending: false })
  if (error) { console.error('getInProgressAssessments:', error); return [] }
  return data.map(fromDbInProgress)
}

export async function saveInProgress(record) {
  if (!supabase) { noClient('saveInProgress'); return }
  const { error } = await supabase
    .from('inprogress_assessments')
    .upsert(toDbInProgress(record), { onConflict: 'id' })
  if (error) console.error('saveInProgress:', error)
}

export async function removeInProgress(id) {
  if (!supabase) { noClient('removeInProgress'); return }
  const { error } = await supabase
    .from('inprogress_assessments')
    .delete()
    .eq('id', id)
  if (error) console.error('removeInProgress:', error)
}

// ─── Edit lock (UI concern — localStorage only) ───────────────────────────────

const EDITING_KEY = 'rfw_editing_id'
export function setEditingId(id) { try { localStorage.setItem(EDITING_KEY, id) } catch {} }
export function getEditingId() { try { return localStorage.getItem(EDITING_KEY) || null } catch { return null } }
export function clearEditingId() { try { localStorage.removeItem(EDITING_KEY) } catch {} }

// ─── Misc ─────────────────────────────────────────────────────────────────────

export function generateId() {
  return crypto.randomUUID()
}
