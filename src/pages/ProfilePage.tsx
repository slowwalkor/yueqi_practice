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
      <div className="min-h-screen bg-[#f8f4ec] flex items-center justify-center">
        <p className="text-[#2d5016] animate-pulse">加载中…</p>
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
    { icon: '🏆', label: '修炼成就', onClick: () => navigate('/achievements') },
    { icon: '📊', label: '练习报告', onClick: () => {} },
    { icon: '📤', label: '数据导出', onClick: () => handleExport() },
    { icon: '👤', label: '账号管理', onClick: () => {} },
    { icon: '⚙️', label: '设置', onClick: () => {} },
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
    <div className="min-h-screen bg-[#f8f4ec] pb-4">
      {/* 顶部头像区域 — 水墨渐变卡片 */}
      <div className="mx-4 mt-4 rounded-2xl bg-gradient-to-br from-[#1a1a2e] to-[#2d3436] p-6 text-white shadow-lg">
        {/* 头像 */}
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full border-2 border-[#c9a96e]/60 bg-gradient-to-br from-[#2d5016]/40 to-[#1a1a2e] flex items-center justify-center mb-2">
            <svg className="w-8 h-8 text-[#c9a96e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {/* 等级+境界 */}
          <p className="text-sm font-medium text-[#c9a96e]">
            Lv.{level} {levelName}·{level === 0 ? '初' : level}境
          </p>

          {/* XP 进度条 */}
          <div className="w-full mt-3">
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#c9a96e] to-[#e8d5a3] rounded-full transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-white/50">
                {xpInLevel} / {xpNeeded} XP
              </span>
              <span className="text-[10px] text-white/50">
                {Math.round(progress)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 练习统计卡片 */}
      <div className="mx-4 mt-4 rounded-xl bg-white/60 border border-[#2d5016]/10 p-4">
        <h3 className="text-sm font-semibold text-[#2d5016] mb-3" style={{ fontFamily: 'STKaiti, KaiTi, serif' }}>
          练习统计
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-2xl font-bold text-[#2d5016]">{stats.totalDays}</p>
            <p className="text-[10px] text-[#666] mt-0.5">总天数</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-[#2d5016]">{totalHours}h</p>
            <p className="text-[10px] text-[#666] mt-0.5">总时长</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-[#2d5016]">{stats.longestStreak}</p>
            <p className="text-[10px] text-[#666] mt-0.5">最长连续</p>
          </div>
        </div>
      </div>

      {/* 菜单列表 */}
      <div className="mx-4 mt-4 rounded-xl bg-white/60 border border-[#2d5016]/10 overflow-hidden">
        {menuItems.map((item, index) => (
          <button
            key={item.label}
            onClick={item.onClick}
            className={`w-full flex items-center justify-between px-4 py-3.5 hover:bg-[#2d5016]/5 transition-colors ${
              index < menuItems.length - 1 ? 'border-b border-[#2d5016]/5' : ''
            }`}
          >
            <span className="flex items-center gap-3">
              <span className="text-base">{item.icon}</span>
              <span className="text-sm text-[#333]">{item.label}</span>
            </span>
            <span className="text-[#999] text-sm">›</span>
          </button>
        ))}
      </div>

      {/* 账号状态 */}
      <div className="mx-4 mt-4 rounded-xl bg-white/60 border border-[#2d5016]/10 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[#666]">当前状态</p>
            <p className="text-sm text-[#333] mt-0.5">
              {user ? user.phone || user.email || '已登录' : isGuest ? '游客模式' : '未登录'}
            </p>
          </div>
          {(user || isGuest) && (
            <button
              onClick={async () => {
                await signOut()
                navigate('/login')
              }}
              className="text-xs text-red-500/80 border border-red-500/20 rounded-lg px-3 py-1.5 hover:bg-red-50 transition-colors"
            >
              退出登录
            </button>
          )}
        </div>
      </div>

      {/* 版本信息 */}
      <p className="text-center text-[10px] text-[#999] mt-6">
        笛韵 v1.0.0 · 竹笛学习助手
      </p>
    </div>
  )
}
