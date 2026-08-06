import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { getToday } from '../utils/dateUtils'
import { exportAllData } from '../utils/exportData'
import StreakCard from '../components/StreakCard'
import XPBar from '../components/XPBar'
import { triggerAchievementToast } from '../components/AchievementToast'
import { addXP, checkAndUnlockAchievements, getGamificationData, getLevelFromXP } from '../storage/gamificationStore'
import { getProgress } from '../storage/progressStore'
import { CURRICULUM } from '../data/curriculum'
import { PRACTICE_SCORES } from '../data/practiceScores'
import { LEVEL_NAMES } from '../data/achievements'
import { getCheckinRange } from '../storage/checkinStore'
import type { GamificationData } from '../storage/gamificationStore'
import type { CourseProgress } from '../storage/progressStore'

const TAGS = ['长音', '音阶', '技巧', '曲目']
const DURATION_OPTIONS = [15, 30, 45, 60]

export default function CheckinPage() {
  const navigate = useNavigate()
  const { stats, todayCheckin, checkin } = useAppContext()
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [duration, setDuration] = useState(30)
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [justChecked, setJustChecked] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [exporting, setExporting] = useState(false)
  const [xpGained, setXpGained] = useState<number | null>(null)
  const [gamData, setGamData] = useState<GamificationData | null>(null)
  const [progress, setProgress] = useState<CourseProgress | null>(null)
  const [weekDays, setWeekDays] = useState<boolean[]>([])

  // 加载游戏化数据 + 课程进度
  useEffect(() => {
    getGamificationData().then(setGamData)
    getProgress().then(setProgress)
    // 加载本周7天打卡数据
    loadWeekData()
  }, [])

  // 刷新热力图时重新加载本周数据
  useEffect(() => {
    if (refreshKey > 0) loadWeekData()
  }, [refreshKey])

  const loadWeekData = async () => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    const monday = new Date(today)
    monday.setDate(today.getDate() + mondayOffset)

    const startDate = monday.toISOString().slice(0, 10)
    const endDate = getToday()
    const records = await getCheckinRange(startDate, endDate)
    const dateSet = new Set(records.filter(r => r.practiced).map(r => r.date))

    const days: boolean[] = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      const dateStr = d.toISOString().slice(0, 10)
      days.push(dateSet.has(dateStr))
    }
    setWeekDays(days)
  }

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const handleSubmit = useCallback(async () => {
    if (selectedTags.length === 0) return
    setSubmitting(true)
    try {
      await checkin({
        date: getToday(),
        practiced: true,
        duration,
        content: selectedTags.join('、'),
        notes: notes.trim() || undefined,
      })

      // XP 奖励：打卡 +20
      let totalXPGain = 20
      await addXP(20, 'checkin')

      // 练习时长 XP: 每分钟 +2
      const practiceXP = duration * 2
      totalXPGain += practiceXP
      await addXP(practiceXP, 'practice')

      // 连续7天额外奖励
      if (stats && (stats.currentStreak + 1) % 7 === 0) {
        totalXPGain += 50
        await addXP(50, 'streak_bonus')
      }

      // 显示 XP 飘字
      setXpGained(totalXPGain)
      setTimeout(() => setXpGained(null), 2000)

      // 检查成就解锁
      const updatedStats = stats ? {
        ...stats,
        totalDays: stats.totalDays + 1,
        totalMinutes: stats.totalMinutes + duration,
      } : { totalDays: 1, currentStreak: 1, longestStreak: 1, totalMinutes: duration, lastCheckinDate: getToday() }

      const newAchievements = await checkAndUnlockAchievements({ stats: updatedStats })
      if (newAchievements.length > 0) {
        triggerAchievementToast(newAchievements)
      }

      // 刷新游戏化数据
      const freshData = await getGamificationData()
      setGamData(freshData)

      setJustChecked(true)
      setRefreshKey(k => k + 1)
      setTimeout(() => setJustChecked(false), 1500)
    } finally {
      setSubmitting(false)
    }
  }, [selectedTags, duration, notes, checkin, stats])

  const isCheckedIn = !!todayCheckin

  // 推算当前课程和下一课
  const currentLesson = (() => {
    if (!progress) return null
    const phase = CURRICULUM.find(p => p.phase === progress.currentPhase)
    if (!phase) return null
    const nextLesson = phase.lessons.find(l => !progress.completedLessons.includes(l.id))
    return nextLesson ? { lesson: nextLesson, phase } : null
  })()

  // 推荐练习曲：当前阶段的第一首
  const recommendedScore = (() => {
    if (!progress) return null
    return PRACTICE_SCORES.find(s => s.phase === progress.currentPhase) || PRACTICE_SCORES[0]
  })()

  // 等级信息
  const level = gamData ? getLevelFromXP(gamData.xp) : 0
  const levelName = LEVEL_NAMES[Math.min(level, LEVEL_NAMES.length - 1)]

  // 本周打卡天数统计
  const weekCheckedCount = weekDays.filter(Boolean).length
  const monthDays = stats?.totalDays ?? 0

  return (
    <div className="p-4 pb-24 space-y-5 page-enter bg-paper-texture min-h-screen">
      {/* 顶栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* 竹叶 SVG 装饰 */}
          <svg className="w-6 h-6 text-[#2d5016]" viewBox="0 0 24 24" fill="none">
            <path d="M12 3c-3 2-4 5-3 8 1-3 4-5 7-5-2 2-3 5-2 8 1-3 3-5 6-6-3 3-4 7-3 11" 
                  stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" fill="none" />
            <path d="M10 14c-2 1-3 3-3 5" stroke="currentColor" strokeWidth={1} strokeLinecap="round" opacity={0.5} />
          </svg>
          <h1 className="text-xl font-bold tracking-wider text-[#1a3a0a]" style={{ fontFamily: 'STKaiti, KaiTi, serif' }}>
            竹韵笛声
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {gamData && (
            <span className="text-xs px-2.5 py-1 rounded-full border border-[#d4a574]/30 bg-[#d4a574]/10 text-[#8B6914] font-medium"
                  style={{ fontFamily: 'STKaiti, KaiTi, serif' }}>
              {levelName}·{level}境
            </span>
          )}
        </div>
      </div>

      {/* XP 飘字动画 */}
      {xpGained !== null && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
          <span className="text-lg font-bold text-[#d4a574] animate-xp-float">
            +{xpGained} XP
          </span>
        </div>
      )}

      {/* XP 进度条 */}
      {gamData && (
        <div className="card-guofeng p-3">
          <XPBar xp={gamData.xp} compact />
        </div>
      )}

      {/* StreakCard（保留水墨风格） */}
      <StreakCard stats={stats} />

      <div className="ink-divider" />

      {/* 今日练习计划 */}
      <div className="card-guofeng p-4 space-y-3">
        <h3 className="text-sm font-bold text-[#1a1a1a] flex items-center gap-2" style={{ fontFamily: 'STKaiti, KaiTi, serif' }}>
          <span className="text-[#2d5016] opacity-60">┃</span>今日练习计划
        </h3>

        {/* 当前课程 */}
        {currentLesson && (
          <button
            onClick={() => navigate('/course')}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#e8f4e0]/50 border border-[#2d5016]/10 active:scale-[0.98] transition-transform text-left"
          >
            <div className="w-9 h-9 rounded-full bg-[#2d5016]/10 border border-[#2d5016]/15 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-[#2d5016]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path d="M12 6.5V17M12 6.5L8 10M12 6.5l4 3.5" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="4" y="3" width="16" height="18" rx="2" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-[#9b9b9b]">当前课程 · {currentLesson.phase.title}</p>
              <p className="text-sm font-medium text-[#1a1a1a] truncate">第{currentLesson.lesson.id}课 {currentLesson.lesson.title}</p>
            </div>
            <span className="text-[#2d5016] text-xs font-medium shrink-0" style={{ fontFamily: 'STKaiti, KaiTi, serif' }}>继续 →</span>
          </button>
        )}

        {/* 推荐练习曲 */}
        {recommendedScore && (
          <button
            onClick={() => navigate('/practice')}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#d4a574]/5 border border-[#d4a574]/15 active:scale-[0.98] transition-transform text-left"
          >
            <div className="w-9 h-9 rounded-full bg-[#d4a574]/10 border border-[#d4a574]/20 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-[#8B6914]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path d="M9 18V5l12-2v13" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-[#9b9b9b]">推荐练习曲</p>
              <p className="text-sm font-medium text-[#1a1a1a] truncate">{recommendedScore.title} · {recommendedScore.difficulty}</p>
            </div>
            <span className="text-[#8B6914] text-xs font-medium shrink-0" style={{ fontFamily: 'STKaiti, KaiTi, serif' }}>练习 →</span>
          </button>
        )}
      </div>

      {/* 今日打卡区 */}
      {isCheckedIn ? (
        <div
          className={`card-guofeng p-5 text-center transition-transform duration-300 ${
            justChecked ? 'scale-105' : 'scale-100'
          }`}
        >
          <div className="w-12 h-12 mx-auto rounded-full bg-[#2d5016]/10 flex items-center justify-center mb-2">
            <svg className="w-6 h-6 text-[#2d5016]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-[#2d5016] mb-1" style={{ fontFamily: 'STKaiti, KaiTi, serif' }}>今日已完成练习</h3>
          <p className="text-[#4a4a4a] text-sm">
            {todayCheckin.content} · {todayCheckin.duration}分钟
          </p>
          {todayCheckin.notes && (
            <p className="text-[#9b9b9b] text-xs mt-1.5 italic">"{todayCheckin.notes}"</p>
          )}
        </div>
      ) : (
        <div className="card-guofeng p-4 space-y-4">
          <h3 className="text-sm font-bold text-[#1a1a1a] flex items-center gap-2" style={{ fontFamily: 'STKaiti, KaiTi, serif' }}>
            <span className="text-[#2d5016] opacity-60">┃</span>今日打卡
          </h3>

          {/* 横向标签pills — 朱砂选中态 */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  selectedTags.includes(tag)
                    ? 'bg-[#c0392b] text-white shadow-md scale-105'
                    : 'bg-transparent text-[#4a4a4a] border border-[#4a4a4a]/30'
                }`}
                style={selectedTags.includes(tag) ? { fontFamily: 'STKaiti, KaiTi, serif' } : undefined}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* 时长按钮组 */}
          <div>
            <p className="text-xs text-[#9b9b9b] mb-2">练习时长</p>
            <div className="flex gap-2">
              {DURATION_OPTIONS.map(d => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    duration === d
                      ? 'bg-[#2d5016] text-white shadow-sm'
                      : 'bg-[#f0f7ed] text-[#4a4a4a] border border-[#d4e8cc]'
                  }`}
                >
                  {d}分
                </button>
              ))}
            </div>
          </div>

          {/* 备注 */}
          <input
            type="text"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="今天练了什么？（可选）"
            className="w-full px-3 py-2.5 border-b border-[#2d5016]/20 bg-transparent text-sm focus:outline-none focus:border-[#2d5016]/50 transition-colors placeholder:text-[#9b9b9b]"
          />

          {/* 提交按钮 */}
          <button
            onClick={handleSubmit}
            disabled={selectedTags.length === 0 || submitting}
            className={`w-full py-3 rounded-xl font-bold text-base transition-all ${
              selectedTags.length === 0
                ? 'bg-[#9b9b9b]/30 text-[#9b9b9b] cursor-not-allowed'
                : submitting
                ? 'btn-bamboo opacity-70 scale-95'
                : 'btn-bamboo active:scale-95'
            }`}
            style={{ fontFamily: 'STKaiti, KaiTi, serif' }}
          >
            {submitting ? '提交中...' : '完成打卡'}
          </button>
        </div>
      )}

      <div className="ink-divider" />

      {/* 本周练习（迷你热力图 - 圆形格子） */}
      <div className="card-guofeng p-4">
        <h3 className="text-sm font-bold text-[#1a1a1a] flex items-center gap-2 mb-3" style={{ fontFamily: 'STKaiti, KaiTi, serif' }}>
          <span className="text-[#2d5016] opacity-60">┃</span>本周练习
        </h3>
        <div className="flex items-center gap-2 mb-3">
          {['一', '二', '三', '四', '五', '六', '日'].map((day, i) => {
            const today = new Date()
            const dayOfWeek = today.getDay()
            const currentDayIdx = dayOfWeek === 0 ? 6 : dayOfWeek - 1
            const isFuture = i > currentDayIdx
            const isToday = i === currentDayIdx
            return (
              <div key={day} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-[10px] text-[#9b9b9b]">{day}</span>
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                    isFuture
                      ? 'bg-[#f0e8d8] text-[#ccc]'
                      : weekDays[i]
                      ? 'bg-gradient-to-br from-[#4a7c23] to-[#2d5016] text-white shadow-sm'
                      : isToday
                      ? 'border-2 border-[#2d5016]/40 text-[#2d5016] bg-[#e8f4e0]'
                      : 'bg-[#f0e8d8] text-[#9b9b9b]'
                  }`}
                >
                  {weekDays[i] ? '✓' : isToday ? '' : '·'}
                </div>
              </div>
            )
          })}
        </div>
        <div className="flex items-center gap-3 text-xs text-[#9b9b9b] pt-2 border-t border-[#2d5016]/8">
          <span>本周 {weekCheckedCount} 天</span>
          <span className="w-px h-3 bg-[#9b9b9b]/30" />
          <span>累计 {monthDays} 天</span>
        </div>
      </div>

      {/* 数据导出 */}
      <div className="card-guofeng p-3">
        <button
          onClick={async () => {
            setExporting(true)
            try {
              await exportAllData()
            } finally {
              setExporting(false)
            }
          }}
          disabled={exporting}
          className="w-full py-2.5 bg-[#f0e8d8] text-[#4a4a4a] rounded-lg font-medium text-xs active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {exporting ? '导出中...' : '导出练习数据'}
        </button>
      </div>
    </div>
  )
}
