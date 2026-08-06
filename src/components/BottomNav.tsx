import { useLocation, useNavigate } from 'react-router-dom'

interface TabItem {
  path: string
  label: string
  icon: (active: boolean) => React.ReactNode
}

const tabs: TabItem[] = [
  {
    path: '/',
    label: '今日',
    icon: (active) => (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 1.8 : 1.4}>
        <path d="M8 2v3M16 2v3" strokeLinecap="round" />
        <rect x="3" y="4" width="18" height="17" rx="2.5" />
        <path d="M3 9h18" />
        <path d="M12 13v4M10 15h4" strokeLinecap="round" strokeWidth={1.8} />
      </svg>
    ),
  },
  {
    path: '/course',
    label: '课程',
    icon: (active) => (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 1.8 : 1.4}>
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
        {/* 竹叶暗示 */}
        <path d="M9 8c2 0 3 1.5 3 1.5s1-1.5 3-1.5" strokeLinecap="round" strokeWidth={1.2} />
        <path d="M9 12h6M9 15h4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    path: '/practice',
    label: '练习',
    icon: (active) => (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 1.8 : 1.4}>
        {/* 笛子造型 */}
        <path d="M4 12h16" strokeLinecap="round" strokeWidth={2.5} />
        <circle cx="7" cy="12" r="0.8" fill="currentColor" stroke="none" />
        <circle cx="10" cy="12" r="0.8" fill="currentColor" stroke="none" />
        <circle cx="13" cy="12" r="0.8" fill="currentColor" stroke="none" />
        <circle cx="16" cy="12" r="0.8" fill="currentColor" stroke="none" />
        <path d="M6 8c1.5 1 2 2.5 2 4M18 8c-1.5 1-2 2.5-2 4" strokeLinecap="round" strokeWidth={1} opacity={0.5} />
      </svg>
    ),
  },
  {
    path: '/tools',
    label: '工具',
    icon: (active) => (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 1.8 : 1.4}>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3" strokeLinecap="round" />
        <path d="M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    path: '/profile',
    label: '我的',
    icon: (active) => (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 1.8 : 1.4}>
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="7" r="4" />
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
      {/* 水墨渐变顶部线 */}
      <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(45,80,22,0.3) 20%, rgba(45,80,22,0.3) 80%, transparent)' }} />
      <div className="flex items-center justify-around backdrop-blur-xl bg-[#faf6ee]/90 py-2 pb-2.5">
        {tabs.map((tab) => {
          const active = isActive(tab.path)
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`relative flex flex-col items-center gap-0.5 px-3 py-1 transition-all duration-200 ${
                active
                  ? 'text-[#c0392b]'
                  : 'text-[#9b9b9b] active:text-[#5a5a5a]'
              }`}
            >
              {tab.icon(active)}
              <span className={`text-[10px] leading-tight mt-0.5 ${active ? 'font-semibold' : ''}`}
                    style={active ? { fontFamily: 'STKaiti, KaiTi, serif' } : undefined}>
                {tab.label}
              </span>
              {/* 朱砂印章小圆点 */}
              {active && (
                <span className="absolute -bottom-0.5 w-1.5 h-1.5 rounded-full bg-[#c0392b] shadow-sm" />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
