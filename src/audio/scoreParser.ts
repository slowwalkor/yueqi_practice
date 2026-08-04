/**
 * 简谱文本解析器
 * 将曲谱行文本解析为结构化的音符序列，供 PracticePlayer 调度播放
 */

export interface ParsedNote {
  numbered: string    // 原始简谱符号，如 "5̣", "1", "2̇", "0"
  noteName: string    // 中文音名，如 "低音5", "中音1", "高音2", "休止"
  beats: number       // 占几拍
  isRest: boolean     // 是否休止符
  durationMs: number  // 实际时长（毫秒）
}

// 组合标记 Unicode 码点
const COMBINING_DOT_BELOW = '\u0323'  // 下方组合点 → 低音
const COMBINING_DOT_ABOVE = '\u0307'  // 上方组合点 → 高音

/**
 * 解析单个音符 token，返回音名和简谱符号
 */
function parseToken(token: string): { noteName: string; numbered: string; isRest: boolean } | null {
  if (token === '0') {
    return { noteName: '休止', numbered: '0', isRest: true }
  }

  // 提取数字部分（1-7）
  const digit = token.charAt(0)
  if (digit < '1' || digit > '7') return null

  // 判断音区：通过组合标记
  const hasBelow = token.includes(COMBINING_DOT_BELOW)
  const hasAbove = token.includes(COMBINING_DOT_ABOVE)

  let prefix: string
  if (hasBelow) {
    prefix = '低音'
  } else if (hasAbove) {
    prefix = '高音'
  } else {
    prefix = '中音'
  }

  return {
    noteName: `${prefix}${digit}`,
    numbered: token,
    isRest: false,
  }
}

/**
 * 从 tempo 字符串中提取 BPM 数值
 * 支持格式如 "♩=80", "♩=66 慢速抒情", "120" 等
 */
function extractTempo(tempoStr: string): number {
  const match = tempoStr.match(/(\d+)/)
  return match ? parseInt(match[1], 10) : 120
}

/**
 * 解析简谱文本行
 * @param lines - 曲谱行数组（来自 Score.lines）
 * @param tempo - BPM 或 tempo 字符串（如 "♩=80"）
 * @param _timeSignature - 拍号（预留，当前未使用）
 * @returns 解析后的音符序列
 */
export function parseScore(lines: string[], tempo: number | string, _timeSignature?: string): ParsedNote[] {
  const bpm = typeof tempo === 'number' ? tempo : extractTempo(tempo)
  const beatMs = 60000 / bpm  // 每拍毫秒数

  const result: ParsedNote[] = []

  for (const line of lines) {
    // 按空格分割 token
    const tokens = line.split(/\s+/).filter(t => t.length > 0)

    for (const token of tokens) {
      // 跳过小节线
      if (token === '|') continue

      // 延长符：增加前一音符时值
      if (token === '-') {
        if (result.length > 0) {
          const prev = result[result.length - 1]
          prev.beats += 1
          prev.durationMs += beatMs
        }
        continue
      }

      // 解析音符/休止符
      const parsed = parseToken(token)
      if (parsed) {
        result.push({
          numbered: parsed.numbered,
          noteName: parsed.noteName,
          beats: 1,
          isRest: parsed.isRest,
          durationMs: beatMs,
        })
      }
    }
  }

  return result
}
