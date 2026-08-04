import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { AudioContextManager } from '../audio/AudioContextManager'
import { Metronome, TimeSignature } from '../audio/Metronome'

const TIME_SIGNATURES: TimeSignature[] = ['2/4', '3/4', '4/4']

export default function MetronomePage() {
  const navigate = useNavigate()
  const [bpm, setBpm] = useState(120)
  const [timeSignature, setTimeSignature] = useState<TimeSignature>('4/4')
  const [playing, setPlaying] = useState(false)
  const [activeBeat, setActiveBeat] = useState(-1)
  const [isStrongBeat, setIsStrongBeat] = useState(false)

  const metronomeRef = useRef<Metronome | null>(null)
  const managerRef = useRef(AudioContextManager.getInstance())

  const beatsPerMeasure = parseInt(timeSignature.split('/')[0])

  // 初始化并启动节拍器
  const startMetronome = useCallback(async () => {
    const ctx = await managerRef.current.initialize()

    if (!metronomeRef.current) {
      metronomeRef.current = new Metronome(ctx)
    }

    metronomeRef.current.setBPM(bpm)
    metronomeRef.current.setTimeSignature(timeSignature)
    metronomeRef.current.onBeat((beat, strong) => {
      setActiveBeat(beat)
      setIsStrongBeat(strong)
    })
    metronomeRef.current.start()
    setPlaying(true)
  }, [bpm, timeSignature])

  // 停止节拍器
  const stopMetronome = useCallback(() => {
    metronomeRef.current?.stop()
    setPlaying(false)
    setActiveBeat(-1)
  }, [])

  // 切换播放/停止
  const togglePlay = useCallback(() => {
    if (playing) {
      stopMetronome()
    } else {
      startMetronome()
    }
  }, [playing, startMetronome, stopMetronome])

  // BPM实时更新
  useEffect(() => {
    if (metronomeRef.current && playing) {
      metronomeRef.current.setBPM(bpm)
    }
  }, [bpm, playing])

  // 拍号实时更新
  useEffect(() => {
    if (metronomeRef.current && playing) {
      metronomeRef.current.setTimeSignature(timeSignature)
    }
  }, [timeSignature, playing])

  // 页面离开/后台时自动停止
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && playing) {
        stopMetronome()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      // 页面卸载时停止
      metronomeRef.current?.stop()
    }
  }, [playing, stopMetronome])

  return (
    <div className="flex flex-col items-center min-h-full px-4 py-6 bg-cream">
      {/* 顶部导航 */}
      <div className="w-full flex items-center mb-8">
        <button
          onClick={() => {
            stopMetronome()
            navigate('/tools')
          }}
          className="flex items-center text-bamboo font-medium"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回
        </button>
        <h1 className="flex-1 text-center text-xl font-bold text-bamboo-dark pr-12">节拍器</h1>
      </div>

      {/* 大圆BPM显示 */}
      <div className="w-44 h-44 rounded-full border-4 border-bamboo/30 flex flex-col items-center justify-center mb-8 bg-white shadow-lg">
        <span className="text-5xl font-bold text-bamboo-dark">{bpm}</span>
        <span className="text-sm text-gray-500 mt-1">BPM</span>
        <span className="text-lg font-medium text-amber mt-1">{timeSignature}</span>
      </div>

      {/* 节拍指示灯 */}
      <div className="flex gap-3 mb-8">
        {Array.from({ length: beatsPerMeasure }).map((_, i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full transition-all duration-100 ${
              activeBeat === i
                ? isStrongBeat && i === 0
                  ? 'bg-amber scale-150 shadow-md shadow-amber/50'
                  : 'bg-bamboo-light scale-125 shadow-md shadow-bamboo-light/50'
                : 'bg-gray-300'
            }`}
          />
        ))}
      </div>

      {/* BPM 滑块 */}
      <div className="w-full max-w-xs mb-6">
        <input
          type="range"
          min={40}
          max={200}
          value={bpm}
          onChange={(e) => setBpm(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-bamboo"
        />
        <div className="flex justify-between mt-2">
          <button
            onClick={() => setBpm((v) => Math.max(40, v - 1))}
            className="w-10 h-10 rounded-full bg-white border border-gray-300 flex items-center justify-center text-xl font-bold text-bamboo active:bg-gray-100"
          >
            −
          </button>
          <button
            onClick={() => setBpm((v) => Math.min(200, v + 1))}
            className="w-10 h-10 rounded-full bg-white border border-gray-300 flex items-center justify-center text-xl font-bold text-bamboo active:bg-gray-100"
          >
            +
          </button>
        </div>
      </div>

      {/* 拍号选择 */}
      <div className="flex gap-3 mb-10">
        {TIME_SIGNATURES.map((ts) => (
          <button
            key={ts}
            onClick={() => setTimeSignature(ts)}
            className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
              timeSignature === ts
                ? 'bg-bamboo text-white shadow-md'
                : 'bg-white text-bamboo border border-bamboo/30'
            }`}
          >
            {ts}
          </button>
        ))}
      </div>

      {/* 开始/停止按钮 */}
      <button
        onClick={togglePlay}
        className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-lg active:scale-95 transition-transform ${
          playing ? 'bg-red-500' : 'bg-bamboo'
        }`}
      >
        {playing ? (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        ) : (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>
      <span className="mt-2 text-sm text-gray-500">{playing ? '停止' : '开始'}</span>
    </div>
  )
}
