// Feature flags for temporarily gating behaviour.
//
// BULK_ASSESS_DISABLED: when true, the "Assess all", "Continue assessment"
// and "Re-assess all" bulk-run buttons (both page-level and per-stage) are
// disabled, forcing dimension-by-dimension assessment. Set to false to restore
// the bulk-run buttons.
export const BULK_ASSESS_DISABLED = true

// Shared message shown on the disabled bulk buttons.
export const BULK_ASSESS_DISABLED_MSG = 'Bulk assessment is disabled — assess each dimension individually'
