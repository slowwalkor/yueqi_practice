/**
 * 多调频率生成模块
 * 根据选定调号，计算竹笛13个音位的实际频率
 */

export const SUPPORTED_KEYS = ['C', 'D', 'E', 'F', 'G', 'A'] as const
export type MusicalKey = typeof SUPPORTED_KEYS[number]

export interface NoteFreq {
  note: string       // 中文音名，如 "低音5", "中音1", "高音2"
  numbered: string   // 简谱符号，如 "5̣", "1", "2̇"
  freq: number       // 频率 Hz
}

// 各调相对D调的半音偏移量
// C调比D调低2个半音，E调比D调高2个半音，以此类推
const KEY_SEMITONE_OFFSET: Record<MusicalKey, number> = {
  C: -2,
  D: 0,
  E: 2,
  F: 3,
  G: 5,
  A: 7,
}

// D调基准：13个音的频率和元数据（低音5到高音3）
// 筒音作5，D4 = 293.66Hz
const D_KEY_BASE: { note: string; numbered: string; freq: number }[] = [
  { note: '低音5', numbered: '5̣', freq: 293.66 },
  { note: '低音6', numbered: '6̣', freq: 329.63 },
  { note: '低音7', numbered: '7̣', freq: 369.99 },
  { note: '中音1', numbered: '1', freq: 392.00 },
  { note: '中音2', numbered: '2', freq: 440.00 },
  { note: '中音3', numbered: '3', freq: 493.88 },
  { note: '中音4', numbered: '4', freq: 523.25 },
  { note: '中音5', numbered: '5', freq: 587.33 },
  { note: '中音6', numbered: '6', freq: 659.26 },
  { note: '中音7', numbered: '7', freq: 739.99 },
  { note: '高音1', numbered: '1̇', freq: 783.99 },
  { note: '高音2', numbered: '2̇', freq: 880.00 },
  { note: '高音3', numbered: '3̇', freq: 987.77 },
]

/**
 * 根据调号获取13个音的频率列表
 * @param key - 调号（C/D/E/F/G/A）
 * @returns 13个 NoteFreq，与 fingeringChart 的条目一一对应
 */
export function getFrequenciesForKey(key: MusicalKey): NoteFreq[] {
  const semitoneOffset = KEY_SEMITONE_OFFSET[key]

  return D_KEY_BASE.map(({ note, numbered, freq }) => ({
    note,
    numbered,
    // 等律计算：baseFreq × 2^(semitoneOffset / 12)
    freq: Math.round(freq * Math.pow(2, semitoneOffset / 12) * 100) / 100,
  }))
}
