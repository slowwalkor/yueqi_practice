import db from '../storage/db'
import { getProgress } from '../storage/progressStore'

export interface ExportPayload {
  exportDate: string
  appVersion: string
  checkins: Record<string, unknown>
  progress: unknown
}

export async function exportAllData(): Promise<void> {
  const checkins: Record<string, unknown> = {}

  await db.iterate<unknown, void>((value, key) => {
    checkins[key] = value
  })

  const progress = await getProgress()

  const payload: ExportPayload = {
    exportDate: new Date().toISOString(),
    appVersion: '1.0.0',
    checkins,
    progress,
  }

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `zhudi-backup-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
