import { useState, useCallback } from 'react'
import { useAppContext } from '../context/AppContext'
import { getToday } from '../utils/dateUtils'
import { exportAllData } from '../utils/exportData'
import StreakCard from '../components/StreakCard'
import Heatmap from '../components/Heatmap'

const TAGS = ['长音', '音阶', '技巧', '曲目']

export default function CheckinPage() {
  const { stats, todayCheckin, checkin } = useAppContext()
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [duration, setDuration] = useState(30)
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [justChecked, setJustChecked] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [exporting, setExporting] = useState(false)

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const handleSubmit = useCallback(async () => {
    if (selectedTags.length === 0) return
    setSubmitting(true)
    try {
      await checkin({
        date: getToday(),
        practiced: true,
        duration,
        content: selectedTags.join('、'),
        notes: notes.trim() || undefined,
      })
      setJustChecked(true)
      setRefreshKey(k => k + 1)
      setTimeout(() => setJustChecked(false), 1500)
    } finally {
      setSubmitting(false)
    }
  }, [selectedTags, duration, notes, checkin])

  const isCheckedIn = !!todayCheckin

  return (
    <div className="p-4 pb-6 space-y-4 page-enter">
      {/* 区域1：统计卡片 */}
      <StreakCard stats={stats} />

      {/* 区域2：热力图 */}
      <Heatmap refreshKey={refreshKey} />

      {/* 区域3：打卡表单 / 已完成状态 */}
      {isCheckedIn ? (
        <div
          className={`card-classical bg-paper p-5 text-center transition-transform duration-300 ${
            justChecked ? 'scale-105' : 'scale-100'
          }`}
        >
          <div className="text-4xl mb-2">✅</div>
          <h3 className="text-lg font-bold font-brush text-bamboo mb-1">今日已完成练习</h3>
          <p className="text-gray-600 text-sm">
            {todayCheckin.content} · {todayCheckin.duration}分钟
          </p>
          {todayCheckin.notes && (
            <p className="text-gray-400 text-xs mt-1">📝 {todayCheckin.notes}</p>
          )}
        </div>
      ) : (
        <div className="card-classical bg-paper p-5 space-y-4">
          <h3 className="text-base font-bold font-brush text-ink section-title">今日练习</h3>

          {/* 快捷标签 */}
          <div>
            <p className="text-sm text-gray-500 mb-2">练习内容</p>
            <div className="flex flex-wrap gap-2">
              {TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all min-h-[44px] ${
                    selectedTags.includes(tag)
                      ? 'btn-primary shadow-md scale-105'
                      : 'bg-bamboo-50 text-ink-light hover:bg-bamboo-100 border border-bamboo-100'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* 时长滑块 */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-gray-500">练习时长</p>
              <span className="text-sm font-bold text-bamboo">{duration} 分钟</span>
            </div>
            <input
              type="range"
              min={5}
              max={120}
              step={5}
              value={duration}
              onChange={e => setDuration(Number(e.target.value))}
              className="w-full h-2 rounded-lg appearance-none bg-gray-200 accent-bamboo"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>5分钟</span>
              <span>120分钟</span>
            </div>
          </div>

          {/* 备注 */}
          <div>
            <p className="text-sm text-gray-500 mb-2">备注（可选）</p>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="今天练了什么曲子？有什么感悟？"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-bamboo/30 focus:border-bamboo min-h-[44px]"
            />
          </div>

          {/* 提交按钮 */}
          <button
            onClick={handleSubmit}
            disabled={selectedTags.length === 0 || submitting}
            className={`w-full py-3 rounded-xl text-white font-bold text-base min-h-[48px] transition-all ${
              selectedTags.length === 0
                ? 'bg-ink-wash/50 cursor-not-allowed'
                : submitting
                ? 'btn-primary opacity-70 scale-95'
                : 'btn-primary active:scale-95'
            }`}
          >
            {submitting ? '提交中...' : '完成今日练习 ✓'}
          </button>
        </div>
      )}
      {/* 数据导出 */}
      <div className="card-classical bg-paper p-4">
        <button
          onClick={async () => {
            setExporting(true)
            try {
              await exportAllData()
            } finally {
              setExporting(false)
            }
          }}
          disabled={exporting}
          className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm min-h-[44px] hover:bg-gray-200 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {exporting ? '导出中...' : '导出练习数据（备份）'}
        </button>
      </div>
    </div>
  )
}
