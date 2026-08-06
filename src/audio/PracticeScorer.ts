/**
 * AI 跟练评分引擎
 * 开启麦克风实时检测音高，与目标音符对比，计算评分
 */

import { PitchDetector } from 'pitchy'

// ============================================================
// 接口定义
// ============================================================

export interface NoteScore {
  noteIndex: number
  targetNote: string       // 目标音符 (如 "中音1")
  targetFreq: number       // 目标频率
  detectedFreq: number | null  // 检测到的频率
  centsDiff: number        // 音准偏差 (cents)
  timingDiff: number       // 节奏偏差 (ms)
  score: number            // 0-100
  status: 'perfect' | 'good' | 'off' | 'missed'
}

export interface PracticeResult {
  totalScore: number
  grade: 'S' | 'A' | 'B' | 'C' | 'D'
  noteScores: NoteScore[]
  perfectCount: number
  goodCount: number
  offCount: number
  missedCount: number
  avgCentsDiff: number
  duration: number         // 总时长 ms
  date: string
  scoreTitle: string
}

// ============================================================
// PracticeScorer
// ============================================================

export class PracticeScorer {
  private audioCtx: AudioContext
  private analyser: AnalyserNode
  private stream: MediaStream | null = null
  private source: MediaStreamAudioSourceNode | null = null
  private detector: PitchDetector<Float32Array>
  private inputBuffer: Float32Array
  private animationId: number | null = null

  // 当前检测状态
  private currentFreq: number | null = null
  private currentClarity: number = 0

  // 当前目标音符
  private targetNote: string = ''
  private targetFreq: number = 0
  private targetIndex: number = -1

  // 检测采样窗口
  private pitchSamples: number[] = []

  // 记录
  private noteScores: NoteScore[] = []
  private startTime: number = 0
  private scoreTitle: string = ''

  constructor(audioCtx: AudioContext) {
    this.audioCtx = audioCtx
    this.analyser = audioCtx.createAnalyser()
    this.analyser.fftSize = 4096
    this.inputBuffer = new Float32Array(this.analyser.fftSize)
    this.detector = PitchDetector.forFloat32Array(this.analyser.fftSize)
    this.detector.minVolumeDecibels = -35
  }

  /** 设置曲目标题 */
  setTitle(title: string): void {
    this.scoreTitle = title
  }

  /** 开启麦克风监听 */
  async start(): Promise<void> {
    if (this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume()
    }

    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
    })

    this.source = this.audioCtx.createMediaStreamSource(this.stream)
    this.source.connect(this.analyser)

    this.startTime = Date.now()
    this.noteScores = []
    this.detect()
  }

  /** 设置当前目标音符 */
  setCurrentTarget(note: string, freq: number, noteIndex: number): void {
    this.targetNote = note
    this.targetFreq = freq
    this.targetIndex = noteIndex
    this.pitchSamples = []
  }

  /** 获取当前检测到的音高 */
  getCurrentPitch(): { freq: number; clarity: number } | null {
    if (this.currentFreq === null || this.currentClarity < 0.6) return null
    return { freq: this.currentFreq, clarity: this.currentClarity }
  }

  /** 结束一个音符，计算得分 */
  commitNote(): NoteScore {
    const detectedFreq = this.getMedianPitch()
    let centsDiff = 0
    let timingDiff = 0
    let score = 0
    let status: NoteScore['status'] = 'missed'

    if (detectedFreq !== null && this.targetFreq > 0) {
      // 计算音准偏差 (cents)
      centsDiff = 1200 * Math.log2(detectedFreq / this.targetFreq)

      // 节奏偏差：从设置目标到首次检测到有效音高的延迟
      // 简化实现：使用采样数量的密度作为节奏判断
      const sampleDensity = this.pitchSamples.length
      timingDiff = sampleDensity < 3 ? 200 : 0  // 如果采样太少，认为有节奏延迟

      // 音准得分 (70% 权重)
      const absCents = Math.abs(centsDiff)
      let pitchScore: number
      if (absCents <= 10) pitchScore = 100
      else if (absCents <= 25) pitchScore = 90 - (absCents - 10) * 0.67
      else if (absCents <= 50) pitchScore = 80 - (absCents - 25) * 1.2
      else pitchScore = Math.max(0, 50 - (absCents - 50) * 0.8)

      // 节奏得分 (30% 权重)
      const absTimingDiff = Math.abs(timingDiff)
      let timingScore: number
      if (absTimingDiff <= 50) timingScore = 100
      else if (absTimingDiff <= 150) timingScore = 80
      else if (absTimingDiff <= 300) timingScore = 60
      else timingScore = 30

      score = Math.round(pitchScore * 0.7 + timingScore * 0.3)

      // 判定状态
      if (score >= 90) status = 'perfect'
      else if (score >= 75) status = 'good'
      else status = 'off'
    } else {
      // 没有检测到有效音高
      score = 0
      status = 'missed'
    }

    const noteScore: NoteScore = {
      noteIndex: this.targetIndex,
      targetNote: this.targetNote,
      targetFreq: this.targetFreq,
      detectedFreq,
      centsDiff,
      timingDiff,
      score,
      status,
    }

    this.noteScores.push(noteScore)
    this.pitchSamples = []
    return noteScore
  }

  /** 结束，返回总结果 */
  stop(): PracticeResult {
    this.stopDetection()

    const duration = Date.now() - this.startTime
    const noteScores = this.noteScores

    // 统计
    let perfectCount = 0
    let goodCount = 0
    let offCount = 0
    let missedCount = 0
    let totalCents = 0
    let centCount = 0

    for (const ns of noteScores) {
      switch (ns.status) {
        case 'perfect': perfectCount++; break
        case 'good': goodCount++; break
        case 'off': offCount++; break
        case 'missed': missedCount++; break
      }
      if (ns.detectedFreq !== null) {
        totalCents += Math.abs(ns.centsDiff)
        centCount++
      }
    }

    // 总分
    const totalScore = noteScores.length > 0
      ? Math.round(noteScores.reduce((sum, n) => sum + n.score, 0) / noteScores.length)
      : 0

    // 评级
    let grade: PracticeResult['grade']
    if (totalScore >= 95) grade = 'S'
    else if (totalScore >= 85) grade = 'A'
    else if (totalScore >= 75) grade = 'B'
    else if (totalScore >= 60) grade = 'C'
    else grade = 'D'

    return {
      totalScore,
      grade,
      noteScores,
      perfectCount,
      goodCount,
      offCount,
      missedCount,
      avgCentsDiff: centCount > 0 ? Math.round(totalCents / centCount) : 0,
      duration,
      date: new Date().toISOString(),
      scoreTitle: this.scoreTitle,
    }
  }

  /** 释放所有资源 */
  destroy(): void {
    this.stopDetection()
  }

  // ============================================================
  // 内部方法
  // ============================================================

  private detect = (): void => {
    this.analyser.getFloatTimeDomainData(this.inputBuffer)
    const [pitch, clarity] = this.detector.findPitch(this.inputBuffer, this.audioCtx.sampleRate)

    if (clarity > 0.6 && pitch > 200 && pitch < 2000) {
      this.currentFreq = pitch
      this.currentClarity = clarity
      this.pitchSamples.push(pitch)
    } else {
      this.currentFreq = null
      this.currentClarity = 0
    }

    this.animationId = requestAnimationFrame(this.detect)
  }

  private stopDetection(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
    if (this.source) {
      this.source.disconnect()
      this.source = null
    }
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop())
      this.stream = null
    }
  }

  /** 取采样窗口内的中位数频率 */
  private getMedianPitch(): number | null {
    if (this.pitchSamples.length === 0) return null
    const sorted = [...this.pitchSamples].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid]
  }
}
