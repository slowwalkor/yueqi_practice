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
    <div className="p-4 max-w-lg mx-auto page-enter">
      <div className="mb-4">
        <h1 className="text-2xl font-bold font-brush text-bamboo">课程路线</h1>
        <p className="text-sm text-ink-wash mt-1">6个月竹笛系统学习，从入门到演奏</p>
      </div>

      {/* 进度概览卡片 */}
      {progress && (
        <div className="card-classical bg-paper p-4 mb-4">
          <h3 className="text-sm font-bold font-brush text-ink section-title mb-3">总体进度</h3>
          <div className="flex items-center gap-4">
            {/* 环形进度 - CSS实现 */}
            <div className="relative w-16 h-16 shrink-0">
              <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18" cy="18" r="15.5"
                  fill="none"
                  stroke="var(--color-bamboo-100)"
                  strokeWidth="3"
                />
                <circle
                  cx="18" cy="18" r="15.5"
                  fill="none"
                  stroke="var(--color-bamboo)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${progressPercent * 0.974} 97.4`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-bamboo">{progressPercent}%</span>
              </div>
            </div>
            {/* 文字说明 */}
            <div className="flex-1">
              <p className="text-sm text-ink font-medium">
                已完成 {completedCount} 课 / 共 {totalLessons} 课
              </p>
              {currentPhase && (
                <p className="text-xs text-ink-wash mt-1">
                  当前：第{currentPhase.phase}阶段 · {currentPhase.title}
                </p>
              )}
              <p className="text-xs text-ink-wash mt-0.5">
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
