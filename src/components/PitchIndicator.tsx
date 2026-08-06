/**
 * 实时音准指示器 — 在 AI 跟练模式中显示于曲谱上方
 * 显示当前检测到的音高 vs 目标音高，动态偏差条
 */

import { useMemo } from 'react'

interface PitchIndicatorProps {
  targetNote: string          // 目标音符名（如 "中音1"）
  targetFreq: number          // 目标频率 Hz
  detectedFreq: number | null // 当前检测到的频率
  clarity: number             // 置信度 0-1
}

export default function PitchIndicator({ targetNote, targetFreq, detectedFreq, clarity }: PitchIndicatorProps) {
  const { centsDiff, color, label, offsetPercent } = useMemo(() => {
    if (!detectedFreq || clarity < 0.6 || targetFreq <= 0) {
      return { centsDiff: 0, color: 'bg-gray-300', label: '等待...', offsetPercent: 50 }
    }

    const cents = 1200 * Math.log2(detectedFreq / targetFreq)
    const absCents = Math.abs(cents)

    let col: string
    let lbl: string
    if (absCents <= 10) {
      col = 'bg-emerald-500'
      lbl = '准确'
    } else if (absCents <= 25) {
      col = 'bg-yellow-500'
      lbl = cents > 0 ? '偏高' : '偏低'
    } else {
      col = 'bg-red-500'
      lbl = cents > 0 ? '严重偏高' : '严重偏低'
    }

    // 将 cents 映射到 0-100 百分比（±50 cents 为满幅）
    const offset = Math.max(0, Math.min(100, 50 + (cents / 50) * 50))

    return { centsDiff: Math.round(cents), color: col, label: lbl, offsetPercent: offset }
  }, [detectedFreq, targetFreq, clarity])

  const isActive = detectedFreq !== null && clarity >= 0.6

  return (
    <div className="w-full px-4 py-2">
      {/* 标签行 */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-ink-wash">
          目标：<span className="font-medium text-ink">{targetNote || '--'}</span>
          <span className="ml-1 text-gray-400">({targetFreq > 0 ? `${targetFreq.toFixed(0)}Hz` : '--'})</span>
        </span>
        <span className={`text-xs font-medium ${isActive ? 'text-ink' : 'text-gray-400'}`}>
          {isActive ? `${label} ${centsDiff > 0 ? '+' : ''}${centsDiff}¢` : '等待吹奏...'}
        </span>
      </div>

      {/* 偏差条 */}
      <div className="relative h-3 bg-paper-warm rounded-full border border-bamboo-100/50 overflow-hidden">
        {/* 中线标记 */}
        <div className="absolute top-0 bottom-0 left-1/2 w-[2px] bg-bamboo/30 -translate-x-1/2 z-10" />

        {/* 左右区域标示 */}
        <div className="absolute inset-0 flex">
          <div className="flex-1 bg-blue-50/50 rounded-l-full" />
          <div className="flex-1 bg-red-50/50 rounded-r-full" />
        </div>

        {/* 指针 */}
        <div
          className={`absolute top-0 bottom-0 w-3 rounded-full transition-all duration-100 ${color} shadow-sm`}
          style={{
            left: `calc(${offsetPercent}% - 6px)`,
            opacity: isActive ? 1 : 0.3,
          }}
        />
      </div>

      {/* 刻度标注 */}
      <div className="flex justify-between mt-0.5 px-1">
        <span className="text-[10px] text-blue-400">低</span>
        <span className="text-[10px] text-bamboo">●</span>
        <span className="text-[10px] text-red-400">高</span>
      </div>
    </div>
  )
}
