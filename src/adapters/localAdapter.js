import { SCHEMA_VERSION, SCHEMA_VERSION_KEY, STORAGE_KEY_PREFIX, MAX_LOCAL_PROFILES } from '../constants'

// ─── SCHEMA MIGRATION ─────────────────────────────────────────────────────────
export function checkAndMigrateSchema() {
  try {
    const stored = localStorage.getItem(SCHEMA_VERSION_KEY)
    if (stored && stored !== SCHEMA_VERSION) {
      // Version mismatch — clear all app data, preserve profiles list
      const profilesRaw = localStorage.getItem(`${STORAGE_KEY_PREFIX}profiles`)
      const keys = Object.keys(localStorage).filter(k => k.startsWith(STORAGE_KEY_PREFIX))
      keys.forEach(k => localStorage.removeItem(k))
      // Restore profiles so users aren't completely reset
      if (profilesRaw) localStorage.setItem(`${STORAGE_KEY_PREFIX}profiles`, profilesRaw)
      localStorage.setItem(SCHEMA_VERSION_KEY, SCHEMA_VERSION)
      return { migrated: true, previousVersion: stored }
    }
    if (!stored) localStorage.setItem(SCHEMA_VERSION_KEY, SCHEMA_VERSION)
    return { migrated: false }
  } catch {
    return { migrated: false }
  }
}

// ─── PROFILE MANAGEMENT ───────────────────────────────────────────────────────
function profileKey(profileId) {
  return `${STORAGE_KEY_PREFIX}profile_${profileId}`
}

export function getProfiles() {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}profiles`)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export function saveProfiles(profiles) {
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}profiles`, JSON.stringify(profiles))
  } catch { /* storage full */ }
}

export function createProfile(name) {
  const profiles = getProfiles()
  if (profiles.length >= MAX_LOCAL_PROFILES) return null
  const id = `profile_${Date.now()}`
  const profile = {
    id,
    name: name.trim(),
    initials: name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2),
    createdAt: new Date().toISOString(),
    confidenceMode: 'guided',
  }
  saveProfiles([...profiles, profile])
  return profile
}

export function getActiveProfileId() {
  return localStorage.getItem(`${STORAGE_KEY_PREFIX}active_profile`) || null
}

export function setActiveProfileId(id) {
  localStorage.setItem(`${STORAGE_KEY_PREFIX}active_profile`, id)
}

// ─── SETTINGS ─────────────────────────────────────────────────────────────────
const DEFAULT_SETTINGS = {
  hideConcepts: false,
  hideMissing: false,
  hideTimer: false,
  darkMode: 'system', // 'system' | 'dark' | 'light'
}

export function getSettings(profileId) {
  try {
    const raw = localStorage.getItem(`${profileKey(profileId)}_settings`)
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : { ...DEFAULT_SETTINGS }
  } catch { return { ...DEFAULT_SETTINGS } }
}

export function saveSettings(profileId, settings) {
  try {
    localStorage.setItem(`${profileKey(profileId)}_settings`, JSON.stringify(settings))
  } catch { /* storage full */ }
}

// ─── CONFIDENCE MODE ──────────────────────────────────────────────────────────
export function getConfidenceMode(profileId) {
  return localStorage.getItem(`${profileKey(profileId)}_mode`) || 'guided'
}

export function saveConfidenceMode(profileId, mode) {
  localStorage.setItem(`${profileKey(profileId)}_mode`, mode)
}

// ─── CARD STATE (step + notes, persists while in-progress) ────────────────────
export function getCardState(profileId, cardId) {
  try {
    const raw = localStorage.getItem(`${profileKey(profileId)}_cardstate_${cardId}`)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function saveCardState(profileId, cardId, state) {
  try {
    localStorage.setItem(
      `${profileKey(profileId)}_cardstate_${cardId}`,
      JSON.stringify(state)
    )
  } catch { /* storage full */ }
}

// ─── NOTES (persists across all steps of a card) ──────────────────────────────
export function getNotes(profileId, cardId) {
  return localStorage.getItem(`${profileKey(profileId)}_notes_${cardId}`) || ''
}

export function saveNotes(profileId, cardId, text) {
  try {
    localStorage.setItem(`${profileKey(profileId)}_notes_${cardId}`, text)
  } catch { /* storage full */ }
}

// ─── PERFORMANCE DATA ─────────────────────────────────────────────────────────
export function saveAttempt(profileId, attempt) {
  // attempt: { cardId, patternId, difficulty, conceptTags, confidenceMode,
  //   readingTimeMs, solvingTimeMs, totalTimeMs, timerHidden, choiceSequence,
  //   firstChoiceCorrect, incorrectAttempts, solRating, conceptsRevealed,
  //   missingConstraintsRevealed, notesWritten, notesLength,
  //   modificationViewed, cardCompleted, timerExpired, date, dayOfWeek }
  try {
    const key = `${profileKey(profileId)}_attempts_${attempt.cardId}`
    const existing = JSON.parse(localStorage.getItem(key) || '[]')
    const updated = [...existing, { ...attempt, savedAt: new Date().toISOString() }]
    localStorage.setItem(key, JSON.stringify(updated))
    // Update aggregated stats
    updateCardStats(profileId, attempt.cardId, updated)
  } catch { /* storage full */ }
}

export function getAttempts(profileId, cardId) {
  try {
    return JSON.parse(localStorage.getItem(`${profileKey(profileId)}_attempts_${cardId}`) || '[]')
  } catch { return [] }
}

// ─── CARD STATS (aggregated) ──────────────────────────────────────────────────
function updateCardStats(profileId, cardId, attempts) {
  const completed = attempts.filter(a => a.cardCompleted)
  if (!completed.length) return

  const recent = completed.slice(-3)
  const masteryScores = recent.map(a => {
    const { MASTERY_WEIGHTS: W } = { MASTERY_WEIGHTS: {
      FIRST_CHOICE_CORRECT: 40, SOL_RATING_3: 20, SOL_RATING_2: 10,
      SINGLE_ATTEMPT: 20, TIMER_NOT_EXPIRED: 10, MODIFICATION_VIEWED: 10,
    }}
    let score = 0
    if (a.firstChoiceCorrect) score += W.FIRST_CHOICE_CORRECT
    if (a.solRating === 3) score += W.SOL_RATING_3
    else if (a.solRating === 2) score += W.SOL_RATING_2
    if (a.incorrectAttempts === 0) score += W.SINGLE_ATTEMPT
    if (!a.timerExpired) score += W.TIMER_NOT_EXPIRED
    if (a.modificationViewed) score += W.MODIFICATION_VIEWED
    return score
  })

  const avgMastery = recent.length >= 3
    ? Math.round(masteryScores.reduce((s, x) => s + x, 0) / masteryScores.length)
    : null // 'building...' until 3 attempts

  // practiceMoreFlag
  const lastTwo = completed.slice(-2)
  const practiceMoreFlag =
    (lastTwo.length === 2 && lastTwo.every(a => !a.firstChoiceCorrect)) ||
    (lastTwo.length === 2 && lastTwo.every(a => a.solRating === 1))

  const stats = {
    cardId,
    timesAttempted: attempts.length,
    timesCompleted: completed.length,
    timesCorrectFirstTry: completed.filter(a => a.firstChoiceCorrect).length,
    avgSolvingTimeMs: Math.round(completed.reduce((s, a) => s + (a.solvingTimeMs || 0), 0) / completed.length),
    avgSolRating: +(completed.reduce((s, a) => s + (a.solRating || 0), 0) / completed.length).toFixed(1),
    masteryScore: avgMastery,
    practiceMoreFlag,
    lastAttemptDate: attempts[attempts.length - 1].date,
    conceptsToImproveOn: getConceptsToImprove(completed),
  }

  localStorage.setItem(`${profileKey(profileId)}_stats_${cardId}`, JSON.stringify(stats))
}

function getConceptsToImprove(completedAttempts) {
  const allRevealed = completedAttempts.flatMap(a => a.conceptsRevealed || [])
  const freq = {}
  allRevealed.forEach(c => { freq[c] = (freq[c] || 0) + 1 })
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([concept]) => concept)
}

export function getCardStats(profileId, cardId) {
  try {
    return JSON.parse(localStorage.getItem(`${profileKey(profileId)}_stats_${cardId}`) || 'null')
  } catch { return null }
}

// ─── PATTERN PROGRESS (aggregated across cards) ───────────────────────────────
export function getPatternProgress(profileId, patternId, cardIds) {
  const stats = cardIds.map(id => getCardStats(profileId, id)).filter(Boolean)
  if (!stats.length) return { masteryScore: null, cardsCompleted: 0, practiceMoreCards: [] }

  const withScores = stats.filter(s => s.masteryScore !== null)
  const avgMastery = withScores.length
    ? Math.round(withScores.reduce((s, x) => s + x.masteryScore, 0) / withScores.length)
    : null

  return {
    masteryScore: avgMastery,
    cardsCompleted: stats.filter(s => s.timesCompleted > 0).length,
    practiceMoreCards: stats.filter(s => s.practiceMoreFlag).map(s => s.cardId),
  }
}

// ─── STREAK ───────────────────────────────────────────────────────────────────
export function getStreak(profileId) {
  try {
    const raw = localStorage.getItem(`${profileKey(profileId)}_streak`)
    return raw ? JSON.parse(raw) : { current: 0, longest: 0, lastDate: null }
  } catch { return { current: 0, longest: 0, lastDate: null } }
}

export function updateStreak(profileId) {
  const streak = getStreak(profileId)
  const today = new Date().toISOString().split('T')[0]
  if (streak.lastDate === today) return streak

  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  const newCurrent = streak.lastDate === yesterday ? streak.current + 1 : 1
  const updated = {
    current: newCurrent,
    longest: Math.max(newCurrent, streak.longest),
    lastDate: today,
  }
  localStorage.setItem(`${profileKey(profileId)}_streak`, JSON.stringify(updated))
  return updated
}

// ─── NUDGE TRACKING ───────────────────────────────────────────────────────────
export function getNudgeDismissed(profileId, patternId) {
  return localStorage.getItem(`${profileKey(profileId)}_nudge_${patternId}`) === 'dismissed'
}

export function setNudgeDismissed(profileId, patternId) {
  localStorage.setItem(`${profileKey(profileId)}_nudge_${patternId}`, 'dismissed')
}
