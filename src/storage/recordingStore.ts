import db from './db'
import { supabase } from '../lib/supabase'

export interface RecordingMeta {
  id: string
  date: string
  timestamp: number
  duration: number
  mimeType: string
  size: number
  title?: string
}

export interface StorageUsage {
  count: number
  totalSize: number
}

const META_KEY = 'recordings:meta'
const BLOB_PREFIX = 'recordings:blob:'

const MAX_COUNT = 50
const MAX_SIZE = 500 * 1024 * 1024 // 500MB

async function getMetaList(): Promise<RecordingMeta[]> {
  const list = await db.getItem<RecordingMeta[]>(META_KEY)
  return list || []
}

async function setMetaList(list: RecordingMeta[]): Promise<void> {
  await db.setItem(META_KEY, list)
}

export async function saveRecording(
  blob: Blob,
  meta: RecordingMeta
): Promise<void> {
  const list = await getMetaList()
  list.unshift(meta)
  await db.setItem(`${BLOB_PREFIX}${meta.id}`, blob)
  await setMetaList(list)
}

export async function getRecordingBlob(id: string): Promise<Blob | null> {
  return await db.getItem<Blob>(`${BLOB_PREFIX}${id}`)
}

export async function getAllRecordings(): Promise<RecordingMeta[]> {
  const list = await getMetaList()
  return list.sort((a, b) => b.timestamp - a.timestamp)
}

export async function deleteRecording(id: string): Promise<void> {
  const list = await getMetaList()
  const updated = list.filter((r) => r.id !== id)
  await db.removeItem(`${BLOB_PREFIX}${id}`)
  await setMetaList(updated)
}

export async function getStorageUsage(): Promise<StorageUsage> {
  const list = await getMetaList()
  const totalSize = list.reduce((sum, r) => sum + r.size, 0)
  return { count: list.length, totalSize }
}

export function isNearCapacity(usage: StorageUsage): boolean {
  return usage.count >= MAX_COUNT - 5 || usage.totalSize >= MAX_SIZE * 0.9
}

export function isAtCapacity(usage: StorageUsage): boolean {
  return usage.count >= MAX_COUNT || usage.totalSize >= MAX_SIZE
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ============================================
// 云端同步
// ============================================

/**
 * 上传录音 Blob 到 Supabase Storage
 */
export async function uploadRecordingToCloud(id: string): Promise<{ error?: string }> {
  if (!supabase) return { error: '未配置云服务' }

  const { data: userData } = await supabase.auth.getUser()
  const userId = userData.user?.id
  if (!userId) return { error: '请先登录' }

  const blob = await getRecordingBlob(id)
  if (!blob) return { error: '录音文件不存在' }

  const path = `${userId}/${id}`
  const { error } = await supabase.storage
    .from('recordings')
    .upload(path, blob, {
      contentType: blob.type || 'audio/webm',
      upsert: true
    })

  if (error) return { error: error.message }
  return {}
}

/**
 * 从 Supabase Storage 下载录音
 */
export async function downloadRecordingFromCloud(id: string): Promise<{ error?: string }> {
  if (!supabase) return { error: '未配置云服务' }

  const { data: userData } = await supabase.auth.getUser()
  const userId = userData.user?.id
  if (!userId) return { error: '请先登录' }

  const path = `${userId}/${id}`
  const { data, error } = await supabase.storage
    .from('recordings')
    .download(path)

  if (error || !data) return { error: error?.message || '下载失败' }

  // 保存到本地
  await db.setItem(`${BLOB_PREFIX}${id}`, data)
  return {}
}
