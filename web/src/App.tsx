import { HashRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import { COLORS } from 'shared/theme'
import { CareProvider } from './state/CareProvider'
import { BottomTabs } from './components/BottomTabs'
import { ViewToggle } from './components/ViewToggle'
import { Home } from './screens/Home'
import { Meds } from './screens/Meds'
import { Calendar } from './screens/Calendar'
import { CareLog } from './screens/CareLog'
import { Supplies } from './screens/Supplies'
import { useSession } from './hooks/useSession'
import { isSupabaseConfigured } from './lib/supabase'
import { SignIn } from './components/SignIn'

function Shell() {
  return (
    <div className="app" style={{ backgroundColor: COLORS.bg, color: COLORS.text }}>
      <div className="container">
        <Routes>
          <Route path="/"          element={<Home />} />
          <Route path="/meds"      element={<Meds />} />
          <Route path="/calendar"  element={<Calendar />} />
          <Route path="/notes"     element={<CareLog />} />
          <Route path="/supplies"  element={<Supplies />} />
          <Route path="*"          element={<Home />} />
        </Routes>
      </div>
      <BottomTabs />
    </div>
  )
}

/**
 * Hash routing rather than history routing: GitHub Pages serves a 404 for any
 * client-side path on refresh, and a hash keeps the whole route in the
 * fragment where the server never sees it. The phone's back button still works.
 */
function App() {
  const { session, loading } = useSession()

  // With no Supabase project configured the app runs on mock data and skips
  // sign-in entirely, which is what the deployed demo does.
  const needsAuth = isSupabaseConfigured && !session

  if (isSupabaseConfigured && loading) {
    return <div style={{ minHeight: '100vh', backgroundColor: COLORS.bg }} />
  }
  if (needsAuth) return <SignIn />

  return (
    <CareProvider>
      <ViewToggle />
      <HashRouter>
        <Shell />
      </HashRouter>
    </CareProvider>
  )
}

export default App
