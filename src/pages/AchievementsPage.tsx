import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ACHIEVEMENTS, CATEGORY_NAMES, LEVEL_NAMES } from '../data/achievements'
import type { Achievement } from '../data/achievements'
import {
  getGamificationData,
  getLevelFromXP,
  getLevelProgress,
  getNextLevelXP,
  getXPForLevel,
  getAchievementProgress,
} from '../storage/gamificationStore'
import type { GamificationData } from '../storage/gamificationStore'
import { getStats } from '../storage/checkinStore'
import type { StatsData } from '../storage/checkinStore'

type TabCategory = 'all' | Achievement['category']

const TABS: { key: TabCategory; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'checkin', label: '打卡' },
  { key: 'practice', label: '练习' },
  { key: 'skill', label: '技巧' },
  { key: 'collection', label: '曲目' },
  { key: 'course', label: '课程' },
]

export default function AchievementsPage() {
  const navigate = useNavigate()
  const [data, setData] = useState<GamificationData | null>(null)
  const [stats, setStats] = useState<StatsData | null>(null)
  const [activeTab, setActiveTab] = useState<TabCategory>('all')

  useEffect(() => {
    async function load() {
      const [gData, sData] = await Promise.all([
        getGamificationData(),
        getStats(),
      ])
      setData(gData)
      setStats(sData)
    }
    load()
  }, [])

  if (!data || !stats) {
    return (
      <div className="min-h-screen bg-paper-texture flex items-center justify-center">
        <div className="text-center">
          <div className="text-3xl mb-2 animate-pulse">🏆</div>
          <p className="text-ink-wash text-sm">加载中…</p>
        </div>
      </div>
    )
  }

  const level = getLevelFromXP(data.xp)
  const progress = getLevelProgress(data.xp)
  const currentLevelXP = getXPForLevel(level)
  const nextLevelXP = getNextLevelXP(level)
  const levelName = LEVEL_NAMES[Math.min(level, LEVEL_NAMES.length - 1)]

  const filteredAchievements = activeTab === 'all'
    ? ACHIEVEMENTS
    : ACHIEVEMENTS.filter(a => a.category === activeTab)

  const unlockedCount = data.unlockedAchievements.length
  const totalCount = ACHIEVEMENTS.length

  return (
    <div className="p-4 pb-24 page-enter">
      {/* 返回按钮 */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-bamboo text-sm mb-4 active:opacity-60"
      >
        <span className="text-lg">‹</span>
        <span>返回</span>
      </button>

      {/* 顶部：等级展示区 */}
      <div className="card-classical bg-paper p-5 mb-4">
        <div className="flex items-center gap-4">
          {/* 圆形进度环 */}
          <div className="relative w-20 h-20 flex-shrink-0">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
              <circle
                cx="40" cy="40" r="35"
                fill="none"
                stroke="var(--color-bamboo-100)"
                strokeWidth="6"
              />
              <circle
                cx="40" cy="40" r="35"
                fill="none"
                stroke="var(--color-gold)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 35}`}
                strokeDashoffset={`${2 * Math.PI * 35 * (1 - progress / 100)}`}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-brush font-bold text-gold">{level}</span>
              <span className="text-[10px] text-ink-wash">境</span>
            </div>
          </div>

          {/* 等级信息 */}
          <div className="flex-1">
            <h2 className="text-xl font-brush font-bold text-ink mb-1">
              第{level}境·{levelName}
            </h2>
            <p className="text-xs text-ink-wash mb-2">
              距下一境还需 {nextLevelXP - data.xp} XP
            </p>
            <div className="h-2 bg-bamboo-50 rounded-full overflow-hidden border border-bamboo-100">
              <div
                className="h-full bg-gradient-to-r from-gold to-amber rounded-full transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-ink-wash">{data.xp - currentLevelXP} XP</span>
              <span className="text-[10px] text-ink-wash">{nextLevelXP - currentLevelXP} XP</span>
            </div>
          </div>
        </div>

        {/* 今日/本周统计 */}
        <div className="flex gap-3 mt-4 pt-3 border-t border-bamboo-100/50">
          <div className="flex-1 text-center">
            <p className="text-lg font-bold text-gold">{data.dailyXP}</p>
            <p className="text-[10px] text-ink-wash">今日XP</p>
          </div>
          <div className="flex-1 text-center">
            <p className="text-lg font-bold text-bamboo">{data.weeklyXP}</p>
            <p className="text-[10px] text-ink-wash">本周XP</p>
          </div>
          <div className="flex-1 text-center">
            <p className="text-lg font-bold text-vermilion">{unlockedCount}/{totalCount}</p>
            <p className="text-[10px] text-ink-wash">已解锁</p>
          </div>
        </div>
      </div>

      {/* 成就分类 Tab */}
      <div className="flex gap-1 overflow-x-auto mb-4 pb-1 -mx-1 px-1 no-scrollbar">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              activeTab === tab.key
                ? 'bg-bamboo text-white shadow-sm'
                : 'bg-bamboo-50 text-ink-light hover:bg-bamboo-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 成就分类标题 */}
      {activeTab !== 'all' && (
        <h3 className="text-base font-brush font-bold text-ink mb-3 section-title">
          {CATEGORY_NAMES[activeTab]}
        </h3>
      )}

      {/* 成就徽章网格 */}
      <div className="grid grid-cols-2 gap-3">
        {filteredAchievements.map(achievement => {
          const isUnlocked = data.unlockedAchievements.includes(achievement.id)
          const unlockDate = data.achievementDates[achievement.id]
          const currentProgress = getAchievementProgress(achievement.id, stats, data)
          const target = achievement.condition.target
          const progressPercent = Math.min(100, (currentProgress / target) * 100)

          return (
            <div
              key={achievement.id}
              className={`card-classical p-3 transition-all ${
                isUnlocked
                  ? 'bg-gradient-to-br from-paper to-gold/5 border-gold/40 achievement-unlocked'
                  : 'bg-paper opacity-70'
              }`}
            >
              {/* 图标 */}
              <div className="flex items-start justify-between mb-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isUnlocked
                    ? 'bg-gradient-to-br from-gold/20 to-amber/20 border-2 border-gold/40'
                    : 'bg-gray-100 border border-gray-200'
                }`}>
                  <span className={`text-lg ${isUnlocked ? '' : 'grayscale opacity-50'}`}>
                    {achievement.icon}
                  </span>
                </div>
                {isUnlocked && (
                  <span className="badge-gold text-[9px]">已达成</span>
                )}
              </div>

              {/* 名称和描述 */}
              <h4 className={`text-sm font-brush font-bold mb-0.5 ${
                isUnlocked ? 'text-ink' : 'text-ink-wash'
              }`}>
                {achievement.name}
              </h4>
              <p className="text-[10px] text-ink-wash mb-2 line-clamp-1">
                {achievement.description}
              </p>

              {/* 进度条 */}
              {!isUnlocked && (achievement.condition.type === 'total_checkin_days' ||
                achievement.condition.type === 'total_practice_minutes' ||
                achievement.condition.type === 'songs_completed') ? (
                <div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-bamboo-100 rounded-full transition-all"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <p className="text-[9px] text-ink-wash mt-0.5 text-right">
                    {achievement.condition.type === 'total_practice_minutes'
                      ? `${Math.floor(currentProgress / 60)}h / ${Math.floor(target / 60)}h`
                      : `${currentProgress} / ${target}`
                    }
                  </p>
                </div>
              ) : isUnlocked ? (
                <p className="text-[9px] text-gold">
                  🗓 {unlockDate} · +{achievement.xpReward} XP
                </p>
              ) : (
                <p className="text-[9px] text-ink-wash">
                  +{achievement.xpReward} XP
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
