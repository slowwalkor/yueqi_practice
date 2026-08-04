import { useNavigate } from 'react-router-dom'

export default function ToolsPage() {
  const navigate = useNavigate()

  return (
    <div className="p-6 pb-24">
      <h1 className="text-2xl font-bold text-bamboo mb-4">工具</h1>
      <p className="text-gray-600 mb-6">辅助练习的实用工具</p>

      <div className="grid grid-cols-2 gap-4 mb-8">
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

      {/* 学习参考 */}
      <h2 className="text-lg font-semibold text-gray-700 mb-3">📚 学习参考</h2>
      <div className="space-y-3">
        <button
          onClick={() => navigate('/tools/notation')}
          className="w-full flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100 active:scale-[0.98] transition-transform text-left"
        >
          <span className="text-2xl">📖</span>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-800">简谱入门</h3>
            <p className="text-xs text-gray-400 mt-0.5">不认识音符？从这里开始</p>
          </div>
          <span className="text-gray-300">›</span>
        </button>

        <button
          onClick={() => navigate('/tools/fingering')}
          className="w-full flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100 active:scale-[0.98] transition-transform text-left"
        >
          <span className="text-2xl">🖐</span>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-800">指法表</h3>
            <p className="text-xs text-gray-400 mt-0.5">D调竹笛全音域指法图解</p>
          </div>
          <span className="text-gray-300">›</span>
        </button>

        <button
          onClick={() => navigate('/tools/scores')}
          className="w-full flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100 active:scale-[0.98] transition-transform text-left"
        >
          <span className="text-2xl">🎶</span>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-800">练习曲谱</h3>
            <p className="text-xs text-gray-400 mt-0.5">课程配套曲目简谱</p>
          </div>
          <span className="text-gray-300">›</span>
        </button>
      </div>
    </div>
  )
}
