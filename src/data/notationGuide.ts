export const NOTATION_GUIDE = {
  basics: [
    { symbol: '1', name: 'Do', pinyin: 'do' },
    { symbol: '2', name: 'Re', pinyin: 're' },
    { symbol: '3', name: 'Mi', pinyin: 'mi' },
    { symbol: '4', name: 'Fa', pinyin: 'fa' },
    { symbol: '5', name: 'Sol', pinyin: 'sol' },
    { symbol: '6', name: 'La', pinyin: 'la' },
    { symbol: '7', name: 'Si', pinyin: 'si' },
  ],
  octaves: [
    { range: '低音', notation: '音符下加点', example: '5̣ 6̣ 7̣' },
    { range: '中音', notation: '无附加符号', example: '1 2 3 4 5 6 7' },
    { range: '高音', notation: '音符上加点', example: '1̇ 2̇ 3̇' },
  ],
  durations: [
    { name: '全音符', beats: 4, notation: '1 - - -' },
    { name: '二分音符', beats: 2, notation: '1 -' },
    { name: '四分音符', beats: 1, notation: '1' },
    { name: '八分音符', beats: 0.5, notation: '下划线' },
    { name: '十六分音符', beats: 0.25, notation: '双下划线' },
  ],
  rests: [
    { name: '全休止', beats: 4, symbol: '0 0 0 0' },
    { name: '二分休止', beats: 2, symbol: '0 0' },
    { name: '四分休止', beats: 1, symbol: '0' },
    { name: '八分休止', beats: 0.5, symbol: '0(下划线)' },
  ],
  symbols: [
    { symbol: '⌒', name: '连音线/圆滑线', desc: '连续吹奏不断气' },
    { symbol: '·', name: '附点', desc: '延长前面音符一半时值' },
    { symbol: '▼', name: '顿音', desc: '短促有力地吹' },
    { symbol: 'tr', name: '颤音', desc: '快速交替按放手指' },
    { symbol: '↑', name: '上滑音', desc: '从低向高滑动' },
    { symbol: '↓', name: '下滑音', desc: '从高向低滑动' },
    { symbol: 'T', name: '吐音', desc: '舌头打断气流' },
  ]
};
