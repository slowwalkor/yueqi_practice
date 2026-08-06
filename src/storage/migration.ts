import db from './db'
import { supabase } from '../lib/supabase'

const MIGRATED_KEY = 'cloud:migrated'

/**
 * 将本地数据批量迁移到云端（仅执行一次）
 */
export async function migrateLocalDataToCloud(userId: string): Promise<void> {
  if (!supabase) return

  // 检查是否已迁移
  const migrated = await db.getItem<boolean>(MIGRATED_KEY)
  if (migrated) return

  const checkins: Array<{ user_id: string; key: string; value: unknown; updated_at: string }> = []
  const now = new Date().toISOString()

  // 遍历本地数据
  await db.iterate<unknown, void>((value, key) => {
    if (key.startsWith('checkin:')) {
      checkins.push({ user_id: userId, key, value, updated_at: now })
    }
  })

  // 批量上传 checkins
  if (checkins.length > 0) {
    const batchSize = 50
    for (let i = 0; i < checkins.length; i += batchSize) {
      const batch = checkins.slice(i, i + batchSize)
      await supabase.from('checkins').upsert(batch, { onConflict: 'user_id,key' })
    }
  }

  // 上传 course_progress
  const progress = await db.getItem('progress')
  if (progress) {
    await supabase.from('course_progress').upsert({
      user_id: userId,
      key: 'progress',
      value: progress,
      updated_at: now
    }, { onConflict: 'user_id,key' })
  }

  // 上传 recordings:meta
  const recordingsMeta = await db.getItem('recordings:meta')
  if (recordingsMeta) {
    await supabase.from('recordings_meta').upsert({
      user_id: userId,
      key: 'recordings:meta',
      value: recordingsMeta,
      updated_at: now
    }, { onConflict: 'user_id,key' })
  }

  // 标记已迁移
  await db.setItem(MIGRATED_KEY, true)
}
