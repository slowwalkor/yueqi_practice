import { useLocation, useNavigate } from 'react-router-dom'

interface TabItem {
  path: string
  label: string
  icon: React.ReactNode
}

const tabs: TabItem[] = [
  {
    path: '/',
    label: '今天',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <rect x="3" y="4" width="18" height="17" rx="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3 9h18" strokeLinecap="round" />
        <path d="M8 2v4M16 2v4" strokeLinecap="round" />
        <circle cx="12" cy="15" r="2" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    path: '/course',
    label: '课程',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 7h8M8 11h5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    path: '/practice',
    label: '练习',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M9 18V5l12-2v13" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    ),
  },
  {
    path: '/tools',
    label: '工具',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    path: '/profile',
    label: '我的',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
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
      <div className="h-px bg-gradient-to-r from-transparent via-[#2d5016]/20 to-transparent" />
      <div className="flex items-center justify-around backdrop-blur-lg bg-[#f8f4ec]/95 py-1.5 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={`relative flex flex-col items-center gap-0.5 px-2 py-1 transition-all duration-200 ${
              isActive(tab.path)
                ? 'text-[#2d5016]'
                : 'text-[#9b9b9b] hover:text-[#6b6b6b]'
            }`}
          >
            {tab.icon}
            <span className={`text-[10px] leading-tight ${isActive(tab.path) ? 'font-semibold' : ''}`}>
              {tab.label}
            </span>
            {isActive(tab.path) && (
              <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-[#2d5016]" />
            )}
          </button>
        ))}
      </div>
    </nav>
  )
}
