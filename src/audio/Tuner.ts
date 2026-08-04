import { PitchDetector } from 'pitchy'
import { NoteInfo, findClosestNote } from './noteFrequencies'

export interface PitchData {
  frequency: number
  note: NoteInfo
  cents: number    // 偏差，±50
  clarity: number  // 置信度 0-1
}

export class Tuner {
  private audioCtx: AudioContext
  private analyser: AnalyserNode
  private stream: MediaStream | null = null
  private source: MediaStreamAudioSourceNode | null = null
  private detector: PitchDetector<Float32Array>
  private animationId: number | null = null
  private onPitchCallback: ((data: PitchData | null) => void) | null = null
  private inputBuffer: Float32Array

  constructor(audioCtx: AudioContext) {
    this.audioCtx = audioCtx
    this.analyser = audioCtx.createAnalyser()
    this.analyser.fftSize = 4096
    this.inputBuffer = new Float32Array(this.analyser.fftSize)
    this.detector = PitchDetector.forFloat32Array(this.analyser.fftSize)
    this.detector.minVolumeDecibels = -30
  }

  onPitch(callback: (data: PitchData | null) => void) {
    this.onPitchCallback = callback
  }

  async start(): Promise<void> {
    // 确保 AudioContext 处于运行状态
    if (this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume()
    }

    // 获取麦克风
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
    })

    this.source = this.audioCtx.createMediaStreamSource(this.stream)
    this.source.connect(this.analyser)

    // 开始检测循环
    this.detect()
  }

  stop() {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
    if (this.source) {
      this.source.disconnect()
      this.source = null
    }
    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop())
      this.stream = null
    }
  }

  private detect() {
    this.analyser.getFloatTimeDomainData(this.inputBuffer)
    const [pitch, clarity] = this.detector.findPitch(this.inputBuffer, this.audioCtx.sampleRate)

    if (clarity > 0.7 && pitch > 200 && pitch < 2000) {
      const { note, cents } = findClosestNote(pitch)
      this.onPitchCallback?.({ frequency: pitch, note, cents, clarity })
    } else {
      this.onPitchCallback?.(null)
    }

    this.animationId = requestAnimationFrame(() => this.detect())
  }
}
