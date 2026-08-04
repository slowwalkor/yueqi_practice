import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { FINGERING_CHART, FingeringNote } from '../data/fingeringChart'
import { useAudio } from '../context/AudioCtx'
import { DiziSynth } from '../audio/DiziSynth'
import { SUPPORTED_KEYS, MusicalKey, getFrequenciesForKey } from '../audio/keyTransposer'
import FingeringDiagram from '../components/FingeringDiagram'

export default function FingeringPage() {
  const navigate = useNavigate()
  const { initialize } = useAudio()
  const synthRef = useRef<DiziSynth | null>(null)
  const [selectedKey, setSelectedKey] = useState<MusicalKey>('D')
  const [activeNote, setActiveNote] = useState<string | null>(null)

  const freqs = getFrequenciesForKey(selectedKey)

  const handlePlay = useCallback(async (note: FingeringNote, index: number) => {
    await initialize()
    if (!synthRef.current) {
      synthRef.current = new DiziSynth()
    }
    const freq = freqs[index]?.freq
    if (freq) {
      synthRef.current.playNote(freq, 0.8)
    }
    setActiveNote(note.note)
    setTimeout(() => setActiveNote(null), 400)
  }, [initialize, freqs])

  return (
    <div className="p-6 pb-24">
      <button
        onClick={() => navigate('/tools/reference')}
        className="flex items-center gap-1 text-bamboo mb-4"
      >
        <span>←</span>
        <span className="text-sm">返回参考</span>
      </button>

      {/* 调性选择器 */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {SUPPORTED_KEYS.map((k) => (
          <button
            key={k}
            onClick={() => setSelectedKey(k)}
            className={`min-h-[44px] px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedKey === k
                ? 'bg-[#2d5016] text-white'
                : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            {k}调
          </button>
        ))}
      </div>

      <h1 className="text-2xl font-bold text-bamboo mb-1">{selectedKey}调竹笛指法表（筒音作5）</h1>
      <p className="text-gray-500 text-sm mb-2">点击卡片试听音色 · 6孔竹笛</p>

      <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-6">
        <p className="text-xs text-amber-700">
          <strong>图例：</strong>
          <span className="inline-block w-4 h-4 rounded-full bg-[#2d5016] align-middle mx-1" />按住
          <span className="inline-block w-4 h-4 rounded-full border-2 border-gray-300 bg-white align-middle mx-1" />放开
        </p>
      </div>

      <div className="space-y-3">
        {FINGERING_CHART.map((note, index) => (
          <div
            key={note.note}
            onClick={() => handlePlay(note, index)}
            className={`bg-white rounded-xl p-4 shadow-sm cursor-pointer active:scale-[0.97] transition-all duration-200 ${
              activeNote === note.note ? 'border-2 border-[#2d5016] shadow-md' : 'border border-transparent'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-lg font-bold text-bamboo">{note.note}</span>
                <span className="ml-2 font-mono text-base text-gray-600">{note.numbered}</span>
              </div>
              <span className="text-xs text-gray-400">{freqs[index]?.freq} Hz</span>
            </div>

            <FingeringDiagram
              fingers={note.fingers}
              note={note.note}
              active={activeNote === note.note}
            />

            {/* 手指编号 */}
            <div className="flex items-center justify-center gap-1 mt-1 mb-2">
              <span className="w-8" />
              {['食', '中', '无'].map((f, i) => (
                <span key={`Ln${i}`} className="w-8 text-center text-[10px] text-gray-400">{f}</span>
              ))}
              <span className="mx-1 w-2" />
              {['食', '中', '无'].map((f, i) => (
                <span key={`Rn${i}`} className="w-8 text-center text-[10px] text-gray-400">{f}</span>
              ))}
              <span className="w-8" />
            </div>

            {note.tips && (
              <p className="text-xs text-gray-500 text-center bg-cream rounded-lg px-3 py-1.5">
                💡 {note.tips}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
