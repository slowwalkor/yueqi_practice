import db from './db'
import { ACHIEVEMENTS } from '../data/achievements'
import type { StatsData } from './checkinStore'

export interface GamificationData {
  xp: number;
  level: number;
  unlockedAchievements: string[];
  achievementDates: Record<string, string>;
  dailyXP: number;
  dailyXPDate: string;
  weeklyXP: number;
  weeklyXPStart: string;
  totalPracticeMinutes: number;
  totalSongsCompleted: number;
  bestStreak: number;
}

const GAMIFICATION_KEY = 'gamification'

function getDefaultData(): GamificationData {
  const today = new Date().toISOString().slice(0, 10)
  return {
    xp: 0,
    level: 0,
    unlockedAchievements: [],
    achievementDates: {},
    dailyXP: 0,
    dailyXPDate: today,
    weeklyXP: 0,
    weeklyXPStart: getWeekStart(),
    totalPracticeMinutes: 0,
    totalSongsCompleted: 0,
    bestStreak: 0,
  }
}

function getWeekStart(): string {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(now.setDate(diff))
  return monday.toISOString().slice(0, 10)
}

/** 根据 XP 计算等级: level = floor(sqrt(xp / 50)) */
export function getLevelFromXP(xp: number): number {
  return Math.floor(Math.sqrt(xp / 50))
}

/** 给定等级所需的总 XP */
export function getXPForLevel(level: number): number {
  return level * level * 50
}

/** 下一级所需总 XP */
export function getNextLevelXP(level: number): number {
  return (level + 1) * (level + 1) * 50
}

/** 获取等级进度百分比 */
export function getLevelProgress(xp: number): number {
  const level = getLevelFromXP(xp)
  const currentLevelXP = getXPForLevel(level)
  const nextLevelXP = getNextLevelXP(level)
  const range = nextLevelXP - currentLevelXP
  if (range <= 0) return 100
  return Math.min(100, ((xp - currentLevelXP) / range) * 100)
}

export async function getGamificationData(): Promise<GamificationData> {
  const saved = await db.getItem<GamificationData>(GAMIFICATION_KEY)
  if (!saved) return getDefaultData()

  const today = new Date().toISOString().slice(0, 10)
  const weekStart = getWeekStart()

  // 重置每日/每周 XP 如果日期已过
  if (saved.dailyXPDate !== today) {
    saved.dailyXP = 0
    saved.dailyXPDate = today
  }
  if (saved.weeklyXPStart !== weekStart) {
    saved.weeklyXP = 0
    saved.weeklyXPStart = weekStart
  }

  return saved
}

export async function addXP(amount: number, _source: string): Promise<GamificationData> {
  const data = await getGamificationData()
  data.xp += amount
  data.dailyXP += amount
  data.weeklyXP += amount
  data.level = getLevelFromXP(data.xp)
  await db.setItem(GAMIFICATION_KEY, data)
  return data
}

export interface AchievementContext {
  stats: StatsData;
  totalPracticeMinutes?: number;
  totalSongsCompleted?: number;
  lessonsCompleted?: number;
  stagesCompleted?: number;
  allCoursesCompleted?: boolean;
  firstRecording?: boolean;
  aiGradeA?: boolean;
  aiGradeS?: boolean;
  perfectNotesStreak?: number;
}

/**
 * 检查并解锁成就，返回新解锁的成就ID列表
 */
export async function checkAndUnlockAchievements(
  context: AchievementContext
): Promise<string[]> {
  const data = await getGamificationData()
  const newlyUnlocked: string[] = []

  // 更新统计数据
  data.totalPracticeMinutes = context.stats.totalMinutes
  data.bestStreak = Math.max(data.bestStreak, context.stats.longestStreak)
  if (context.totalSongsCompleted !== undefined) {
    data.totalSongsCompleted = context.totalSongsCompleted
  }

  for (const achievement of ACHIEVEMENTS) {
    if (data.unlockedAchievements.includes(achievement.id)) continue

    let met = false
    const { type, target } = achievement.condition

    switch (type) {
      case 'total_checkin_days':
        met = context.stats.totalDays >= target
        break
      case 'total_practice_minutes':
        met = context.stats.totalMinutes >= target
        break
      case 'songs_completed':
        met = (context.totalSongsCompleted ?? data.totalSongsCompleted) >= target
        break
      case 'lessons_completed':
        met = (context.lessonsCompleted ?? 0) >= target
        break
      case 'stages_completed':
        met = (context.stagesCompleted ?? 0) >= target
        break
      case 'all_courses_completed':
        met = context.allCoursesCompleted === true
        break
      case 'first_recording':
        met = context.firstRecording === true
        break
      case 'ai_grade_a':
        met = context.aiGradeA === true
        break
      case 'ai_grade_s':
        met = context.aiGradeS === true
        break
      case 'perfect_notes_streak':
        met = (context.perfectNotesStreak ?? 0) >= target
        break
    }

    if (met) {
      data.unlockedAchievements.push(achievement.id)
      data.achievementDates[achievement.id] = new Date().toISOString().slice(0, 10)
      data.xp += achievement.xpReward
      data.dailyXP += achievement.xpReward
      data.weeklyXP += achievement.xpReward
      newlyUnlocked.push(achievement.id)
    }
  }

  data.level = getLevelFromXP(data.xp)
  await db.setItem(GAMIFICATION_KEY, data)
  return newlyUnlocked
}

/** 获取某个成就的当前进度值 */
export function getAchievementProgress(
  achievementId: string,
  stats: StatsData,
  data: GamificationData
): number {
  const achievement = ACHIEVEMENTS.find(a => a.id === achievementId)
  if (!achievement) return 0

  const { type } = achievement.condition

  switch (type) {
    case 'total_checkin_days':
      return stats.totalDays
    case 'total_practice_minutes':
      return stats.totalMinutes
    case 'songs_completed':
      return data.totalSongsCompleted
    default:
      return 0
  }
}
