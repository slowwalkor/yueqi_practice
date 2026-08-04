import { useNavigate } from 'react-router-dom'

export default function ReferencePage() {
  const navigate = useNavigate()

  const entries = [
    {
      icon: '📖',
      title: '简谱入门',
      desc: '不认识音符？从这里开始',
      path: '/tools/notation',
    },
    {
      icon: '🖐',
      title: '指法表',
      desc: 'D调竹笛全音域指法图解',
      path: '/tools/fingering',
    },
    {
      icon: '🎵',
      title: '练习曲谱',
      desc: '课程配套曲目简谱',
      path: '/tools/scores',
    },
  ]

  return (
    <div className="p-6 pb-24">
      <button
        onClick={() => navigate('/tools')}
        className="flex items-center gap-1 text-bamboo mb-4"
      >
        <span>←</span>
        <span className="text-sm">返回工具</span>
      </button>

      <h1 className="text-2xl font-bold text-bamboo mb-2">学习参考</h1>
      <p className="text-gray-600 mb-6">零基础竹笛学习必备资料</p>

      <div className="flex flex-col gap-4">
        {entries.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="flex items-center gap-4 p-5 bg-white rounded-xl shadow-sm border border-gray-100 active:scale-[0.98] transition-transform text-left"
          >
            <span className="text-4xl">{item.icon}</span>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">{item.title}</h2>
              <p className="text-sm text-gray-500 mt-0.5">{item.desc}</p>
            </div>
            <span className="ml-auto text-gray-300 text-xl">›</span>
          </button>
        ))}
      </div>
    </div>
  )
}
