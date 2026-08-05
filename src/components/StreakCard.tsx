import type { StatsData } from '../storage/checkinStore'

const POEMS = [
  '此曲只应天上有，人间能得几回闻',
  '谁家玉笛暗飞声，散入春风满洛城',
  '羌笛何须怨杨柳，春风不度玉门关',
  '江南无所有，聊赠一枝春',
  '中军置酒饮归客，胡琴琵琶与羌笛',
  '黄鹤楼中吹玉笛，江城五月落梅花',
  '笛中闻折柳，春色未曾看',
  '牧童归去横牛背，短笛无腔信口吹',
]

function getDailyPoem(): string {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
  return POEMS[dayOfYear % POEMS.length]
}

interface StreakCardProps {
  stats: StatsData | null
}

export default function StreakCard({ stats }: StreakCardProps) {
  const totalHours = stats ? Math.round(stats.totalMinutes / 60 * 10) / 10 : 0

  return (
    <div className="relative overflow-hidden rounded-2xl p-5 text-white shadow-lg ink-gradient">
      {/* 半透明竹叶纹理装饰 */}
      <div className="absolute inset-0 opacity-[0.08]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cpath d='M30 5 C25 15 20 25 30 30 C40 25 35 15 30 5z' fill='%23fff'/%3E%3Cpath d='M45 25 C40 35 35 45 45 50 C55 45 50 35 45 25z' fill='%23fff'/%3E%3Cpath d='M10 35 C5 45 5 50 15 50 C20 45 15 40 10 35z' fill='%23fff'/%3E%3C/svg%3E")`,
        backgroundSize: '60px 60px',
      }} />
      
      <div className="relative z-10">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-brush text-lg tracking-wider opacity-90">今日修行</span>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-4xl font-bold tracking-tight" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
            {stats?.currentStreak ?? 0}
          </span>
          <span className="text-lg font-brush opacity-90">日不辍</span>
        </div>
        <div className="flex items-center gap-3 text-white/75 text-sm mb-3">
          <span>累计 {totalHours} 时辰</span>
          <span className="w-px h-3 bg-white/30" />
          <span>共习练 {stats?.totalDays ?? 0} 日</span>
        </div>
        {/* 古诗词 */}
        <p className="text-xs text-white/60 font-brush tracking-wider italic border-t border-white/10 pt-2">
          「{getDailyPoem()}」
        </p>
      </div>
    </div>
  )
}
