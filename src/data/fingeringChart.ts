// 6个音孔，从左到右：左手食指(1)、中指(2)、无名指(3)，右手食指(4)、中指(5)、无名指(6)
// ● = 按住, ○ = 放开

export interface FingeringNote {
  note: string;       // 音名如"低音5", "中音1"
  numbered: string;   // 简谱符号
  fingers: boolean[]; // [1,2,3,4,5,6] true=按住
  tips?: string;      // 吹奏提示
}

export const FINGERING_CHART: FingeringNote[] = [
  { note: '低音5', numbered: '5̣', fingers: [true, true, true, true, true, true], tips: '全按，气息放缓' },
  { note: '低音6', numbered: '6̣', fingers: [true, true, true, true, true, false], tips: '右手无名指抬起' },
  { note: '低音7', numbered: '7̣', fingers: [true, true, true, true, false, false], tips: '右手中指、无名指抬起' },
  { note: '中音1', numbered: '1', fingers: [true, true, true, false, false, false], tips: '右手全部抬起' },
  { note: '中音2', numbered: '2', fingers: [true, true, false, false, false, false], tips: '左手无名指也抬起' },
  { note: '中音3', numbered: '3', fingers: [true, false, false, false, false, false], tips: '只按左手食指' },
  { note: '中音4', numbered: '4', fingers: [false, true, true, false, false, false], tips: '叉口指法，食指抬起中无名指按' },
  { note: '中音5', numbered: '5', fingers: [false, true, true, true, true, true], tips: '超吹，气速加快' },
  { note: '中音6', numbered: '6', fingers: [true, true, true, true, true, false], tips: '超吹低音6指法' },
  { note: '中音7', numbered: '7', fingers: [true, true, true, true, false, false], tips: '超吹低音7指法' },
  { note: '高音1', numbered: '1̇', fingers: [true, true, true, false, false, false], tips: '超吹中音1指法，气速更快' },
  { note: '高音2', numbered: '2̇', fingers: [true, true, false, false, false, false], tips: '超吹，风门更小' },
  { note: '高音3', numbered: '3̇', fingers: [true, false, false, false, false, false], tips: '气速最快，嘴唇收紧' },
];
