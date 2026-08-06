/**
 * 练习报告弹窗 — AI跟练结束后展示评分结果
 * 国风UI：毛笔评级字体、印章风格徽章、纸纹背景
 */

import { useEffect, useState } from 'react'
import type { PracticeResult, NoteScore } from '../audio/PracticeScorer'

interface PracticeReportProps {
  result: PracticeResult
  onRetry: () => void
  onBack: () => void
}

// 评级颜色映射
const GRADE_STYLES: Record<string, { bg: string; text: string; ring: string }> = {
  S: { bg: 'bg-gradient-to-br from-yellow-400 to-amber-600', text: 'text-amber-900', ring: 'ring-amber-400' },
  A: { bg: 'bg-gradient-to-br from-emerald-400 to-green-600', text: 'text-emerald-900', ring: 'ring-emerald-400' },
  B: { bg: 'bg-gradient-to-br from-blue-400 to-indigo-600', text: 'text-blue-900', ring: 'ring-blue-400' },
  C: { bg: 'bg-gradient-to-br from-orange-400 to-orange-600', text: 'text-orange-900', ring: 'ring-orange-400' },
  D: { bg: 'bg-gradient-to-br from-gray-400 to-gray-600', text: 'text-gray-900', ring: 'ring-gray-400' },
}

// 评级文字
const GRADE_LABEL: Record<string, string> = {
  S: '卓越',
  A: '优秀',
  B: '良好',
  C: '及格',
  D: '需努力',
}

// 圆形进度环
function ScoreRing({ score, grade }: { score: number; grade: string }) {
  const [animatedScore, setAnimatedScore] = useState(0)
  const circumference = 2 * Math.PI * 54  // r=54
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 100)
    return () => clearTimeout(timer)
  }, [score])

  const gradeStyle = GRADE_STYLES[grade] || GRADE_STYLES.D

  return (
    <div className="relative flex items-center justify-center">
      <svg width="140" height="140" className="transform -rotate-90">
        {/* 背景圈 */}
        <circle
          cx="70" cy="70" r="54"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-bamboo-100"
        />
        {/* 进度圈 */}
        <circle
          cx="70" cy="70" r="54"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          className="text-bamboo transition-all duration-1000 ease-out"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      {/* 中心内容 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-ink">{animatedScore}</span>
        <span className="text-xs text-ink-wash">分</span>
      </div>
      {/* 评级印章 */}
      <div className={`absolute -top-2 -right-2 w-10 h-10 rounded-full ${gradeStyle.bg} flex items-center justify-center shadow-lg ring-2 ${gradeStyle.ring}`}>
        <span className="text-white font-bold text-lg font-brush">{grade}</span>
      </div>
    </div>
  )
}

// 偏差条形图
function DeviationBar({ noteScore }: { noteScore: NoteScore }) {
  if (noteScore.status === 'missed') {
    return (
      <div className="flex items-center gap-1 py-0.5">
        <span className="w-5 text-[10px] text-gray-400 text-center">{noteScore.noteIndex + 1}</span>
        <div className="flex-1 h-2 bg-gray-100 rounded-full relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[8px] text-gray-400">漏</span>
          </div>
        </div>
      </div>
    )
  }

  const cents = noteScore.centsDiff
  // 映射到 -100% ~ +100%
  const widthPercent = Math.min(100, Math.abs(cents) * 2)
  const isHigh = cents > 0
  const barColor = Math.abs(cents) <= 10 ? 'bg-emerald-400' : (Math.abs(cents) <= 25 ? 'bg-yellow-400' : (isHigh ? 'bg-red-400' : 'bg-blue-400'))

  return (
    <div className="flex items-center gap-1 py-0.5">
      <span className="w-5 text-[10px] text-gray-500 text-center">{noteScore.noteIndex + 1}</span>
      <div className="flex-1 h-2 bg-gray-50 rounded-full relative overflow-hidden">
        {/* 中线 */}
        <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-gray-300" />
        {/* 偏差条 */}
        <div
          className={`absolute top-0 bottom-0 ${barColor} rounded-full transition-all duration-300`}
          style={{
            width: `${widthPercent / 2}%`,
            left: isHigh ? '50%' : `${50 - widthPercent / 2}%`,
          }}
        />
      </div>
    </div>
  )
}

export default function PracticeReport({ result, onRetry, onBack }: PracticeReportProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-paper rounded-2xl shadow-2xl overflow-hidden card-classical animate-[fadeSlideUp_0.4s_ease-out]">
        {/* 纸纹头部 */}
        <div className="bg-paper-texture p-6 text-center border-b border-bamboo-100/50">
          {/* 标题 */}
          <h2 className="text-lg font-brush text-ink mb-1">练习报告</h2>
          <p className="text-xs text-ink-wash">{result.scoreTitle}</p>

          {/* 分数环 */}
          <div className="flex justify-center my-4">
            <ScoreRing score={result.totalScore} grade={result.grade} />
          </div>

          {/* 评级文字 */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bamboo-50 border border-bamboo-100">
            <span className="text-sm font-medium text-bamboo">{GRADE_LABEL[result.grade]}</span>
            <span className="text-xs text-ink-wash">平均偏差 {result.avgCentsDiff}¢</span>
          </div>
        </div>

        {/* 统计区 */}
        <div className="px-6 py-4">
          <div className="grid grid-cols-4 gap-2 mb-4">
            <StatItem icon="✓" label="完美" count={result.perfectCount} color="text-emerald-600" />
            <StatItem icon="○" label="良好" count={result.goodCount} color="text-blue-600" />
            <StatItem icon="△" label="偏差" count={result.offCount} color="text-yellow-600" />
            <StatItem icon="✗" label="漏掉" count={result.missedCount} color="text-red-500" />
          </div>

          {/* 偏差条形图（最多显示前20个音符） */}
          <div className="mb-4">
            <h3 className="text-xs text-ink-wash mb-2 flex items-center gap-1">
              <span>音准分布</span>
              <span className="text-[10px] text-gray-400">(蓝=偏低 绿=准确 红=偏高)</span>
            </h3>
            <div className="max-h-32 overflow-y-auto pr-1 space-y-0.5">
              {result.noteScores.slice(0, 24).map((ns, i) => (
                <DeviationBar key={i} noteScore={ns} />
              ))}
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 min-h-[44px] py-2.5 rounded-xl border border-bamboo-100 text-sm font-medium text-ink-light active:scale-95 transition-transform"
          >
            返回
          </button>
          <button
            onClick={onRetry}
            className="flex-1 min-h-[44px] py-2.5 rounded-xl btn-primary text-sm active:scale-95 transition-transform"
          >
            再练一次
          </button>
        </div>
      </div>
    </div>
  )
}

// 统计项小组件
function StatItem({ icon, label, count, color }: { icon: string; label: string; count: number; color: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className={`text-lg font-bold ${color}`}>{count}</span>
      <span className="text-[10px] text-gray-500 flex items-center gap-0.5">
        <span>{icon}</span>
        <span>{label}</span>
      </span>
    </div>
  )
}
