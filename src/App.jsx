import { useEffect } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import Topbar from './components/layout/Topbar'
import ProfileSelector from './pages/ProfileSelector'
import Home from './pages/Home'
import Chapter from './pages/Chapter'
import CardPage from './pages/Card'
import SessionBuilder from './pages/SessionBuilder'
import ReviewSession from './pages/ReviewSession'
import Dashboard from './pages/Dashboard'
import Settings from './pages/Settings'
import { useProfiles } from './hooks/useProfiles'
import { useSettings } from './hooks/useSettings'
import { useConfidenceMode } from './hooks/useConfidenceMode'
import { checkAndMigrateSchema } from './adapters/localAdapter'

function AppShell({ children, hideTopbar, profile, mode, onModeChange }) {
  return (
    <div>
      {!hideTopbar && profile && (
        <Topbar mode={mode} onModeChange={onModeChange} profile={profile} />
      )}
      {children}
    </div>
  )
}

export default function App() {
  const { profiles, activeProfile, activeId, addProfile, switchProfile } = useProfiles()
  const { settings, updateSetting } = useSettings(activeId)
  const { mode, updateMode } = useConfidenceMode(activeId)

  // Schema migration on startup
  useEffect(() => {
    const result = checkAndMigrateSchema()
    if (result.migrated) {
      console.info(`[prep.dev] Schema migrated from ${result.previousVersion} — progress cleared`)
    }
  }, [])

  // Apply dark mode
  useEffect(() => {
    const dm = settings.darkMode
    const root = document.documentElement
    if (dm === 'dark') root.setAttribute('data-theme', 'dark')
    else if (dm === 'light') root.setAttribute('data-theme', 'light')
    else root.removeAttribute('data-theme')
  }, [settings.darkMode])

  const isLoggedIn = !!activeProfile

  return (
    <HashRouter>
      <Routes>
        {/* Profile selector — always accessible */}
        <Route path="/" element={
          <ProfileSelector
            profiles={profiles}
            activeId={activeId}
            onSelect={switchProfile}
            onAdd={addProfile}
          />
        } />

        {/* Protected routes — redirect to profile selector if no active profile */}
        <Route path="/home" element={
          !isLoggedIn ? <Navigate to="/" replace /> :
          <AppShell profile={activeProfile} mode={mode} onModeChange={updateMode}>
            <Home profileId={activeId} />
          </AppShell>
        } />

        <Route path="/session" element={
          !isLoggedIn ? <Navigate to="/" replace /> :
          <AppShell profile={activeProfile} mode={mode} onModeChange={updateMode}>
            <SessionBuilder />
          </AppShell>
        } />

        <Route path="/chapter/:patternId" element={
          !isLoggedIn ? <Navigate to="/" replace /> :
          <AppShell profile={activeProfile} mode={mode} onModeChange={updateMode}>
            <Chapter profileId={activeId} mode={mode} onModeChange={updateMode} />
          </AppShell>
        } />

        <Route path="/card/:patternId/:difficulty/:index" element={
          !isLoggedIn ? <Navigate to="/" replace /> :
          <AppShell profile={activeProfile} mode={mode} onModeChange={updateMode}>
            <CardPage profileId={activeId} mode={mode} settings={settings} />
          </AppShell>
        } />

        <Route path="/review" element={
          !isLoggedIn ? <Navigate to="/" replace /> :
          <AppShell profile={activeProfile} mode={mode} onModeChange={updateMode}>
            <ReviewSession profileId={activeId} />
          </AppShell>
        } />

        <Route path="/dashboard" element={
          !isLoggedIn ? <Navigate to="/" replace /> :
          <AppShell profile={activeProfile} mode={mode} onModeChange={updateMode}>
            <Dashboard profileId={activeId} />
          </AppShell>
        } />

        <Route path="/settings" element={
          !isLoggedIn ? <Navigate to="/" replace /> :
          <AppShell profile={activeProfile} mode={mode} onModeChange={updateMode}>
            <Settings
              settings={settings}
              onUpdate={updateSetting}
              profile={activeProfile}
            />
          </AppShell>
        } />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to={isLoggedIn ? '/home' : '/'} replace />} />
      </Routes>
    </HashRouter>
  )
}
