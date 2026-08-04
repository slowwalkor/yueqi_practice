import db from './db'
import { calculateStreak } from '../utils/dateUtils'

export interface CheckinRecord {
  date: string        // YYYY-MM-DD
  practiced: boolean
  duration: number    // 分钟
  content: string     // 练习内容
  notes?: string
}

export interface StatsData {
  totalDays: number
  currentStreak: number
  longestStreak: number
  totalMinutes: number
  lastCheckinDate: string | null
}

const CHECKIN_PREFIX = 'checkin:'
const STATS_KEY = 'stats'

export async function saveCheckin(record: CheckinRecord): Promise<void> {
  const key = `${CHECKIN_PREFIX}${record.date}`
  await db.setItem(key, record)
  await updateStats()
}

export async function getCheckin(date: string): Promise<CheckinRecord | null> {
  const key = `${CHECKIN_PREFIX}${date}`
  return await db.getItem<CheckinRecord>(key)
}

export async function getCheckinRange(startDate: string, endDate: string): Promise<CheckinRecord[]> {
  const records: CheckinRecord[] = []
  const start = new Date(startDate)
  const end = new Date(endDate)

  await db.iterate<CheckinRecord, void>((value, key) => {
    if (key.startsWith(CHECKIN_PREFIX)) {
      const recordDate = key.slice(CHECKIN_PREFIX.length)
      const d = new Date(recordDate)
      if (d >= start && d <= end) {
        records.push(value)
      }
    }
  })

  return records.sort((a, b) => a.date.localeCompare(b.date))
}

export async function getStats(): Promise<StatsData> {
  const saved = await db.getItem<StatsData>(STATS_KEY)
  if (saved) return saved
  return {
    totalDays: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalMinutes: 0,
    lastCheckinDate: null
  }
}

export async function updateStats(): Promise<StatsData> {
  const allRecords: CheckinRecord[] = []

  await db.iterate<CheckinRecord, void>((value, key) => {
    if (key.startsWith(CHECKIN_PREFIX) && value.practiced) {
      allRecords.push(value)
    }
  })

  const { current, longest } = calculateStreak(allRecords)

  const stats: StatsData = {
    totalDays: allRecords.length,
    currentStreak: current,
    longestStreak: longest,
    totalMinutes: allRecords.reduce((sum, r) => sum + r.duration, 0),
    lastCheckinDate: allRecords.length > 0
      ? allRecords.sort((a, b) => b.date.localeCompare(a.date))[0].date
      : null
  }

  await db.setItem(STATS_KEY, stats)
  return stats
}
