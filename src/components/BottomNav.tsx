import { useLocation, useNavigate } from 'react-router-dom'

const tabs = [
  {
    path: '/',
    label: '打卡',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M12 3c-1.2 0-2.4.6-3 1.5C8.4 3.6 7.2 3 6 3 3.8 3 2 4.8 2 7c0 4 5 8.5 10 12 5-3.5 10-8 10-12 0-2.2-1.8-4-4-4-1.2 0-2.4.6-3 1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 7v4M10 9h4" strokeLinecap="round" strokeWidth={1.5} />
      </svg>
    ),
  },
  {
    path: '/course',
    label: '课程',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M3 5c0-1 .5-2 2-2h3c1 0 2 .5 2.5 1.5L12 6l1.5-1.5C14 3.5 15 3 16 3h3c1.5 0 2 1 2 2v14c0 1-.5 2-2 2h-3.5c-1 0-1.5.5-2 1L12 21l-1.5-1c-.5-.5-1-1-2-1H5c-1.5 0-2-1-2-2V5z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 6v15" strokeLinecap="round" />
        <path d="M7 8h2M7 11h2M15 8h2M15 11h2" strokeLinecap="round" strokeWidth={1.5} />
      </svg>
    ),
  },
  {
    path: '/tools',
    label: '工具',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M12 2C9 2 7 4 7 6c0 1.5.5 2.5 1.5 3.5L9 10v2h6v-2l.5-.5C16.5 8.5 17 7.5 17 6c0-2-2-4-5-4z" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="9" y="12" width="6" height="3" rx="1" />
        <path d="M10 15v2c0 1 .5 2 2 2s2-1 2-2v-2" strokeLinecap="round" />
        <path d="M8 6h1M15 6h1" strokeLinecap="round" strokeWidth={2} />
      </svg>
    ),
  },
  {
    path: '/record',
    label: '录音',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <ellipse cx="12" cy="14" rx="3" ry="4" />
        <path d="M12 10V3" strokeLinecap="round" />
        <path d="M10 3h4" strokeLinecap="round" />
        <path d="M6 14c0 3.3 2.7 6 6 6s6-2.7 6-6" strokeLinecap="round" />
        <path d="M12 20v2" strokeLinecap="round" />
        <circle cx="9" cy="14" r="0.5" fill="currentColor" />
        <circle cx="12" cy="14" r="0.5" fill="currentColor" />
        <circle cx="15" cy="14" r="0.5" fill="currentColor" />
      </svg>
    ),
  },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path: string) => {
    if (path === '/tools') {
      return location.pathname.startsWith('/tools')
    }
    return location.pathname === path
  }

  return (
    <nav className="relative safe-bottom">
      {/* 顶部竹绿渐变线 */}
      <div className="nav-top-line" />
      <div className="flex items-center justify-around backdrop-blur-lg bg-paper/90 py-2">
        {tabs.map((tab) => (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={`relative flex flex-col items-center gap-0.5 px-3 py-1 transition-all duration-200 ${
              isActive(tab.path)
                ? 'text-bamboo scale-105'
                : 'text-ink-wash hover:text-ink-light'
            }`}
          >
            {/* 选中态圆形底衬 */}
            {isActive(tab.path) && (
              <div className="absolute -top-0.5 w-9 h-9 rounded-full bg-bamboo-50 -z-10" />
            )}
            {tab.icon}
            <span className={`text-xs font-brush ${isActive(tab.path) ? 'font-semibold' : ''}`}>
              {tab.label}
            </span>
            {/* 选中态底部竹叶 */}
            {isActive(tab.path) && (
              <span className="absolute -bottom-0.5 text-[8px] leading-none">🌿</span>
            )}
          </button>
        ))}
      </div>
    </nav>
  )
}
