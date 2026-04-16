// Phase 3 — Supabase cloud adapter
// Same interface as localAdapter — swap via VITE_STORAGE_MODE=cloud
// All functions here are stubs that throw until Phase 3 is implemented.

const STUB = (name) => {
  throw new Error(`Cloud adapter not yet implemented: ${name}. Set VITE_STORAGE_MODE=local.`)
}

export const checkAndMigrateSchema = () => ({ migrated: false })
export const getProfiles = () => STUB('getProfiles')
export const saveProfiles = () => STUB('saveProfiles')
export const createProfile = () => STUB('createProfile')
export const getActiveProfileId = () => STUB('getActiveProfileId')
export const setActiveProfileId = () => STUB('setActiveProfileId')
export const getSettings = () => STUB('getSettings')
export const saveSettings = () => STUB('saveSettings')
export const getConfidenceMode = () => STUB('getConfidenceMode')
export const saveConfidenceMode = () => STUB('saveConfidenceMode')
export const getCardState = () => STUB('getCardState')
export const saveCardState = () => STUB('saveCardState')
export const getNotes = () => STUB('getNotes')
export const saveNotes = () => STUB('saveNotes')
export const saveAttempt = () => STUB('saveAttempt')
export const getAttempts = () => STUB('getAttempts')
export const getCardStats = () => STUB('getCardStats')
export const getPatternProgress = () => STUB('getPatternProgress')
export const getStreak = () => STUB('getStreak')
export const updateStreak = () => STUB('updateStreak')
export const getNudgeDismissed = () => STUB('getNudgeDismissed')
export const setNudgeDismissed = () => STUB('setNudgeDismissed')
