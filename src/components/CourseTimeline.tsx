import { useState, useEffect, useCallback } from 'react'
import { CURRICULUM, TOTAL_LESSONS, type Phase } from '../data/curriculum'
import { getProgress, completeLesson, type CourseProgress } from '../storage/progressStore'

const TYPE_COLORS = {
  theory: 'bg-blue-100 text-blue-700',
  practice: 'bg-emerald-100 text-emerald-700',
  song: 'bg-amber-100 text-amber-700',
} as const

const TYPE_LABELS = {
  theory: '理论',
  practice: '练习',
  song: '曲目',
} as const

export default function CourseTimeline() {
  // 初始值直接用默认进度，确保课程内容立即渲染，不等待异步存储
  const [progress, setProgress] = useState<CourseProgress>({
    currentPhase: 1,
    completedLessons: [],
    milestones: {
      1: { completed: false, date: null },
      2: { completed: false, date: null },
      3: { completed: false, date: null },
      4: { completed: false, date: null },
      5: { completed: false, date: null },
      6: { completed: false, date: null },
    },
    startDate: new Date().toISOString().slice(0, 10),
  })
  const [expandedPhases, setExpandedPhases] = useState<Set<number>>(new Set([1]))
  const [animatingId, setAnimatingId] = useState<number | null>(null)

  useEffect(() => {
    // 后台加载实际进度，加载成功则更新UI
    let cancelled = false
    const timer = setTimeout(() => {
      // 3秒超时保护：如果 localforage 挂起，不阻塞界面
      if (!cancelled) cancelled = true
    }, 3000)

    getProgress().then((p) => {
      if (!cancelled || true) {
        // 无论是否超时，只要返回就更新
        setProgress(p)
        setExpandedPhases(new Set([p.currentPhase]))
      }
      clearTimeout(timer)
    }).catch(() => {
      clearTimeout(timer)
      // 存储异常时保持默认进度，课程内容仍然可见
    })

    return () => { cancelled = true; clearTimeout(timer) }
  }, [])

  const togglePhase = useCallback((phase: number) => {
    setExpandedPhases((prev) => {
      const next = new Set(prev)
      if (next.has(phase)) {
        next.delete(phase)
      } else {
        next.add(phase)
      }
      return next
    })
  }, [])

  const handleComplete = useCallback(async (lessonId: number) => {
    await completeLesson(lessonId)
    setAnimatingId(lessonId)
    setTimeout(() => setAnimatingId(null), 400)
    const updated = await getProgress()
    setProgress(updated)
  }, [])

  if (!progress) {
    // 不会触发：progress 已有初始值，保留以防TS类型报错
    return null
  }

  const completedCount = progress.completedLessons.length
  const percent = Math.round((completedCount / TOTAL_LESSONS) * 100)

  const getPhaseStatus = (phase: Phase): 'completed' | 'current' | 'locked' => {
    const phaseLessonIds = phase.lessons.map((l) => l.id)
    const allDone = phaseLessonIds.every((id) => progress.completedLessons.includes(id))
    if (allDone) return 'completed'
    if (phase.phase === progress.currentPhase) return 'current'
    if (phase.phase < progress.currentPhase) return 'current' // allow previous phases
    return 'locked'
  }

  return (
    <div className="pb-6">
      {/* Progress bar */}
      <div className="mb-6 px-1">
        <div className="flex justify-between text-sm text-gray-600 mb-1.5">
          <span>学习进度</span>
          <span>{completedCount}/{TOTAL_LESSONS} 课时 · {percent}%</span>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-bamboo rounded-full transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {CURRICULUM.map((phase, idx) => {
          const status = getPhaseStatus(phase)
          const isExpanded = expandedPhases.has(phase.phase)
          const phaseLessonsCompleted = phase.lessons.filter((l) =>
            progress.completedLessons.includes(l.id)
          ).length
          const milestoneAchieved = progress.milestones[phase.phase]?.completed

          return (
            <div key={phase.phase} className="relative flex">
              {/* Vertical line + node */}
              <div className="flex flex-col items-center mr-4">
                {/* Node */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                    status === 'completed'
                      ? 'bg-bamboo text-white'
                      : status === 'current'
                      ? 'border-2 border-bamboo text-bamboo bg-white'
                      : 'border-2 border-gray-300 text-gray-400 bg-white'
                  }`}
                >
                  {status === 'completed' ? '✓' : phase.phase}
                </div>
                {/* Connector line */}
                {idx < CURRICULUM.length - 1 && (
                  <div
                    className={`w-0.5 flex-1 min-h-[20px] ${
                      status === 'completed' ? 'bg-bamboo' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>

              {/* Phase content */}
              <div className="flex-1 pb-6">
                {/* Header - clickable */}
                <button
                  onClick={() => togglePhase(phase.phase)}
                  className="w-full text-left bg-white rounded-xl shadow-sm p-4 active:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-medium text-gray-400">{phase.month}</span>
                        <h3 className="font-semibold text-gray-900 truncate">{phase.title}</h3>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 truncate">{phase.goal}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-3 shrink-0">
                      <span className="text-xs font-medium text-gray-500">
                        {phaseLessonsCompleted}/{phase.lessons.length}
                      </span>
                      <svg
                        className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  {/* Milestone */}
                  <div className="mt-2 flex items-center gap-1.5">
                    {milestoneAchieved ? (
                      <span className="text-xs text-amber font-medium">🏆 里程碑已达成</span>
                    ) : (
                      <span className="text-xs text-gray-400">🎯 {phase.milestone}</span>
                    )}
                  </div>
                </button>

                {/* Body - lessons list */}
                {isExpanded && (
                  <div className="mt-3 space-y-2 pl-1">
                    {phase.lessons.map((lesson) => {
                      const isDone = progress.completedLessons.includes(lesson.id)
                      const isAnimating = animatingId === lesson.id
                      return (
                        <div
                          key={lesson.id}
                          className={`flex items-center gap-3 bg-white rounded-lg p-3 shadow-sm transition-all duration-300 ${
                            isAnimating ? 'scale-[0.97] bg-green-50' : ''
                          }`}
                        >
                          {/* Check circle */}
                          <button
                            onClick={() => !isDone && handleComplete(lesson.id)}
                            className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center touch-manipulation"
                            style={{ minWidth: 44, minHeight: 44 }}
                            disabled={isDone}
                          >
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                                isDone
                                  ? 'bg-bamboo text-white'
                                  : 'border-2 border-gray-300 hover:border-bamboo'
                              }`}
                            >
                              {isDone && (
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                          </button>

                          {/* Title + type */}
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${isDone ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                              {lesson.title}
                            </p>
                          </div>

                          {/* Type tag */}
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${TYPE_COLORS[lesson.type]}`}>
                            {TYPE_LABELS[lesson.type]}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
