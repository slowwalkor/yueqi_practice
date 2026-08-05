import { useNavigate } from 'react-router-dom'

export default function ToolsPage() {
  const navigate = useNavigate()

  return (
    <div className="p-6 pb-24 page-enter">
      <h1 className="text-2xl font-bold font-brush text-bamboo mb-1">工具</h1>
      <p className="text-ink-wash text-sm mb-6">辅助练习的实用工具</p>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <button
          onClick={() => navigate('/tools/metronome')}
          className="card-scroll flex flex-col items-center gap-3 p-6 bg-paper border border-bamboo-100 rounded-xl active:scale-95 transition-transform"
        >
          <div className="w-12 h-12 rounded-full border-2 border-gold/60 flex items-center justify-center">
            <svg className="w-6 h-6 text-bamboo" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path d="M12 3v18M8 6l4-3 4 3M9 21h6" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="2" />
              <path d="M12 10V6" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-sm font-brush font-medium text-ink">节拍器</span>
        </button>

        <button
          onClick={() => navigate('/tools/tuner')}
          className="card-scroll flex flex-col items-center gap-3 p-6 bg-paper border border-bamboo-100 rounded-xl active:scale-95 transition-transform"
        >
          <div className="w-12 h-12 rounded-full border-2 border-gold/60 flex items-center justify-center">
            <svg className="w-6 h-6 text-bamboo" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path d="M9 18V5l12-2v13" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
          </div>
          <span className="text-sm font-brush font-medium text-ink">调音器</span>
        </button>
      </div>

      {/* 学习参考 */}
      <h2 className="text-lg font-brush font-semibold text-ink mb-3 section-title">学习参考</h2>
      <div className="space-y-3">
        <button
          onClick={() => navigate('/tools/notation')}
          className="w-full flex items-center gap-3 p-4 card-classical bg-paper active:scale-[0.98] transition-transform text-left"
        >
          <div className="w-10 h-10 rounded-full bg-bamboo-50 border border-bamboo-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-bamboo" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path d="M4 5h16M4 9h12M4 13h16M4 17h8" strokeLinecap="round" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-ink">简谱入门</h3>
            <p className="text-xs text-ink-wash mt-0.5">不认识音符？从这里开始</p>
          </div>
          <span className="text-bamboo-100 text-lg">›</span>
        </button>

        <button
          onClick={() => navigate('/tools/fingering')}
          className="w-full flex items-center gap-3 p-4 card-classical bg-paper active:scale-[0.98] transition-transform text-left"
        >
          <div className="w-10 h-10 rounded-full bg-bamboo-50 border border-bamboo-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-bamboo" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <rect x="3" y="10" width="18" height="4" rx="2" />
              <circle cx="7" cy="12" r="1.2" />
              <circle cx="10" cy="12" r="1.2" />
              <circle cx="13" cy="12" r="1.2" />
              <circle cx="16" cy="12" r="1.2" />
              <circle cx="19" cy="12" r="1.2" />
              <circle cx="5" cy="12" r="1.2" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-ink">指法表</h3>
            <p className="text-xs text-ink-wash mt-0.5">D调竹笛全音域指法图解</p>
          </div>
          <span className="text-bamboo-100 text-lg">›</span>
        </button>

        <button
          onClick={() => navigate('/tools/scores')}
          className="w-full flex items-center gap-3 p-4 card-classical bg-paper active:scale-[0.98] transition-transform text-left"
        >
          <div className="w-10 h-10 rounded-full bg-bamboo-50 border border-bamboo-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-bamboo" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path d="M9 18V5l12-2v13" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
              <path d="M9 9l12-2" strokeLinecap="round" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-ink">练习曲谱</h3>
            <p className="text-xs text-ink-wash mt-0.5">课程配套曲目简谱</p>
          </div>
          <span className="text-bamboo-100 text-lg">›</span>
        </button>
      </div>
    </div>
  )
}
