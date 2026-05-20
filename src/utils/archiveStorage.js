import { supabase } from './supabase'

function noClient(fn) {
  console.warn(`[rfw] Supabase not configured — ${fn} skipped.`)
}

export async function archiveAssessment(id) {
  if (!supabase) { noClient('archiveAssessment'); return }
  const { error } = await supabase
    .from('completed_assessments')
    .update({ is_archived: true })
    .eq('id', id)
  if (error) console.error('archiveAssessment:', error)
}

export async function unarchiveAssessment(id) {
  if (!supabase) { noClient('unarchiveAssessment'); return }
  const { error } = await supabase
    .from('completed_assessments')
    .update({ is_archived: false })
    .eq('id', id)
  if (error) console.error('unarchiveAssessment:', error)
}
