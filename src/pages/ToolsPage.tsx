import { useNavigate } from 'react-router-dom'

// 精致线描风格 SVG 图标
const MetronomeIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.3}>
    <path d="M8 20h8M12 20V4M12 4L7 20M12 4l5 16" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 10l4-3" strokeLinecap="round" strokeWidth={1.5} />
    <circle cx="12" cy="4" r="1.5" fill="currentColor" stroke="none" />
  </svg>
)

const TunerIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.3}>
    <path d="M12 3v18M12 3c-1 0-2 .5-2 1.5S11 6 12 6s2-.5 2-1.5S13 3 12 3z" strokeLinecap="round" />
    <path d="M8 10h8M6 14h12" strokeLinecap="round" opacity={0.5} />
    <circle cx="12" cy="14" r="2" strokeWidth={1.5} />
  </svg>
)

const FingeringIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.3}>
    <path d="M12 3v14M8 5v10M16 5v10" strokeLinecap="round" />
    <circle cx="12" cy="7" r="1.5" />
    <circle cx="12" cy="11" r="1.5" />
    <circle cx="12" cy="15" r="1.5" />
    <circle cx="8" cy="8" r="1.2" />
    <circle cx="8" cy="12" r="1.2" />
    <circle cx="16" cy="8" r="1.2" />
    <circle cx="16" cy="12" r="1.2" />
    <path d="M6 19h12" strokeLinecap="round" opacity={0.4} />
  </svg>
)

const RecordIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.3}>
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="3.5" fill="currentColor" stroke="none" opacity={0.8} />
    <circle cx="12" cy="12" r="1" fill="white" stroke="none" />
  </svg>
)

const NotationIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.3}>
    <path d="M8 5v14M14 3v14" strokeLinecap="round" />
    <circle cx="6" cy="19" r="2" fill="currentColor" stroke="none" />
    <circle cx="12" cy="17" r="2" fill="currentColor" stroke="none" />
    <path d="M8 5l6-2M8 9l6-2" strokeLinecap="round" />
    <path d="M17 8l2 2-2 2" strokeLinecap="round" strokeWidth={1} opacity={0.5} />
  </svg>
)

export default function ToolsPage() {
  const navigate = useNavigate()

  const tools = [
    { icon: <MetronomeIcon />, label: '节拍器', path: '/tools/metronome' },
    { icon: <TunerIcon />, label: '调音器', path: '/tools/tuner' },
    { icon: <FingeringIcon />, label: '指法表', path: '/tools/fingering' },
    { icon: <RecordIcon />, label: '录音', path: '/tools/record' },
    { icon: <NotationIcon />, label: '简谱', path: '/tools/notation' },
  ]

  const references = [
    { label: '简谱乐理基础', desc: '从零开始学看简谱', path: '/tools/notation' },
    { label: '竹笛指法速查', desc: 'D调全音域指法图解', path: '/tools/fingering' },
    { label: '学习参考资料', desc: '竹笛学习常用资源', path: '/tools/reference' },
  ]

  return (
    <div className="p-5 pb-24 page-enter bg-paper-texture min-h-screen">
      {/* 练习工具标题 */}
      <h2 className="text-lg font-bold text-[#1a3a0a] mb-4 flex items-center gap-2" style={{ fontFamily: 'STKaiti, KaiTi, serif' }}>
        <span className="text-[#2d5016] opacity-60">┃</span>练习工具
      </h2>

      {/* 工具网格 - 圆形图标+文字在下 */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {tools.map(tool => (
          <button
            key={tool.path}
            onClick={() => navigate(tool.path)}
            className="flex flex-col items-center gap-2.5 py-4 active:scale-95 transition-transform"
          >
            <div className="w-14 h-14 rounded-full bg-[#e8f4e0] border border-[#2d5016]/10 flex items-center justify-center text-[#2d5016] shadow-sm">
              {tool.icon}
            </div>
            <span className="text-xs font-medium text-[#4a4a4a]">{tool.label}</span>
          </button>
        ))}
      </div>

      <div className="ink-divider" />

      {/* 学习参考 */}
      <h2 className="text-lg font-bold text-[#1a3a0a] mb-3 flex items-center gap-2 mt-5" style={{ fontFamily: 'STKaiti, KaiTi, serif' }}>
        <span className="text-[#2d5016] opacity-60">┃</span>学习参考
      </h2>

      <div className="space-y-2.5">
        {references.map((ref, idx) => (
          <button
            key={idx}
            onClick={() => navigate(ref.path)}
            className="card-guofeng w-full flex items-center gap-3 p-4 active:scale-[0.98] transition-transform text-left"
          >
            {/* 墨点装饰 */}
            <div className="w-2 h-2 rounded-full bg-[#2d5016]/40 shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-[#1a1a1a]">{ref.label}</h3>
              <p className="text-xs text-[#9b9b9b] mt-0.5">{ref.desc}</p>
            </div>
            <svg className="w-4 h-4 text-[#9b9b9b] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  )
}
