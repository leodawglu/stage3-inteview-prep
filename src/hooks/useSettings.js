import { useState, useEffect, useCallback } from 'react'
import { getSettings, saveSettings } from '../adapters/localAdapter'

export function useSettings(profileId) {
  const [settings, setSettings] = useState({
    hideConcepts: false,
    hideMissing: false,
    hideTimer: false,
    darkMode: 'system',
  })

  useEffect(() => {
    if (profileId) setSettings(getSettings(profileId))
  }, [profileId])

  const updateSetting = useCallback((key, value) => {
    setSettings(prev => {
      const next = { ...prev, [key]: value }
      if (profileId) saveSettings(profileId, next)
      return next
    })
  }, [profileId])

  return { settings, updateSetting }
}
