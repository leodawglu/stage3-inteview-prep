// Single import point for all storage operations.
// Components never call localStorage or Supabase directly.
// Swap adapters here when VITE_STORAGE_MODE changes.

const mode = import.meta.env.VITE_STORAGE_MODE || 'local'

let adapter
if (mode === 'cloud') {
  adapter = await import('./cloudAdapter.js')
} else {
  adapter = await import('./localAdapter.js')
}

export const {
  checkAndMigrateSchema,
  getProfiles,
  saveProfiles,
  createProfile,
  getActiveProfileId,
  setActiveProfileId,
  getSettings,
  saveSettings,
  getConfidenceMode,
  saveConfidenceMode,
  getCardState,
  saveCardState,
  getNotes,
  saveNotes,
  saveAttempt,
  getAttempts,
  getCardStats,
  getPatternProgress,
  getStreak,
  updateStreak,
  getNudgeDismissed,
  setNudgeDismissed,
} = adapter
