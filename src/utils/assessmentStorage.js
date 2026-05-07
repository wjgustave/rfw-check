const SAVED_KEY = 'rfw_saved_assessments'
const INPROGRESS_KEY = 'rfw_inprogress_assessments'

export function getSavedAssessments() {
  try { return JSON.parse(localStorage.getItem(SAVED_KEY) || '[]') } catch { return [] }
}

export function saveAssessment(record) {
  try {
    const all = getSavedAssessments()
    all.unshift(record)
    localStorage.setItem(SAVED_KEY, JSON.stringify(all))
  } catch {}
}

export function getInProgressAssessments() {
  try { return JSON.parse(localStorage.getItem(INPROGRESS_KEY) || '[]') } catch { return [] }
}

export function saveInProgress(record) {
  try {
    const all = getInProgressAssessments().filter(r => r.id !== record.id)
    all.unshift(record)
    localStorage.setItem(INPROGRESS_KEY, JSON.stringify(all))
  } catch {}
}

export function removeInProgress(id) {
  try {
    const all = getInProgressAssessments().filter(r => r.id !== id)
    localStorage.setItem(INPROGRESS_KEY, JSON.stringify(all))
  } catch {}
}

export function generateId() {
  return crypto.randomUUID()
}
