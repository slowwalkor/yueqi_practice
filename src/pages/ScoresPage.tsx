import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { PRACTICE_SCORES, Score } from '../data/practiceScores'
import { FINGERING_CHART } from '../data/fingeringChart'
import { useAudio } from '../context/AudioCtx'
import { DiziSynth } from '../audio/DiziSynth'
import { getFrequenciesForKey, NoteFreq, SUPPORTED_KEYS, MusicalKey } from '../audio/keyTransposer'
import { parseScore, ParsedNote } from '../audio/scoreParser'
import { PracticePlayer } from '../audio/PracticePlayer'
import FingeringDiagram from '../components/FingeringDiagram'

const DIFFICULTY_COLORS = {
  '入门': 'bg-bamboo-50 text-bamboo',
  '初级': 'bg-blue-50 text-blue-700',
  '中级': 'bg-paper-warm text-gold',
} as const

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5] as const

// 组合标记 Unicode 码点
const COMBINING_DOT_BELOW = '\u0323'
const COMBINING_DOT_ABOVE = '\u0307'

type DifficultyFilter = '全部' | '入门' | '初级' | '中级'

/** 从 Score.key 中提取调号字母，如 "1=D 筒音作5" => "D" */
function extractKeyFromScore(keyStr: string): string {
  const match = keyStr.match(/1=([A-G])/)
  return match ? match[1] : 'D'
}

/** 解析单个token为音名 */
function tokenToNoteName(token: string): string | null {
  if (token === '0') return '休止'
  const digit = token.charAt(0)
  if (digit < '1' || digit > '7') return null
  const hasBelow = token.includes(COMBINING_DOT_BELOW)
  const hasAbove = token.includes(COMBINING_DOT_ABOVE)
  if (hasBelow) return `低音${digit}`
  if (hasAbove) return `高音${digit}`
  return `中音${digit}`
}

// ============================================================
// MicroFingering — 超小型指法图，用于曲谱内联显示
// ============================================================
function MicroFingering({ fingers }: { fingers: boolean[] }) {
  return (
    <div className="flex items-center justify-center gap-[1px] mt-0.5">
      {fingers.slice(0, 3).map((pressed, i) => (
        <div
          key={`L${i}`}
          className={`w-[6px] h-[6px] rounded-full ${
            pressed ? 'bg-gray-700' : 'border border-gray-400 bg-white'
          }`}
        />
      ))}
      <div className="w-[2px]" />
      {fingers.slice(3, 6).map((pressed, i) => (
        <div
          key={`R${i}`}
          className={`w-[6px] h-[6px] rounded-full ${
            pressed ? 'bg-gray-700' : 'border border-gray-400 bg-white'
          }`}
        />
      ))}
    </div>
  )
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

  const defaultKey = extractKeyFromScore(score.key) as MusicalKey
  const [selectedKey, setSelectedKey] = useState<MusicalKey>(defaultKey)
  const freqMap: NoteFreq[] = useMemo(() => getFrequenciesForKey(selectedKey), [selectedKey])
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

  const handleKeyChange = useCallback((key: MusicalKey) => {
    if (key === selectedKey) return
    // 如果正在播放，停止并重置
    if (playerRef.current) {
      playerRef.current.stop()
      playerRef.current = null
      setIsPlaying(false)
      setCurrentIndex(-1)
    }
    setSelectedKey(key)
  }, [selectedKey])

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
              ${isCurrent ? 'bg-vermilion/20 text-vermilion font-bold scale-125 transform ring-1 ring-vermilion/30' : ''}
              ${isPast ? 'text-ink-wash' : ''}
              ${!isCurrent && !isPast ? 'text-ink' : ''}
            `}
          >
            {token}
          </span>
        )
      }
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
        <span className="text-xs text-gray-500 font-medium">当前：{selectedKey}调 筒音作5</span>
      </div>

      {/* 进度指示 */}
      <div className="text-center text-xs text-gray-500 mb-3">
        第 {currentIndex >= 0 ? currentIndex + 1 : 0} / {parsedNotes.length} 音
      </div>

      {/* 曲谱区 */}
      <div className="flex-1 card-classical bg-paper p-4 overflow-y-auto mb-3 leading-loose">
        {renderScoreTokens()}
      </div>

      {/* 控制栏 */}
      <div className="bg-ink rounded-xl p-4 shadow-lg mb-3">
        <div className="flex items-center justify-center gap-4 mb-3">
          <button
            onClick={handleStop}
            className="w-10 h-10 rounded-full bg-ink-light/50 flex items-center justify-center text-white active:scale-90 transition-transform"
          >
            ⏹
          </button>
          <button
            onClick={handlePlayPause}
            className="w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl shadow-lg active:scale-90 transition-transform"
            style={{ background: 'linear-gradient(135deg, #4a7c23, #2d5016)' }}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          <div className="w-10" />
        </div>

        {/* 调性选择 */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-xs text-white/60 mr-1">调性</span>
          {SUPPORTED_KEYS.map((k) => (
            <button
              key={k}
              onClick={() => handleKeyChange(k)}
              className={`min-h-[32px] px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedKey === k
                  ? 'bg-bamboo-light text-white'
                  : 'bg-ink-light/30 text-white/70'
              }`}
            >
              {k}
            </button>
          ))}
        </div>

        {/* 速度选择 */}
        <div className="flex items-center justify-center gap-2">
          <span className="text-xs text-white/60 mr-1">速度</span>
          {SPEED_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => handleSpeedChange(s)}
              className={`min-h-[32px] px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                speed === s
                  ? 'bg-bamboo-light text-white'
                  : 'bg-ink-light/30 text-white/70'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* 底部指法栏 */}
      <div className="fixed bottom-16 left-0 right-0 bg-paper/95 backdrop-blur-md px-4 py-3 shadow-[0_-2px_10px_rgba(0,0,0,0.08)] border-t border-bamboo-100">
        <div className="flex items-center justify-center gap-3">
          {currentFingering ? (
            <>
              <FingeringDiagram
                fingers={currentFingering.fingers}
                note={currentFingering.note}
                compact
                active
              />
              <span className="text-sm font-medium text-bamboo">{currentFingering.note}</span>
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
// ScoreDetail — 曲谱详情（带内联指法显示）
// ============================================================
function ScoreDetail({ score, onBack, onPractice }: { score: Score; onBack: () => void; onPractice: () => void }) {
  /** 解析 lines 为带指法的渲染数据 */
  const renderInlineFingering = () => {
    const elements: React.ReactNode[] = []

    for (let lineIdx = 0; lineIdx < score.lines.length; lineIdx++) {
      const line = score.lines[lineIdx]
      const tokens = line.split(/\s+/).filter(t => t.length > 0)
      const lineElements: React.ReactNode[] = []

      for (let tIdx = 0; tIdx < tokens.length; tIdx++) {
        const token = tokens[tIdx]

        // 小节线
        if (token === '|') {
          lineElements.push(
            <div key={`bar-${lineIdx}-${tIdx}`} className="flex items-center px-0.5 self-stretch">
              <div className="w-[1px] h-full bg-gray-300 min-h-[40px]" />
            </div>
          )
          continue
        }

        // 延长符
        if (token === '-') {
          lineElements.push(
            <div key={`ext-${lineIdx}-${tIdx}`} className="flex flex-col items-center justify-start w-8">
              <span className="text-lg font-mono text-gray-400 leading-tight">-</span>
              <div className="h-[10px]" />
            </div>
          )
          continue
        }

        // 休止符
        if (token === '0') {
          lineElements.push(
            <div key={`rest-${lineIdx}-${tIdx}`} className="flex flex-col items-center justify-start w-8">
              <span className="text-lg font-mono text-gray-400 leading-tight">0</span>
              <div className="h-[10px]" />
            </div>
          )
          continue
        }

        // 音符
        const noteName = tokenToNoteName(token)
        const fingering = noteName ? FINGERING_CHART.find(f => f.note === noteName) : null

        lineElements.push(
          <div key={`note-${lineIdx}-${tIdx}`} className="flex flex-col items-center justify-start w-8">
            <span className="text-lg font-mono text-gray-800 leading-tight">{token}</span>
            {fingering ? (
              <MicroFingering fingers={fingering.fingers} />
            ) : (
              <div className="h-[10px]" />
            )}
          </div>
        )
      }

      elements.push(
        <div key={`line-${lineIdx}`} className="flex flex-wrap items-start gap-y-3 mb-2">
          {lineElements}
        </div>
      )
    }

    return elements
  }

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-bamboo mb-4"
      >
        <span>←</span>
        <span className="text-sm">返回列表</span>
      </button>

      <div className="card-classical bg-paper p-5 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-xl font-bold font-brush text-ink">{score.title}</h2>
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
            className="ml-auto min-h-[44px] px-4 py-2 rounded-full text-white text-xs font-medium flex items-center gap-1 active:scale-95 transition-transform btn-primary"
          >
            ▶ 跟练
          </button>
        </div>

        {/* 曲谱区：内联指法显示 */}
        <div className="bg-paper-warm rounded-lg p-4 overflow-x-auto border border-bamboo-100/50">
          {renderInlineFingering()}
        </div>

        {/* 指法图例 */}
        <div className="mt-3 flex items-center gap-3 text-[10px] text-gray-400">
          <span>图例：</span>
          <span className="flex items-center gap-0.5">
            <span className="inline-block w-[6px] h-[6px] rounded-full bg-gray-700" /> 按住
          </span>
          <span className="flex items-center gap-0.5">
            <span className="inline-block w-[6px] h-[6px] rounded-full border border-gray-400" /> 放开
          </span>
          <span className="text-gray-300">|</span>
          <span>左3孔 · 右3孔</span>
        </div>
      </div>

      <div className="bg-bamboo-50 border border-bamboo-100 rounded-lg px-4 py-3">
        <p className="text-xs text-bamboo-dark">
          <strong>练习建议：</strong>先用手指空按熟悉指法，再慢速吹奏（比标注速度慢一半），
          最后逐渐加速到标准速度。
        </p>
      </div>
    </div>
  )
}

// ============================================================
// ScoresPage — 主页（含难度筛选）
// ============================================================
export default function ScoresPage() {
  const navigate = useNavigate()
  const [selectedScore, setSelectedScore] = useState<Score | null>(null)
  const [practiceMode, setPracticeMode] = useState(false)
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('全部')

  const filteredScores = useMemo(() => {
    if (difficultyFilter === '全部') return PRACTICE_SCORES
    return PRACTICE_SCORES.filter(s => s.difficulty === difficultyFilter)
  }, [difficultyFilter])

  const groupedScores = useMemo(() => ({
    '入门': filteredScores.filter(s => s.difficulty === '入门'),
    '初级': filteredScores.filter(s => s.difficulty === '初级'),
    '中级': filteredScores.filter(s => s.difficulty === '中级'),
  }), [filteredScores])

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
    <div className="p-6 pb-24 page-enter">
      <button
        onClick={() => navigate('/tools/reference')}
        className="flex items-center gap-1 text-bamboo mb-4"
      >
        <span>←</span>
        <span className="text-sm">返回参考</span>
      </button>

      <h1 className="text-2xl font-bold font-brush text-bamboo mb-1">练习曲谱</h1>
      <p className="text-ink-wash text-sm mb-4">课程配套曲目，按难度分级 · 共{PRACTICE_SCORES.length}首</p>

      {/* 难度筛选 */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {(['全部', '入门', '初级', '中级'] as DifficultyFilter[]).map((level) => (
          <button
            key={level}
            onClick={() => setDifficultyFilter(level)}
            className={`min-h-[36px] px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              difficultyFilter === level
                ? 'btn-primary shadow-sm'
                : 'bg-bamboo-50 text-ink-light hover:bg-bamboo-100'
            }`}
          >
            {level}
            {level !== '全部' && (
              <span className="ml-1 opacity-70">
                {PRACTICE_SCORES.filter(s => s.difficulty === level).length}
              </span>
            )}
          </button>
        ))}
      </div>

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
                  className="w-full flex items-center gap-3 p-4 card-classical bg-paper active:scale-[0.98] transition-transform text-left"
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
