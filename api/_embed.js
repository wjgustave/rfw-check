// Shared embedding utilities used by assess.js (retrieval) and the local sync script.
// Underscore prefix tells Vercel not to expose this as a public endpoint.

export async function embedText(text) {
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
    throw new Error(`OpenAI embedding error ${res.status}: ${err.slice(0, 200)}`)
  }
  const data = await res.json()
  return data.data[0].embedding
}

// Split text into overlapping chunks so context isn't lost at boundaries.
// chunkSize and overlap are in words.
export function chunkText(text, chunkSize = 400, overlap = 50) {
  const words = text.split(/\s+/).filter(Boolean)
  const chunks = []
  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    const chunk = words.slice(i, i + chunkSize).join(' ')
    if (chunk.trim()) chunks.push(chunk)
    if (i + chunkSize >= words.length) break
  }
  return chunks
}

// Strip Confluence storage format HTML tags and decode common entities.
export function stripHtml(html) {
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
