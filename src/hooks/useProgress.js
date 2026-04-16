import { useCallback } from 'react'
import {
  saveAttempt, getCardStats, getPatternProgress,
  getStreak, updateStreak,
} from '../adapters/localAdapter'
import { MASTERY_WEIGHTS } from '../constants'

export function useProgress(profileId) {

  const recordAttempt = useCallback((cardData, cardStateSnapshot, timerSnapshot) => {
    if (!profileId) return

    const attempt = {
      cardId:                    cardData.id,
      patternId:                 cardData.patternId,
      difficulty:                cardData.difficulty,
      conceptTags:               cardData.conceptTags || [],
      confidenceMode:            cardStateSnapshot.confidenceMode,
      readingTimeMs:             timerSnapshot.readingMs,
      solvingTimeMs:             timerSnapshot.solvingMs,
      totalTimeMs:               timerSnapshot.readingMs + timerSnapshot.solvingMs,
      timerHidden:               timerSnapshot.hidden,
      choiceSequence:            cardStateSnapshot.choiceSequence || [],
      firstChoiceCorrect:        cardStateSnapshot.firstChoiceCorrect || false,
      incorrectAttempts:         cardStateSnapshot.incorrectAttempts || 0,
      solRating:                 cardStateSnapshot.solRating,
      conceptsRevealed:          Object.entries(cardStateSnapshot.conceptsOpen || {})
                                   .filter(([, v]) => v).map(([k]) => k),
      missingConstraintsRevealed: cardStateSnapshot.missingOpen || false,
      notesWritten:              (cardStateSnapshot.notes || '').length > 0,
      notesLength:               (cardStateSnapshot.notes || '').length,
      modificationViewed:        cardStateSnapshot.modOpen || false,
      cardCompleted:             true,
      timerExpired:              timerSnapshot.expired || false,
      date:                      new Date().toISOString().split('T')[0],
      dayOfWeek:                 new Date().toLocaleDateString('en-US', { weekday: 'long' }),
    }

    saveAttempt(profileId, attempt)
    updateStreak(profileId)

    return attempt
  }, [profileId])

  const computeMasteryScore = useCallback((attempt) => {
    const W = MASTERY_WEIGHTS
    let score = 0
    if (attempt.firstChoiceCorrect)    score += W.FIRST_CHOICE_CORRECT
    if (attempt.solRating === 3)        score += W.SOL_RATING_3
    else if (attempt.solRating === 2)   score += W.SOL_RATING_2
    if (attempt.incorrectAttempts === 0) score += W.SINGLE_ATTEMPT
    if (!attempt.timerExpired)          score += W.TIMER_NOT_EXPIRED
    if (attempt.modificationViewed)     score += W.MODIFICATION_VIEWED
    return score
  }, [])

  const getStats = useCallback((cardId) => {
    if (!profileId) return null
    return getCardStats(profileId, cardId)
  }, [profileId])

  const getProgress = useCallback((patternId, cardIds) => {
    if (!profileId) return null
    return getPatternProgress(profileId, patternId, cardIds)
  }, [profileId])

  const getStreakData = useCallback(() => {
    if (!profileId) return { current: 0, longest: 0 }
    return getStreak(profileId)
  }, [profileId])

  return { recordAttempt, computeMasteryScore, getStats, getProgress, getStreakData }
}
