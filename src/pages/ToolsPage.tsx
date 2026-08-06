import { useNavigate } from 'react-router-dom'

export default function ToolsPage() {
  const navigate = useNavigate()

  const tools = [
    { icon: '🎵', label: '节拍器', path: '/tools/metronome' },
    { icon: '🎼', label: '调音器', path: '/tools/tuner' },
    { icon: '👆', label: '指法表', path: '/tools/fingering' },
    { icon: '🎙', label: '录音', path: '/tools/record' },
    { icon: '📝', label: '简谱入门', path: '/tools/notation' },
  ]

  const references = [
    { icon: '📚', label: '简谱乐理基础', desc: '从零开始学看简谱', path: '/tools/notation' },
    { icon: '🎋', label: '竹笛指法速查', desc: 'D调全音域指法图解', path: '/tools/fingering' },
    { icon: '📖', label: '学习参考资料', desc: '竹笛学习常用资源', path: '/tools/reference' },
  ]

  return (
    <div className="p-6 pb-24 page-enter">
      {/* 练习工具 */}
      <h2 className="text-lg font-brush font-semibold text-ink mb-4 section-title">练习工具</h2>
      <div className="grid grid-cols-3 gap-3 mb-8">
        {tools.map(tool => (
          <button
            key={tool.path}
            onClick={() => navigate(tool.path)}
            className="card-classical bg-paper flex flex-col items-center gap-2 p-4 active:scale-95 transition-transform"
          >
            <div className="w-11 h-11 rounded-full bg-bamboo-50 border border-bamboo-100 flex items-center justify-center">
              <span className="text-xl">{tool.icon}</span>
            </div>
            <span className="text-xs font-medium text-ink">{tool.label}</span>
          </button>
        ))}
      </div>

      {/* 学习参考 */}
      <h2 className="text-lg font-brush font-semibold text-ink mb-3 section-title">学习参考</h2>
      <div className="card-classical bg-paper overflow-hidden divide-y divide-bamboo-100/40">
        {references.map((ref, idx) => (
          <button
            key={idx}
            onClick={() => navigate(ref.path)}
            className="w-full flex items-center gap-3 p-4 active:scale-[0.98] transition-transform text-left"
          >
            <div className="w-9 h-9 rounded-full bg-bamboo-50 border border-bamboo-100 flex items-center justify-center shrink-0">
              <span className="text-base">{ref.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-ink">{ref.label}</h3>
              <p className="text-xs text-ink-wash mt-0.5">{ref.desc}</p>
            </div>
            <span className="text-bamboo-100 text-lg shrink-0">›</span>
          </button>
        ))}
      </div>
    </div>
  )
}
