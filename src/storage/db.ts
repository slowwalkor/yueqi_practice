import localforage from 'localforage'
import { supabase } from '../lib/supabase'

const store = localforage.createInstance({
  name: 'zhudi-app',
  storeName: 'main'
})

// ============================================
// 同步队列
// ============================================
interface SyncOp {
  op: 'set' | 'remove'
  key: string
  value?: unknown
}

const syncQueue: SyncOp[] = []
let isSyncing = false

function enqueueSyncOp(op: 'set' | 'remove', key: string, value?: unknown) {
  if (!supabase) return
  syncQueue.push({ op, key, value })
  void flushSyncQueue()
}

async function flushSyncQueue() {
  if (isSyncing || syncQueue.length === 0) return
  isSyncing = true

  while (syncQueue.length > 0) {
    const batch = syncQueue.splice(0, 10)
    for (const item of batch) {
      try {
        const table = getTableForKey(item.key)
        if (!table) continue // 不需要同步的 key

        if (item.op === 'set') {
          await supabase!.from(table).upsert({
            user_id: await getCurrentUserId(),
            key: item.key,
            value: item.value,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id,key' })
        } else {
          await supabase!.from(table).delete().match({
            user_id: await getCurrentUserId(),
            key: item.key
          })
        }
      } catch {
        // 静默失败，不影响本地操作
        console.warn('[sync] 云端同步失败，数据已保存在本地')
      }
    }
  }

  isSyncing = false
}

/**
 * 根据 key 前缀路由到不同的 Supabase 表
 */
function getTableForKey(key: string): string | null {
  if (key.startsWith('checkin:')) return 'checkins'
  if (key === 'progress') return 'course_progress'
  if (key === 'recordings:meta') return 'recordings_meta'
  if (key.startsWith('recordings:blob:')) return null // blob 走 Storage，不走表
  if (key === 'stats') return null // 本地计算，无需同步
  return null
}

async function getCurrentUserId(): Promise<string> {
  if (!supabase) return 'local'
  const { data } = await supabase.auth.getUser()
  return data.user?.id || 'local'
}

// ============================================
// 导出适配器（兼容原 localforage 接口）
// ============================================
const db = {
  async getItem<T>(key: string): Promise<T | null> {
    return store.getItem<T>(key)
  },

  async setItem<T>(key: string, value: T): Promise<T> {
    await store.setItem(key, value)
    enqueueSyncOp('set', key, value)
    return value
  },

  async removeItem(key: string): Promise<void> {
    await store.removeItem(key)
    enqueueSyncOp('remove', key)
  },

  async iterate<T, U>(fn: (value: T, key: string, iterationNumber: number) => U): Promise<U | undefined> {
    return store.iterate(fn)
  }
}

export default db

// ============================================
// 远端数据拉取（登录后调用）
// ============================================
export async function pullRemoteData(userId: string): Promise<void> {
  if (!supabase) return

  // 拉取 checkins
  const { data: checkins } = await supabase
    .from('checkins')
    .select('key, value')
    .eq('user_id', userId)

  if (checkins) {
    for (const row of checkins) {
      await store.setItem(row.key, row.value)
    }
  }

  // 拉取 course_progress
  const { data: progress } = await supabase
    .from('course_progress')
    .select('key, value')
    .eq('user_id', userId)

  if (progress) {
    for (const row of progress) {
      await store.setItem(row.key, row.value)
    }
  }

  // 拉取 recordings_meta
  const { data: recordings } = await supabase
    .from('recordings_meta')
    .select('key, value')
    .eq('user_id', userId)

  if (recordings) {
    for (const row of recordings) {
      await store.setItem(row.key, row.value)
    }
  }
}
