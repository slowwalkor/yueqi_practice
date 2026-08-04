export interface Score {
  id: string;
  title: string;
  difficulty: '入门' | '初级' | '中级';
  key: string;
  tempo: string;
  timeSignature: string;
  lines: string[];
  phase: number;
}

export const PRACTICE_SCORES: Score[] = [
  {
    id: 'twinkle',
    title: '小星星',
    difficulty: '入门',
    key: '1=D 筒音作5',
    tempo: '♩=80',
    timeSignature: '4/4',
    phase: 1,
    lines: [
      '1 1 5 5 | 6 6 5 - |',
      '4 4 3 3 | 2 2 1 - |',
      '5 5 4 4 | 3 3 2 - |',
      '5 5 4 4 | 3 3 2 - |',
      '1 1 5 5 | 6 6 5 - |',
      '4 4 3 3 | 2 2 1 - |',
    ]
  },
  {
    id: 'tigers',
    title: '两只老虎',
    difficulty: '入门',
    key: '1=D 筒音作5',
    tempo: '♩=100',
    timeSignature: '4/4',
    phase: 1,
    lines: [
      '1 2 3 1 | 1 2 3 1 |',
      '3 4 5 - | 3 4 5 - |',
      '5 6 5 4 | 3 1 |',
      '5 6 5 4 | 3 1 |',
      '2 5̣ 1 - | 2 5̣ 1 - |',
    ]
  },
  {
    id: 'jasmine',
    title: '茉莉花',
    difficulty: '初级',
    key: '1=D 筒音作5',
    tempo: '♩=66 慢速抒情',
    timeSignature: '4/4',
    phase: 2,
    lines: [
      '3 3 5 6 1̇ 1̇ 6 |',
      '5 6 5 3 5 - |',
      '2 3 5 3 2 1 6̣ |',
      '5̣ 6̣ 1 - - - |',
      '5 3 2 3 5 6 5 |',
      '3 2 1 6̣ 1 - |',
    ]
  },
  {
    id: 'kangding',
    title: '康定情歌（片段）',
    difficulty: '初级',
    key: '1=D 筒音作5',
    tempo: '♩=72',
    timeSignature: '2/4',
    phase: 2,
    lines: [
      '5 3 5 | 1̇ 6 5 3 |',
      '2 - 2 | 3 5 6 5 3 |',
      '2 - | 1 2 3 5 |',
      '6 5 3 2 | 1 - |',
    ]
  },
  {
    id: 'shepherd',
    title: '牧羊曲',
    difficulty: '中级',
    key: '1=D 筒音作2',
    tempo: '♩=72 中速优美',
    timeSignature: '4/4',
    phase: 5,
    lines: [
      '6̣ 1 2 3 | 5 3 2 1 2 - |',
      '6̣ 1 2 3 | 2 1 6̣ 5̣ 6̣ - |',
      '6̣ 1 2 3 | 5 3 5 6 5 - |',
      '3 2 1 6̣ | 5̣ 3̣ 5̣ 6̣ 1 - |',
      '3 5 6 1̇ | 6 5 3 5 6 - |',
      '3 2 1 6̣ | 5̣ 6̣ 1 2 1 - |',
      '6̣ 1 2 3 | 5 3 2 1 2 - |',
      '6̣ 1 2 3 | 2 1 6̣ 5̣ 6̣ - |',
    ]
  }
];
