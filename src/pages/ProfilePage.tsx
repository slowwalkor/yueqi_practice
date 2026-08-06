import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getGamificationData, getLevelFromXP, getLevelProgress, getXPForLevel, getNextLevelXP } from '../storage/gamificationStore'
import { getStats } from '../storage/checkinStore'
import { LEVEL_NAMES } from '../data/achievements'
import type { GamificationData } from '../storage/gamificationStore'
import type { StatsData } from '../storage/checkinStore'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, isGuest, signOut } = useAuth()
  const [gamData, setGamData] = useState<GamificationData | null>(null)
  const [stats, setStats] = useState<StatsData | null>(null)

  useEffect(() => {
    async function loadData() {
      const [g, s] = await Promise.all([getGamificationData(), getStats()])
      setGamData(g)
      setStats(s)
    }
    loadData()
  }, [])

  if (!gamData || !stats) {
    return (
      <div className="min-h-screen bg-[#faf6ee] flex items-center justify-center">
        <p className="text-[#2d5016] animate-pulse" style={{ fontFamily: 'STKaiti, KaiTi, serif' }}>加载中…</p>
      </div>
    )
  }

  const level = getLevelFromXP(gamData.xp)
  const progress = getLevelProgress(gamData.xp)
  const currentLevelXP = getXPForLevel(level)
  const nextLevelXP = getNextLevelXP(level)
  const levelName = LEVEL_NAMES[Math.min(level, LEVEL_NAMES.length - 1)]
  const xpInLevel = gamData.xp - currentLevelXP
  const xpNeeded = nextLevelXP - currentLevelXP
  const totalHours = (stats.totalMinutes / 60).toFixed(1)

  const menuItems = [
    { icon: <TrophyIcon />, label: '修炼成就', onClick: () => navigate('/achievements') },
    { icon: <ChartIcon />, label: '练习报告', onClick: () => {} },
    { icon: <ExportIcon />, label: '数据导出', onClick: () => handleExport() },
    { icon: <UserIcon />, label: '账号管理', onClick: () => {} },
    { icon: <GearIcon />, label: '设置', onClick: () => {} },
  ]

  function handleExport() {
    const exportData = {
      stats,
      gamification: {
        xp: gamData!.xp,
        level,
        levelName,
        achievements: gamData!.unlockedAchievements.length,
      },
      exportedAt: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `zhudi-data-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-paper-texture pb-24 page-enter">
      {/* 顶部个人信息卡片 — 深色水墨渐变+竹叶暗纹 */}
      <div className="mx-4 mt-4 rounded-2xl overflow-hidden relative shadow-lg">
        {/* 深色水墨背景 */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f1a0a] via-[#1a2e14] to-[#2d3436]" />
        {/* 竹叶暗纹装饰 */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.06]" viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice">
          <path d="M20 80c10-20 25-30 40-25s20 15 10 30" fill="white" />
          <path d="M150 30c-10 15-25 20-35 15s-10-15 0-25" fill="white" />
          <path d="M100 90c5-15 15-20 25-18s12 12 5 22" fill="white" />
          <path d="M170 80c-8 10-18 12-25 8s-5-12 3-18" fill="white" />
        </svg>
        
        <div className="relative p-6 text-white">
          {/* 头像 */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full border-2 border-[#d4a574]/50 bg-gradient-to-br from-[#2d5016]/30 to-transparent flex items-center justify-center mb-3">
              <svg className="w-8 h-8 text-[#d4a574]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>

            {/* 等级名称 — 楷体大字 */}
            <p className="text-lg font-bold text-[#d4a574] tracking-wider" style={{ fontFamily: 'STKaiti, KaiTi, serif' }}>
              {levelName}·{level === 0 ? '初' : level}境
            </p>
            <p className="text-[11px] text-white/40 mt-0.5">Lv.{level}</p>

            {/* XP 进度条 — 竹绿渐变 */}
            <div className="w-full mt-4">
              <div className="h-2 bg-white/10 rounded-full overflow-hidden relative">
                {/* 两端装饰小点 */}
                <div className="absolute left-0.5 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-white/20" />
                <div className="absolute right-0.5 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-white/20" />
                <div
                  className="h-full bg-gradient-to-r from-[#4a7c23] to-[#2d5016] rounded-full transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-[10px] text-white/40">
                  {xpInLevel} / {xpNeeded} XP
                </span>
                <span className="text-[10px] text-white/40">
                  {Math.round(progress)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 练习统计 — 三栏圆形 */}
      <div className="mx-4 mt-5">
        <div className="grid grid-cols-3 gap-3">
          <div className="card-guofeng p-4 flex flex-col items-center">
            <p className="text-2xl font-bold text-[#2d5016]" style={{ fontFamily: 'STKaiti, KaiTi, serif' }}>
              {stats.totalDays}
            </p>
            <p className="text-[10px] text-[#9b9b9b] mt-1" style={{ fontFamily: 'STKaiti, KaiTi, serif' }}>总天数</p>
          </div>
          <div className="card-guofeng p-4 flex flex-col items-center">
            <p className="text-2xl font-bold text-[#2d5016]" style={{ fontFamily: 'STKaiti, KaiTi, serif' }}>
              {totalHours}
            </p>
            <p className="text-[10px] text-[#9b9b9b] mt-1" style={{ fontFamily: 'STKaiti, KaiTi, serif' }}>时(h)</p>
          </div>
          <div className="card-guofeng p-4 flex flex-col items-center">
            <p className="text-2xl font-bold text-[#2d5016]" style={{ fontFamily: 'STKaiti, KaiTi, serif' }}>
              {stats.longestStreak}
            </p>
            <p className="text-[10px] text-[#9b9b9b] mt-1" style={{ fontFamily: 'STKaiti, KaiTi, serif' }}>最长连续</p>
          </div>
        </div>
      </div>

      {/* 菜单列表 — 每项用 card-guofeng */}
      <div className="mx-4 mt-5 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={item.onClick}
            className="card-guofeng w-full flex items-center justify-between px-4 py-3.5 active:scale-[0.98] transition-transform"
          >
            <span className="flex items-center gap-3">
              <span className="text-[#2d5016]">{item.icon}</span>
              <span className="text-sm text-[#1a1a1a]">{item.label}</span>
            </span>
            <svg className="w-4 h-4 text-[#9b9b9b]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ))}
      </div>

      {/* 账号状态 */}
      <div className="mx-4 mt-5 card-guofeng p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] text-[#9b9b9b]">当前状态</p>
            <p className="text-sm text-[#1a1a1a] mt-0.5">
              {user ? user.phone || user.email || '已登录' : isGuest ? '游客模式' : '未登录'}
            </p>
          </div>
          {(user || isGuest) && (
            <button
              onClick={async () => {
                await signOut()
                navigate('/login')
              }}
              className="text-xs text-[#c0392b]/80 border border-[#c0392b]/20 rounded-lg px-3 py-1.5 active:bg-[#c0392b]/5 transition-colors"
            >
              退出登录
            </button>
          )}
        </div>
      </div>

      {/* 版本信息 */}
      <p className="text-center text-[10px] text-[#9b9b9b] mt-6" style={{ fontFamily: 'STKaiti, KaiTi, serif' }}>
        竹韵笛声 v1.0.0
      </p>
    </div>
  )
}

// 水墨风 SVG 图标组件
function TrophyIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.3}>
      <path d="M8 21h8M12 17v4M17 3H7v4a5 5 0 0010 0V3z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 3H4v2a3 3 0 003 3M17 3h3v2a3 3 0 01-3 3" strokeLinecap="round" />
    </svg>
  )
}

function ChartIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.3}>
      <path d="M4 20h16M8 16V9M12 16V4M16 16v-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ExportIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.3}>
      <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.3}>
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function GearIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.3}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" strokeLinecap="round" />
    </svg>
  )
}
