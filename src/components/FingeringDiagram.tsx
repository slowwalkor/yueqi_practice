interface FingeringDiagramProps {
  fingers: boolean[]   // [1,2,3,4,5,6] true=按住
  note: string         // 音名如"中音1"
  compact?: boolean    // 紧凑模式（用于跟练底部浮层）
  onClick?: () => void
  active?: boolean     // 高亮状态
}

export default function FingeringDiagram({ fingers, note: _note, compact, onClick, active }: FingeringDiagramProps) {
  const circleSize = compact ? 'w-5 h-5' : 'w-8 h-8'
  const textSize = compact ? 'text-[8px]' : 'text-xs'
  const labelSize = compact ? 'text-[8px]' : 'text-[10px]'
  const gap = compact ? 'gap-0.5' : 'gap-1'

  return (
    <div
      onClick={onClick}
      className={`
        flex items-center justify-center ${gap}
        ${compact ? 'py-1' : 'py-2'}
        ${onClick ? 'cursor-pointer' : ''}
        ${active ? 'ring-2 ring-[#2d5016] rounded-xl scale-105 transition-transform duration-200' : 'transition-transform duration-200'}
      `}
    >
      {/* 左手标签 */}
      <span className={`${labelSize} text-gray-400 ${compact ? 'w-5' : 'w-8'} text-right`}>左手</span>
      {fingers.slice(0, 3).map((pressed, i) => (
        <div
          key={`L${i}`}
          className={`${circleSize} rounded-full border-2 flex items-center justify-center ${textSize} ${
            pressed
              ? 'bg-[#2d5016] border-[#2d5016] text-white'
              : 'bg-white border-gray-300 text-gray-400'
          }`}
        >
          {pressed ? '●' : '○'}
        </div>
      ))}
      <span className={`${compact ? 'mx-0.5' : 'mx-1'} text-gray-300`}>|</span>
      {fingers.slice(3, 6).map((pressed, i) => (
        <div
          key={`R${i}`}
          className={`${circleSize} rounded-full border-2 flex items-center justify-center ${textSize} ${
            pressed
              ? 'bg-[#2d5016] border-[#2d5016] text-white'
              : 'bg-white border-gray-300 text-gray-400'
          }`}
        >
          {pressed ? '●' : '○'}
        </div>
      ))}
      {/* 右手标签 */}
      <span className={`${labelSize} text-gray-400 ${compact ? 'w-5' : 'w-8'}`}>右手</span>
    </div>
  )
}
