import { AudioContextManager } from './AudioContextManager'

// 竹笛谐波谱 — 使用 PeriodicWave Fourier 系数模拟竹笛音色
// real: 余弦系数（全零表示无偶次谐波偏移）
// imag: 正弦系数（基波+丰富的奇次谐波赋予竹笛特有的明亮感）
const real = new Float32Array([0, 0, 0, 0, 0, 0, 0, 0])
const imag = new Float32Array([0, 1.0, 1.15, 0.76, 0.32, 0.55, 0.18, 0.25])

// ADSR 包络参数（秒）
const ATTACK = 0.03    // 30ms 起音
const DECAY = 0.05     // 50ms 衰减
const SUSTAIN = 0.7    // 持续音量比例
const RELEASE = 0.15   // 150ms 释放

/**
 * 竹笛音色合成器
 * 通过 Web Audio PeriodicWave + ADSR 包络模拟竹笛音色
 */
export class DiziSynth {
  private activeNodes: { osc: OscillatorNode; gain: GainNode }[] = []
  private periodicWave: PeriodicWave | null = null

  /** 获取 AudioContext，若未初始化则返回 null */
  private getCtx(): AudioContext | null {
    return AudioContextManager.getInstance().getContext()
  }

  /** 确保 PeriodicWave 已创建（懒初始化，避免 AudioContext 未就绪时报错） */
  private ensureWave(ctx: AudioContext): PeriodicWave {
    if (!this.periodicWave) {
      this.periodicWave = ctx.createPeriodicWave(real, imag, { disableNormalization: false })
    }
    return this.periodicWave
  }

  /**
   * 播放一个音符
   * @param freq - 频率 Hz
   * @param duration - 持续时长（秒），不含 release
   * @param startTime - Web Audio 时间轴上的开始时间，默认立即播放
   */
  playNote(freq: number, duration: number, startTime?: number): void {
    const ctx = this.getCtx()
    if (!ctx) return

    const wave = this.ensureWave(ctx)
    const now = startTime ?? ctx.currentTime
    const noteEnd = now + duration
    const releaseEnd = noteEnd + RELEASE

    // 创建振荡器
    const osc = ctx.createOscillator()
    osc.setPeriodicWave(wave)
    osc.frequency.value = freq

    // 创建增益节点（包络）
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0, now)
    // Attack
    gain.gain.linearRampToValueAtTime(1.0, now + ATTACK)
    // Decay → Sustain
    gain.gain.linearRampToValueAtTime(SUSTAIN, now + ATTACK + DECAY)
    // Sustain 保持到 noteEnd
    gain.gain.setValueAtTime(SUSTAIN, noteEnd)
    // Release
    gain.gain.linearRampToValueAtTime(0.001, releaseEnd)

    // 连接音频图
    osc.connect(gain)
    gain.connect(ctx.destination)

    // 调度播放与停止
    osc.start(now)
    osc.stop(releaseEnd)

    // 记录活跃节点
    const entry = { osc, gain }
    this.activeNodes.push(entry)

    // 播放结束后自动清理
    osc.onended = () => {
      osc.disconnect()
      gain.disconnect()
      const idx = this.activeNodes.indexOf(entry)
      if (idx !== -1) this.activeNodes.splice(idx, 1)
    }
  }

  /** 立即停止所有正在播放的音符 */
  stopAll(): void {
    const ctx = this.getCtx()
    const now = ctx?.currentTime ?? 0
    for (const { osc, gain } of this.activeNodes) {
      try {
        gain.gain.cancelScheduledValues(now)
        gain.gain.setValueAtTime(0.001, now)
        osc.stop(now + 0.01)
      } catch {
        // 节点可能已停止，忽略
      }
    }
    this.activeNodes = []
  }
}
