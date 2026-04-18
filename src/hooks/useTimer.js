import { useState, useEffect, useRef, useCallback } from 'react'

export function useTimer(hidden = false) {
  const [readingMs, setReadingMs]   = useState(0)
  const [solvingMs, setSolvingMs]   = useState(0)
  const [solvingActive, setSolvingActive] = useState(false)
  const [expired, setExpired]       = useState(false)

  const readingRef = useRef(null)
  const solvingRef = useRef(null)
  const solvingLimit = useRef(null) // ms, null = no limit

  // Reading timer starts immediately on mount
  useEffect(() => {
    readingRef.current = setInterval(() => setReadingMs(ms => ms + 100), 100)
    return () => clearInterval(readingRef.current)
  }, [])

  // Solving timer — started explicitly by user
  useEffect(() => {
    if (!solvingActive) return
    solvingRef.current = setInterval(() => {
      setSolvingMs(ms => {
        const next = ms + 100
        if (solvingLimit.current && next >= solvingLimit.current) {
          clearInterval(solvingRef.current)
          setExpired(true)
          return solvingLimit.current
        }
        return next
      })
    }, 100)
    return () => clearInterval(solvingRef.current)
  }, [solvingActive])

  const startSolving = useCallback((limitMs = null) => {
    solvingLimit.current = limitMs
    setSolvingActive(true)
  }, [])

  const stopAll = useCallback(() => {
    clearInterval(readingRef.current)
    clearInterval(solvingRef.current)
  }, [])

  const reset = useCallback(() => {
    clearInterval(readingRef.current)
    clearInterval(solvingRef.current)
    solvingLimit.current = null
    setReadingMs(0)
    setSolvingMs(0)
    setSolvingActive(false)
    setExpired(false)
    readingRef.current = setInterval(() => setReadingMs(ms => ms + 100), 100)
  }, [])

  const formatMs = (ms) => {
    const s = Math.floor(ms / 1000)
    const m = Math.floor(s / 60)
    return `${m}:${String(s % 60).padStart(2, '0')}`
  }

  // Urgency: amber > 60s, red > 90s (interview mode)
  const solvingUrgency = solvingMs > 90000 ? 'red' : solvingMs > 60000 ? 'amber' : 'normal'

  return {
    readingMs, solvingMs,
    readingFormatted: formatMs(readingMs),
    solvingFormatted: formatMs(solvingMs),
    solvingActive, expired, solvingUrgency,
    startSolving, stopAll, reset,
    hidden,
  }
}
