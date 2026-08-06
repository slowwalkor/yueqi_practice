import { Routes, Route } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import BottomNav from './components/BottomNav'
import PWAInstallGuide from './components/PWAInstallGuide'
import LoginPage from './pages/LoginPage'
import CheckinPage from './pages/CheckinPage'
import CoursePage from './pages/CoursePage'
import ToolsPage from './pages/ToolsPage'
import MetronomePage from './pages/MetronomePage'
import TunerPage from './pages/TunerPage'
import RecordPage from './pages/RecordPage'
import ReferencePage from './pages/ReferencePage'
import NotationPage from './pages/NotationPage'
import FingeringPage from './pages/FingeringPage'
import ScoresPage from './pages/ScoresPage'

function App() {
  const { user, loading, isGuest } = useAuth()

  // 加载中显示动画
  if (loading) {
    return (
      <div className="min-h-screen bg-paper-texture flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3 animate-pulse">🎵</div>
          <p className="title-brush text-[var(--color-bamboo)] text-lg">笛韵加载中…</p>
        </div>
      </div>
    )
  }

  // 未登录且非游客模式 → 显示登录页
  if (!user && !isGuest) {
    return <LoginPage />
  }

  return (
    <div className="flex flex-col h-screen bg-paper-texture">
      <PWAInstallGuide />
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<CheckinPage />} />
          <Route path="/course" element={<CoursePage />} />
          <Route path="/tools" element={<ToolsPage />} />
          <Route path="/tools/metronome" element={<MetronomePage />} />
          <Route path="/tools/tuner" element={<TunerPage />} />
          <Route path="/tools/reference" element={<ReferencePage />} />
          <Route path="/tools/notation" element={<NotationPage />} />
          <Route path="/tools/fingering" element={<FingeringPage />} />
          <Route path="/tools/scores" element={<ScoresPage />} />
          <Route path="/record" element={<RecordPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  )
}

export default App
