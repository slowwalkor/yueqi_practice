import type { StatsData } from '../storage/checkinStore'

interface StreakCardProps {
  stats: StatsData | null
}

export default function StreakCard({ stats }: StreakCardProps) {
  const totalHours = stats ? Math.round(stats.totalMinutes / 60 * 10) / 10 : 0

  return (
    <div className="bg-gradient-to-br from-bamboo to-bamboo-dark rounded-2xl p-5 text-white shadow-lg">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-3xl">🔥</span>
        <span className="text-3xl font-bold">
          连续 {stats?.currentStreak ?? 0} 天
        </span>
      </div>
      <div className="flex items-center gap-3 text-white/80 text-sm">
        <span>累计练习 {totalHours} 小时</span>
        <span className="w-px h-3 bg-white/40" />
        <span>共打卡 {stats?.totalDays ?? 0} 天</span>
      </div>
    </div>
  )
}
