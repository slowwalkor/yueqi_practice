import { useState, useEffect } from 'react'
import { ACHIEVEMENTS } from '../data/achievements'

interface ToastItem {
  id: string;
  achievementId: string;
  visible: boolean;
}

let toastCallback: ((achievementIds: string[]) => void) | null = null

/** 外部调用此函数触发成就 toast */
export function triggerAchievementToast(achievementIds: string[]) {
  if (toastCallback) {
    toastCallback(achievementIds)
  }
}

export default function AchievementToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  useEffect(() => {
    toastCallback = (achievementIds: string[]) => {
      const newToasts = achievementIds.map((aid, idx) => ({
        id: `${aid}-${Date.now()}-${idx}`,
        achievementId: aid,
        visible: false,
      }))
      setToasts(prev => [...prev, ...newToasts])

      // 逐个显示
      newToasts.forEach((toast, idx) => {
        setTimeout(() => {
          setToasts(prev =>
            prev.map(t => t.id === toast.id ? { ...t, visible: true } : t)
          )
        }, idx * 300)

        // 3秒后隐藏
        setTimeout(() => {
          setToasts(prev =>
            prev.map(t => t.id === toast.id ? { ...t, visible: false } : t)
          )
        }, 3000 + idx * 300)

        // 3.5秒后移除
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== toast.id))
        }, 3500 + idx * 300)
      })
    }

    return () => { toastCallback = null }
  }, [])

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center pointer-events-none pt-safe">
      {toasts.map(toast => {
        const achievement = ACHIEVEMENTS.find(a => a.id === toast.achievementId)
        if (!achievement) return null

        return (
          <div
            key={toast.id}
            className={`mt-3 px-5 py-3 rounded-xl border-2 border-gold/60 bg-paper shadow-lg shadow-gold/20 transform transition-all duration-500 pointer-events-auto ${
              toast.visible
                ? 'translate-y-0 opacity-100 scale-100'
                : '-translate-y-8 opacity-0 scale-90'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold/20 to-amber/20 border-2 border-gold/40 flex items-center justify-center achievement-stamp">
                <span className="text-xl">{achievement.icon}</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-brush font-bold text-ink text-sm">
                    {achievement.name}
                  </span>
                  <span className="text-xs text-vermilion font-bold">达成！</span>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-xs text-gold font-medium">
                    +{achievement.xpReward} XP
                  </span>
                  <span className="text-[10px] text-ink-wash">
                    {achievement.description}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
