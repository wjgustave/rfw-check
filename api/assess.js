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

// The two interpolated bands. Keep in sync with INTERPOLATED_CRITERIA in
// src/constants/stages.js. The written per-dimension criteria are the anchors:
// "low" → very_low, "medium" → medium, "high" → very_high.
const BAND_LOW_CRITERION  = 'Above the "very_low" floor but short of the medium criterion — only early or isolated signs exist (e.g. a single pilot, early-stage research, a nascent market, or informal interest), not the systematic position described under medium.'
const BAND_HIGH_CRITERION = 'Clearly beyond the medium criterion and meeting most — but not all — of the conditions listed under very_high. One or more very_high conditions remain unmet.'

// Build the five-band ladder for a dimension from its three written criteria.
// A dimension may override the interpolated Low/High bands via `d.bands`.
function bandLadder(d) {
  return `- very_low: ${d.criteria.low}
- low: ${d.bands?.low ?? BAND_LOW_CRITERION}
- medium: ${d.criteria.medium}
- high: ${d.bands?.high ?? BAND_HIGH_CRITERION}
- very_high: ${d.criteria.high}`
}

// Domains hard-blocked from web search results. These are consultancy
// marketing/insight sites that rank well for NICE/HTA queries but are not
// authoritative evidence. Enforced at the web_search tool level via
// blocked_domains — results from these never reach the model. Extend as more
// are spotted in assessment sources.
const BLOCKED_SEARCH_DOMAINS = [
  // Market-access / HTA consultancies
  'remapconsulting.com',
  'mtechaccess.co.uk',
  'costellomedical.com',
  'validinsight.com',
  'lumanity.com',
  'sourcehealtheconomics.com',
  'avalere.com',
  'precisionaq.com',
  'mtrconsult.com',
  'hardianhealth.com',
  // Digital-health market-intelligence firms and VCs (promotional funding/market commentary)
  'galengrowth.com',
  'rockhealth.com',
  '7wireventures.com',
  // Non-official blogs / advocacy sites (were wrongly used to evidence service maturity)
  'nationalelfservice.net',
  'specialneedsjungle.com',
]

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
- gettingitrightfirsttime.co.uk and gettingitrightfirsttime.co.uk/girft-reports (GIRFT specialty reports, standardised pathways and national variation data)
- napc.co.uk (National Association of Primary Care — primary care models, commissioning and reimbursement context)
- model.nhs.uk (NHS Model Health System — benchmarking, productivity and variation metrics)
- nrap.org.uk and rcp.ac.uk/nacap (NACAP / National Respiratory Audit Programme — national asthma & COPD audit outcomes)
- york.ac.uk/health-sciences/research/cardiac/nacr and bhf.org.uk (NACR — National Audit of Cardiac Rehabilitation: uptake, coverage and outcome data)
When searching, prefer site-specific queries (e.g. "site:nice.org.uk COPD pulmonary rehabilitation") before broader queries.

BLOCKED SOURCE TYPES — never use, cite, or base any part of a score on these:
- AI-generated or unsourced claims that have no traceable link back to the supplier's own published statement or an official document.
- Anonymous or unattributed market commentary — any market claim with no named author or named organisation behind it.
- Informal opinion about a supplier with no documented basis (forum posts, hearsay, social media chatter, unreferenced opinion pieces).
- Blogs. Exception: posts published by named national bodies (e.g. NHS England, NICE, The King's Fund, Nuffield Trust) may be used, as these sometimes carry policy announcements — attribute them to the organisation.
- Commercial consultancy marketing or insight content — market-access, pricing, HTA or management consulting firm websites (e.g. remapconsulting.com and similar). Their commentary on NICE processes, HTA outcomes or market conditions is promotional, not authoritative: cite the underlying NICE/NHS/official document instead. Exception: formally published industry market reports from named firms (e.g. IQVIA, Deloitte) where a dimension's evidence sources explicitly ask for market or industry reports.
Enforcement:
- Blocked sources must never appear in the rationale or the sources list.
- A score must never be raised or lowered on the basis of a blocked source.
- If the only evidence found for a claim is from a blocked source type, treat the claim as having NO evidence and score accordingly.

SOURCE QUALITY — always prefer the primary source:
- When a fact is reported by a news or trade outlet (e.g. Digital Health News, Medscape, HTN, pharmaphorum, National Health Executive, Healthcare Brew), do NOT cite the outlet. Trace the fact to the primary source it is reporting — the NICE guidance, NHS England document, national audit, journal article or official announcement — and cite that. Only if no primary source can be found may you state the fact without citing the outlet.
- STAGE 1 (Service Maturity) specifically: claims about how established, available, standardised, measured, staffed or funded the conventional NHS service is MUST be evidenced by official sources only — NHS England service specifications and commissioning documents, national audits (e.g. NACR, NACAP, NCAPOP, MHSDS), the Model Health System, NICE guidelines, and Royal College / specialty-society standards. Blogs, advocacy sites and news/trade media must NOT be used to evidence Stage 1 service maturity, even to illustrate variation, waiting times or access problems — cite the underlying audit or NHS data instead.

CRITICAL SCORING RULES — follow these exactly:
1. Score each dimension on a FIVE-band scale: very_low, low, medium, high, very_high. Each dimension lists criteria for all five bands. Apply them exactly as written — do not substitute your own judgement.
2. "very_high" is the top band: it requires EVERY condition stated in its criterion to be clearly and verifiably met. If the criterion says "AND", every part must be satisfied. If most — but not all — of those conditions are met, and the position is clearly beyond the medium criterion, score "high" instead. If there is any doubt that the medium criterion is fully met, do not exceed "medium".
3. "very_low" is the floor: award it only when essentially nothing exists, or the available evidence works against readiness. If there are early or isolated signs that still fall short of the medium criterion, score "low".
4. Pilots, COVID-era adaptations, local programmes, and telemonitoring trials do NOT satisfy the "high" or "very_high" criteria unless the criterion explicitly includes them.
5. Cite real, named documents you know to exist — include a URL if web search confirmed one, omit the URL if not found but still cite the document by name.
6. Return only the JSON array, no other text.`

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
${bandLadder(d)}`
    ).join('\n\n')

    systemPrompt = STAGE_SYSTEM_PROMPT
    maxTokens = 4000
    tools = [{ type: 'web_search_20250305', name: 'web_search', max_uses: 2, blocked_domains: BLOCKED_SEARCH_DOMAINS }]
    messages = [{
      role: 'user',
      content: `Pathway: ${pathway}

Stage ${stage.number}: ${stage.name}
Stage question: ${stage.question}

Assess each dimension below using your training knowledge as the primary basis. Use web_search to find URLs for sources and check for recent developments — but if searches are inconclusive, score from what you know. Apply criteria exactly as written. Return a JSON array with exactly ${stage.dimensions.length} objects, one per dimension in order:

${dimensionsList}

Return format (JSON only, no other text):
[{"id":"...","score":"very_low"|"low"|"medium"|"high"|"very_high","rationale":"2-3 sentences citing specific evidence found","sources":[{"title":"Document name","url":"https://..."}]}]

For sources, include the actual URL for each document found. If no URL is available, omit the url field.`
    }]
  } else if (type === 'dimension') {
  const { stage, dimension, linkedEvidence } = req.body

  const knowledgeQuery = `${dimension.check} ${dimension.evidenceSources.join(' ')}`
  const knowledgeMatches = await retrieveKnowledge(knowledgeQuery, [pathway.toLowerCase()])
  const knowledgeBlock = buildKnowledgeBlock(knowledgeMatches)

  systemPrompt = STAGE_SYSTEM_PROMPT
  maxTokens = 4000
  tools = [{ type: 'web_search_20250305', name: 'web_search', max_uses: 1, blocked_domains: BLOCKED_SEARCH_DOMAINS }]
  messages = [{
    role: 'user',
    content: `Pathway: ${pathway}

Stage ${stage.number}: ${stage.name}
Stage question: ${stage.question}

Dimension (id: ${dimension.id}) — ${dimension.check}
Evidence to search for: ${dimension.evidenceSources.join(' | ')}
${bandLadder(dimension)}
${knowledgeBlock}
Use your training knowledge as the primary basis. Use web_search to find URLs and verify currency — if inconclusive, score from what you know. Apply criteria exactly as written.
${linkedEvidence?.length ? `\nRELATED EVIDENCE TO CONSIDER: Also search for and consider evidence relating to these closely linked interventions, programmes and guidelines: ${linkedEvidence.join(' | ')}. Where any of this linked evidence informs your score or rationale, explicitly state so in the rationale — for example: "Considering linked evidence for [item], ..." or "Evidence from [linked programme] also supports this score because..."\n` : ''}
IMPORTANT: Output ONLY the JSON object below. No preamble, no explanation, no markdown — just the raw JSON.

{"id":"${dimension.id}","score":"very_low|low|medium|high|very_high","rationale":"2-3 sentences citing specific evidence","sources":[{"title":"Document name","url":"https://..."}]}`
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
