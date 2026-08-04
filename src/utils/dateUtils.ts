import type { CheckinRecord } from '../storage/checkinStore'

export function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function getToday(): string {
  return formatDate(new Date())
}

export function calculateStreak(records: CheckinRecord[]): { current: number; longest: number } {
  if (records.length === 0) return { current: 0, longest: 0 }

  // Sort by date descending
  const sorted = [...records]
    .filter(r => r.practiced)
    .sort((a, b) => b.date.localeCompare(a.date))

  if (sorted.length === 0) return { current: 0, longest: 0 }

  let longest = 1
  let current = 0
  let streak = 1

  // Check if current streak includes today or yesterday
  const today = getToday()
  const yesterday = formatDate(new Date(Date.now() - 86400000))
  const latestDate = sorted[0].date

  if (latestDate === today || latestDate === yesterday) {
    current = 1
  }

  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1].date)
    const curr = new Date(sorted[i].date)
    const diffDays = (prev.getTime() - curr.getTime()) / 86400000

    if (diffDays === 1) {
      streak++
      longest = Math.max(longest, streak)
      if (i < sorted.length && (latestDate === today || latestDate === yesterday)) {
        current = streak
      }
    } else {
      streak = 1
    }
  }

  longest = Math.max(longest, streak)
  if (current === 0 && (latestDate === today || latestDate === yesterday)) {
    current = 1
  }

  return { current, longest }
}

export function getDaysInRange(start: string, end: string): string[] {
  const days: string[] = []
  const startDate = new Date(start)
  const endDate = new Date(end)

  const current = new Date(startDate)
  while (current <= endDate) {
    days.push(formatDate(current))
    current.setDate(current.getDate() + 1)
  }

  return days
}

export function getMonthsAgo(months: number): string {
  const date = new Date()
  date.setMonth(date.getMonth() - months)
  return formatDate(date)
}
