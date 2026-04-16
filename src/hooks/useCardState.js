import { useState, useCallback, useEffect } from 'react'
import { getCardState, saveCardState, getNotes, saveNotes } from '../adapters/localAdapter'
import { CARD_STEPS } from '../constants'

const INITIAL_STATE = {
  step: CARD_STEPS.PROBLEM,
  selectedChoice: null,   // index for easy/med, null for hard
  mm1: null,              // hard card part 1 selection index
  mm2: null,              // hard card part 2 selection index
  solRating: null,        // 1 | 2 | 3
  conceptsOpen: {},       // { [conceptIndex]: boolean }
  missingOpen: false,
  approachModelOpen: false,
  summaryModelOpen: false,
  modOpen: false,
  startedAt: null,        // ISO timestamp
}

export function useCardState(profileId, cardId) {
  const [state, setState] = useState(INITIAL_STATE)
  const [notes, setNotes]  = useState('')

  // Rehydrate from storage when card changes
  useEffect(() => {
    if (!profileId || !cardId) return
    const saved = getCardState(profileId, cardId)
    setState(saved ? { ...INITIAL_STATE, ...saved } : {
      ...INITIAL_STATE,
      startedAt: new Date().toISOString(),
    })
    setNotes(getNotes(profileId, cardId))
  }, [profileId, cardId])

  const update = useCallback((patch) => {
    setState(prev => {
      const next = { ...prev, ...patch }
      if (profileId && cardId) saveCardState(profileId, cardId, next)
      return next
    })
  }, [profileId, cardId])

  const advanceTo = useCallback((step) => update({ step }), [update])

  const selectChoice = useCallback((idx) => update({ selectedChoice: idx }), [update])
  const selectMM1    = useCallback((idx) => update({ mm1: idx }), [update])
  const selectMM2    = useCallback((idx) => update({ mm2: idx }), [update])
  const setRating    = useCallback((r)   => update({ solRating: r }), [update])

  const toggleConcept = useCallback((i) => {
    setState(prev => {
      const next = {
        ...prev,
        conceptsOpen: { ...prev.conceptsOpen, [i]: !prev.conceptsOpen[i] },
      }
      if (profileId && cardId) saveCardState(profileId, cardId, next)
      return next
    })
  }, [profileId, cardId])

  const toggleMissing      = useCallback(() => update({ missingOpen: !state.missingOpen }), [update, state.missingOpen])
  const toggleApproachModel= useCallback(() => update({ approachModelOpen: !state.approachModelOpen }), [update, state.approachModelOpen])
  const toggleSummaryModel = useCallback(() => update({ summaryModelOpen: !state.summaryModelOpen }), [update, state.summaryModelOpen])
  const toggleMod          = useCallback(() => update({ modOpen: !state.modOpen }), [update, state.modOpen])

  const updateNotes = useCallback((text) => {
    setNotes(text)
    if (profileId && cardId) saveNotes(profileId, cardId, text)
  }, [profileId, cardId])

  const reset = useCallback(() => {
    const fresh = { ...INITIAL_STATE, startedAt: new Date().toISOString() }
    setState(fresh)
    if (profileId && cardId) saveCardState(profileId, cardId, fresh)
  }, [profileId, cardId])

  // Derived
  const canAdvanceFromSelect = state.selectedChoice !== null
  const canAdvanceFromHardSelect = state.mm1 !== null && state.mm2 !== null

  return {
    ...state,
    notes,
    advanceTo,
    selectChoice,
    selectMM1,
    selectMM2,
    setRating,
    toggleConcept,
    toggleMissing,
    toggleApproachModel,
    toggleSummaryModel,
    toggleMod,
    updateNotes,
    reset,
    canAdvanceFromSelect,
    canAdvanceFromHardSelect,
  }
}
