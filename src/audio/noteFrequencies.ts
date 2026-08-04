export interface NoteInfo {
  name: string      // 如 "D4", "E4"
  frequency: number // Hz
  label: string     // 中文标注，如 "中音1"
}

// D调竹笛常用音域：D4(293Hz) ~ E6(1318Hz)
export const NOTE_FREQUENCIES: NoteInfo[] = [
  { name: 'D4', frequency: 293.66, label: '低音5' },
  { name: 'E4', frequency: 329.63, label: '低音6' },
  { name: 'F#4', frequency: 369.99, label: '低音7' },
  { name: 'G4', frequency: 392.00, label: '中音1' },
  { name: 'A4', frequency: 440.00, label: '中音2' },
  { name: 'B4', frequency: 493.88, label: '中音3' },
  { name: 'C#5', frequency: 554.37, label: '中音4' },
  { name: 'D5', frequency: 587.33, label: '中音5' },
  { name: 'E5', frequency: 659.25, label: '中音6' },
  { name: 'F#5', frequency: 739.99, label: '中音7' },
  { name: 'G5', frequency: 783.99, label: '高音1' },
  { name: 'A5', frequency: 880.00, label: '高音2' },
  { name: 'B5', frequency: 987.77, label: '高音3' },
  { name: 'C#6', frequency: 1108.73, label: '高音4' },
  { name: 'D6', frequency: 1174.66, label: '高音5' },
  { name: 'E6', frequency: 1318.51, label: '高音6' },
]

// 根据频率找最接近的音符
export function findClosestNote(frequency: number): { note: NoteInfo; cents: number } {
  let closestNote = NOTE_FREQUENCIES[0]
  let minCents = Infinity

  for (const n of NOTE_FREQUENCIES) {
    const cents = 1200 * Math.log2(frequency / n.frequency)
    if (Math.abs(cents) < Math.abs(minCents)) {
      minCents = cents
      closestNote = n
    }
  }

  return { note: closestNote, cents: minCents }
}
