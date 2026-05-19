const ARCHIVE_KEY = 'rfw_archived_ids'

function getArchivedIds() {
  try { return new Set(JSON.parse(localStorage.getItem(ARCHIVE_KEY) || '[]')) }
  catch { return new Set() }
}

function saveArchivedIds(set) {
  try { localStorage.setItem(ARCHIVE_KEY, JSON.stringify([...set])) } catch {}
}

export function archiveAssessment(id) {
  const ids = getArchivedIds()
  ids.add(id)
  saveArchivedIds(ids)
}

export function unarchiveAssessment(id) {
  const ids = getArchivedIds()
  ids.delete(id)
  saveArchivedIds(ids)
}

export function isArchivedId(id) {
  return getArchivedIds().has(id)
}

export { getArchivedIds }
