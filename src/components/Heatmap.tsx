import { useEffect, useState, useMemo } from 'react'
import { getCheckinRange } from '../storage/checkinStore'
import type { CheckinRecord } from '../storage/checkinStore'
import { getToday, getMonthsAgo, formatDate } from '../utils/dateUtils'

function getDurationLevel(minutes: number): number {
  if (minutes === 0) return 0
  if (minutes <= 15) return 1
  if (minutes <= 30) return 2
  return 3
}

const LEVEL_COLORS = [
  'bg-paper-warm',
  'bg-bamboo-100',
  'bg-bamboo-light',
  'bg-bamboo',
]

interface HeatmapProps {
  refreshKey?: number
}

export default function Heatmap({ refreshKey }: HeatmapProps) {
  const [records, setRecords] = useState<CheckinRecord[]>([])

  const startDate = useMemo(() => getMonthsAgo(3), [])
  const endDate = useMemo(() => getToday(), [])

  useEffect(() => {
    getCheckinRange(startDate, endDate).then(setRecords)
  }, [startDate, endDate, refreshKey])

  // Build date->duration map
  const dateMap = useMemo(() => {
    const map = new Map<string, number>()
    records.forEach(r => {
      if (r.practiced) map.set(r.date, r.duration)
    })
    return map
  }, [records])

  // Build grid: columns are weeks, rows are days of week (Mon=0, Sun=6)
  const grid = useMemo(() => {
    const start = new Date(startDate)
    const end = new Date(endDate)

    // Adjust start to Monday
    const startDay = start.getDay()
    const mondayOffset = startDay === 0 ? -6 : 1 - startDay
    start.setDate(start.getDate() + mondayOffset)

    const weeks: { date: string; level: number }[][] = []
    const current = new Date(start)

    while (current <= end) {
      const week: { date: string; level: number }[] = []
      for (let d = 0; d < 7; d++) {
        const dateStr = formatDate(current)
        const minutes = dateMap.get(dateStr) || 0
        week.push({ date: dateStr, level: getDurationLevel(minutes) })
        current.setDate(current.getDate() + 1)
      }
      weeks.push(week)
    }

    return weeks
  }, [startDate, endDate, dateMap])

  // Month labels
  const monthLabels = useMemo(() => {
    const labels: { text: string; col: number }[] = []
    let lastMonth = -1
    grid.forEach((week, colIdx) => {
      const firstDay = new Date(week[0].date)
      const month = firstDay.getMonth()
      if (month !== lastMonth) {
        lastMonth = month
        labels.push({
          text: `${month + 1}月`,
          col: colIdx,
        })
      }
    })
    return labels
  }, [grid])

  return (
    <div className="card-classical bg-paper p-4">
      <h3 className="text-sm font-brush font-medium text-ink-light mb-3">练习热力图</h3>

      {/* Month labels */}
      <div className="flex mb-1 text-xs text-gray-400" style={{ paddingLeft: '0px' }}>
        <div className="grid gap-[3px]" style={{ gridTemplateColumns: `repeat(${grid.length}, minmax(0, 1fr))` }}>
          {grid.map((_, colIdx) => {
            const label = monthLabels.find(l => l.col === colIdx)
            return (
              <div key={colIdx} className="w-3 text-center text-[10px]">
                {label ? label.text : ''}
              </div>
            )
          })}
        </div>
      </div>

      {/* Heatmap grid */}
      <div className="overflow-x-auto">
        <div
          className="grid gap-[3px]"
          style={{
            gridTemplateColumns: `repeat(${grid.length}, 12px)`,
            gridTemplateRows: 'repeat(7, 12px)',
          }}
        >
          {/* Render column by column (transposed) */}
          {Array.from({ length: 7 }).map((_, rowIdx) =>
            grid.map((week, colIdx) => {
              const cell = week[rowIdx]
              const today = getToday()
              const isFuture = cell.date > today
              return (
                <div
                  key={`${colIdx}-${rowIdx}`}
                  className={`w-3 h-3 rounded-sm ${isFuture ? 'bg-gray-100' : LEVEL_COLORS[cell.level]}`}
                  title={`${cell.date}: ${dateMap.get(cell.date) || 0}分钟`}
                />
              )
            })
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1 mt-3 text-xs text-gray-400">
        <span>少</span>
        {LEVEL_COLORS.map((color, i) => (
          <div key={i} className={`w-3 h-3 rounded-sm ${color}`} />
        ))}
        <span>多</span>
      </div>
    </div>
  )
}
