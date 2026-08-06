import { getLevelFromXP, getLevelProgress, getNextLevelXP, getXPForLevel } from '../storage/gamificationStore'
import { LEVEL_NAMES } from '../data/achievements'

interface XPBarProps {
  xp: number;
  compact?: boolean;
}

export default function XPBar({ xp, compact = false }: XPBarProps) {
  const level = getLevelFromXP(xp)
  const progress = getLevelProgress(xp)
  const currentLevelXP = getXPForLevel(level)
  const nextLevelXP = getNextLevelXP(level)
  const levelName = LEVEL_NAMES[Math.min(level, LEVEL_NAMES.length - 1)]

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs font-brush text-gold font-bold whitespace-nowrap">
          {levelName}·{level}境
        </span>
        <div className="flex-1 h-2 bg-bamboo-50 rounded-full overflow-hidden border border-bamboo-100">
          <div
            className="h-full bg-gradient-to-r from-gold to-amber rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-[10px] text-ink-wash whitespace-nowrap">
          {xp - currentLevelXP}/{nextLevelXP - currentLevelXP}
        </span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full border-2 border-gold/60 bg-gradient-to-br from-amber/10 to-gold/10 flex items-center justify-center">
        <span className="text-sm font-brush font-bold text-gold">{level}</span>
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-brush font-medium text-ink">
            {levelName}·第{level}境
          </span>
          <span className="text-xs text-ink-wash">
            {xp - currentLevelXP} / {nextLevelXP - currentLevelXP} XP
          </span>
        </div>
        <div className="h-2.5 bg-bamboo-50 rounded-full overflow-hidden border border-bamboo-100">
          <div
            className="h-full bg-gradient-to-r from-gold to-amber rounded-full transition-all duration-700 ease-out xp-bar-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}
