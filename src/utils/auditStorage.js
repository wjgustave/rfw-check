const KEY = 'rfw_audit_trail'

export function getAuditEntries(pathway) {
  try {
    const all = JSON.parse(localStorage.getItem(KEY) || '[]')
    return pathway ? all.filter(e => e.pathway === pathway) : all
  } catch { return [] }
}

export function addAuditEntry(entry) {
  try {
    const all = JSON.parse(localStorage.getItem(KEY) || '[]')
    const newEntry = { ...entry, id: crypto.randomUUID(), changedAt: new Date().toISOString() }
    all.unshift(newEntry)
    localStorage.setItem(KEY, JSON.stringify(all))
    return newEntry
  } catch { return entry }
}
