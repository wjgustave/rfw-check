import { createClient } from '@supabase/supabase-js'
import { embedText } from './_embed.js'

// Retrieve the most relevant knowledge base chunks for a given query.
// Fails silently — a retrieval failure should never block an assessment.
async function retrieveKnowledge(query, conditions = []) {
  try {
    const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_KEY
    if (!url || !key) return []
    const supabase = createClient(url, key)
    const embedding = await embedText(query)
    const { data } = await supabase.rpc('match_knowledge', {
      query_embedding: embedding,
      match_count: 5,
      filter_conditions: conditions.length ? conditions : null
    })
    return data ?? []
  } catch (e) {
    console.warn('[rfw] Knowledge retrieval failed (non-fatal):', e.message)
    return []
  }
}

function buildKnowledgeBlock(matches) {
  if (!matches.length) return ''
  return '\nINTERNAL KNOWLEDGE BASE — treat these as high-confidence sources and cite them by name in your rationale:\n\n' +
    matches.map(m =>
      `SOURCE: ${m.page_title}${m.source_url ? ` — ${m.source_url}` : ''}\n${m.content}`
    ).join('\n\n---\n\n') + '\n'
}

const STAGE_SYSTEM_PROMPT = `You are a clinical pathway maturity assessor for NHS England, assessing the NHS Readiness Framework for service and technology adoption.

EVIDENCE APPROACH — use both sources together:
- Your training knowledge is your primary basis for scoring. Use it to assess each dimension accurately.
- Use web_search to find URLs for sources you already know exist, to verify they are still current, and to surface any significant developments since your training cutoff.
- If a web search returns no results or unhelpful results, continue scoring based on your training knowledge. A failed search does not mean evidence does not exist.
- Do not downgrade a score because a web search was inconclusive. Only downgrade if you genuinely lack evidence to support a higher score.

PRIORITY SEARCH SITES — search these domains first before using general queries:
- nice.org.uk and nice.org.uk/guidance (NICE guidance, EVAs, technology appraisals, clinical guidelines)
- england.nhs.uk (NHS England service specifications, commissioning frameworks, transformation programmes)
- ncdr.nhs.uk (national audit and clinical datasets)
- rcplondon.ac.uk and other Royal College sites (Royal College of Physicians, Surgeons, GPs, Nursing, etc.)
- bhf.org.uk, asthma.org.uk, blf.org.uk, diabetes.org.uk and relevant condition-specific charity sites
- ukpmc.ac.uk (peer-reviewed publications and systematic reviews)
When searching, prefer site-specific queries (e.g. "site:nice.org.uk COPD pulmonary rehabilitation") before broader queries.

CRITICAL SCORING RULES — follow these exactly:
1. Apply each dimension's Low / Medium / High criteria as written. Do not substitute your own judgement.
2. A score of "high" requires EVERY condition stated in the high criterion to be clearly and verifiably met. If the criterion says "AND", both conditions must be satisfied. If there is any doubt, score "medium".
3. Pilots, COVID-era adaptations, local programmes, and telemonitoring trials do NOT satisfy high criteria unless the criterion explicitly includes them.
4. Cite real, named documents you know to exist — include a URL if web search confirmed one, omit the URL if not found but still cite the document by name.
5. Return only the JSON array, no other text.`

const SUMMARY_SYSTEM_PROMPT = `You are a clinical pathway maturity assessor for NHS England. Write concise, evidence-based summaries. Plain text only, no JSON, no headers, no bullet points.`

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed')
  }

  const { pathway, type } = req.body

  let systemPrompt, messages, maxTokens, tools

  if (type === 'stage') {
    const { stage } = req.body
    const dimensionsList = stage.dimensions.map((d, i) =>
      `Dimension ${i + 1} (id: ${d.id}) — ${d.check}
Evidence to search for: ${d.evidenceSources.join(' | ')}
- Low: ${d.criteria.low}
- Medium: ${d.criteria.medium}
- High: ${d.criteria.high}`
    ).join('\n\n')

    systemPrompt = STAGE_SYSTEM_PROMPT
    maxTokens = 4000
    tools = [{ type: 'web_search_20250305', name: 'web_search', max_uses: 2 }]
    messages = [{
      role: 'user',
      content: `Pathway: ${pathway}

Stage ${stage.number}: ${stage.name}
Stage question: ${stage.question}

Assess each dimension below using your training knowledge as the primary basis. Use web_search to find URLs for sources and check for recent developments — but if searches are inconclusive, score from what you know. Apply criteria exactly as written. Return a JSON array with exactly ${stage.dimensions.length} objects, one per dimension in order:

${dimensionsList}

Return format (JSON only, no other text):
[{"id":"...","score":"high"|"medium"|"low","rationale":"2-3 sentences citing specific evidence found","sources":[{"title":"Document name","url":"https://..."}]}]

For sources, include the actual URL for each document found. If no URL is available, omit the url field.`
    }]
  } else if (type === 'dimension') {
  const { stage, dimension, linkedEvidence } = req.body

  const knowledgeQuery = `${dimension.check} ${dimension.evidenceSources.join(' ')}`
  const knowledgeMatches = await retrieveKnowledge(knowledgeQuery, [pathway.toLowerCase()])
  const knowledgeBlock = buildKnowledgeBlock(knowledgeMatches)

  systemPrompt = STAGE_SYSTEM_PROMPT
  maxTokens = 2000
  tools = [{ type: 'web_search_20250305', name: 'web_search', max_uses: 1 }]
  messages = [{
    role: 'user',
    content: `Pathway: ${pathway}

Stage ${stage.number}: ${stage.name}
Stage question: ${stage.question}

Dimension (id: ${dimension.id}) — ${dimension.check}
Evidence to search for: ${dimension.evidenceSources.join(' | ')}
- Low: ${dimension.criteria.low}
- Medium: ${dimension.criteria.medium}
- High: ${dimension.criteria.high}
${knowledgeBlock}
Use your training knowledge as the primary basis. Use web_search to find URLs and verify currency — if inconclusive, score from what you know. Apply criteria exactly as written.
${linkedEvidence?.length ? `\nRELATED EVIDENCE TO CONSIDER: Also search for and consider evidence relating to these closely linked interventions, programmes and guidelines: ${linkedEvidence.join(' | ')}. Where any of this linked evidence informs your score or rationale, explicitly state so in the rationale — for example: "Considering linked evidence for [item], ..." or "Evidence from [linked programme] also supports this score because..."\n` : ''}
IMPORTANT: Output ONLY the JSON object below. No preamble, no explanation, no markdown — just the raw JSON.

{"id":"${dimension.id}","score":"high|medium|low","rationale":"2-3 sentences citing specific evidence","sources":[{"title":"Document name","url":"https://..."}]}`
  }]
  } else if (type === 'summary') {
    const { stageResults } = req.body
    const stageLines = stageResults
      .map(s => `Stage ${s.number} (${s.name}): ${s.score} — ${s.rationale}`)
      .join('\n')

    systemPrompt = SUMMARY_SYSTEM_PROMPT
    maxTokens = 300
    messages = [{
      role: 'user',
      content: `Write a 2-3 sentence overall readiness summary for "${pathway}" based on these stage results. Be specific about strengths and gaps.\n\n${stageLines}`
    }]
  } else {
    return res.status(400).json({ error: 'Unknown type' })
  }

  const requestBody = {
    model: 'claude-sonnet-4-6',
    max_tokens: maxTokens,
    system: systemPrompt,
    messages
  }
  if (tools) requestBody.tools = tools

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-beta': 'web-search-2025-03-05'
    },
    body: JSON.stringify(requestBody)
  })

  if (!response.ok) {
    const err = await response.text()
    console.error(`Anthropic API error ${response.status}:`, err)
    return res.status(response.status).json({ error: err })
  }

  const data = await response.json()
  const textBlocks = data.content?.filter(c => c.type === 'text') || []
  const text = textBlocks[textBlocks.length - 1]?.text || ''

  res.setHeader('Content-Type', type === 'summary' ? 'text/plain' : 'application/json')
  res.send(text)
}
