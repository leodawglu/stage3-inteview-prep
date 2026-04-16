import { useState, useEffect, useCallback } from 'react'
import {
  getProfiles, saveProfiles, createProfile,
  getActiveProfileId, setActiveProfileId,
} from '../adapters/localAdapter'

export function useProfiles() {
  const [profiles, setProfiles] = useState([])
  const [activeId, setActiveId] = useState(null)

  useEffect(() => {
    setProfiles(getProfiles())
    setActiveId(getActiveProfileId())
  }, [])

  const addProfile = useCallback((name) => {
    const p = createProfile(name)
    if (p) setProfiles(prev => [...prev, p])
    return p
  }, [])

  const switchProfile = useCallback((id) => {
    setActiveProfileId(id)
    setActiveId(id)
  }, [])

  const activeProfile = profiles.find(p => p.id === activeId) || null

  return { profiles, activeProfile, activeId, addProfile, switchProfile }
}
