#!/usr/bin/env node
// Run this script from a machine on the NHS network to sync Confluence content
// into the Supabase knowledge base.
//
// Usage:
//   node scripts/sync-confluence.js              — sync all registered sources
//   node scripts/sync-confluence.js <source-id>  — sync one specific source
//
// Required environment variables (create a .env file in the project root — see .env.sync.example):
//   CONFLUENCE_BASE_URL    e.g. https://nhsd-confluence.digital.nhs.uk
//   CONFLUENCE_EMAIL       your Atlassian login email
//   CONFLUENCE_API_TOKEN   generated at id.atlassian.com → Security → API tokens
//   OPENAI_API_KEY         from platform.openai.com
//   SUPABASE_URL           your Supabase project URL
//   SUPABASE_SERVICE_KEY   from Supabase → Settings → API → service_role key

import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

// ─── Load .env file if present ────────────────────────────────────────────────

const envPath = resolve(process.cwd(), '.env.sync')
if (existsSync(envPath)) {
  const lines = readFileSync(envPath, 'utf8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const [key, ...rest] = trimmed.split('=')
    if (key && rest.length) process.env[key.trim()] = rest.join('=').trim()
  }
}

// ─── Validate env vars ────────────────────────────────────────────────────────

const REQUIRED = [
  'CONFLUENCE_BASE_URL',
  'CONFLUENCE_EMAIL',
  'CONFLUENCE_API_TOKEN',
  'OPENAI_API_KEY',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_KEY',
]
const missing = REQUIRED.filter(k => !process.env[k])
if (missing.length) {
  console.error(`\nMissing required environment variables:\n  ${missing.join('\n  ')}`)
  console.error('\nCreate a .env.sync file in the project root — see .env.sync.example\n')
  process.exit(1)
}

// ─── Clients ──────────────────────────────────────────────────────────────────

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

const CONFLUENCE_BASE = process.env.CONFLUENCE_BASE_URL.replace(/\/$/, '')
const CONFLUENCE_AUTH = Buffer.from(
  `${process.env.CONFLUENCE_EMAIL}:${process.env.CONFLUENCE_API_TOKEN}`
).toString('base64')

// ─── Helpers ──────────────────────────────────────────────────────────────────

function stripHtml(html) {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function chunkText(text, chunkSize = 400, overlap = 50) {
  const words = text.split(/\s+/).filter(Boolean)
  const chunks = []
  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    const chunk = words.slice(i, i + chunkSize).join(' ')
    if (chunk.trim()) chunks.push(chunk)
    if (i + chunkSize >= words.length) break
  }
  return chunks
}

async function embedText(text) {
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({ model: 'text-embedding-3-small', input: text })
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenAI error ${res.status}: ${err.slice(0, 200)}`)
  }
  const data = await res.json()
  return data.data[0].embedding
}

// ─── Confluence API ───────────────────────────────────────────────────────────

async function fetchPage(pageId) {
  const res = await fetch(
    `${CONFLUENCE_BASE}/rest/api/content/${pageId}?expand=body.storage`,
    { headers: { Authorization: `Basic ${CONFLUENCE_AUTH}` } }
  )
  if (!res.ok) throw new Error(`Confluence error ${res.status} for page ${pageId}`)
  return res.json()
}

async function fetchSpacePages(spaceKey) {
  const pages = []
  let start = 0
  while (true) {
    const res = await fetch(
      `${CONFLUENCE_BASE}/rest/api/space/${spaceKey}/content/page?limit=50&start=${start}&expand=body.storage`,
      { headers: { Authorization: `Basic ${CONFLUENCE_AUTH}` } }
    )
    if (!res.ok) throw new Error(`Confluence space error ${res.status} for space ${spaceKey}`)
    const data = await res.json()
    pages.push(...data.results)
    console.log(`  Fetched ${pages.length} pages so far...`)
    if (data.results.length < 50) break
    start += 50
  }
  return pages
}

// ─── Sync a single source ─────────────────────────────────────────────────────

async function syncSource(source) {
  console.log(`\nSyncing: ${source.label}`)

  // 1. Get pages to process
  let pages = []
  if (source.page_id) {
    console.log(`  Fetching page ${source.page_id}...`)
    const page = await fetchPage(source.page_id)
    pages = [page]
  } else if (source.space_key) {
    console.log(`  Fetching all pages in space ${source.space_key}...`)
    pages = await fetchSpacePages(source.space_key)
  }
  console.log(`  Found ${pages.length} page(s)`)

  // 2. Delete old chunks for this source
  const { error: deleteError } = await supabase
    .from('knowledge_base')
    .delete()
    .eq('source_id', source.id)
  if (deleteError) throw new Error(`Failed to clear old chunks: ${deleteError.message}`)
  console.log(`  Cleared old chunks`)

  // 3. Chunk, embed and store each page
  let totalChunks = 0
  for (const page of pages) {
    const rawText = stripHtml(page.body?.storage?.value ?? '')
    if (!rawText.trim()) {
      console.log(`  Skipping empty page: ${page.title}`)
      continue
    }
    const chunks = chunkText(rawText)
    const pageUrl = `${CONFLUENCE_BASE}/pages/${page.id}`
    console.log(`  Processing "${page.title}" — ${chunks.length} chunks`)

    for (let i = 0; i < chunks.length; i++) {
      const embedding = await embedText(chunks[i])
      const { error } = await supabase.from('knowledge_base').insert({
        source_id: source.id,
        confluence_page_id: page.id,
        page_title: page.title,
        source_url: pageUrl,
        content: chunks[i],
        embedding,
        conditions: source.conditions ?? [],
      })
      if (error) console.warn(`  Warning: failed to store chunk ${i + 1}: ${error.message}`)
      else totalChunks++
    }
  }

  // 4. Update sync metadata
  await supabase.from('confluence_sources').update({
    last_synced_at: new Date().toISOString(),
    chunk_count: totalChunks,
  }).eq('id', source.id)

  console.log(`  Done — ${totalChunks} chunks stored`)
  return totalChunks
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const targetId = process.argv[2] ?? null

  // Load sources from Supabase
  let query = supabase.from('confluence_sources').select('*')
  if (targetId) query = query.eq('id', targetId)

  const { data: sources, error } = await query
  if (error) { console.error('Failed to load sources:', error.message); process.exit(1) }
  if (!sources?.length) {
    console.log(targetId
      ? `No source found with id: ${targetId}`
      : 'No sources registered. Add sources via the Knowledge Base page in the app.')
    process.exit(0)
  }

  console.log(`\nStarting sync of ${sources.length} source(s)...`)
  let totalChunks = 0
  let errors = 0

  for (const source of sources) {
    try {
      const chunks = await syncSource(source)
      totalChunks += chunks
    } catch (e) {
      console.error(`  ERROR syncing "${source.label}": ${e.message}`)
      errors++
    }
  }

  console.log(`\n✓ Sync complete — ${totalChunks} total chunks stored`)
  if (errors) console.warn(`  ${errors} source(s) failed — check errors above`)
}

main().catch(e => { console.error(e); process.exit(1) })
