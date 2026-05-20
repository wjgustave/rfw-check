// Receives content captured by the browser bookmarklet.
// Chunks, embeds and stores it in the knowledge base.
// Requires CORS headers so the bookmarklet (running on a different domain) can POST here.

import { createClient } from '@supabase/supabase-js'
import { embedText, chunkText } from './_embed.js'

function getSupabase() {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY
  if (!url || !key) throw new Error('Supabase env vars not configured')
  return createClient(url, key)
}

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

export default async function handler(req, res) {
  setCors(res)

  // Browser sends an OPTIONS preflight before the real POST — just acknowledge it
  if (req.method === 'OPTIONS') return res.status(200).end()

  let supabase
  try {
    supabase = getSupabase()
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }

  // GET — list all manually captured pages (for the Knowledge Base UI)
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('id, page_title, source_url, conditions, captured_at')
      .is('source_id', null)
      .order('captured_at', { ascending: false })

    if (error) return res.status(500).json({ error: error.message })

    // Group by page so we show one row per page rather than one per chunk
    const pages = []
    const seen = new Set()
    for (const row of data) {
      const key = row.source_url ?? row.page_title
      if (!seen.has(key)) {
        seen.add(key)
        pages.push({
          page_title: row.page_title,
          source_url: row.source_url,
          conditions: row.conditions,
          captured_at: row.captured_at,
        })
      }
    }
    return res.json(pages)
  }

  // POST — ingest a new page from the bookmarklet
  if (req.method === 'POST') {
    const { title, content, source_url, conditions } = req.body

    if (!title || !content) {
      return res.status(400).json({ error: 'title and content are required' })
    }

    // Remove any existing chunks for this URL so re-capturing replaces rather than duplicates
    if (source_url) {
      await supabase
        .from('knowledge_base')
        .delete()
        .eq('source_url', source_url)
        .is('source_id', null)
    }

    const chunks = chunkText(content)
    let stored = 0

    for (const chunk of chunks) {
      try {
        const embedding = await embedText(chunk)
        const { error } = await supabase.from('knowledge_base').insert({
          source_id: null,
          confluence_page_id: null,
          page_title: title,
          source_url: source_url ?? null,
          content: chunk,
          embedding,
          conditions: (conditions ?? []).map(c => c.toLowerCase().trim()).filter(Boolean),
          captured_at: new Date().toISOString(),
        })
        if (!error) stored++
      } catch (e) {
        console.warn('Failed to store chunk:', e.message)
      }
    }

    return res.json({ ok: true, chunks: stored })
  }

  // DELETE — remove all chunks for a captured page by source_url
  if (req.method === 'DELETE') {
    const { source_url } = req.body
    if (!source_url) return res.status(400).json({ error: 'source_url is required' })
    const { error } = await supabase
      .from('knowledge_base')
      .delete()
      .eq('source_url', source_url)
      .is('source_id', null)
    if (error) return res.status(500).json({ error: error.message })
    return res.json({ ok: true })
  }

  res.status(405).end()
}
