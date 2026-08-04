import { useNavigate } from 'react-router-dom'

export default function ToolsPage() {
  const navigate = useNavigate()

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-bamboo mb-4">工具</h1>
      <p className="text-gray-600 mb-6">辅助练习的实用工具</p>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => navigate('/tools/metronome')}
          className="flex flex-col items-center gap-2 p-6 bg-white rounded-xl shadow-sm border border-gray-100 active:scale-95 transition-transform"
        >
          <span className="text-3xl">🎵</span>
          <span className="text-sm font-medium text-gray-700">节拍器</span>
        </button>

        <button
          onClick={() => navigate('/tools/tuner')}
          className="flex flex-col items-center gap-2 p-6 bg-white rounded-xl shadow-sm border border-gray-100 active:scale-95 transition-transform"
        >
          <span className="text-3xl">🎼</span>
          <span className="text-sm font-medium text-gray-700">调音器</span>
        </button>
      </div>
    </div>
  )
}
