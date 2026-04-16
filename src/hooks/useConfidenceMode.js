import { useState, useEffect, useCallback } from 'react'
import { getConfidenceMode, saveConfidenceMode } from '../adapters/localAdapter'
import { CONFIDENCE_MODES } from '../constants'

export function useConfidenceMode(profileId) {
  const [mode, setMode] = useState(CONFIDENCE_MODES.GUIDED)

  useEffect(() => {
    if (profileId) setMode(getConfidenceMode(profileId))
  }, [profileId])

  const updateMode = useCallback((newMode) => {
    setMode(newMode)
    if (profileId) saveConfidenceMode(profileId, newMode)
  }, [profileId])

  const isGuided   = mode === CONFIDENCE_MODES.GUIDED
  const isPractice = mode === CONFIDENCE_MODES.PRACTICE
  const isInterview = mode === CONFIDENCE_MODES.INTERVIEW

  return { mode, updateMode, isGuided, isPractice, isInterview }
}
