// Manages the knowledge base source registry in Supabase.
// The actual Confluence fetching + embedding is done by scripts/sync-confluence.js
// which runs locally on an NHS network machine.

import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY
  if (!url || !key) throw new Error('Supabase env vars not configured')
  return createClient(url, key)
}

export default async function handler(req, res) {
  let supabase
  try {
    supabase = getSupabase()
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }

  // GET — return all sources with their sync status
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('confluence_sources')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) return res.status(500).json({ error: error.message })
    return res.json(data)
  }

  if (req.method !== 'POST') return res.status(405).end()

  const { action } = req.body

  // Add a new source
  if (action === 'add') {
    const { label, page_id, space_key, conditions, created_by } = req.body
    if (!label) return res.status(400).json({ error: 'label is required' })
    if (!page_id && !space_key) return res.status(400).json({ error: 'page_id or space_key is required' })

    const { data, error } = await supabase
      .from('confluence_sources')
      .insert({
        label,
        page_id: page_id || null,
        space_key: space_key || null,
        conditions: (conditions ?? []).map(c => c.toLowerCase().trim()).filter(Boolean),
        created_by: created_by ?? null,
      })
      .select()
      .single()

    if (error) return res.status(500).json({ error: error.message })
    return res.json({ ok: true, source: data })
  }

  // Remove a source and all its chunks (cascade handles knowledge_base rows)
  if (action === 'delete') {
    const { source_id } = req.body
    if (!source_id) return res.status(400).json({ error: 'source_id is required' })
    const { error } = await supabase
      .from('confluence_sources')
      .delete()
      .eq('id', source_id)
    if (error) return res.status(500).json({ error: error.message })
    return res.json({ ok: true })
  }

  return res.status(400).json({ error: `Unknown action: ${action}` })
}
