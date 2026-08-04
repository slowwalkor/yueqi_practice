import localforage from 'localforage'

export interface CourseProgress {
  currentPhase: number
  completedLessons: number[]
  milestones: Record<number, { completed: boolean; date: string | null }>
  startDate: string
}

const STORAGE_KEY = 'progress'

function defaultProgress(): CourseProgress {
  return {
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
  }
}

export async function getProgress(): Promise<CourseProgress> {
  try {
    const data = await localforage.getItem<CourseProgress>(STORAGE_KEY)
    if (!data) {
      const init = defaultProgress()
      await localforage.setItem(STORAGE_KEY, init)
      return init
    }
    return data
  } catch {
    return defaultProgress()
  }
}

export async function completeLesson(lessonId: number): Promise<void> {
  const progress = await getProgress()
  if (!progress.completedLessons.includes(lessonId)) {
    progress.completedLessons.push(lessonId)
    await localforage.setItem(STORAGE_KEY, progress)
  }
}

export async function completeMilestone(phase: number): Promise<void> {
  const progress = await getProgress()
  progress.milestones[phase] = {
    completed: true,
    date: new Date().toISOString().slice(0, 10),
  }
  // Advance currentPhase if applicable
  if (phase >= progress.currentPhase && phase < 6) {
    progress.currentPhase = phase + 1
  }
  await localforage.setItem(STORAGE_KEY, progress)
}

export async function resetProgress(): Promise<void> {
  await localforage.setItem(STORAGE_KEY, defaultProgress())
}
