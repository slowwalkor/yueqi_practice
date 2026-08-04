import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { PRACTICE_SCORES, Score } from '../data/practiceScores'
import { FINGERING_CHART } from '../data/fingeringChart'
import { useAudio } from '../context/AudioCtx'
import { DiziSynth } from '../audio/DiziSynth'
import { getFrequenciesForKey, NoteFreq } from '../audio/keyTransposer'
import { parseScore, ParsedNote } from '../audio/scoreParser'
import { PracticePlayer } from '../audio/PracticePlayer'
import FingeringDiagram from '../components/FingeringDiagram'

const DIFFICULTY_COLORS = {
  '入门': 'bg-green-100 text-green-700',
  '初级': 'bg-blue-100 text-blue-700',
  '中级': 'bg-orange-100 text-orange-700',
} as const

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5] as const

/** 从 Score.key 中提取调号字母，如 "1=D 筒音作5" => "D" */
function extractKeyFromScore(keyStr: string): string {
  const match = keyStr.match(/1=([A-G])/)
  return match ? match[1] : 'D'
}

// ============================================================
// PracticeView — 跟练子组件
// ============================================================
function PracticeView({ score, onExit }: { score: Score; onExit: () => void }) {
  const { initialize } = useAudio()
  const synthRef = useRef<DiziSynth | null>(null)
  const playerRef = useRef<PracticePlayer | null>(null)

  const [currentIndex, setCurrentIndex] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)

  const keyLetter = extractKeyFromScore(score.key)
  const freqMap: NoteFreq[] = useMemo(() => getFrequenciesForKey(keyLetter as any), [keyLetter])
  const parsedNotes: ParsedNote[] = useMemo(
    () => parseScore(score.lines, score.tempo, score.timeSignature),
    [score]
  )

  // 当前音符对应的指法
  const currentFingering = useMemo(() => {
    if (currentIndex < 0 || currentIndex >= parsedNotes.length) return null
    const note = parsedNotes[currentIndex]
    if (note.isRest) return null
    return FINGERING_CHART.find(f => f.note === note.noteName) || null
  }, [currentIndex, parsedNotes])

  // 清理 player
  useEffect(() => {
    return () => {
      playerRef.current?.stop()
    }
  }, [])

  const handlePlayPause = useCallback(async () => {
    await initialize()
    if (!synthRef.current) {
      synthRef.current = new DiziSynth()
    }

    if (!playerRef.current) {
      playerRef.current = new PracticePlayer(
        synthRef.current,
        parsedNotes,
        freqMap,
        (idx) => {
          setCurrentIndex(idx)
          if (idx === -1) {
            // 播放完毕
            setIsPlaying(false)
            setCurrentIndex(-1)
            playerRef.current = null
          }
        }
      )
      playerRef.current.setSpeed(speed)
      playerRef.current.start()
      setIsPlaying(true)
    } else if (playerRef.current.isPlaying) {
      playerRef.current.pause()
      setIsPlaying(false)
    } else {
      playerRef.current.resume()
      setIsPlaying(true)
    }
  }, [initialize, parsedNotes, freqMap, speed])

  const handleStop = useCallback(() => {
    playerRef.current?.stop()
    playerRef.current = null
    setIsPlaying(false)
    setCurrentIndex(-1)
  }, [])

  const handleSpeedChange = useCallback((s: number) => {
    setSpeed(s)
    playerRef.current?.setSpeed(s)
  }, [])

  // 将 lines 中所有 token 渲染为逐个 span
  const renderScoreTokens = () => {
    const elements: React.ReactNode[] = []
    let noteIdx = 0

    for (let lineIdx = 0; lineIdx < score.lines.length; lineIdx++) {
      const line = score.lines[lineIdx]
      const tokens = line.split(/\s+/).filter(t => t.length > 0)

      for (const token of tokens) {
        if (token === '|') {
          elements.push(
            <span key={`bar-${lineIdx}-${elements.length}`} className="mx-1 text-gray-300 font-mono">|</span>
          )
          continue
        }

        if (token === '-') {
          // 延长符属于前一个音符，不单独计数
          elements.push(
            <span key={`ext-${lineIdx}-${elements.length}`} className="mx-0.5 font-mono text-gray-400">-</span>
          )
          continue
        }

        const idx = noteIdx
        noteIdx++
        const isCurrent = idx === currentIndex
        const isPast = currentIndex >= 0 && idx < currentIndex

        elements.push(
          <span
            key={`note-${idx}`}
            className={`
              inline-block mx-0.5 px-1 py-0.5 rounded font-mono text-lg transition-all duration-150
              ${isCurrent ? 'bg-[#fef3c7] text-gray-900 font-bold scale-125 transform' : ''}
              ${isPast ? 'text-gray-400' : ''}
              ${!isCurrent && !isPast ? 'text-gray-800' : ''}
            `}
          >
            {token}
          </span>
        )
      }
      // 换行
      elements.push(<br key={`br-${lineIdx}`} />)
    }
    return elements
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-6rem)]">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={onExit} className="flex items-center gap-1 text-bamboo">
          <span>←</span>
          <span className="text-sm">返回</span>
        </button>
        <h2 className="text-base font-bold text-gray-800">{score.title}</h2>
        <span className="text-xs text-gray-400">{score.key}</span>
      </div>

      {/* 进度指示 */}
      <div className="text-center text-xs text-gray-500 mb-3">
        第 {currentIndex >= 0 ? currentIndex + 1 : 0} / {parsedNotes.length} 音
      </div>

      {/* 曲谱区 */}
      <div className="flex-1 bg-white rounded-xl p-4 shadow-sm overflow-y-auto mb-3 leading-loose">
        {renderScoreTokens()}
      </div>

      {/* 控制栏 */}
      <div className="bg-white rounded-xl p-4 shadow-sm mb-3">
        <div className="flex items-center justify-center gap-4 mb-3">
          {/* 停止 */}
          <button
            onClick={handleStop}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 active:scale-90 transition-transform"
          >
            ⏹
          </button>
          {/* 播放/暂停 */}
          <button
            onClick={handlePlayPause}
            className="w-14 h-14 rounded-full bg-[#2d5016] flex items-center justify-center text-white text-2xl shadow-lg active:scale-90 transition-transform"
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          {/* 占位对齐 */}
          <div className="w-10" />
        </div>

        {/* 速度选择 */}
        <div className="flex items-center justify-center gap-2">
          <span className="text-xs text-gray-500 mr-1">速度</span>
          {SPEED_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => handleSpeedChange(s)}
              className={`min-h-[32px] px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                speed === s
                  ? 'bg-[#2d5016] text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* 底部指法栏 */}
      <div className="fixed bottom-16 left-0 right-0 bg-white px-4 py-3 shadow-[0_-2px_10px_rgba(0,0,0,0.1)]">
        <div className="flex items-center justify-center gap-3">
          {currentFingering ? (
            <>
              <FingeringDiagram
                fingers={currentFingering.fingers}
                note={currentFingering.note}
                compact
                active
              />
              <span className="text-sm font-medium text-[#2d5016]">{currentFingering.note}</span>
            </>
          ) : (
            <span className="text-sm text-gray-400">
              {currentIndex >= 0 && parsedNotes[currentIndex]?.isRest ? '🤫 休止' : '等待播放...'}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================
// ScoreDetail — 曲谱详情（增加跟练入口）
// ============================================================
function ScoreDetail({ score, onBack, onPractice }: { score: Score; onBack: () => void; onPractice: () => void }) {
  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-bamboo mb-4"
      >
        <span>←</span>
        <span className="text-sm">返回列表</span>
      </button>

      <div className="bg-white rounded-xl p-5 shadow-sm mb-4">
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-xl font-bold text-gray-800">{score.title}</h2>
          <span className={`text-xs px-2 py-0.5 rounded-full ${DIFFICULTY_COLORS[score.difficulty]}`}>
            {score.difficulty}
          </span>
        </div>

        <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-4">
          <span>🎵 {score.key}</span>
          <span>⏱ {score.tempo}</span>
          <span>📐 {score.timeSignature}</span>
          <span>📚 第{score.phase}阶段</span>
          {/* 跟练按钮 */}
          <button
            onClick={onPractice}
            className="ml-auto min-h-[44px] px-4 py-2 rounded-full bg-[#2d5016] text-white text-xs font-medium flex items-center gap-1 active:scale-95 transition-transform"
          >
            ▶ 跟练
          </button>
        </div>

        <div className="bg-cream rounded-lg p-4">
          {score.lines.map((line, i) => (
            <p key={i} className="font-mono text-lg leading-loose text-gray-800 tracking-wide">
              {line}
            </p>
          ))}
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
        <p className="text-xs text-amber-700">
          <strong>练习建议：</strong>先用手指空按熟悉指法，再慢速吹奏（比标注速度慢一半），
          最后逐渐加速到标准速度。
        </p>
      </div>
    </div>
  )
}

// ============================================================
// ScoresPage — 主页
// ============================================================
export default function ScoresPage() {
  const navigate = useNavigate()
  const [selectedScore, setSelectedScore] = useState<Score | null>(null)
  const [practiceMode, setPracticeMode] = useState(false)

  const groupedScores = {
    '入门': PRACTICE_SCORES.filter(s => s.difficulty === '入门'),
    '初级': PRACTICE_SCORES.filter(s => s.difficulty === '初级'),
    '中级': PRACTICE_SCORES.filter(s => s.difficulty === '中级'),
  }

  // 跟练模式
  if (practiceMode && selectedScore) {
    return (
      <div className="p-6 pb-24">
        <PracticeView
          score={selectedScore}
          onExit={() => setPracticeMode(false)}
        />
      </div>
    )
  }

  // 曲谱详情
  if (selectedScore) {
    return (
      <div className="p-6 pb-24">
        <ScoreDetail
          score={selectedScore}
          onBack={() => setSelectedScore(null)}
          onPractice={() => setPracticeMode(true)}
        />
      </div>
    )
  }

  // 曲谱列表
  return (
    <div className="p-6 pb-24">
      <button
        onClick={() => navigate('/tools/reference')}
        className="flex items-center gap-1 text-bamboo mb-4"
      >
        <span>←</span>
        <span className="text-sm">返回参考</span>
      </button>

      <h1 className="text-2xl font-bold text-bamboo mb-1">练习曲谱</h1>
      <p className="text-gray-500 text-sm mb-6">课程配套曲目，按难度分级</p>

      {Object.entries(groupedScores).map(([level, scores]) => (
        scores.length > 0 && (
          <section key={level} className="mb-6">
            <h2 className="text-base font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded-full ${DIFFICULTY_COLORS[level as keyof typeof DIFFICULTY_COLORS]}`}>
                {level}
              </span>
              <span className="text-xs text-gray-400">{scores.length}首</span>
            </h2>
            <div className="space-y-2">
              {scores.map((score) => (
                <button
                  key={score.id}
                  onClick={() => setSelectedScore(score)}
                  className="w-full flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100 active:scale-[0.98] transition-transform text-left"
                >
                  <div className="flex-1">
                    <h3 className="text-base font-medium text-gray-800">{score.title}</h3>
                    <p className="text-xs text-gray-400 mt-1">
                      {score.key} · {score.tempo} · {score.timeSignature}
                    </p>
                  </div>
                  <span className="text-gray-300 text-lg">›</span>
                </button>
              ))}
            </div>
          </section>
        )
      ))}
    </div>
  )
}
