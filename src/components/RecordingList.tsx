import { useState, useRef, useEffect, useCallback } from 'react'
import {
  RecordingMeta,
  getRecordingBlob,
  deleteRecording,
  formatSize,
} from '../storage/recordingStore'

interface Props {
  recordings: RecordingMeta[]
  onDeleted: () => void
}

export default function RecordingList({ recordings, onDeleted }: Props) {
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const urlRef = useRef<string | null>(null)

  const cleanupAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current)
      urlRef.current = null
    }
    setPlayingId(null)
    setProgress(0)
  }, [])

  useEffect(() => {
    return () => {
      cleanupAudio()
    }
  }, [cleanupAudio])

  const handlePlay = async (id: string) => {
    if (playingId === id) {
      cleanupAudio()
      return
    }

    cleanupAudio()

    const blob = await getRecordingBlob(id)
    if (!blob) return

    const url = URL.createObjectURL(blob)
    urlRef.current = url

    const audio = new Audio(url)
    audioRef.current = audio

    audio.ontimeupdate = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100)
      }
    }

    audio.onended = () => {
      cleanupAudio()
    }

    audio.onerror = () => {
      cleanupAudio()
    }

    setPlayingId(id)
    await audio.play()
  }

  const handleDelete = async (id: string) => {
    await deleteRecording(id)
    if (playingId === id) {
      cleanupAudio()
    }
    setConfirmDeleteId(null)
    onDeleted()
  }

  const formatDuration = (seconds: number): string => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const formatDate = (timestamp: number): string => {
    const d = new Date(timestamp)
    return `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  }

  if (recordings.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <div className="text-4xl mb-3">🎵</div>
        <p>还没有录音，点击上方按钮开始录制</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {recordings.map((rec) => (
        <div
          key={rec.id}
          className={`bg-white rounded-xl p-4 shadow-sm border transition-colors ${
            playingId === rec.id
              ? 'border-bamboo-light bg-green-50'
              : 'border-transparent'
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-800 truncate">
                {rec.title || `练习录音`}
              </div>
              <div className="text-xs text-gray-400 mt-1 flex gap-3">
                <span>{formatDate(rec.timestamp)}</span>
                <span>{formatDuration(rec.duration)}</span>
                <span>{formatSize(rec.size)}</span>
              </div>
            </div>

            <div className="flex gap-2">
              {/* Play button */}
              <button
                onClick={() => handlePlay(rec.id)}
                className="w-11 h-11 flex items-center justify-center rounded-full bg-bamboo-light text-white active:scale-95 transition-transform"
                aria-label={playingId === rec.id ? '停止' : '播放'}
              >
                {playingId === rec.id ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              {/* Delete button */}
              <button
                onClick={() => setConfirmDeleteId(rec.id)}
                className="w-11 h-11 flex items-center justify-center rounded-full bg-red-50 text-red-500 active:scale-95 transition-transform"
                aria-label="删除"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Progress bar */}
          {playingId === rec.id && (
            <div className="mt-3 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-bamboo-light rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      ))}

      {/* Delete confirmation modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">确认删除</h3>
            <p className="text-gray-500 text-sm mb-6">
              删除后无法恢复，确定要删除这条录音吗？
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 h-11 rounded-lg border border-gray-200 text-gray-600 font-medium active:scale-95 transition-transform"
              >
                取消
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                className="flex-1 h-11 rounded-lg bg-red-500 text-white font-medium active:scale-95 transition-transform"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

