export class AudioContextManager {
  private static instance: AudioContextManager
  private audioCtx: AudioContext | null = null
  private initialized = false
  private recoverySetup = false

  static getInstance(): AudioContextManager {
    if (!AudioContextManager.instance) {
      AudioContextManager.instance = new AudioContextManager()
    }
    return AudioContextManager.instance
  }

  // 用户交互时调用，创建/resume AudioContext
  async initialize(): Promise<AudioContext> {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    if (this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume()
    }
    this.setupRecovery()
    this.initialized = true
    return this.audioCtx
  }

  getContext(): AudioContext | null {
    return this.audioCtx
  }

  isReady(): boolean {
    return this.initialized && this.audioCtx?.state === 'running'
  }

  // visibilitychange 恢复：页面从后台回来时自动resume
  private setupRecovery() {
    if (this.recoverySetup) return
    this.recoverySetup = true
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.audioCtx?.state === 'suspended') {
        this.audioCtx.resume()
      }
    })
  }

  // 释放资源
  async dispose() {
    if (this.audioCtx) {
      await this.audioCtx.close()
      this.audioCtx = null
      this.initialized = false
    }
  }
}
