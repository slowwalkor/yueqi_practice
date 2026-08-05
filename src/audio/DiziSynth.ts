import { AudioContextManager } from './AudioContextManager'

// ─── 竹笛谐波谱（基于开管声学分析）───
// 竹笛为开管乐器，奇偶谐波均存在，高次谐波快速衰减
// real: 余弦系数（轻微相位偏移增加丰富度）
// imag: 正弦系数（基波最强，高次谐波逐渐衰减）
const HARMONIC_REAL = new Float32Array([0, 0, 0.10, 0.05, 0.02, 0, 0, 0, 0])
const HARMONIC_IMAG = new Float32Array([0, 1.0, 0.75, 0.50, 0.30, 0.15, 0.08, 0.04, 0.02])

// ─── ADSR 包络参数（秒）───
// 竹笛起音有气息建立过程，不如铜管快
const ATTACK = 0.06     // 60ms 起音（模拟气息建立）
const DECAY = 0.08      // 80ms 衰减
const SUSTAIN = 0.75    // 持续音量比例
const RELEASE = 0.20    // 200ms 释放（尾音有渐弱气息感）

// ─── Vibrato（颤音）参数 ───
const VIBRATO_RATE = 5.5     // Hz，颤音频率
const VIBRATO_DEPTH = 0.006  // 音高偏移比例（约±10 cents）
const VIBRATO_DELAY = 0.15   // 秒，延迟启动（先稳定音高再揉音）

// ─── 气息噪声参数 ───
const NOISE_ATTACK_LEVEL = 0.18   // 起音时噪声混合量
const NOISE_SUSTAIN_LEVEL = 0.06  // 持续时噪声混合量
const NOISE_BANDPASS_Q = 2.0      // 带通滤波 Q 值
const NOISE_FREQ_RATIO = 2.5      // 噪声中心频率 = 音高 × 此比值

// ─── 笛膜效果参数 ───
const MEMBRANE_RATE = 9.0         // Hz，膜颤动频率
const MEMBRANE_DEPTH = 0.04       // 幅度调制深度

/** 活跃音符的所有节点，用于停止和清理 */
interface ActiveNote {
  osc: OscillatorNode
  gain: GainNode
  noiseSource: AudioBufferSourceNode
  noiseGain: GainNode
  lfo: OscillatorNode
  lfoGain: GainNode
  membraneLfo: OscillatorNode
  membraneGain: GainNode
  masterGain: GainNode
}

/**
 * 竹笛音色合成器 v2
 * 通过多层音频图模拟真实竹笛音色：
 * - PeriodicWave 谐波合成（主音源）
 * - 气息噪声层（带通滤波的白噪声）
 * - Vibrato 颤音（LFO 调制音高）
 * - 笛膜效果（低频幅度调制）
 */
export class DiziSynth {
  private activeNodes: ActiveNote[] = []
  private periodicWave: PeriodicWave | null = null
  private noiseBuffer: AudioBuffer | null = null

  /** 获取 AudioContext，若未初始化则返回 null */
  private getCtx(): AudioContext | null {
    return AudioContextManager.getInstance().getContext()
  }

  /** 确保 PeriodicWave 已创建（懒初始化） */
  private ensureWave(ctx: AudioContext): PeriodicWave {
    if (!this.periodicWave) {
      this.periodicWave = ctx.createPeriodicWave(HARMONIC_REAL, HARMONIC_IMAG, {
        disableNormalization: false
      })
    }
    return this.periodicWave
  }

  /** 确保噪声缓冲区已创建（懒初始化，2秒白噪声循环） */
  private ensureNoiseBuffer(ctx: AudioContext): AudioBuffer {
    if (!this.noiseBuffer) {
      const bufferSize = ctx.sampleRate * 2
      this.noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const data = this.noiseBuffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1
      }
    }
    return this.noiseBuffer
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
    const noiseBuf = this.ensureNoiseBuffer(ctx)
    const now = startTime ?? ctx.currentTime
    const noteEnd = now + duration
    const releaseEnd = noteEnd + RELEASE

    // ═══ 主振荡器（PeriodicWave 谐波合成）═══
    const osc = ctx.createOscillator()
    osc.setPeriodicWave(wave)
    osc.frequency.setValueAtTime(freq, now)

    // 主音源增益（ADSR 包络）
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(1.0, now + ATTACK)
    gain.gain.linearRampToValueAtTime(SUSTAIN, now + ATTACK + DECAY)
    gain.gain.setValueAtTime(SUSTAIN, noteEnd)
    gain.gain.linearRampToValueAtTime(0.001, releaseEnd)

    // ═══ Vibrato（颤音 LFO → 调制主振荡器频率）═══
    const lfo = ctx.createOscillator()
    lfo.type = 'sine'
    lfo.frequency.setValueAtTime(VIBRATO_RATE, now)

    const lfoGain = ctx.createGain()
    // vibrato 深度 = freq × VIBRATO_DEPTH
    const vibratoAmount = freq * VIBRATO_DEPTH
    // 延迟启动：前 VIBRATO_DELAY 秒无颤音，之后渐入
    lfoGain.gain.setValueAtTime(0, now)
    lfoGain.gain.setValueAtTime(0, now + VIBRATO_DELAY)
    lfoGain.gain.linearRampToValueAtTime(vibratoAmount, now + VIBRATO_DELAY + 0.1)

    lfo.connect(lfoGain)
    lfoGain.connect(osc.frequency)

    // ═══ 气息噪声层 ═══
    const noiseSource = ctx.createBufferSource()
    noiseSource.buffer = noiseBuf
    noiseSource.loop = true

    // 带通滤波器（中心频率跟随音高，模拟管内气流共振）
    const bandpass = ctx.createBiquadFilter()
    bandpass.type = 'bandpass'
    bandpass.frequency.setValueAtTime(freq * NOISE_FREQ_RATIO, now)
    bandpass.Q.setValueAtTime(NOISE_BANDPASS_Q, now)

    // 噪声增益包络（起音时气息噪声大，sustain 时降低）
    const noiseGain = ctx.createGain()
    noiseGain.gain.setValueAtTime(0, now)
    noiseGain.gain.linearRampToValueAtTime(NOISE_ATTACK_LEVEL, now + ATTACK * 0.5)
    noiseGain.gain.linearRampToValueAtTime(NOISE_SUSTAIN_LEVEL, now + ATTACK + DECAY)
    noiseGain.gain.setValueAtTime(NOISE_SUSTAIN_LEVEL, noteEnd)
    noiseGain.gain.linearRampToValueAtTime(0.001, releaseEnd)

    noiseSource.connect(bandpass)
    bandpass.connect(noiseGain)

    // ═══ 笛膜效果（低频幅度调制）═══
    const membraneLfo = ctx.createOscillator()
    membraneLfo.type = 'sine'
    membraneLfo.frequency.setValueAtTime(MEMBRANE_RATE, now)

    const membraneGain = ctx.createGain()
    membraneGain.gain.setValueAtTime(MEMBRANE_DEPTH, now)

    // ═══ 总线混合 ═══
    // masterGain 同时受 membraneLfo 的幅度调制
    const masterGain = ctx.createGain()
    masterGain.gain.setValueAtTime(1.0, now)

    // 膜效果：LFO → membraneGain → masterGain.gain（AM调制）
    membraneLfo.connect(membraneGain)
    membraneGain.connect(masterGain.gain)

    // 音频路由：
    // osc → gain ─────────┐
    //                      ├─→ masterGain → destination
    // noiseSource → bp → noiseGain ─┘
    osc.connect(gain)
    gain.connect(masterGain)
    noiseGain.connect(masterGain)
    masterGain.connect(ctx.destination)

    // ═══ 调度播放与停止 ═══
    osc.start(now)
    osc.stop(releaseEnd)
    lfo.start(now)
    lfo.stop(releaseEnd)
    noiseSource.start(now)
    noiseSource.stop(releaseEnd)
    membraneLfo.start(now)
    membraneLfo.stop(releaseEnd)

    // 记录活跃节点
    const entry: ActiveNote = {
      osc, gain, noiseSource, noiseGain,
      lfo, lfoGain, membraneLfo, membraneGain, masterGain
    }
    this.activeNodes.push(entry)

    // 播放结束后自动清理
    osc.onended = () => {
      osc.disconnect()
      gain.disconnect()
      lfo.disconnect()
      lfoGain.disconnect()
      noiseSource.disconnect()
      noiseGain.disconnect()
      bandpass.disconnect()
      membraneLfo.disconnect()
      membraneGain.disconnect()
      masterGain.disconnect()
      const idx = this.activeNodes.indexOf(entry)
      if (idx !== -1) this.activeNodes.splice(idx, 1)
    }
  }

  /** 立即停止所有正在播放的音符 */
  stopAll(): void {
    const ctx = this.getCtx()
    const now = ctx?.currentTime ?? 0
    for (const node of this.activeNodes) {
      try {
        node.masterGain.gain.cancelScheduledValues(now)
        node.masterGain.gain.setValueAtTime(0.001, now)
        node.gain.gain.cancelScheduledValues(now)
        node.gain.gain.setValueAtTime(0.001, now)
        node.noiseGain.gain.cancelScheduledValues(now)
        node.noiseGain.gain.setValueAtTime(0.001, now)
        node.osc.stop(now + 0.01)
        node.lfo.stop(now + 0.01)
        node.noiseSource.stop(now + 0.01)
        node.membraneLfo.stop(now + 0.01)
      } catch {
        // 节点可能已停止，忽略
      }
    }
    this.activeNodes = []
  }
}
