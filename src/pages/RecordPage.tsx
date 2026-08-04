import { useState, useEffect, useRef, useCallback } from 'react'
import { RecordingManager, RecordingState } from '../audio/RecordingManager'
import {
  RecordingMeta,
  saveRecording,
  getAllRecordings,
  getStorageUsage,
  StorageUsage,
  isNearCapacity,
  isAtCapacity,
  formatSize,
} from '../storage/recordingStore'
import RecordingList from '../components/RecordingList'

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export default function RecordPage() {
  const [recState, setRecState] = useState<RecordingState>('idle')
  const [duration, setDuration] = useState(0)
  const [recordings, setRecordings] = useState<RecordingMeta[]>([])
  const [usage, setUsage] = useState<StorageUsage>({ count: 0, totalSize: 0 })
  const [error, setError] = useState<string | null>(null)
  const managerRef = useRef<RecordingManager | null>(null)

  const loadData = useCallback(async () => {
    const [recs, storageUsage] = await Promise.all([
      getAllRecordings(),
      getStorageUsage(),
    ])
    setRecordings(recs)
    setUsage(storageUsage)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    return () => {
      managerRef.current?.dispose()
    }
  }, [])

  const handleStart = async () => {
    if (isAtCapacity(usage)) {
      setError('存储已满，请删除一些录音后再试')
      return
    }
    setError(null)

    try {
      const mgr = new RecordingManager()
      mgr.setDurationCallback((s) => setDuration(s))
      await mgr.start()
      managerRef.current = mgr
      setRecState('recording')
      setDuration(0)
    } catch (e) {
      setError('无法访问麦克风，请检查权限设置')
      console.error(e)
    }
  }

  const handlePause = () => {
    managerRef.current?.pause()
    setRecState('paused')
  }

  const handleResume = () => {
    managerRef.current?.resume()
    setRecState('recording')
  }

  const handleStop = async () => {
    const mgr = managerRef.current
    if (!mgr) return

    try {
      const result = await mgr.stop()
      const now = Date.now()
      const meta: RecordingMeta = {
        id: `rec_${now}`,
        date: new Date(now).toISOString().slice(0, 10),
        timestamp: now,
        duration: result.duration,
        mimeType: result.mimeType,
        size: result.blob.size,
      }
      await saveRecording(result.blob, meta)
      managerRef.current = null
      setRecState('idle')
      setDuration(0)
      await loadData()
    } catch (e) {
      setError('保存录音失败')
      console.error(e)
    }
  }

  return (
    <div className="min-h-screen bg-cream pb-24">
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-bamboo">练习录音</h1>
        <p className="text-gray-500 text-sm mt-1">录制练习片段，回听对比进步</p>
      </div>

      {/* Recording control */}
      <div className="flex flex-col items-center px-5 py-6">
        {/* Duration display */}
        <div className="text-4xl font-mono font-light text-gray-700 mb-6 tabular-nums">
          {formatTime(duration)}
        </div>

        {/* Status indicator */}
        <div className="text-sm text-gray-500 mb-4 h-5">
          {recState === 'recording' && (
            <span className="flex items-center gap-1.5 text-red-500">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse-dot" />
              录制中
            </span>
          )}
          {recState === 'paused' && (
            <span className="text-amber-600">⏸ 已暂停</span>
          )}
          {recState === 'idle' && <span>&nbsp;</span>}
        </div>

        {/* Main controls */}
        <div className="flex items-center gap-6">
          {recState !== 'idle' && (
            <button
              onClick={recState === 'recording' ? handlePause : handleResume}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-md border border-gray-100 active:scale-90 transition-transform"
              aria-label={recState === 'recording' ? '暂停' : '继续'}
            >
              {recState === 'recording' ? (
                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-bamboo-light" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
          )}

          {/* Record / Stop button */}
          {recState === 'idle' ? (
            <button
              onClick={handleStart}
              className="w-20 h-20 rounded-full bg-red-600 shadow-lg flex items-center justify-center active:scale-90 transition-transform"
              aria-label="开始录音"
            >
              <div className="w-8 h-8 rounded-full bg-white" />
            </button>
          ) : (
            <button
              onClick={handleStop}
              className={`w-20 h-20 rounded-full bg-red-600 shadow-lg flex items-center justify-center active:scale-90 transition-transform ${
                recState === 'recording' ? 'animate-pulse-ring' : ''
              }`}
              aria-label="停止录音"
            >
              <div className="w-7 h-7 rounded-sm bg-white" />
            </button>
          )}

          {recState !== 'idle' && <div className="w-12 h-12" />}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mx-5 mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Capacity warning */}
      {isNearCapacity(usage) && (
        <div className="mx-5 mb-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm">
          ⚠️ 存储空间即将用尽，建议删除部分录音
        </div>
      )}

      {/* Storage stats */}
      <div className="mx-5 mb-4 px-4 py-2.5 bg-white/60 rounded-xl text-center text-sm text-gray-500">
        {usage.count} 条录音 · {formatSize(usage.totalSize)}
      </div>

      {/* Recording list */}
      <div className="px-5">
        <RecordingList recordings={recordings} onDeleted={loadData} />
      </div>
    </div>
  )
}
