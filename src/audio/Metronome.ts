export type TimeSignature = '2/4' | '3/4' | '4/4'

export class Metronome {
  private audioCtx: AudioContext
  private bpm: number = 120
  private timeSignature: TimeSignature = '4/4'
  private isPlaying: boolean = false
  private nextNoteTime: number = 0
  private currentBeat: number = 0
  private schedulerTimer: number | null = null
  private scheduleAheadTime = 0.1 // 100ms提前调度
  private onBeatCallback: ((beat: number, isStrong: boolean) => void) | null = null

  constructor(audioCtx: AudioContext) {
    this.audioCtx = audioCtx
  }

  setBPM(bpm: number) {
    this.bpm = Math.max(40, Math.min(200, bpm))
  }

  getBPM(): number {
    return this.bpm
  }

  setTimeSignature(ts: TimeSignature) {
    this.timeSignature = ts
    // 切换拍号时重置当前拍位，避免越界
    this.currentBeat = 0
  }

  getTimeSignature(): TimeSignature {
    return this.timeSignature
  }

  getIsPlaying(): boolean {
    return this.isPlaying
  }

  onBeat(callback: (beat: number, isStrong: boolean) => void) {
    this.onBeatCallback = callback
  }

  start() {
    if (this.isPlaying) return
    this.isPlaying = true
    this.currentBeat = 0
    this.nextNoteTime = this.audioCtx.currentTime
    this.schedule()
  }

  stop() {
    this.isPlaying = false
    if (this.schedulerTimer !== null) {
      cancelAnimationFrame(this.schedulerTimer)
      this.schedulerTimer = null
    }
  }

  private schedule() {
    if (!this.isPlaying) return

    while (this.nextNoteTime < this.audioCtx.currentTime + this.scheduleAheadTime) {
      this.playBeat(this.nextNoteTime, this.currentBeat)
      this.nextNoteTime += 60 / this.bpm
      this.currentBeat = (this.currentBeat + 1) % this.getBeatsPerMeasure()
    }
    this.schedulerTimer = requestAnimationFrame(() => this.schedule())
  }

  private playBeat(time: number, beat: number) {
    const isStrong = beat === 0
    const freq = isStrong ? 880 : 440 // 强拍高频，弱拍低频
    const duration = 0.05

    const osc = this.audioCtx.createOscillator()
    const gain = this.audioCtx.createGain()
    osc.connect(gain)
    gain.connect(this.audioCtx.destination)

    osc.frequency.value = freq
    gain.gain.setValueAtTime(isStrong ? 0.5 : 0.3, time)
    gain.gain.exponentialRampToValueAtTime(0.01, time + duration)

    osc.start(time)
    osc.stop(time + duration)

    // 通知UI
    if (this.onBeatCallback) {
      const delay = (time - this.audioCtx.currentTime) * 1000
      setTimeout(() => this.onBeatCallback!(beat, isStrong), Math.max(0, delay))
    }
  }

  private getBeatsPerMeasure(): number {
    return parseInt(this.timeSignature.split('/')[0])
  }
}
