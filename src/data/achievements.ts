export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'checkin' | 'practice' | 'skill' | 'course' | 'collection';
  condition: {
    type: string;
    target: number;
  };
  xpReward: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  // ===== 打卡类（持之以恒） =====
  {
    id: 'checkin_3',
    name: '初窥门径',
    description: '累计打卡3天',
    icon: '🌱',
    category: 'checkin',
    condition: { type: 'total_checkin_days', target: 3 },
    xpReward: 30,
  },
  {
    id: 'checkin_7',
    name: '小有所成',
    description: '累计打卡7天',
    icon: '🌿',
    category: 'checkin',
    condition: { type: 'total_checkin_days', target: 7 },
    xpReward: 50,
  },
  {
    id: 'checkin_30',
    name: '锲而不舍',
    description: '累计打卡30天',
    icon: '🎋',
    category: 'checkin',
    condition: { type: 'total_checkin_days', target: 30 },
    xpReward: 150,
  },
  {
    id: 'checkin_100',
    name: '百日维新',
    description: '累计打卡100天',
    icon: '🏔️',
    category: 'checkin',
    condition: { type: 'total_checkin_days', target: 100 },
    xpReward: 500,
  },
  {
    id: 'checkin_365',
    name: '水滴石穿',
    description: '累计打卡365天',
    icon: '🐉',
    category: 'checkin',
    condition: { type: 'total_checkin_days', target: 365 },
    xpReward: 2000,
  },

  // ===== 练习类（勤学苦练） =====
  {
    id: 'practice_60',
    name: '牛刀小试',
    description: '累计练习1小时',
    icon: '⏱️',
    category: 'practice',
    condition: { type: 'total_practice_minutes', target: 60 },
    xpReward: 40,
  },
  {
    id: 'practice_600',
    name: '熟能生巧',
    description: '累计练习10小时',
    icon: '🔥',
    category: 'practice',
    condition: { type: 'total_practice_minutes', target: 600 },
    xpReward: 200,
  },
  {
    id: 'practice_3000',
    name: '铁杵成针',
    description: '累计练习50小时',
    icon: '⚔️',
    category: 'practice',
    condition: { type: 'total_practice_minutes', target: 3000 },
    xpReward: 800,
  },
  {
    id: 'practice_6000',
    name: '炉火纯青',
    description: '累计练习100小时',
    icon: '🌟',
    category: 'practice',
    condition: { type: 'total_practice_minutes', target: 6000 },
    xpReward: 1500,
  },

  // ===== 技巧类（妙音天成） =====
  {
    id: 'skill_first_record',
    name: '初试啼声',
    description: '完成首次录音',
    icon: '🎤',
    category: 'skill',
    condition: { type: 'first_recording', target: 1 },
    xpReward: 30,
  },
  {
    id: 'skill_grade_a',
    name: '音准达人',
    description: 'AI评分达到A级',
    icon: '🎯',
    category: 'skill',
    condition: { type: 'ai_grade_a', target: 1 },
    xpReward: 100,
  },
  {
    id: 'skill_grade_s',
    name: '天籁之音',
    description: 'AI评分达到S级',
    icon: '👑',
    category: 'skill',
    condition: { type: 'ai_grade_s', target: 1 },
    xpReward: 300,
  },
  {
    id: 'skill_perfect_10',
    name: '百发百中',
    description: '连续10个完美音',
    icon: '💎',
    category: 'skill',
    condition: { type: 'perfect_notes_streak', target: 10 },
    xpReward: 200,
  },

  // ===== 曲目类（博采众长） =====
  {
    id: 'collection_1',
    name: '初学乍练',
    description: '完成1首曲目',
    icon: '📜',
    category: 'collection',
    condition: { type: 'songs_completed', target: 1 },
    xpReward: 50,
  },
  {
    id: 'collection_5',
    name: '渐入佳境',
    description: '完成5首曲目',
    icon: '📚',
    category: 'collection',
    condition: { type: 'songs_completed', target: 5 },
    xpReward: 150,
  },
  {
    id: 'collection_10',
    name: '得心应手',
    description: '完成10首曲目',
    icon: '🎵',
    category: 'collection',
    condition: { type: 'songs_completed', target: 10 },
    xpReward: 300,
  },
  {
    id: 'collection_20',
    name: '融会贯通',
    description: '完成20首曲目',
    icon: '🏆',
    category: 'collection',
    condition: { type: 'songs_completed', target: 20 },
    xpReward: 600,
  },

  // ===== 课程类（循序渐进） =====
  {
    id: 'course_first',
    name: '启蒙',
    description: '完成第1课',
    icon: '📖',
    category: 'course',
    condition: { type: 'lessons_completed', target: 1 },
    xpReward: 30,
  },
  {
    id: 'course_stage1',
    name: '入门',
    description: '完成第1阶段全部课程',
    icon: '🎓',
    category: 'course',
    condition: { type: 'stages_completed', target: 1 },
    xpReward: 200,
  },
  {
    id: 'course_stage3',
    name: '进阶',
    description: '完成第3阶段全部课程',
    icon: '⭐',
    category: 'course',
    condition: { type: 'stages_completed', target: 3 },
    xpReward: 500,
  },
  {
    id: 'course_all',
    name: '大成',
    description: '完成全部课程',
    icon: '🐲',
    category: 'course',
    condition: { type: 'all_courses_completed', target: 1 },
    xpReward: 2000,
  },
];

/** 成就分类名称 */
export const CATEGORY_NAMES: Record<Achievement['category'], string> = {
  checkin: '持之以恒',
  practice: '勤学苦练',
  skill: '妙音天成',
  collection: '博采众长',
  course: '循序渐进',
};

/** 等级境界名称 */
export const LEVEL_NAMES: string[] = [
  '凡人',     // 0
  '炼气',     // 1
  '筑基',     // 2
  '金丹',     // 3
  '元婴',     // 4
  '化神',     // 5
  '合体',     // 6
  '大乘',     // 7
  '渡劫',     // 8
  '飞升',     // 9
  '天仙',     // 10+
];
