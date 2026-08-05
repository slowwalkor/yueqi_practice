interface FingeringDiagramProps {
  fingers: boolean[]   // [1,2,3,4,5,6] true=按住
  note: string         // 音名如"中音1"
  compact?: boolean    // 紧凑模式（用于跟练底部浮层）
  onClick?: () => void
  active?: boolean     // 高亮状态
}

export default function FingeringDiagram({ fingers, note: _note, compact, onClick, active }: FingeringDiagramProps) {
  const holeSize = compact ? 'w-4 h-4' : 'w-6 h-6'
  const labelSize = compact ? 'text-[8px]' : 'text-[10px]'

  return (
    <div
      onClick={onClick}
      className={`
        flex items-center justify-center
        ${compact ? 'py-1' : 'py-2'}
        ${onClick ? 'cursor-pointer' : ''}
        ${active ? 'scale-105 transition-transform duration-200' : 'transition-transform duration-200'}
      `}
    >
      {/* 左手标签 */}
      <span className={`${labelSize} text-ink-wash ${compact ? 'w-5' : 'w-7'} text-right font-brush`}>左手</span>

      {/* 竹笛管身 */}
      <div className={`relative flex items-center ${compact ? 'mx-1' : 'mx-2'}`}>
        {/* 管身背景 */}
        <div className={`absolute inset-0 ${compact ? '-inset-y-1' : '-inset-y-1.5'} rounded-full`}
          style={{
            background: 'linear-gradient(180deg, #8fbc5e 0%, #4a7c23 30%, #2d5016 60%, #1a3b0a 100%)',
            opacity: active ? 0.9 : 0.7,
          }}
        />

        {/* 左手指孔 */}
        <div className={`relative flex items-center ${compact ? 'gap-1' : 'gap-1.5'} ${compact ? 'px-2' : 'px-3'}`}>
          {fingers.slice(0, 3).map((pressed, i) => (
            <div
              key={`L${i}`}
              className={`${holeSize} rounded-full border-2 flex items-center justify-center transition-colors duration-150 ${
                pressed
                  ? 'bg-bamboo-dark border-bamboo-dark shadow-inner'
                  : 'bg-paper border-bamboo-light/50 shadow-sm'
              }`}
            >
              {!pressed && <div className="w-1/2 h-1/2 rounded-full bg-ink/10" />}
            </div>
          ))}
        </div>

        {/* 分隔膜孔位置标记 */}
        <div className={`relative ${compact ? 'mx-1' : 'mx-2'} flex items-center`}>
          <div className={`${compact ? 'w-2 h-2' : 'w-3 h-3'} rounded-full border border-gold/60 bg-paper-warm`} />
        </div>

        {/* 右手指孔 */}
        <div className={`relative flex items-center ${compact ? 'gap-1' : 'gap-1.5'} ${compact ? 'px-2' : 'px-3'}`}>
          {fingers.slice(3, 6).map((pressed, i) => (
            <div
              key={`R${i}`}
              className={`${holeSize} rounded-full border-2 flex items-center justify-center transition-colors duration-150 ${
                pressed
                  ? 'bg-bamboo-dark border-bamboo-dark shadow-inner'
                  : 'bg-paper border-bamboo-light/50 shadow-sm'
              }`}
            >
              {!pressed && <div className="w-1/2 h-1/2 rounded-full bg-ink/10" />}
            </div>
          ))}
        </div>
      </div>

      {/* 右手标签 */}
      <span className={`${labelSize} text-ink-wash ${compact ? 'w-5' : 'w-7'} font-brush`}>右手</span>
    </div>
  )
}
