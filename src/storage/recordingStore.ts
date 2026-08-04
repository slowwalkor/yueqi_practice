import db from './db'

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
