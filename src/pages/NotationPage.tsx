import { useNavigate } from 'react-router-dom'
import { NOTATION_GUIDE } from '../data/notationGuide'

export default function NotationPage() {
  const navigate = useNavigate()

  return (
    <div className="p-6 pb-24 page-enter">
      <button
        onClick={() => navigate('/tools/reference')}
        className="flex items-center gap-1 text-bamboo mb-4"
      >
        <span>←</span>
        <span className="text-sm">返回参考</span>
      </button>

      <h1 className="text-2xl font-bold text-bamboo mb-1">简谱入门</h1>
      <p className="text-gray-500 text-sm mb-6">学会看懂简谱，吹出你想要的旋律</p>

      {/* 基本音符 */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">🎼 七个基本音</h2>
        <div className="grid grid-cols-7 gap-1">
          {NOTATION_GUIDE.basics.map((n) => (
            <div key={n.symbol} className="flex flex-col items-center bg-white rounded-lg p-2 shadow-sm">
              <span className="text-2xl font-bold text-bamboo">{n.symbol}</span>
              <span className="text-xs text-gray-500 mt-1">{n.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 音域 */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">🔈 音域高低</h2>
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
          {NOTATION_GUIDE.octaves.map((o) => (
            <div key={o.range} className="flex items-center gap-3">
              <span className="w-12 text-sm font-medium text-bamboo">{o.range}</span>
              <span className="text-sm text-gray-600 flex-1">{o.notation}</span>
              <span className="font-mono text-lg text-gray-800">{o.example}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 时值 */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">⏱ 音符时值</h2>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {NOTATION_GUIDE.durations.map((d, i) => (
            <div
              key={d.name}
              className={`flex items-center px-4 py-3 ${i > 0 ? 'border-t border-gray-50' : ''}`}
            >
              <span className="text-sm font-medium text-gray-700 w-24">{d.name}</span>
              <span className="text-xs text-gray-400 w-16">{d.beats}拍</span>
              <span className="font-mono text-base text-bamboo">{d.notation}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 休止符 */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">🤫 休止符</h2>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {NOTATION_GUIDE.rests.map((r, i) => (
            <div
              key={r.name}
              className={`flex items-center px-4 py-3 ${i > 0 ? 'border-t border-gray-50' : ''}`}
            >
              <span className="text-sm font-medium text-gray-700 w-24">{r.name}</span>
              <span className="text-xs text-gray-400 w-16">{r.beats}拍</span>
              <span className="font-mono text-base text-gray-600">{r.symbol}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 常用符号 */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">✨ 常用演奏符号</h2>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {NOTATION_GUIDE.symbols.map((s, i) => (
            <div
              key={s.name}
              className={`flex items-center px-4 py-3 ${i > 0 ? 'border-t border-gray-50' : ''}`}
            >
              <span className="text-xl w-10 text-center font-mono text-bamboo">{s.symbol}</span>
              <div className="flex-1 ml-2">
                <span className="text-sm font-medium text-gray-700">{s.name}</span>
                <p className="text-xs text-gray-400 mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
