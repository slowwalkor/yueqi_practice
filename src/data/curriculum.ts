export interface Lesson {
  id: number
  title: string
  type: 'theory' | 'practice' | 'song'
  description: string
}

export interface Phase {
  phase: number
  title: string
  month: string
  goal: string
  milestone: string
  lessons: Lesson[]
}

export const CURRICULUM: Phase[] = [
  {
    phase: 1,
    title: '基础入门',
    month: '第1月',
    goal: '稳定吹响中音区，能吹简单儿歌',
    milestone: '能流畅吹出《小星星》',
    lessons: [
      { id: 1, title: '认识竹笛与持笛', type: 'theory', description: '了解竹笛结构、正确持笛姿势' },
      { id: 2, title: '贴笛膜技巧', type: 'theory', description: '笛膜选择、贴膜松紧度控制' },
      { id: 3, title: '口型与风门', type: 'theory', description: '正确口型、风门大小与角度' },
      { id: 4, title: '腹式呼吸', type: 'practice', description: '腹式呼吸法练习与气息支撑' },
      { id: 5, title: '中音1-3指法', type: 'practice', description: '中音do re mi指法与发音' },
      { id: 6, title: '中音4-5指法', type: 'practice', description: '中音fa sol指法与发音' },
      { id: 7, title: '中音6-7指法', type: 'practice', description: '中音la si指法与发音' },
      { id: 8, title: '全音阶上下行', type: 'practice', description: '中音区完整音阶连贯练习' },
      { id: 9, title: '长音练习4拍', type: 'practice', description: '每音保持4拍，稳定气息' },
      { id: 10, title: '练习曲《小星星》', type: 'song', description: '第一首完整练习曲目' },
    ],
  },
  {
    phase: 2,
    title: '气息稳定',
    month: '第2月',
    goal: '长音8拍稳定，掌握低音区',
    milestone: '能连贯吹《康定情歌》',
    lessons: [
      { id: 11, title: '长音8拍练习', type: 'practice', description: '每音保持8拍，气息均匀' },
      { id: 12, title: '低音5-7指法', type: 'practice', description: '低音sol la si指法' },
      { id: 13, title: '中低音连贯音阶', type: 'practice', description: '低音与中音区衔接练习' },
      { id: 14, title: '换气技巧入门', type: 'theory', description: '乐句间快速换气方法' },
      { id: 15, title: '音头控制', type: 'practice', description: '起音干净利落的技巧' },
      { id: 16, title: '《送别》简谱', type: 'song', description: '经典曲目简谱识读与慢速练习' },
      { id: 17, title: '乐句划分练习', type: 'theory', description: '理解乐句结构与呼吸点' },
      { id: 18, title: '《康定情歌》分段', type: 'song', description: '分段练习，逐段攻克' },
      { id: 19, title: '完整吹奏《康定情歌》', type: 'song', description: '全曲连贯演奏' },
      { id: 20, title: '月末自测', type: 'practice', description: '回顾本月所学，自我评估' },
    ],
  },
  {
    phase: 3,
    title: '装饰技巧',
    month: '第3月',
    goal: '掌握单吐、打音、叠音',
    milestone: '能吹《茉莉花》带韵味',
    lessons: [
      { id: 21, title: '单吐"Tu"练习', type: 'practice', description: '舌头动作与吐音基本功' },
      { id: 22, title: '单吐配合音阶', type: 'practice', description: '吐音与指法协调练习' },
      { id: 23, title: '打音技法讲解', type: 'theory', description: '打音原理与手指动作' },
      { id: 24, title: '打音音阶练习', type: 'practice', description: '各音阶上的打音练习' },
      { id: 25, title: '叠音技法讲解', type: 'theory', description: '叠音原理与应用场景' },
      { id: 26, title: '叠音实战', type: 'practice', description: '慢速到快速的叠音练习' },
      { id: 27, title: '打音+叠音组合', type: 'practice', description: '装饰音组合运用' },
      { id: 28, title: '《茉莉花》简谱识读', type: 'song', description: '熟悉旋律与节奏' },
      { id: 29, title: '《茉莉花》慢速练习', type: 'song', description: '慢速逐句练习' },
      { id: 30, title: '加装饰音练习', type: 'song', description: '为《茉莉花》添加打音叠音' },
      { id: 31, title: '完整演奏《茉莉花》', type: 'song', description: '带装饰音的完整演奏' },
      { id: 32, title: '月末自测', type: 'practice', description: '装饰技巧综合考核' },
    ],
  },
  {
    phase: 4,
    title: '滑音与表现力',
    month: '第4月',
    goal: '掌握滑音气震音，通读《牧羊曲》',
    milestone: '能慢速素吹完整《牧羊曲》',
    lessons: [
      { id: 33, title: '上滑音练习', type: 'practice', description: '手指渐开的上滑音技巧' },
      { id: 34, title: '下滑音练习', type: 'practice', description: '手指渐闭的下滑音技巧' },
      { id: 35, title: '气震音入门', type: 'theory', description: '腹部震动产生颤音效果' },
      { id: 36, title: '气震音控频', type: 'practice', description: '控制气震音频率与幅度' },
      { id: 37, title: '筒音作2指法', type: 'theory', description: '转调指法学习' },
      { id: 38, title: '《牧羊曲》简谱识读', type: 'song', description: '熟悉全曲旋律结构' },
      { id: 39, title: '分段练习-第一段', type: 'song', description: '第一段慢速练习' },
      { id: 40, title: '分段练习-第二段', type: 'song', description: '第二段慢速练习' },
      { id: 41, title: '分段练习-第三段', type: 'song', description: '第三段慢速练习' },
      { id: 42, title: '素吹全曲连贯', type: 'song', description: '不加装饰的全曲连贯演奏' },
      { id: 43, title: '音准校正', type: 'practice', description: '借助校音器纠正音准' },
      { id: 44, title: '月末自测', type: 'practice', description: '滑音气震音综合评估' },
    ],
  },
  {
    phase: 5,
    title: '加花润色',
    month: '第5月',
    goal: '《牧羊曲》加装饰达到演奏标准',
    milestone: '能中速吹《牧羊曲》带全部装饰',
    lessons: [
      { id: 45, title: '第一段加打叠音', type: 'song', description: '为第一段添加打音叠音' },
      { id: 46, title: '第一段加滑音', type: 'song', description: '为第一段添加滑音润色' },
      { id: 47, title: '第二段加装饰', type: 'song', description: '第二段综合装饰处理' },
      { id: 48, title: '高音区过渡技巧', type: 'practice', description: '高音区气息与指法衔接' },
      { id: 49, title: '第三段精练', type: 'song', description: '第三段装饰与表现力' },
      { id: 50, title: '段落衔接练习', type: 'practice', description: '段与段之间流畅过渡' },
      { id: 51, title: '全曲中速连贯', type: 'song', description: '中速带装饰全曲演奏' },
      { id: 52, title: '对照示范精修', type: 'practice', description: '对照范奏查找差距' },
      { id: 53, title: '录音自听对比', type: 'practice', description: '录音回放发现问题' },
      { id: 54, title: '薄弱段强化', type: 'practice', description: '针对性强化薄弱环节' },
      { id: 55, title: '强弱处理入门', type: 'theory', description: '音乐力度变化基础' },
      { id: 56, title: '月末自测', type: 'practice', description: '装饰演奏完整度评估' },
    ],
  },
  {
    phase: 6,
    title: '完善表演',
    month: '第6月',
    goal: '完整流畅有韵味地演奏《牧羊曲》',
    milestone: '能配伴奏完整演奏《牧羊曲》',
    lessons: [
      { id: 57, title: '强弱渐变练习', type: 'practice', description: '渐强渐弱的气息控制' },
      { id: 58, title: '乐句起伏表现', type: 'practice', description: '旋律线条的情感起伏' },
      { id: 59, title: '气息分配规划', type: 'theory', description: '全曲气息使用规划' },
      { id: 60, title: '配伴奏慢速合', type: 'song', description: '跟伴奏慢速磨合' },
      { id: 61, title: '配伴奏原速合', type: 'song', description: '原速跟伴奏完整合奏' },
      { id: 62, title: '模拟表演通关', type: 'practice', description: '模拟正式演出完整表演' },
      { id: 63, title: '录音验收第一遍', type: 'practice', description: '第一次正式录音' },
      { id: 64, title: '精修细节', type: 'practice', description: '根据录音修正细节' },
      { id: 65, title: '最终录音验收', type: 'practice', description: '最终录音定版' },
      { id: 66, title: '结业总结', type: 'theory', description: '六个月学习回顾与展望' },
    ],
  },
]

export const TOTAL_LESSONS = CURRICULUM.reduce((sum, p) => sum + p.lessons.length, 0)
