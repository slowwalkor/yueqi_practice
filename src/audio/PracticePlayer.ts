/**
 * 跟练调度器
 * 复用 Metronome 的 setInterval + scheduleAheadTime 架构
 * 按曲谱顺序调度 DiziSynth 播放音符，并同步通知 UI 当前音符位置
 */

import { DiziSynth } from './DiziSynth'
import { AudioContextManager } from './AudioContextManager'
import type { ParsedNote } from './scoreParser'
import type { NoteFreq } from './keyTransposer'

export class PracticePlayer {
  private synth: DiziSynth
  private notes: ParsedNote[]
  private freqMap: NoteFreq[]
  private onNoteChange: (index: number) => void

  private _isPlaying = false
  private _isPaused = false
  private _currentIndex = 0
  private speedMultiplier = 1.0

  // 调度相关
  private schedulerTimer: ReturnType<typeof setInterval> | null = null
  private scheduleAheadTime = 0.2   // 200ms 预调度窗口
  private lookaheadInterval = 25    // 25ms 轮询间隔
  private nextNoteTime = 0          // 下一个音符的 AudioContext 时间
  private scheduledIndex = 0        // 已调度到的音符索引

  constructor(
    synth: DiziSynth,
    notes: ParsedNote[],
    freqMap: NoteFreq[],
    onNoteChange: (index: number) => void
  ) {
    this.synth = synth
    this.notes = notes
    this.freqMap = freqMap
    this.onNoteChange = onNoteChange
  }

  /** 是否正在播放 */
  get isPlaying(): boolean {
    return this._isPlaying
  }

  /** 当前播放的音符索引 */
  get currentIndex(): number {
    return this._currentIndex
  }

  /** 开始播放 */
  start(): void {
    if (this._isPlaying) return
    if (this.notes.length === 0) return

    const ctx = AudioContextManager.getInstance().getContext()
    if (!ctx) return

    this._isPlaying = true
    this._isPaused = false
    this._currentIndex = 0
    this.scheduledIndex = 0
    this.nextNoteTime = ctx.currentTime + 0.05  // 小延迟确保首音可听

    this.startScheduler()
  }

  /** 停止播放并重置 */
  stop(): void {
    this._isPlaying = false
    this._isPaused = false
    this.clearScheduler()
    this.synth.stopAll()
    this._currentIndex = 0
    this.scheduledIndex = 0
  }

  /** 暂停播放 */
  pause(): void {
    if (!this._isPlaying || this._isPaused) return
    this._isPaused = true
    this.clearScheduler()
    this.synth.stopAll()
  }

  /** 恢复播放 */
  resume(): void {
    if (!this._isPlaying || !this._isPaused) return

    const ctx = AudioContextManager.getInstance().getContext()
    if (!ctx) return

    this._isPaused = false
    // 从当前已调度位置继续
    this.nextNoteTime = ctx.currentTime + 0.05
    this.startScheduler()
  }

  /**
   * 设置播放速度倍率
   * @param multiplier - 0.5 ~ 1.5
   */
  setSpeed(multiplier: number): void {
    this.speedMultiplier = Math.max(0.5, Math.min(1.5, multiplier))
  }

  /** 启动调度定时器 */
  private startScheduler(): void {
    this.schedule()
    this.schedulerTimer = setInterval(() => this.schedule(), this.lookaheadInterval)
  }

  /** 清除调度定时器 */
  private clearScheduler(): void {
    if (this.schedulerTimer !== null) {
      clearInterval(this.schedulerTimer)
      this.schedulerTimer = null
    }
  }

  /** 核心调度逻辑：在预调度窗口内安排需要播放的音符 */
  private schedule(): void {
    if (!this._isPlaying || this._isPaused) return

    const ctx = AudioContextManager.getInstance().getContext()
    if (!ctx) return

    while (
      this.scheduledIndex < this.notes.length &&
      this.nextNoteTime < ctx.currentTime + this.scheduleAheadTime
    ) {
      const note = this.notes[this.scheduledIndex]
      const noteTime = this.nextNoteTime
      const actualDurationMs = note.durationMs / this.speedMultiplier
      const durationSec = actualDurationMs / 1000

      // 调度音符播放
      if (!note.isRest) {
        const freq = this.lookupFreq(note.noteName)
        if (freq > 0) {
          this.synth.playNote(freq, durationSec, noteTime)
        }
      }

      // 通过 setTimeout 对齐 UI 回调
      const delayMs = (noteTime - ctx.currentTime) * 1000
      const idx = this.scheduledIndex
      setTimeout(() => {
        if (this._isPlaying) {
          this._currentIndex = idx
          this.onNoteChange(idx)
        }
      }, Math.max(0, delayMs))

      // 推进时间指针
      this.nextNoteTime += durationSec
      this.scheduledIndex++
    }

    // 所有音符已调度完毕，等播放完后自动停止
    if (this.scheduledIndex >= this.notes.length) {
      const ctx2 = AudioContextManager.getInstance().getContext()
      if (ctx2) {
        const remainMs = (this.nextNoteTime - ctx2.currentTime) * 1000
        setTimeout(() => {
          this.stop()
          this.onNoteChange(-1)
        }, Math.max(0, remainMs))
      }
      this.clearScheduler()
    }
  }

  /** 根据音名查找频率 */
  private lookupFreq(noteName: string): number {
    const found = this.freqMap.find(n => n.note === noteName)
    return found ? found.freq : 0
  }
}
