import { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAudio } from '../context/AudioCtx'
import { Tuner } from '../audio/Tuner'
import { PitchData } from '../audio/Tuner'

type TunerState = 'idle' | 'connecting' | 'listening'

export default function TunerPage() {
  const navigate = useNavigate()
  const { initialize, getManager } = useAudio()
  const tunerRef = useRef<Tuner | null>(null)

  const [state, setState] = useState<TunerState>('idle')
  const [pitchData, setPitchData] = useState<PitchData | null>(null)

  // 清理
  useEffect(() => {
    return () => {
      tunerRef.current?.stop()
    }
  }, [])

  const handleStart = useCallback(async () => {
    try {
      setState('connecting')
      await initialize()
      const audioCtx = getManager().getContext()!
      const tuner = new Tuner(audioCtx)
      tunerRef.current = tuner

      tuner.onPitch((data) => {
        setPitchData(data)
      })

      await tuner.start()
      setState('listening')
    } catch (err) {
      console.error('Tuner start failed:', err)
      setState('idle')
    }
  }, [initialize, getManager])

  const handleStop = useCallback(() => {
    tunerRef.current?.stop()
    tunerRef.current = null
    setState('idle')
    setPitchData(null)
  }, [])

  // 偏差条颜色
  const getCentsColor = (cents: number) => {
    const abs = Math.abs(cents)
    if (abs <= 5) return 'bg-green-500'
    if (abs <= 15) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  // 偏差文字
  const getCentsLabel = (cents: number) => {
    if (Math.abs(cents) <= 5) return '准确!'
    if (cents < 0) return '偏低'
    return '偏高'
  }

  // 大圆边框颜色
  const getCircleBorder = () => {
    if (state !== 'listening' || !pitchData) return 'border-gray-300'
    const abs = Math.abs(pitchData.cents)
    if (abs <= 5) return 'border-green-500'
    if (abs <= 15) return 'border-yellow-500'
    return 'border-red-400'
  }

  return (
    <div className="flex flex-col h-full bg-cream">
      {/* 顶部栏 */}
      <div className="flex items-center px-4 py-3 border-b border-gray-100">
        <button
          onClick={() => navigate('/tools')}
          className="p-2 -ml-2 text-bamboo"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="ml-2 text-lg font-bold text-bamboo">调音器</h1>
      </div>

      {/* 主内容 */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8">
        {/* 主显示圆 */}
        <div
          className={`w-48 h-48 rounded-full border-4 ${getCircleBorder()} flex flex-col items-center justify-center transition-colors duration-200`}
        >
          {state === 'idle' && (
            <span className="text-gray-400 text-center text-sm px-4">
              点击下方按钮
              <br />
              开始调音
            </span>
          )}
          {state === 'connecting' && (
            <span className="text-gray-500 text-sm animate-pulse">
              正在连接麦克风...
            </span>
          )}
          {state === 'listening' && !pitchData && (
            <span className="text-gray-400 text-sm">请吹奏...</span>
          )}
          {state === 'listening' && pitchData && (
            <>
              <span className="text-xs text-gray-500">{pitchData.note.name}</span>
              <span className="text-3xl font-bold text-bamboo mt-1">
                {pitchData.note.label}
              </span>
              <span className="text-xs text-gray-500 mt-1">
                {pitchData.frequency.toFixed(1)} Hz
              </span>
            </>
          )}
        </div>

        {/* 偏差指示器 */}
        <div className="w-[80%] flex flex-col items-center gap-2">
          {/* 标签行 */}
          <div className="w-full flex justify-between text-xs text-gray-400">
            <span>偏低</span>
            <span>偏高</span>
          </div>

          {/* 偏差条 */}
          <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            {/* 中心标记 */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-green-500 -translate-x-1/2 z-10" />

            {/* 指针 */}
            {state === 'listening' && pitchData && (
              <div
                className={`absolute top-0 h-full w-3 rounded-full ${getCentsColor(pitchData.cents)} transition-all duration-100`}
                style={{
                  left: `calc(${50 + (pitchData.cents / 50) * 50}% - 6px)`,
                }}
              />
            )}
          </div>

          {/* 状态文字 */}
          <div className="h-5 text-sm font-medium">
            {state === 'listening' && pitchData && (
              <span
                className={
                  Math.abs(pitchData.cents) <= 5
                    ? 'text-green-600'
                    : Math.abs(pitchData.cents) <= 15
                      ? 'text-yellow-600'
                      : 'text-red-500'
                }
              >
                {getCentsLabel(pitchData.cents)}
                {Math.abs(pitchData.cents) > 5 && (
                  <span className="ml-1 text-xs text-gray-400">
                    ({pitchData.cents > 0 ? '+' : ''}{pitchData.cents.toFixed(0)}¢)
                  </span>
                )}
              </span>
            )}
          </div>
        </div>

        {/* 信号强度 */}
        {state === 'listening' && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>信号</span>
            <div className="flex gap-0.5">
              {[0.2, 0.4, 0.6, 0.8, 1.0].map((threshold, i) => (
                <div
                  key={i}
                  className={`w-1.5 rounded-sm ${
                    pitchData && pitchData.clarity >= threshold
                      ? 'bg-bamboo'
                      : 'bg-gray-200'
                  }`}
                  style={{ height: `${8 + i * 3}px` }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 底部按钮 */}
      <div className="flex justify-center pb-8 pt-4">
        {state === 'idle' ? (
          <button
            onClick={handleStart}
            className="w-16 h-16 rounded-full bg-bamboo flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          >
            {/* 麦克风图标 */}
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4M12 15a3 3 0 003-3V5a3 3 0 00-6 0v7a3 3 0 003 3z"
              />
            </svg>
          </button>
        ) : state === 'connecting' ? (
          <button
            disabled
            className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center"
          >
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </button>
        ) : (
          <button
            onClick={handleStop}
            className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          >
            {/* 停止图标 */}
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
