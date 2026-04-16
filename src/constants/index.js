// Bump this whenever the localStorage schema changes.
// On mismatch at startup, progress is cleared with a user-facing message.
export const SCHEMA_VERSION = '1.0.0'

export const STORAGE_KEY_PREFIX = 'prep_'
export const SCHEMA_VERSION_KEY = `${STORAGE_KEY_PREFIX}schema_version`

export const CONFIDENCE_MODES = {
  GUIDED:    'guided',
  PRACTICE:  'practice',
  INTERVIEW: 'interview',
}

export const DIFFICULTIES = {
  EASY:   'easy',
  MEDIUM: 'medium',
  HARD:   'hard',
}

export const CARD_STEPS = {
  PROBLEM:      1,
  SELECT:       2,
  SAY_APPROACH: 3,
  CHECK:        4,
  CODE:         5,
  SUMMARY:      6,
  TITLE_MODS:   7,
}

export const MAX_LOCAL_PROFILES = 5

// Mastery score weights — max 100
export const MASTERY_WEIGHTS = {
  FIRST_CHOICE_CORRECT: 40,
  SOL_RATING_3:         20,
  SOL_RATING_2:         10,
  SINGLE_ATTEMPT:       20,
  TIMER_NOT_EXPIRED:    10,
  MODIFICATION_VIEWED:  10,
}

// practiceMoreFlag triggers
export const PRACTICE_MORE_TRIGGERS = {
  CONSECUTIVE_INCORRECT:  2,   // wrong 2x in a row
  CONSECUTIVE_LOW_RATING: 2,   // solRating=1 twice in a row
  DAYS_STALE:             7,   // not attempted in 7+ days
  MASTERY_THRESHOLD:      80,  // below this + stale = flag
}

export const SESSION_TYPES = {
  RANDOM:          'random',
  WEAKEST:         'weakest',
  BY_DIFFICULTY:   'by_difficulty',
  BY_TAG:          'by_tag',
  PATTERN_DIVE:    'pattern_dive',
  QUICK_DRILL:     'quick_drill',
}
