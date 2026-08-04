import { Routes, Route } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import PWAInstallGuide from './components/PWAInstallGuide'
import CheckinPage from './pages/CheckinPage'
import CoursePage from './pages/CoursePage'
import ToolsPage from './pages/ToolsPage'
import MetronomePage from './pages/MetronomePage'
import TunerPage from './pages/TunerPage'
import RecordPage from './pages/RecordPage'

function App() {
  return (
    <div className="flex flex-col h-screen bg-cream">
      <PWAInstallGuide />
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<CheckinPage />} />
          <Route path="/course" element={<CoursePage />} />
          <Route path="/tools" element={<ToolsPage />} />
          <Route path="/tools/metronome" element={<MetronomePage />} />
          <Route path="/tools/tuner" element={<TunerPage />} />
          <Route path="/record" element={<RecordPage />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  )
}

export default App
