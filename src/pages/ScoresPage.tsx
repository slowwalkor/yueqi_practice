import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PRACTICE_SCORES, Score } from '../data/practiceScores'

const DIFFICULTY_COLORS = {
  '入门': 'bg-green-100 text-green-700',
  '初级': 'bg-blue-100 text-blue-700',
  '中级': 'bg-orange-100 text-orange-700',
} as const

function ScoreDetail({ score, onBack }: { score: Score; onBack: () => void }) {
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

export default function ScoresPage() {
  const navigate = useNavigate()
  const [selectedScore, setSelectedScore] = useState<Score | null>(null)

  const groupedScores = {
    '入门': PRACTICE_SCORES.filter(s => s.difficulty === '入门'),
    '初级': PRACTICE_SCORES.filter(s => s.difficulty === '初级'),
    '中级': PRACTICE_SCORES.filter(s => s.difficulty === '中级'),
  }

  if (selectedScore) {
    return (
      <div className="p-6 pb-24">
        <ScoreDetail score={selectedScore} onBack={() => setSelectedScore(null)} />
      </div>
    )
  }

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
