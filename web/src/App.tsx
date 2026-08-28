import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import { COLORS } from 'shared/theme'
import { CareProvider } from './state/CareProvider'
import { BottomTabs } from './components/BottomTabs'
import { ViewToggle } from './components/ViewToggle'
import { RoleSwitcher } from './components/RoleSwitcher'
import { DoseInteractionProvider } from './dose/doseInteraction'
import { DoseSheet } from './dose/DoseSheet'
import { DoseToast } from './dose/DoseToast'
import { useCare } from './state/CareProvider'
import { Home } from './screens/Home'
import { Meds } from './screens/Meds'
import { Calendar } from './screens/Calendar'
import { CareLog } from './screens/CareLog'
import { Supplies } from './screens/Supplies'
import { Movement } from './screens/Movement'
import { More } from './screens/More'
import { Moments } from './screens/Moments'
import { Nutrition } from './screens/Nutrition'
import { CareStory } from './screens/CareStory'
import { Connectors } from './screens/Connectors'
import { Team } from './screens/Team'
import { useSession } from './hooks/useSession'
import { isSupabaseConfigured } from './lib/supabase'
import { SignIn } from './components/SignIn'

function Shell() {
  const { role } = useCare()
  const isRecipient = role === 'recipient'

  // Hiding a tab is not enough — a stale hash would otherwise walk straight
  // into a screen Gail should not see, so the routes redirect too.
  const guard = (el: React.ReactElement) =>
    isRecipient ? <Navigate to="/" replace /> : el

  return (
    <div className="app" style={{ backgroundColor: COLORS.bg, color: COLORS.text }}>
      <div className="container">
        {isRecipient && <div className="view-badge">Gail's view</div>}
        <RoleSwitcher />
        <Routes>
          <Route path="/"          element={<Home />} />
          <Route path="/meds"      element={guard(<Meds />)} />
          <Route path="/move"      element={<Movement />} />
          <Route path="/calendar"  element={<Calendar />} />
          <Route path="/notes"     element={guard(<CareLog />)} />
          <Route path="/supplies"  element={guard(<Supplies />)} />
          <Route path="/team"      element={guard(<Team />)} />
          <Route path="/more"      element={<More />} />
          <Route path="/moments"   element={<Moments />} />
          <Route path="/nutrition" element={<Nutrition />} />
          <Route path="/story"     element={<CareStory />} />
          <Route path="/connectors" element={<Connectors />} />
          <Route path="*"          element={<Home />} />
        </Routes>
      </div>
      <BottomTabs />
      {/* Mounted once at the shell so a dose can be logged from any screen. */}
      <DoseToast />
      <DoseSheet />
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
      <DoseInteractionProvider>
        <ViewToggle />
        <HashRouter>
          <Shell />
        </HashRouter>
      </DoseInteractionProvider>
    </CareProvider>
  )
}

export default App
