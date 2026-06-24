// Extract plain text from an uploaded document, in the browser.
// PDF via pdfjs-dist, .docx via mammoth, plain text read natively. The heavy
// parsers are lazy-imported so they never bloat the initial bundle — they only
// download when a user actually uploads a matching file.

// Accept attribute for the file input.
export const ACCEPTED_UPLOAD =
  '.pdf,.docx,.txt,.md,.csv,application/pdf,text/plain,text/markdown,text/csv,application/vnd.openxmlformats-officedocument.wordprocessingml.document'

export const SUPPORTED_LABEL = 'PDF, Word (.docx), TXT or MD'

function extOf(name) {
  const i = (name ?? '').lastIndexOf('.')
  return i === -1 ? '' : name.slice(i).toLowerCase()
}

// Turn a filename into a sensible default title: drop the extension, tidy separators.
export function titleFromFilename(name) {
  const i = (name ?? '').lastIndexOf('.')
  const base = i === -1 ? (name ?? '') : name.slice(0, i)
  return base.replace(/[_]+/g, ' ').replace(/\s{2,}/g, ' ').trim()
}

export async function parseDocument(file) {
  const ext = extOf(file.name)
  const type = file.type || ''

  // Plain text / markdown / csv
  if (ext === '.txt' || ext === '.md' || ext === '.csv' || type.startsWith('text/')) {
    return (await file.text()).trim()
  }

  // Word .docx via mammoth (browser build)
  if (ext === '.docx' || type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const mod = await import('mammoth/mammoth.browser.js')
    const mammoth = mod.default ?? mod
    const arrayBuffer = await file.arrayBuffer()
    const { value } = await mammoth.extractRawText({ arrayBuffer })
    return (value ?? '').replace(/\n{3,}/g, '\n\n').trim()
  }

  // PDF via pdfjs-dist
  if (ext === '.pdf' || type === 'application/pdf') {
    const pdfjs = await import('pdfjs-dist')
    const workerUrl = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default
    pdfjs.GlobalWorkerOptions.workerSrc = workerUrl
    const data = await file.arrayBuffer()
    const pdf = await pdfjs.getDocument({ data }).promise
    let out = ''
    for (let p = 1; p <= pdf.numPages; p++) {
      const page = await pdf.getPage(p)
      const content = await page.getTextContent()
      out += content.items.map(it => it.str ?? '').join(' ') + '\n\n'
    }
    return out.replace(/[ \t]{2,}/g, ' ').replace(/\n{3,}/g, '\n\n').trim()
  }

  // Old binary .doc isn't reliably parseable in the browser
  if (ext === '.doc') {
    throw new Error('Old .doc files are not supported. Please save the file as PDF or .docx, or paste the text instead.')
  }

  throw new Error(`Unsupported file type "${ext || type || 'unknown'}". Supported: ${SUPPORTED_LABEL}.`)
}
