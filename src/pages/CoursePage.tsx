import { useState, useEffect } from 'react'
import CourseTimeline from '../components/CourseTimeline'
import { getProgress } from '../storage/progressStore'
import { CURRICULUM } from '../data/curriculum'
import type { CourseProgress } from '../storage/progressStore'

export default function CoursePage() {
  const [progress, setProgress] = useState<CourseProgress | null>(null)

  useEffect(() => {
    getProgress().then(setProgress)
  }, [])

  // 计算总课程数和完成数
  const totalLessons = CURRICULUM.reduce((sum, p) => sum + p.lessons.length, 0)
  const completedCount = progress?.completedLessons.length ?? 0
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0
  const currentPhase = progress ? CURRICULUM.find(p => p.phase === progress.currentPhase) : null

  return (
    <div className="p-4 pb-24 max-w-lg mx-auto page-enter bg-paper-texture min-h-screen">
      {/* 卷轴标题区 */}
      <div className="mb-5 text-center relative py-4">
        {/* 上方金色线+卷轴装饰 */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-[#d4a574] text-xs">◎</span>
          <div className="flex-1 max-w-[120px] h-px bg-gradient-to-r from-transparent via-[#d4a574] to-transparent" />
          <span className="text-[#d4a574] text-xs">━</span>
          <div className="flex-1 max-w-[120px] h-px bg-gradient-to-r from-transparent via-[#d4a574] to-transparent" />
          <span className="text-[#d4a574] text-xs">◎</span>
        </div>
        <h1 className="text-2xl font-bold text-[#1a3a0a] tracking-widest" style={{ fontFamily: 'STKaiti, KaiTi, serif' }}>
          课程路线
        </h1>
        <p className="text-xs text-[#9b9b9b] mt-1.5 tracking-wide">六月习笛 · 从入门到演奏</p>
        {/* 下方金色线+卷轴装饰 */}
        <div className="flex items-center justify-center gap-2 mt-3">
          <span className="text-[#d4a574] text-xs">◎</span>
          <div className="flex-1 max-w-[120px] h-px bg-gradient-to-r from-transparent via-[#d4a574] to-transparent" />
          <span className="text-[#d4a574] text-xs">━</span>
          <div className="flex-1 max-w-[120px] h-px bg-gradient-to-r from-transparent via-[#d4a574] to-transparent" />
          <span className="text-[#d4a574] text-xs">◎</span>
        </div>
      </div>

      {/* 进度概览卡片 */}
      {progress && (
        <div className="card-guofeng p-4 mb-5">
          <h3 className="text-sm font-bold text-[#1a1a1a] flex items-center gap-2 mb-3" style={{ fontFamily: 'STKaiti, KaiTi, serif' }}>
            <span className="text-[#2d5016] opacity-60">┃</span>总体进度
          </h3>
          <div className="flex items-center gap-4">
            {/* 环形进度 - 墨绿色描边 */}
            <div className="relative w-16 h-16 shrink-0">
              <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18" cy="18" r="15.5"
                  fill="none"
                  stroke="#e8f4e0"
                  strokeWidth="3"
                />
                <circle
                  cx="18" cy="18" r="15.5"
                  fill="none"
                  stroke="#2d5016"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${progressPercent * 0.974} 97.4`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-[#2d5016]" style={{ fontFamily: 'STKaiti, KaiTi, serif' }}>
                  {progressPercent}%
                </span>
              </div>
            </div>
            {/* 文字说明 */}
            <div className="flex-1">
              <p className="text-sm text-[#1a1a1a] font-medium">
                已完成 {completedCount} 课 / 共 {totalLessons} 课
              </p>
              {currentPhase && (
                <p className="text-xs text-[#9b9b9b] mt-1">
                  当前：第{currentPhase.phase}阶段 · {currentPhase.title}
                </p>
              )}
              <p className="text-xs text-[#9b9b9b] mt-0.5">
                目标：{currentPhase?.goal ?? '系统学习竹笛'}
              </p>
            </div>
          </div>
        </div>
      )}

      <CourseTimeline />
    </div>
  )
}
