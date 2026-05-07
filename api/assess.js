export const config = { runtime: 'edge' }

const STAGE_SYSTEM_PROMPT = `You are a clinical pathway maturity assessor for NHS England, assessing the NHS Readiness Framework for service and technology adoption.

Use the web_search tool to find current, specific evidence before scoring each dimension. Search for real NHS England publications, NICE guidance, national audit reports, and Royal College statements by name.

CRITICAL SCORING RULES — follow these exactly:
1. Apply each dimension's Low / Medium / High criteria as written. Do not substitute your own judgement.
2. A score of "high" requires EVERY condition stated in the high criterion to be clearly and verifiably met. If the criterion says "AND", both conditions must be satisfied. If there is any doubt, score "medium".
3. Pilots, COVID-era adaptations, local programmes, and telemonitoring trials do NOT satisfy high criteria unless the criterion explicitly includes them.
4. Only cite named, published documents that you have confirmed exist via search.
5. Return only the JSON array, no other text.`

const SUMMARY_SYSTEM_PROMPT = `You are a clinical pathway maturity assessor for NHS England. Write concise, evidence-based summaries. Plain text only, no JSON, no headers, no bullet points.`

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const body = await req.json()
  const { pathway, type } = body

  let systemPrompt, messages, maxTokens, tools

  if (type === 'stage') {
    const { stage } = body
    const dimensionsList = stage.dimensions.map((d, i) =>
      `Dimension ${i + 1} (id: ${d.id}) — ${d.check}
Evidence to search for: ${d.evidenceSources.join(' | ')}
- Low: ${d.criteria.low}
- Medium: ${d.criteria.medium}
- High: ${d.criteria.high}`
    ).join('\n\n')

    systemPrompt = STAGE_SYSTEM_PROMPT
    maxTokens = 4000
    tools = [{ type: 'web_search_20250305', name: 'web_search', max_uses: 5 }]
    messages = [{
      role: 'user',
      content: `Pathway: ${pathway}

Stage ${stage.number}: ${stage.name}
Stage question: ${stage.question}

Search for current evidence then assess each dimension below. Apply criteria exactly as written — do not infer or upgrade a score. Return a JSON array with exactly ${stage.dimensions.length} objects, one per dimension in order:

${dimensionsList}

Return format (JSON only, no other text):
[{"id":"...","score":"high"|"medium"|"low","rationale":"2-3 sentences citing specific evidence found","sources":[{"title":"Document name","url":"https://..."}]}]

For sources, include the actual URL for each document found. If no URL is available, omit the url field.`
    }]
  } else if (type === 'summary') {
    const { stageResults } = body
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
    return new Response(JSON.stringify({ error: 'Unknown type' }), { status: 400 })
  }

  const requestBody = {
    model: 'claude-opus-4-5',
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
    return new Response(JSON.stringify({ error: err }), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const data = await response.json()
  const textBlocks = data.content?.filter(c => c.type === 'text') || []
  const text = textBlocks[textBlocks.length - 1]?.text || ''

  return new Response(text, {
    headers: { 'Content-Type': type === 'summary' ? 'text/plain' : 'application/json' }
  })
}
