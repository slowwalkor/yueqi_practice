import { getSupportedMimeType } from '../utils/mimeDetection'

export type RecordingState = 'idle' | 'recording' | 'paused'

export interface RecordingResult {
  blob: Blob
  duration: number // seconds
  mimeType: string
}

type DurationCallback = (seconds: number) => void

export class RecordingManager {
  private mediaRecorder: MediaRecorder | null = null
  private stream: MediaStream | null = null
  private chunks: Blob[] = []
  private state: RecordingState = 'idle'
  private startTime = 0
  private pausedDuration = 0
  private pauseStart = 0
  private timer: ReturnType<typeof setInterval> | null = null
  private onDurationUpdate: DurationCallback | null = null
  private mimeType = ''

  getState(): RecordingState {
    return this.state
  }

  setDurationCallback(cb: DurationCallback | null) {
    this.onDurationUpdate = cb
  }

  async start(): Promise<void> {
    if (this.state !== 'idle') return

    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
    })

    this.mimeType = getSupportedMimeType()
    const options: MediaRecorderOptions = {}
    if (this.mimeType) {
      options.mimeType = this.mimeType
    }

    this.mediaRecorder = new MediaRecorder(this.stream, options)
    this.chunks = []
    this.pausedDuration = 0

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        this.chunks.push(e.data)
      }
    }

    this.mediaRecorder.start(1000) // collect data every second
    this.state = 'recording'
    this.startTime = Date.now()

    this.timer = setInterval(() => {
      if (this.onDurationUpdate && this.state === 'recording') {
        const elapsed = (Date.now() - this.startTime - this.pausedDuration) / 1000
        this.onDurationUpdate(Math.floor(elapsed))
      }
    }, 500)
  }

  pause(): void {
    if (this.state !== 'recording' || !this.mediaRecorder) return
    this.mediaRecorder.pause()
    this.state = 'paused'
    this.pauseStart = Date.now()
  }

  resume(): void {
    if (this.state !== 'paused' || !this.mediaRecorder) return
    this.pausedDuration += Date.now() - this.pauseStart
    this.mediaRecorder.resume()
    this.state = 'recording'
  }

  stop(): Promise<RecordingResult> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || this.state === 'idle') {
        reject(new Error('No active recording'))
        return
      }

      if (this.state === 'paused') {
        this.pausedDuration += Date.now() - this.pauseStart
      }

      this.mediaRecorder.onstop = () => {
        const duration = Math.round(
          (Date.now() - this.startTime - this.pausedDuration) / 1000
        )
        const actualMime = this.mimeType || 'audio/webm'
        const blob = new Blob(this.chunks, { type: actualMime })

        this.cleanup()

        resolve({
          blob,
          duration: Math.max(duration, 1),
          mimeType: actualMime,
        })
      }

      this.mediaRecorder.onerror = () => {
        this.cleanup()
        reject(new Error('Recording failed'))
      }

      this.mediaRecorder.stop()
    })
  }

  private cleanup() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop())
      this.stream = null
    }
    this.mediaRecorder = null
    this.chunks = []
    this.state = 'idle'
    this.startTime = 0
    this.pausedDuration = 0
  }

  dispose() {
    this.cleanup()
  }
}
