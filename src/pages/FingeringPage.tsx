import { useNavigate } from 'react-router-dom'
import { FINGERING_CHART, FingeringNote } from '../data/fingeringChart'

function FingeringDiagram({ note }: { note: FingeringNote }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="text-lg font-bold text-bamboo">{note.note}</span>
          <span className="ml-2 font-mono text-base text-gray-600">{note.numbered}</span>
        </div>
      </div>

      {/* 指法图示 */}
      <div className="flex items-center justify-center gap-1 mb-2">
        {/* 左手标签 */}
        <span className="text-[10px] text-gray-400 w-8 text-right">左手</span>
        {note.fingers.slice(0, 3).map((pressed, i) => (
          <div
            key={`L${i}`}
            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs ${
              pressed
                ? 'bg-bamboo border-bamboo text-white'
                : 'bg-white border-gray-300 text-gray-400'
            }`}
          >
            {pressed ? '●' : '○'}
          </div>
        ))}
        <span className="mx-1 text-gray-300">|</span>
        {note.fingers.slice(3, 6).map((pressed, i) => (
          <div
            key={`R${i}`}
            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs ${
              pressed
                ? 'bg-bamboo border-bamboo text-white'
                : 'bg-white border-gray-300 text-gray-400'
            }`}
          >
            {pressed ? '●' : '○'}
          </div>
        ))}
        {/* 右手标签 */}
        <span className="text-[10px] text-gray-400 w-8">右手</span>
      </div>

      {/* 手指编号 */}
      <div className="flex items-center justify-center gap-1 mb-2">
        <span className="w-8" />
        {['食', '中', '无'].map((f, i) => (
          <span key={`Ln${i}`} className="w-8 text-center text-[10px] text-gray-400">{f}</span>
        ))}
        <span className="mx-1 w-2" />
        {['食', '中', '无'].map((f, i) => (
          <span key={`Rn${i}`} className="w-8 text-center text-[10px] text-gray-400">{f}</span>
        ))}
        <span className="w-8" />
      </div>

      {note.tips && (
        <p className="text-xs text-gray-500 text-center bg-cream rounded-lg px-3 py-1.5">
          💡 {note.tips}
        </p>
      )}
    </div>
  )
}

export default function FingeringPage() {
  const navigate = useNavigate()

  return (
    <div className="p-6 pb-24">
      <button
        onClick={() => navigate('/tools/reference')}
        className="flex items-center gap-1 text-bamboo mb-4"
      >
        <span>←</span>
        <span className="text-sm">返回参考</span>
      </button>

      <h1 className="text-2xl font-bold text-bamboo mb-1">D调竹笛指法表</h1>
      <p className="text-gray-500 text-sm mb-2">筒音作5 · 6孔竹笛</p>

      <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-6">
        <p className="text-xs text-amber-700">
          <strong>图例：</strong>
          <span className="inline-block w-4 h-4 rounded-full bg-bamboo align-middle mx-1" />按住
          <span className="inline-block w-4 h-4 rounded-full border-2 border-gray-300 bg-white align-middle mx-1" />放开
        </p>
      </div>

      <div className="space-y-3">
        {FINGERING_CHART.map((note) => (
          <FingeringDiagram key={note.note} note={note} />
        ))}
      </div>
    </div>
  )
}
