// ── Screen & Visual ───────────────────────────────────────────────
export const GAME_CONFIG = {
  WIDTH: 1920,
  HEIGHT: 1080,
  BACKGROUND_COLOR: 0x08081a,
} as const;

// ── Colors (game entity tints only — UI uses globalTheme) ─────────
export const PALETTE = {
  NEON_CYAN: 0x00fff2,
  NEON_MAGENTA: 0xff00aa,
  NEON_YELLOW: 0xffe600,
  DARK_BG: 0x08081a,
  PANEL_BG: 0x0e0e28,
  TEXT_DIM: 0x667788,
  TEXT_BRIGHT: 0xe0f0ff,
  TAG_HKD: 0xffe600,
  TAG_SAN: 0x66ff99,
  TAG_ENERGY: 0xff8844,
  TAG_GPA: 0x00ccff,
  TAG_CANTONESE: 0xff66cc,
  TAG_ENGLISH: 0x44bbdd,
  TAG_SPECIAL: 0xff4444,
} as const;

// ── University hover keyword tags ────────────────────────────────
export const UNI_HOVER_TAGS: Record<string, [string, string]> = {
  hku: ['半山精英', '红砖情结'],
  cuhk: ['山城隐士', '深港钟摆'],
  hkust: ['绝美孤岛', '压力之巅'],
  polyu: ['红磡地头', '实干主义'],
  cityu: ['商场学子', '九龙枢纽'],
};

// ── Font ──────────────────────────────────────────────────────────
export const FONT = {
  PIXEL: 'Courier New',
  TITLE_SIZE: 72,
  SUBTITLE_SIZE: 36,
  BODY_SIZE: 28,
  CHOICE_SIZE: 24,
  TAG_SIZE: 22,
  LABEL_SIZE: 18,
  HINT_SIZE: 16,
} as const;

// ── Stats (Core Data System) ─────────────────────────────────────
export interface PlayerStats {
  hkd: number;       // HKD — survival baseline
  san: number;       // SAN — sanity, zero triggers "phantom return"
  energy: number;    // Energy — commuting & all-nighter indicator
  gpa: number;       // GPA / CV score — career gate
  cantonese: number; // Cantonese proficiency — social/career key
  english: number;   // English proficiency — academic/career key
}

export const INITIAL_STATS: PlayerStats = {
  hkd: 55,
  san: 65,
  energy: 75,
  gpa: 50,
  cantonese: 10,
  english: 40,
} as const;

export const STAT_MIN = 0;
export const STAT_MAX = 100;

// ── UI Layout ─────────────────────────────────────────────────────
export const LAYOUT = {
  PANEL_WIDTH: 1200,
  PANEL_HEIGHT: 700,
  CHOICE_BTN_WIDTH: 500,
  CHOICE_BTN_HEIGHT: 60,
  CHOICE_GAP: 20,
  STAT_BAR_WIDTH: 200,
  STAT_BAR_HEIGHT: 16,
  PADDING: 40,
  TAG_PANEL_WIDTH: 280,
  TAG_PANEL_HEIGHT: 56,
  TAG_GAP: 16,
} as const;

// ── Story Chapter ─────────────────────────────────────────────────
export interface StoryChoice {
  text: string;
  effects: Partial<PlayerStats>;
}

export interface StoryChapter {
  title: string;
  narration: string;
  imageId: string;
  choices: StoryChoice[];
}

export const STORY_CHAPTERS: StoryChapter[] = [
  {
    title: '第一章 · 租房大作战',
    imageId: 'ch1-airport',
    narration:
      '飞机降落赤鱲角，维港灯火在窗外闪烁。你拖着行李走出航站楼，八达通、电话卡、银行开户——待办清单长得看不到头。但最紧迫的问题只有一个：住哪里？学校附近的月租让你倒吸一口凉气，中介发来的"温馨小窝"照片像个盒子。有人说深圳住更便宜……',
    choices: [
      {
        text: '🏠 咬牙租校区附近，通勤省心',
        effects: { hkd: -15, energy: 10, san: 5, gpa: 5, cantonese: 0, english: 0 },
      },
      {
        text: '🚄 跨境住深圳，钱包感谢我',
        effects: { hkd: 15, energy: -15, san: -5, gpa: 0, cantonese: 5, english: 0 },
      },
      {
        text: '👥 和同学合租，分摊也社交',
        effects: { hkd: 5, energy: 5, san: 5, gpa: 0, cantonese: 0, english: 5 },
      },
    ],
  },
  {
    title: '第二章 · 语言壁垒',
    imageId: 'ch2-campus',
    narration:
      '开学第一周，教授全程英文授课，PPT比小说还厚。茶餐厅阿姐用粤语连珠炮式问你"饮咩"，你支支吾吾比划了半天才点到一杯冻柠茶。同学群里有人分享了粤语速成班的链接，也有人说反正大家都讲普通话……',
    choices: [
      {
        text: '🗣 主动学粤语，从茶餐厅点餐练起',
        effects: { hkd: 0, san: -5, energy: -5, gpa: 0, cantonese: 15, english: 0 },
      },
      {
        text: '📖 专攻英文学术写作，GPA要紧',
        effects: { hkd: 0, san: -5, energy: -5, gpa: 10, cantonese: 0, english: 10 },
      },
      {
        text: '🏡 留在内地生圈子，舒适就好',
        effects: { hkd: 0, san: 10, energy: 5, gpa: 0, cantonese: 0, english: 0 },
      },
    ],
  },
  {
    title: '第三章 · 两餸饭的抉择',
    imageId: 'ch3-library',
    narration:
      '月中了，八达通余额告急。学校食堂的两餸饭28蚊，已经是最低生存标准。但深水埗有更便宜的选择，中环那边的同学却约你去兰桂坊"见见世面"。你看了看银行APP里的数字，陷入了沉思……',
    choices: [
      {
        text: '🍱 每天两餸饭+自己煮，极限省钱',
        effects: { hkd: 15, san: -10, energy: 5, gpa: 0, cantonese: 0, english: 0 },
      },
      {
        text: '🍸 去兰桂坊社交，人脉比钱重要',
        effects: { hkd: -15, san: 5, energy: -5, gpa: 0, cantonese: 5, english: 10 },
      },
      {
        text: '🍳 自己做饭+偶尔社交，平衡路线',
        effects: { hkd: 5, san: 5, energy: 5, gpa: 0, cantonese: 5, english: 0 },
      },
    ],
  },
  {
    title: '第四章 · 期中危机',
    imageId: 'ch4-street',
    narration:
      'Midterm来了，Group Project队友划水，DDL像连环炸弹。你已经连续三天睡不到四小时，红牛空罐堆满了桌面。教授邮件通知最终考试占60%，而你的笔记上还有大片空白。窗外的霓虹灯在嘲笑你的疲惫……',
    choices: [
      {
        text: '💪 通宵赶DDL，搏一搏单车变摩托',
        effects: { hkd: 0, san: -15, energy: -20, gpa: 15, cantonese: 0, english: 5 },
      },
      {
        text: '🤝 求助学习小组，不懂就问',
        effects: { hkd: 0, san: 5, energy: -5, gpa: 5, cantonese: 0, english: 5 },
      },
      {
        text: '🧘 战略性放弃一门，保住San值',
        effects: { hkd: 0, san: 15, energy: 10, gpa: -10, cantonese: 0, english: 0 },
      },
    ],
  },
  {
    title: '第五章 · 求职前哨',
    imageId: 'ch5-exam',
    narration:
      'Career Fair人头攒动，你穿着唯一的正装挤在人群里。简历投了三十多份，回复寥寥。LinkedIn上的HR已读不回，学长说"港硕就业是地狱模式"。有人开始做小红书自媒体，有人转头考公，还有人已经在中环大厂实习了……',
    choices: [
      {
        text: '🏢 死磕中环大厂，投简历面试连轴转',
        effects: { hkd: -5, san: -10, energy: -10, gpa: 5, cantonese: 0, english: 10 },
      },
      {
        text: '📱 做自媒体/Freelance，自己当老板',
        effects: { hkd: 15, san: -5, energy: -5, gpa: 0, cantonese: 10, english: 0 },
      },
      {
        text: '🔬 留校做RA/TA，学术路线继续',
        effects: { hkd: 5, san: 5, energy: 0, gpa: 10, cantonese: 0, english: 5 },
      },
    ],
  },
  {
    title: '第六章 · 毕业冲刺',
    imageId: 'ch6-career',
    narration:
      '论文截止日倒计时开始。导师的修改意见从第一页红到最后一页，你几乎要重写。与此同时，签证续期的材料也堆在桌上。有人已经定好了回去的机票，有人还在等那个可能改变命运的offer。你必须做出选择……',
    choices: [
      {
        text: '📝 闭关写论文，GPA就是一切',
        effects: { hkd: 0, san: -15, energy: -15, gpa: 15, cantonese: 0, english: 5 },
      },
      {
        text: '📋 边写论文边找工作，两手抓',
        effects: { hkd: 5, san: -10, energy: -10, gpa: 5, cantonese: 0, english: 5 },
      },
      {
        text: '🌅 享受最后的香港时光，边写边玩',
        effects: { hkd: -10, san: 15, energy: 0, gpa: -5, cantonese: 10, english: 0 },
      },
    ],
  },
  {
    title: '第七章 · 何去何从',
    imageId: 'ch7-peak',
    narration:
      '毕业典礼的黑袍穿在身上，沉甸甸的。站在太平山顶俯瞰维港，霓虹灯倒映在海面上。这一年你经历了无数个深夜、无数次崩溃、也有无数个意想不到的温暖瞬间。IANG签证还剩一年，你的下一步是什么？',
    choices: [
      {
        text: '🏙 留港工作，这座城市还没看够',
        effects: { hkd: 10, san: 5, energy: -5, gpa: 0, cantonese: 5, english: 5 },
      },
      {
        text: '✈️ 回内地发展，落叶总要归根',
        effects: { hkd: 5, san: 15, energy: 10, gpa: 0, cantonese: 0, english: 0 },
      },
      {
        text: '🎓 继续深造读博，学术道路走到底',
        effects: { hkd: -15, san: -5, energy: -5, gpa: 15, cantonese: 0, english: 10 },
      },
    ],
  },
];

export const TOTAL_CHAPTERS = STORY_CHAPTERS.length;

// ── Tags (Categorized Achievement System) ────────────────────────
export interface TagDef {
  id: string;
  category: string;
  label: string;
  description: string;
  color: number;
  condition: (stats: PlayerStats) => boolean;
  universityId?: string;
  /** If set, tag only shows for this gender. */
  gender?: 'male' | 'female';
}

/** All tag categories in display order. */
export const TAG_CATEGORIES = [
  '🏠 居住与生活',
  '🚉 交通与通勤',
  '📚 学业与AI',
  '💼 求职与未来',
  '🧠 心理与社交',
  '🌐 文化与身份',
] as const;

/** Category → accent color mapping. */
export const TAG_CAT_COLORS: Record<string, number> = {
  '🏠 居住与生活': PALETTE.TAG_HKD,
  '🚉 交通与通勤': PALETTE.TAG_ENERGY,
  '📚 学业与AI': PALETTE.TAG_GPA,
  '💼 求职与未来': PALETTE.TAG_ENGLISH,
  '🧠 心理与社交': PALETTE.TAG_SAN,
  '🌐 文化与身份': PALETTE.TAG_CANTONESE,
  '🏫 校园特色': PALETTE.NEON_CYAN,
  '🎰 港城奇迹': PALETTE.NEON_YELLOW,
};

export const ALL_TAGS: TagDef[] = [
  // ═══ 🏠 第一章专属身份标签 ═══════════════════════════════════════
  {
    id: 'remote_warrior',
    category: '🏠 居住与生活',
    label: '远程签约勇士',
    description: '人在老家，钱已入港。你对这个世界的信任度，全靠那一段15秒的房源视频。',
    color: PALETTE.TAG_HKD,
    condition: (s) => s.hkd <= 40 && s.san >= 50,
  },
  {
    id: 'dual_city_commando',
    category: '🚉 交通与通勤',
    label: '双城特种兵',
    description: '你比海关更了解罗湖口岸的红外线。你的租房史是一部流汗史。',
    color: PALETTE.TAG_ENERGY,
    condition: (s) => s.energy <= 50 && s.hkd >= 40,
  },
  {
    id: 'potential_hall_master',
    category: '🏠 居住与生活',
    label: '厅长候选人',
    description: '为了GPA和CV，你愿意牺牲隐私，住在客厅的帘子后面。',
    color: PALETTE.TAG_HKD,
    condition: (s) => s.hkd <= 45 && s.gpa >= 40,
  },
  {
    id: 'rental_prophet',
    category: '🏠 居住与生活',
    label: '租房预言家',
    description: '你看透了中介的每一句"平靓正"背后的陷阱。你是同学中的租房指南针。',
    color: PALETTE.TAG_GPA,
    condition: (s) => s.san >= 40 && s.cantonese >= 20,
  },

  // ═══ 🏠 居住与生活类 ═══════════════════════════════════════════
  {
    id: 'hall_master',
    category: '🏠 居住与生活',
    label: '职业厅长',
    description: '熟练掌握用彩色布帘在客厅隔出 2 平米宇宙的技巧。隐私是奢侈品，耳塞是必需品。',
    color: PALETTE.TAG_HKD,
    condition: (s) => s.hkd <= 40 && s.san >= 30,
  },
  {
    id: 'meal_critic',
    category: '🏠 居住与生活',
    label: '两餸饭评论家',
    description: '在油麻地与红磡之间，你精准掌握了哪家店的黑椒薯仔牛柳粒分量最足。',
    color: PALETTE.TAG_HKD,
    condition: (s) => s.hkd >= 50,
    universityId: 'polyu',
  },
  {
    id: 'breathing_cost',
    category: '🏠 居住与生活',
    label: '呼吸成本精算师',
    description: '睁眼闭眼间，你都能心算出这一秒扣除的房租。在香港，连呼吸都是带价位的。',
    color: PALETTE.TAG_HKD,
    condition: (s) => s.hkd <= 30,
  },
  {
    id: 'west_district',
    category: '🏠 居住与生活',
    label: '西环分拣学徒',
    description: '体验过在凌晨的西环分拣货物。为了留在这座城市，你放下了所有的精英包袱。',
    color: PALETTE.TAG_HKD,
    condition: (s) => s.hkd <= 35 && s.energy >= 45,
    universityId: 'hku',
  },

  // ═══ 🚉 交通与通勤类 ═══════════════════════════════════════════
  {
    id: 'mtr_sardine',
    category: '🚉 交通与通勤',
    label: '港铁沙丁鱼',
    description: '在东铁线的早高峰，你练就了双脚悬空依然能稳如泰山的平衡力。',
    color: PALETTE.TAG_ENERGY,
    condition: (s) => s.energy <= 60,
  },
  {
    id: 'minibus_king',
    category: '🚉 交通与通勤',
    label: '11M 排队王',
    description: '科大人的勋章。你在清水湾的烈日下，等过无数辆满载的小巴，看透了山里的孤独。',
    color: PALETTE.TAG_ENERGY,
    condition: (s) => s.energy <= 55,
    universityId: 'hkust',
  },
  {
    id: 'border_sprinter',
    category: '🚉 交通与通勤',
    label: '罗湖折返跑冠军',
    description: '到闸机才想起通行证在床头。你在口岸线上的往返距离，足以绕地球一圈。',
    color: PALETTE.TAG_ENERGY,
    condition: (s) => s.energy <= 40,
    universityId: 'cuhk',
  },
  {
    id: 'infrared_suspect',
    category: '🚉 交通与通勤',
    label: '红外线"嫌疑人"',
    description: '因为过劳导致体温过高，被海关红外线锁定的瞬间，你以为这辈子的签证都要没了。',
    color: PALETTE.TAG_SPECIAL,
    condition: (s) => s.energy <= 30 && s.san <= 45,
    universityId: 'cuhk',
  },
  {
    id: 'bao_proxy',
    category: '🚉 交通与通勤',
    label: '鲍师傅代购特种兵',
    description: '书包里一半是论文，一半是给组员带的深圳鲍师傅。这是你维持小组社交的"硬通货"。',
    color: PALETTE.TAG_ENERGY,
    condition: (s) => s.cantonese >= 20,
    universityId: 'cuhk',
  },
  {
    id: 'disaster_bystander',
    category: '🚉 交通与通勤',
    label: '东铁线事故见证者',
    description: '遇到东铁线瘫痪的突发事故。你站在人流中，第一次深刻感受到双城生活的脆弱。',
    color: PALETTE.TAG_SPECIAL,
    condition: (s) => s.energy <= 40 && s.san <= 50,
    universityId: 'cuhk',
  },

  // ═══ 📚 学业与AI类 ═════════════════════════════════════════════
  {
    id: 'cyber_deadline',
    category: '📚 学业与AI',
    label: '赛博死线战士',
    description: '凌晨三点，图书馆灯火通明。你已经忘记上次睡眠超过五小时是什么感觉。',
    color: PALETTE.TAG_GPA,
    condition: (s) => s.energy <= 50 && s.gpa >= 40,
  },
  {
    id: 'vibe_coding_sensei',
    category: '📚 学业与AI',
    label: 'Vibe Coding 大师',
    description: '熟练运用 AI 指挥官模式。代码不是写出来的，是跟 AI"沟通"出来的。',
    color: PALETTE.TAG_GPA,
    condition: (s) => s.gpa >= 60 && s.energy >= 40,
  },
  {
    id: 'freerider_hunter',
    category: '📚 学业与AI',
    label: 'Free-rider 猎手',
    description: '在 GP 群里精准对线，手撕"消失的组员"。你是正义的化身，也是组员的噩梦。',
    color: PALETTE.TAG_GPA,
    condition: (s) => s.gpa >= 55 && s.san <= 55,
  },
  {
    id: 'cuhk_zen',
    category: '🏫 校园特色',
    label: '天人合一冥想者',
    description: '你对着吐露港发呆的时间，比你看论文的时间还长。你已经悟到了：所谓硕士，不过是山里的一场幻觉。',
    color: PALETTE.TAG_GPA,
    condition: (s) => s.san >= 55 && s.gpa <= 55,
    universityId: 'cuhk',
  },

  // ═══ 💼 求职与未来类 ═══════════════════════════════════════════
  {
    id: 'iang_beggar',
    category: '💼 求职与未来',
    label: 'IANG 签证乞丐',
    description: '面试的第一句话永远是："请问贵公司可以帮我办理签证延期吗？"',
    color: PALETTE.TAG_ENGLISH,
    condition: (s) => s.english >= 40 && s.gpa >= 40,
  },
  {
    id: 'central_newbie',
    category: '💼 求职与未来',
    label: '中环新贵预备役',
    description: '英语口语值点满。你终于走进了 IFC 的玻璃幕墙，成为了别人眼中的精英。',
    color: PALETTE.NEON_CYAN,
    condition: (s) => s.english >= 65 && s.gpa >= 65,
  },
  {
    id: 'cyberport_nomad',
    category: '💼 求职与未来',
    label: '数码港流浪者',
    description: '拿着学校的资助，在数码港的草坪上改了无数版商业计划书。',
    color: PALETTE.TAG_ENGLISH,
    condition: (s) => s.gpa >= 55 && s.hkd <= 50,
  },
  {
    id: 'hometown_dreamer_tag',
    category: '💼 求职与未来',
    label: '回归故里的梦游者',
    description: '回到了北方的办公室。在灰蒙蒙的天空下，你偶尔会恍惚：那一年的海风是真的吗？',
    color: PALETTE.TEXT_DIM,
    condition: (s) => s.cantonese <= 25 && s.english <= 55,
  },

  // ═══ 🧠 心理与社交类 ═══════════════════════════════════════════
  {
    id: 'post_breakdown',
    category: '🧠 心理与社交',
    label: '崩溃后重启',
    description: '在茶餐厅哭完 20 分钟后，擦干眼泪，继续打开电脑写论文。',
    color: PALETTE.TAG_SAN,
    condition: (s) => s.san <= 50,
  },
  {
    id: 'xhs_personality',
    category: '🧠 心理与社交',
    label: '小红书包装官',
    description: '现实里吃着剩饭，手机里发着坚尼地城的日落。你的赛博人格比你本人过得好。',
    color: PALETTE.TAG_SAN,
    condition: (s) => s.san >= 35 && s.hkd <= 50,
  },
  {
    id: 'easter_rebel',
    category: '🧠 心理与社交',
    label: '复活节逆行者',
    description: '当全香港都在北上吃喝，你顶着人潮逆流而上回实验室。你是这座城市的异类。',
    color: PALETTE.TAG_SAN,
    condition: (s) => s.gpa >= 55 && s.energy <= 55,
  },
  {
    id: 'lkf_outsider',
    category: '🧠 心理与社交',
    label: '兰桂坊局外人',
    description: '站在苏豪区的斜坡上，看着彻夜狂欢的人群，你只觉得他们吵闹，而你只想回红磡睡觉。',
    color: PALETTE.TAG_SAN,
    condition: (s) => s.san <= 50 && s.hkd >= 35,
  },

  // ═══ 🌐 文化与身份类 ═══════════════════════════════════════════
  {
    id: 'cantonese_survivor',
    category: '🌐 文化与身份',
    label: '粤语生存者',
    description: '学会了"唔该"、"多谢"、"几多钱"。在便利店能自如对话时，你觉得自己进化了。',
    color: PALETTE.TAG_CANTONESE,
    condition: (s) => s.cantonese >= 25,
  },
  {
    id: 'typhoon_hunter',
    category: '🌐 文化与身份',
    label: '台风假期盼望者',
    description: '每一次天文台挂出八号风球，你的心情比中奖还舒畅。终于可以光明正大不去上课。',
    color: PALETTE.TAG_CANTONESE,
    condition: (s) => s.san <= 55 && s.energy <= 60,
  },

  // ═══ 🚨 危机专属标签 ═══════════════════════════════════════════
  {
    id: 'panadol_addict',
    category: '🧠 心理与社交',
    label: 'Panadol 成瘾者',
    description: '你的血里一半是咖啡，一半是止痛药。学校医务室的护士已经能叫出你的全名了。',
    color: PALETTE.TAG_SPECIAL,
    condition: (s) => s.energy <= 30 && s.san <= 40,
  },
  {
    id: 'ssp_ghost',
    category: '🏠 居住与生活',
    label: '深水埗幽灵',
    description: '为了活下去，你曾潜入过这座城市的阴影里。深水埗旧楼的灯光，照亮的不是希望，是求生本能。',
    color: PALETTE.TAG_SPECIAL,
    condition: (s) => s.hkd <= 25,
  },
  {
    id: 'broken_puppet',
    category: '🧠 心理与社交',
    label: '断线的木偶',
    description: '你的表情系统已经损坏，只会机械地输入代码。同学以为你很专注，其实你只是忘了怎么笑。',
    color: PALETTE.TAG_SPECIAL,
    condition: (s) => s.san <= 30,
  },
  {
    id: 'bridge_prisoner',
    category: '🚉 交通与通勤',
    label: '被困在桥上的人',
    description: '你的身体在拒绝这种双城生活。在口岸晕倒的那一刻，你意识到通行证和学生证之间，隔着一条命。',
    color: PALETTE.TAG_SPECIAL,
    condition: (s) => s.energy <= 25 && s.san <= 40,
    universityId: 'cuhk',
  },

  // ═══ 🚺 女性专属标签 ═══════════════════════════════════════════
  {
    id: 'cold_queen',
    category: '🧠 心理与社交',
    label: '生人勿近的冷面女王',
    description: '你的眼神能让陌生人自动后退三步。在深夜的港铁车厢里，你就是自己的保镖。',
    color: PALETTE.TAG_SAN,
    condition: (s) => s.san >= 45 && s.energy >= 35,
    gender: 'female',
  },
  {
    id: 'real_scholar_girl',
    category: '📚 学业与AI',
    label: '真实力派学霸',
    description: '当别人还在用滤镜包装港硕生活时，你发了一张灰头土脸改代码的照片。评论区沉默了三秒，然后集体高呼"姐姐太酷了"。',
    color: PALETTE.TAG_GPA,
    condition: (s) => s.gpa >= 55 && s.san >= 40,
    gender: 'female',
  },

  // ═══ 🚹 男性专属标签 ═══════════════════════════════════════════
  {
    id: 'beer_negotiator',
    category: '🧠 心理与社交',
    label: '红磡酒局谈判专家',
    description: '你发明了一种全新的社交模式：用帮人Debug换喝酒机会。在红磡的路边摊，你是技术圈的社交货币。',
    color: PALETTE.TAG_SAN,
    condition: (s) => s.gpa >= 50 && s.cantonese >= 25,
    gender: 'male',
  },
  {
    id: 'generous_fool',
    category: '🏠 居住与生活',
    label: '深情且多金的冤大头',
    description: '你偷偷帮人叫了Lalamove还说是朋友帮忙。你的银行卡余额和你的面子一样薄，但你的善良比维港还深。',
    color: PALETTE.TAG_HKD,
    condition: (s) => s.hkd <= 40 && s.san >= 35,
    gender: 'male',
  },

  // ═══ 🗣️ 港味语言标签 ═══════════════════════════════════════════
  {
    id: 'konglish_master',
    category: '🌐 文化与身份',
    label: '港式英语 8 级',
    description: '你已经学会了在每句话里随机插入3个以上英文单词，且不带违和感。"呢个 Deadline 好 Chur，我要 Run 个 Model 先。"',
    color: PALETTE.TAG_ENGLISH,
    condition: (s) => s.english >= 50 && s.cantonese >= 25,
  },
  {
    id: 'mgoi_master',
    category: '🌐 文化与身份',
    label: '唔该大师',
    description: '谢谢、借过、买单、求助……你深谙"唔该"包治百界的生存哲学。一句"唔该"走天下，粤语精髓尽在其中。',
    color: PALETTE.TAG_CANTONESE,
    condition: (s) => s.cantonese >= 35,
  },
  {
    id: 'diving_champion',
    category: '🧠 心理与社交',
    label: '潜水冠军',
    description: '你掌握了"已读不回"的最高境界。群聊999+，你一条没回。组员在群里疯狂@你，你安静得像是退了群。',
    color: PALETTE.TAG_SAN,
    condition: (s) => s.san <= 40 && s.gpa >= 40,
  },
  {
    id: 'zap_saang',
    category: '🌐 文化与身份',
    label: '识执生',
    description: '"执生"是你的本能。没带证件能顺利过关，组员消失能独自扛起项目，没钱吃饭能找到免费活动——无论遇到什么烂摊子，你都能随机应变搞定。',
    color: PALETTE.NEON_CYAN,
    condition: (s) => s.cantonese >= 30 && s.energy >= 35 && s.san >= 35,
  },

  // ═══ 🎰 赛博锦鲤专属标签 ═══════════════════════════════════════
  {
    id: 'miracle_shatin_gambler',
    category: '🎰 港城奇迹',
    label: '沙田赌神',
    description: '你在沙田马场创造了传说。赔率1:42的冷门马因你而封神，连马场阿伯都管你叫"后生仔股神"。',
    color: PALETTE.NEON_YELLOW,
    condition: (s) => s.hkd >= 80,
  },
  {
    id: 'miracle_granny_son',
    category: '🎰 港城奇迹',
    label: '大娘的亲儿子',
    description: '深水埗叉烧饭摊的阿婆成了你的贵人。她给你介绍了CTO儿子的公司，你用一碗饭换了一个offer。',
    color: PALETTE.NEON_CYAN,
    condition: (s) => s.hkd >= 60 && s.cantonese >= 30,
    gender: 'male',
  },
  {
    id: 'miracle_granny_daughter',
    category: '🎰 港城奇迹',
    label: '大娘的亲闺女',
    description: '深水埗叉烧饭摊的阿婆成了你的贵人。她给你介绍了CTO儿子的公司，你用一碗饭换了一个offer。',
    color: PALETTE.NEON_CYAN,
    condition: (s) => s.hkd >= 60 && s.cantonese >= 30,
    gender: 'female',
  },
  {
    id: 'miracle_funded_graduate',
    category: '🎰 港城奇迹',
    label: '带资毕业',
    description: '你在毕业前就拿到了种子轮融资。当别人还在投简历时，你已经在注册公司了。创业圈称你为"港硕之光"。',
    color: PALETTE.NEON_MAGENTA,
    condition: (s) => s.gpa >= 70 && s.hkd >= 60,
  },
  {
    id: 'miracle_comeback_king',
    category: '🎰 港城奇迹',
    label: '逆风翻盘者',
    description: '曾经跌到谷底，又从废墟中爬了起来。你的故事本身就是一部赛博传奇，激励着无数后来的港硕。',
    color: PALETTE.NEON_YELLOW,
    condition: (s) => s.hkd >= 50 && s.san >= 50 && s.energy >= 40,
  },

  // ═══ 🏫 城大专属类 ═══════════════════════════════════════════
  {
    id: 'cityu_festival_walk_alumnus',
    category: '🏫 校园特色',
    label: '又一城校友',
    description: '对你来说，商场就是校园，橱窗就是校训。你能闭着眼从大学站C2出口走到任何一个教室。',
    color: PALETTE.TAG_HKD,
    condition: (s) => s.hkd <= 50,
    universityId: 'cityu',
  },
  {
    id: 'cityu_cmc_captain',
    category: '🏫 校园特色',
    label: 'CMC银舰舵手',
    description: '你已经习惯了在那座几何感扭曲的白色建筑里通宵。那里是你的实验室，也是你的避难所。',
    color: PALETTE.TAG_GPA,
    condition: (s) => s.gpa >= 45 && s.energy <= 50,
    universityId: 'cityu',
  },
  {
    id: 'cityu_nam_shan_aesthete',
    category: '🏫 校园特色',
    label: '南山邨美学家',
    description: '熟知南山邨每一个拍照机位。在奢侈品商场与旧区公屋之间，你完美平衡了自己的消费观。',
    color: PALETTE.TAG_SAN,
    condition: (s) => s.san >= 40 && s.hkd <= 45,
    universityId: 'cityu',
  },
  {
    id: 'cityu_junction_master',
    category: '🏫 校园特色',
    label: '九龙塘转乘大师',
    description: '住在九龙塘这个咽喉要道。你见证了东铁线与观塘线的每一次交汇，也见证了无数留子的来来往往。',
    color: PALETTE.TAG_ENERGY,
    condition: (s) => s.energy >= 35 && s.cantonese >= 20,
    universityId: 'cityu',
  },

  // ═══ 🏫 理工专属类 ═══════════════════════════════════════════
  {
    id: 'polyu_bridge_runner',
    category: '🏫 校园特色',
    label: '红磡天桥跑者',
    description: '你已经掌握了不看地图就能在红磡站、理工校区和黄埔之间无缝切换的秘籍。',
    color: PALETTE.TAG_ENERGY,
    condition: (s) => s.energy <= 50,
    universityId: 'polyu',
  },
  {
    id: 'polyu_two_dish_sommelier',
    category: '🏫 校园特色',
    label: '两餸饭鉴赏家',
    description: '你是红磡生活区的活地图。哪家的黑椒牛柳最嫩，哪家的阿姨给饭最满，你一清二楚。',
    color: PALETTE.TAG_HKD,
    condition: (s) => s.hkd <= 50 && s.san >= 35,
    universityId: 'polyu',
  },
  {
    id: 'polyu_red_brick_doer',
    category: '🏫 校园特色',
    label: '红砖实干家',
    description: '你不屑于空谈理论，你的代码和设计都是为了解决实际问题。你是PolyU精神的具象化。',
    color: PALETTE.TAG_GPA,
    condition: (s) => s.gpa >= 50 && s.energy <= 45,
    universityId: 'polyu',
  },
  {
    id: 'polyu_tunnel_citizen',
    category: '🏫 校园特色',
    label: '隧道旁的一等公民',
    description: '长期生活在全港最繁忙的交通枢纽旁。引擎声是你的摇篮曲，汽车尾气是你的助眠香氛。',
    color: PALETTE.TAG_SAN,
    condition: (s) => s.san >= 40 && s.energy >= 30,
    universityId: 'polyu',
  },

  // ═══ 🏫 科大专属类 ═══════════════════════════════════════════
  {
    id: 'hkust_11m_disciple',
    category: '🏫 校园特色',
    label: '11M候车信徒',
    description: '你的大半个硕士生涯都是在坑口小巴站度过的。你精准知道每一班车的空位数量。',
    color: PALETTE.TAG_ENERGY,
    condition: (s) => s.energy <= 45,
    universityId: 'hkust',
  },
  {
    id: 'hkust_red_bird_watcher',
    category: '🏫 校园特色',
    label: '红鸟下的守望者',
    description: '你曾在红鸟下见证过凌晨四点的日出，也曾在它阴影里流过Quiz挂掉的泪水。',
    color: PALETTE.TAG_GPA,
    condition: (s) => s.gpa >= 45 && s.san <= 50,
    universityId: 'hkust',
  },
  {
    id: 'hkust_ust_champ',
    category: '🏫 校园特色',
    label: '压力与张力冠军',
    description: '你完美诠释了"University of Stress and Tension"。在这种高压Curve下活下来，你已经是战神。',
    color: PALETTE.TAG_SAN,
    condition: (s) => s.gpa >= 50 && s.san <= 45,
    universityId: 'hkust',
  },
  {
    id: 'hkust_ocean_lab_prisoner',
    category: '🏫 校园特色',
    label: '海景实验室囚徒',
    description: '拥有全港最好的海景，却过着最封闭的生活。窗外的海是蓝的，你的代码是红的（报错）。',
    color: PALETTE.TAG_GPA,
    condition: (s) => s.gpa >= 55 && s.energy <= 45,
    universityId: 'hkust',
  },

  // ═══ 🏫 中大专属类 ═══════════════════════════════════════════
  {
    id: 'cuhk_shuttle_brawler',
    category: '🏫 校园特色',
    label: '校巴肉搏战神',
    description: '你能在校巴车门关闭的最后一秒，以一种违反物理学姿势把自己塞进车厢。中大的山坡，从不收留弱者。',
    color: PALETTE.TAG_ENERGY,
    condition: (s) => s.energy >= 40,
    universityId: 'cuhk',
  },
  {
    id: 'cuhk_east_rail_pendulum',
    category: '🏫 校园特色',
    label: '东铁线钟摆人',
    description: '住在罗湖，学在中大。你闭着眼睛都能数出从大学站到罗湖经过了几个隧道。',
    color: PALETTE.TAG_ENERGY,
    condition: (s) => s.energy <= 50 && s.hkd <= 45,
    universityId: 'cuhk',
  },
  {
    id: 'cuhk_monkey_expert',
    category: '🏫 校园特色',
    label: '猴口夺食者',
    description: '你是敢于在中大后山提着外卖行走的猛士。你和猕猴达成了某种心照不宣的和平协议。',
    color: PALETTE.TAG_SAN,
    condition: (s) => s.san >= 40 && s.energy >= 35,
    universityId: 'cuhk',
  },

  // ═══ 🏫 港大专属类 ═══════════════════════════════════════════
  {
    id: 'hku_vertical_climber',
    category: '🏫 校园特色',
    label: '港大登山队员',
    description: '庄月明楼的电梯永远在维修。你已练就一口气爬八层楼不喘的绝技，腿是铁打的。',
    color: PALETTE.TAG_ENERGY,
    condition: (s) => s.energy >= 45,
    universityId: 'hku',
  },
  {
    id: 'hku_slope_victim',
    category: '🏫 校园特色',
    label: '西环坡道受害者',
    description: '坚尼地城的斜坡是你的每日噩梦。下雨天滑倒三次后，你终于学会了买防滑鞋。',
    color: PALETTE.TAG_ENERGY,
    condition: (s) => s.energy <= 50 && s.san <= 55,
    universityId: 'hku',
  },
  {
    id: 'hku_central_benchwarmer',
    category: '🏫 校园特色',
    label: '中环后备军',
    description: '你参加了无数场中环的Networking活动，名片发了一沓，但没有一个回复你。',
    color: PALETTE.TAG_ENGLISH,
    condition: (s) => s.english >= 45 && s.hkd <= 45,
    universityId: 'hku',
  },
  {
    id: 'hku_red_brick_guardian',
    category: '🏫 校园特色',
    label: '红砖墙的守门人',
    description: '你曾在本部大楼的红砖墙下独坐到天黑，最终选择用自己的方式守护这份归属感。',
    color: PALETTE.TAG_SAN,
    condition: (s) => s.san >= 40 && s.cantonese >= 15,
    universityId: 'hku',
  },

  // ═══ 🛫 归途身份标签 ═══════════════════════════════════════════
  {
    id: 'suitcase_scholar',
    category: '💼 求职与未来',
    label: '行李箱里的硕士',
    description: '你的整个香港记忆，最后都被压缩进了一个28寸的行李箱里。没有欢呼，只有轮子滚过柏油路的隆隆声。',
    color: PALETTE.TAG_ENERGY,
    condition: (s) => s.energy <= 40 && s.san <= 45,
  },
  {
    id: 'iang_scavenger',
    category: '💼 求职与未来',
    label: 'IANG 拾荒者',
    description: '拿着那张签证，却不知道该往哪张办公桌坐下。你留下了，但你还在流浪。',
    color: PALETTE.TAG_ENGLISH,
    condition: (s) => s.english >= 40 && s.hkd <= 35,
  },
  {
    id: 'parallel_traveler',
    category: '🌐 文化与身份',
    label: '平行世界的过客',
    description: '你曾在香港住过一年，但你觉得自己从未真正推开过这个城市的门。',
    color: PALETTE.TAG_CANTONESE,
    condition: (s) => s.cantonese <= 15 && s.san >= 30,
  },
];

// ── Universities (School Origins) ────────────────────────────────
export interface UniversityDef {
  id: string;
  name: string;
  abbr: string;
  title: string;       // illustrated codex title
  geoTrait: string;    // geographic trait
  mechanic: string;    // unique game mechanic description
  statBonus: Partial<PlayerStats>;
}

export const UNIVERSITIES: UniversityDef[] = [
  {
    id: 'hkust',
    name: '香港科技大学',
    abbr: 'HKUST',
    title: '清水湾修仙者',
    geoTrait: '交通孤岛，山海之间',
    mechanic: '[小巴挑战] 早高峰91M排队博弈，体力消耗翻倍\n[后山愈合] 通过Hiking大幅恢复San值',
    statBonus: { energy: -10, gpa: 5, english: 5, san: 5 },
  },
  {
    id: 'cuhk',
    name: '香港中文大学',
    abbr: 'CUHK',
    title: '东铁线钟摆',
    geoTrait: '离口岸最近，双城门户',
    mechanic: '[罗湖/福田居住] 默认省钱模式\n[口岸事故] 可能触发交通瘫痪事件',
    statBonus: { hkd: 15, energy: -5, cantonese: 5, san: -5 },
  },
  {
    id: 'polyu',
    name: '香港理工大学',
    abbr: 'PolyU',
    title: '红磡社交达人',
    geoTrait: '闹市中心，生活巅峰',
    mechanic: '[步行生存] 无交通压力\n[社交涡旋] San值波动大，受高房租影响',
    statBonus: { cantonese: 10, english: 5, hkd: -10, san: -5 },
  },
  {
    id: 'cityu',
    name: '香港城市大学',
    abbr: 'CityU',
    title: '又一城购物学者',
    geoTrait: '九龙塘核心，又一城楼上',
    mechanic: '[又一城效应] 出门就是商场，消费欲望翻倍\n[双线交汇] 东铁+观塘线通勤极便利',
    statBonus: { energy: 10, hkd: -10, cantonese: 5, gpa: 5 },
  },
  {
    id: 'hku',
    name: '香港大学',
    abbr: 'HKU',
    title: '中环预备役',
    geoTrait: '港岛核心，阶级感强',
    mechanic: '[西营盘坡道] 房租全港最高\n[中环Networking] 求职成功率+20%',
    statBonus: { hkd: -15, gpa: 5, english: 10, san: 0 },
  },
];

// ── Majors ───────────────────────────────────────────────────────
export interface MajorDef {
  id: string;
  name: string;
  description: string;
  statBonus: Partial<PlayerStats>;
}

export const MAJORS: MajorDef[] = [
  {
    id: 'humanities',
    name: '人文社科设计类',
    description: '文学、社会学、传播、设计、教育',
    statBonus: { san: 5, cantonese: 5, english: 5 },
  },
  {
    id: 'cs',
    name: '计算机类',
    description: '计算机科学、数据科学、人工智能',
    statBonus: { gpa: 10, energy: -5, english: 5 },
  },
  {
    id: 'finance',
    name: '金融商科类',
    description: '金融、会计、MBA、经济学',
    statBonus: { hkd: 10, english: 5, gpa: 5 },
  },
];

// ── Housing Timing (Chapter 1 Dynamic Opening) ──────────────────
export interface HousingTimingDef {
  id: string;
  name: string;
  label: string;
  emoji: string;
  description: string;
  statBonus: Partial<PlayerStats>;
  /** Recurring per-chapter stat buff (empty object = random buff in code). */
  chapterBuff: Partial<PlayerStats>;
}

export const HOUSING_TIMING_OPTIONS: HousingTimingDef[] = [
  {
    id: 'early_bird',
    name: '早鸟派',
    label: '远程狩猎',
    emoji: '🐦',
    description: '3个月前拿到Offer就已经开始远程"狩猎"。\n初始资金低，San值高。',
    statBonus: { hkd: -15, san: 15 },
    chapterBuff: { san: 2 },
  },
  {
    id: 'last_minute',
    name: '压哨派',
    label: '双城跨看',
    emoji: '⏰',
    description: '开学前两周才到深圳，住在酒店"双城跨看"。\n初始资金高，San值低，Energy低。',
    statBonus: { hkd: 15, san: -10, energy: -10 },
    chapterBuff: { hkd: 2 },
  },
  {
    id: 'bargain_hunter',
    name: '捡漏派',
    label: '实体拆盲盒',
    emoji: '📦',
    description: '干脆不租房，先住短租/青旅，入港后再实体看房。\n随机性极大。',
    statBonus: { san: -5, energy: 5, cantonese: 5 },
    chapterBuff: {},
  },
];

/** Map housing timing id to its branch event id. */
export const HOUSING_BRANCH_EVENTS: Record<string, string> = {
  early_bird: 'housing_xhs_dream',
  last_minute: 'housing_special_ops',
  bargain_hunter: 'housing_hostel_intel',
};

// ── Survival Events (Random/Fixed Incidents) ─────────────────────
export interface SurvivalEvent {
  id: string;
  series: string;
  title: string;
  narration: string;
  choices: StoryChoice[];
  /** Scene illustration texture id for this event. */
  imageId?: string;
  /** If set, event only triggers for this university id. */
  universityId?: string;
  /** If set, event only triggers for this gender. */
  gender?: 'male' | 'female';
  /** If set, event is a housing branch event (excluded from random rolls). */
  housingTiming?: string;
}

// ── Event series → illustration texture mapping ─────────────────
export const EVENT_SERIES_IMAGE_MAP: Record<string, string> = {
  '租房博弈': 'evt-money',
  '口岸噩梦': 'evt-border',
  '学术修罗场': 'evt-academic',
  '天灾人祸': 'evt-weather',
  '生存危机': 'evt-money',
  '深夜故事': 'evt-night',
  '租房血泪': 'evt-money',
  '行政噩梦': 'evt-city',
  '宿舍日常': 'evt-night',
  '城市意外': 'evt-city',
  '社交名利场': 'evt-social',
  '城市漫游': 'evt-city',
  '港式生存': 'evt-social',
  'Konglish 修罗场': 'evt-academic',
  '港式社交': 'evt-social',
  '思乡': 'evt-career',
  '求职地狱': 'evt-career',
  '安全边界': 'evt-night',
  '流量陷阱': 'evt-social',
  '兄弟社交': 'evt-social',
  '体力透支': 'evt-city',
  '港大日常': 'evt-hku',
  '中大日常': 'evt-cuhk',
  '科大日常': 'evt-hkust',
  '理工日常': 'evt-polyu',
  '城大日常': 'evt-cityu',
  '霓虹下的异乡人': 'evt-city',
  '红磡的寿司预言': 'evt-social',
  '悄无声息的散场': 'evt-career',
  '🚨 数值危机': 'evt-crisis',
  '🎰 港城奇迹': 'evt-miracle',
} as const;

/** All unique event illustration texture ids for preloading. */
export const EVENT_IMAGE_IDS = [
  'evt-border',
  'evt-academic',
  'evt-weather',
  'evt-money',
  'evt-night',
  'evt-city',
  'evt-social',
  'evt-career',
  'evt-crisis',
  'evt-miracle',
  'evt-hku',
  'evt-cuhk',
  'evt-hkust',
  'evt-polyu',
  'evt-cityu',
] as const;

export const SURVIVAL_EVENTS: SurvivalEvent[] = [
  // ── Housing Branch Events (triggered after housing timing selection) ──
  {
    id: 'housing_xhs_dream',
    series: '租房博弈',
    title: '【小红书上的"梦情神房"】',
    housingTiming: 'early_bird',
    narration: '房产中介发来一段视频，采光极好，离学校5分钟，甚至还有个能看海的小阳台。中介催促："后面还有5个同学在排队，10分钟内交订金（Deposit）就留给你。"',
    choices: [
      { text: '💸 立刻打钱，不等视频通话直接付订金', effects: { hkd: -15, energy: 5 } },
      { text: '📹 要求连线，让中介现场直播实拍', effects: { san: -10, cantonese: 5 } },
      { text: '🤖 AI深度分析，对比租金波动和投诉记录', effects: { gpa: 10, san: 5 } },
    ],
  },
  {
    id: 'housing_special_ops',
    series: '租房博弈',
    title: '【罗湖酒店里的"看房特种兵"】',
    housingTiming: 'last_minute',
    narration: '你住在罗湖某快捷酒店，今天已经过关看了5套红磡的唐楼。此时全身汗透，小腿酸痛，最后一家中介说大角咀还有一套"平靓正"的。',
    choices: [
      { text: '💪 硬顶去大角咀，咬牙坐港铁哪怕天黑', effects: { energy: -25, san: -10, hkd: 5 } },
      { text: '🛏 回酒店瘫着，去深圳吃个烧烤回血', effects: { energy: 15, hkd: -5, san: 5 } },
      { text: '🗣 在MTR上寻找室友，留子群里大喊拼房', effects: { cantonese: 15, san: 5 } },
    ],
  },
  {
    id: 'housing_hostel_intel',
    series: '租房博弈',
    title: '【青旅里的"情报交易"】',
    housingTiming: 'bargain_hunter',
    narration: '你住在深水埗的青旅上铺，旁边是一个刚退学的学长，他正打算转让他的"厅长"位。',
    choices: [
      { text: '🤝 直接接手，不看房直接承接学长的转租', effects: { hkd: 10, san: -5 } },
      { text: '🚶 去大坑口扫街，看唐楼下面贴的招租黄纸', effects: { cantonese: 10, energy: -10 } },
      { text: '🤖 AI寻找房源，编写脚本监控低价放水瞬间', effects: { gpa: 5, english: 5 } },
    ],
  },

  // ── 第三章：霓虹下的异乡人 (The Neon Ghost) ──────────────────────
  {
    id: 'victoria_harbour_silence',
    series: '霓虹下的异乡人',
    title: '【维港的沉默】',
    narration: '你结束了12小时的Lab，独自坐车到尖沙咀海旁。对面中环的灯光极其璀璨，你耳机里放着歌，那一刻你觉得自己离繁华只有几百米，但中间隔着的是整个人生。',
    choices: [
      { text: '💳 强制融入：去K11随便买一件昂贵但无用的东西', effects: { hkd: -15, san: 5 } },
      { text: '🌊 沉浸疏离：坐在长椅上看半小时海，数灯光熄灭的顺序', effects: { san: 20, cantonese: 5 } },
      { text: '🎙 录制白噪音：拿出设备录下海浪和人声当Vibe Coding素材', effects: { gpa: 10, english: 5 } },
    ],
  },

  // ── 第四章：红磡的寿司预言 (The Sushi Prophecy) ───────────────────
  {
    id: 'last_lemon_tea',
    series: '红磡的寿司预言',
    title: '【最后一杯冻柠茶的质问】',
    narration: '在Poly旁边的手抓寿司店。灯光昏暗，朋友脸上写满了疲惫。你们讨论的不再是哪个教授给分高，而是"回内地考公/大厂"还是"留在香港洗盘子拿IANG"。朋友看着你问："诶，你真的想好要留下来了吗？在这儿租一辈子房？"',
    choices: [
      { text: '📱 现实主义者：展示刚刷到的内地大厂春招信息', effects: { english: 10, gpa: 10, san: -10 } },
      { text: '🎲 浪漫的赌徒：喝掉冰块，说想留下看看这赛博城市', effects: { san: 15, cantonese: 5, hkd: -10 } },
      { text: '🤐 迷茫的钟摆：沉默。继续吃那个已经不怎么新鲜的寿司', effects: { san: -15, energy: -5 } },
    ],
  },

  // ── 第五章：悄无声息的散场 (The Silent Exit) ──────────────────────
  {
    id: 'xianyu_heritage',
    series: '悄无声息的散场',
    title: '【闲鱼上的"港硕遗产"】',
    narration: '租房合同到期了。没有毕业典礼上的狂欢，只有闲鱼上不断成交的二手插线板和烧水壶。你最后一件卖出的是那个陪你熬了无数个夜的台灯。买家是刚拿到Offer、满脸憧憬的下一届学弟。',
    choices: [
      { text: '📦 前辈的忠告：把避雷指南和求职资源打包发给他，不收钱', effects: { cantonese: 15, san: 10 } },
      { text: '🚪 冷漠交接：拿钱，关门，你知道他要吃的苦你帮不了', effects: { hkd: 10, san: -5 } },
      { text: '🍱 最后的最后：去吃那家你最讨厌但最便宜的两餸饭告别', effects: { san: 10, cantonese: 5, energy: 5 } },
    ],
  },

  // ── 口岸噩梦系列 (cross-border events — only for schools where Shenzhen commute is common) ──
  {
    id: 'fatal_forget',
    series: '口岸噩梦',
    title: '【致命遗忘】',
    narration: '地铁上你才发现——通行证忘在深圳的书桌上了。来不及了，早课已经开始。你被迫折返，一路上心跳加速，脑子里全是教授点名的画面……',
    universityId: 'cuhk',
    choices: [
      {
        text: '🏃 狂奔折返取证件，赶下一节课',
        effects: { san: -20, energy: -15, gpa: -5 },
      },
      {
        text: '📱 跟同学借笔记，今天就算了',
        effects: { san: -10, gpa: -10, energy: -5 },
      },
    ],
  },
  {
    id: 'infrared_judge',
    series: '口岸噩梦',
    title: '【红外线审判】',
    narration: '长期跨境通勤终于让免疫力崩塌。过海关时红外测温仪亮了红灯，你被拦下来进入隔离观察区。手机上的面试邀请还在闪烁——今天下午三点，中环某大厂……',
    universityId: 'cuhk',
    choices: [
      {
        text: '📞 赶紧打电话改期，诚恳道歉',
        effects: { san: -10, energy: -10, gpa: -5, english: 5 },
      },
      {
        text: '😔 算了，身体要紧，面试再找机会',
        effects: { san: -5, energy: -5, hkd: -5 },
      },
    ],
  },
  {
    id: 'north_flood',
    series: '口岸噩梦',
    title: '【北上逆流】',
    narration: '节假日的口岸，数十万北上消费的港人像潮水一样涌来。你逆流而上，被挤得前胸贴后背。新买的衬衫被踩了一脚，包里的奶茶洒了一半。体力值瞬间见底……',
    universityId: 'cuhk',
    choices: [
      {
        text: '💪 硬挤过去，死也不迟到',
        effects: { energy: -20, san: -10 },
      },
      {
        text: '☕ 找个角落等人流过去，喝杯咖啡缓缓',
        effects: { energy: -10, san: 5, hkd: -5 },
      },
    ],
  },
  {
    id: 'pastry_courier',
    series: '口岸噩梦',
    title: '【鲍师傅搬运工】',
    narration: '香港组员知道你住深圳后，请求你带几盒网红点心过来。为了维系小组关系，你凌晨排队买了鲍师傅和喜茶，左手两袋右手三袋，像个搬运工一样过关……',
    universityId: 'cuhk',
    choices: [
      {
        text: '🎁 开心帮忙，人情就是投资',
        effects: { cantonese: 10, energy: -5, san: 5 },
      },
      {
        text: '🙅 委婉拒绝，自己的事都忙不过来',
        effects: { san: -5, energy: 5 },
      },
    ],
  },
  // ── 学术修罗场系列 ──
  {
    id: 'missing_traveler',
    series: '学术修罗场',
    title: '【消失的旅行者】',
    narration: 'Deadline前72小时，负责核心模块的组员在朋友圈发了大三巴的自拍，然后人间蒸发。群里@了三十条消息，已读不回。你打开他负责的部分——几乎是空的。',
    choices: [
      {
        text: '💻 深吸一口气，自己扛起来通宵做',
        effects: { gpa: 10, san: -15, energy: -20 },
      },
      {
        text: '📧 直接举报给教授，让他承担后果',
        effects: { gpa: 5, san: -5, cantonese: -5 },
      },
    ],
  },
  {
    id: 'vibe_coding',
    series: '学术修罗场',
    title: '【Vibe Coding 觉醒】',
    narration: '凌晨两点，面对上千行代码需求，你打开了ChatGPT。几个prompt下来，代码框架已经搭好。效率飞升，但你隐隐担心——如果面试被问到细节怎么办？',
    choices: [
      {
        text: '🤖 All in AI，效率就是正义',
        effects: { gpa: 10, energy: 10, san: 5, english: -5 },
      },
      {
        text: '📝 用AI辅助但自己理解每一行',
        effects: { gpa: 5, energy: -5, english: 5 },
      },
    ],
  },

  // ── 通用随机事件 (Universal random events) ──
  {
    id: 'typhoon_dilemma',
    series: '天灾人祸',
    title: '【八号风球拉扯】',
    narration: '手机弹出红色警报：八号风球即将生效。教授刚发邮件说"课照上"，但天文台说"非必要不外出"。窗外的雨已经开始横着飘了。你的室友已经在床上躺平刷剧。',
    choices: [
      {
        text: '🌧️ 风雨无阻，全副武装冲去教室',
        effects: { gpa: 10, energy: -15, san: -10 },
      },
      {
        text: '🛏️ 躺平享受，台风假是港漂福利',
        effects: { san: 15, gpa: -5, energy: 10 },
      },
      {
        text: '💻 线上参与，假装自己很积极',
        effects: { gpa: 5, san: 5 },
      },
    ],
  },
  {
    id: 'octopus_disaster',
    series: '生存危机',
    title: '【八达通见底】',
    narration: '"嘟——"闸机发出刺耳的红色蜂鸣。余额不足。身后排着十几个赶早高峰的上班族，目光像激光一样射过来。你翻遍口袋，手机支付也绑定失败。港铁站的空调很冷，你的脸很热。',
    choices: [
      {
        text: '🏧 找最近的充值机，忍受白眼',
        effects: { san: -10, energy: -5 },
      },
      {
        text: '🚶 算了，走路去学校省车费',
        effects: { energy: -20, hkd: 5 },
      },
    ],
  },
  {
    id: 'midnight_mcd',
    series: '深夜故事',
    title: '【麦当劳凌晨三点】',
    narration: '图书馆关门了。你抱着电脑走进24小时麦当劳，发现这里简直是一个平行宇宙——有赶DDL的留学生，有刷手机的夜班司机，还有一个不知道在对谁笑的大叔。薯条的味道混着疲惫，莫名让人安心。',
    choices: [
      {
        text: '🍟 点一份套餐，在这里通宵写论文',
        effects: { hkd: -5, gpa: 10, energy: -15, san: -5 },
      },
      {
        text: '😴 趴桌睡两小时再说，反正没人管',
        effects: { energy: 10, san: 5, gpa: -5 },
      },
      {
        text: '🗣️ 跟隔壁桌的留学生搭话，互诉苦水',
        effects: { san: 10, english: 5 },
      },
    ],
  },
  {
    id: 'landlord_conflict',
    series: '租房血泪',
    title: '【房东的最后通牒】',
    narration: '房东发来语音：下个月起加租15%。你看着银行卡余额，又看了看窗外那片你已经习惯的天际线。搬家意味着重新开始，不搬意味着吃土。深圳的朋友说那边有空房间……',
    choices: [
      {
        text: '💰 咬牙续租，稳定比什么都重要',
        effects: { hkd: -15, san: -5, energy: 5 },
      },
      {
        text: '📦 连夜找房搬家，开启游牧模式',
        effects: { hkd: 5, san: -15, energy: -20 },
      },
      {
        text: '🚄 搬去深圳，正式加入跨境大军',
        effects: { hkd: 15, energy: -10, cantonese: 5 },
      },
    ],
  },
  {
    id: 'visa_panic',
    series: '行政噩梦',
    title: '【签证续期惊魂】',
    narration: '入境处的邮件冰冷而简洁："您的签证申请材料不完整，请于5个工作日内补交。"你翻遍了文件夹——银行流水、在读证明、住址证明——少了一份雇主信。而你根本还没找到工作。',
    choices: [
      {
        text: '📞 疯狂打电话求助学校国际处',
        effects: { san: -15, energy: -10, english: 5 },
      },
      {
        text: '🏃 亲自跑入境处碰运气当面解释',
        effects: { san: -10, energy: -15, cantonese: 5 },
      },
    ],
  },
  {
    id: 'group_project_betrayal',
    series: '学术修罗场',
    title: '【组员的背刺】',
    narration: 'Presentation前一晚。你打开共享文档，发现那个说"交给我"的组员把你负责的部分改得面目全非，还在PPT最后一页写了句"Special thanks to ChatGPT"。你的名字被挤到了最小的字号。',
    choices: [
      {
        text: '😤 连夜改回来，用Git记录证明谁才是原作者',
        effects: { gpa: 10, san: -15, energy: -15 },
      },
      {
        text: '🤝 私聊沟通，毕竟还要一起拿分',
        effects: { san: -5, english: 5, cantonese: 5 },
      },
      {
        text: '🔥 截图发群，公开对质',
        effects: { san: -10, gpa: 5 },
      },
    ],
  },
  {
    id: 'cheap_flight_temptation',
    series: '思乡',
    title: '【99块的机票】',
    narration: '刷手机看到一条推送：飞回家的机票只要99块。你的手指悬在"立即购买"上方，脑子里闪过妈妈做的红烧肉、阳台上晒的被子、还有楼下那条遛狗的老街。但下周有Quiz，下下周有Presentation……',
    choices: [
      {
        text: '✈️ 买！周末闪回家充电',
        effects: { san: 20, energy: -10, gpa: -10, hkd: -10 },
      },
      {
        text: '😢 忍住，截图发给妈妈说"下次一定"',
        effects: { san: -10, gpa: 5 },
      },
    ],
  },
  {
    id: 'job_fair_humiliation',
    series: '求职地狱',
    title: '【Career Fair 社死现场】',
    narration: 'HR接过你的简历，扫了一眼，笑着说："哦，taught master啊。我们只收research track的。"旁边的本地生投来一个微妙的目光。你的手心全是汗，西装里闷得像蒸笼。',
    choices: [
      {
        text: '💪 微笑回应，转身投下一家',
        effects: { san: -10, english: 10 },
      },
      {
        text: '🚪 提前离场，去厕所平复情绪',
        effects: { san: -15, energy: 5 },
      },
      {
        text: '🗣️ 当场自我推销，用项目经历反驳偏见',
        effects: { san: -5, english: 10, gpa: 5 },
      },
    ],
  },
  {
    id: 'laundry_war',
    series: '宿舍日常',
    title: '【洗衣房争夺战】',
    narration: '你提着一桶脏衣服来到公共洗衣房，发现六台洗衣机全部被占。有三台显示"已完成"但没人来取。你等了20分钟，还是没人。衣服已经开始产生"生化武器"级别的味道。',
    choices: [
      {
        text: '🧺 帮别人取出来，自己先洗',
        effects: { san: -5 },
      },
      {
        text: '⏰ 设闹钟凌晨三点再来',
        effects: { energy: -10, san: -5 },
      },
      {
        text: '🤚 手洗算了，锻炼臂力',
        effects: { energy: -10, san: 5 },
      },
    ],
  },
  {
    id: 'lost_airpods_mtr',
    series: '城市意外',
    title: '【港铁上的AirPods葬礼】',
    narration: '车门关闭的瞬间，你的AirPods从耳朵弹出，完美地落入了月台与车厢之间的缝隙。你眼睁睁看着它消失在黑暗中。车厢里的大叔用粤语说了句什么，旁边有人在笑。你觉得全世界都在看你。',
    choices: [
      {
        text: '🎧 找站务员求助，虽然大概率回不来了',
        effects: { san: -10, cantonese: 5 },
      },
      {
        text: '😤 当场下单买新的，钱是用来解决问题的',
        effects: { hkd: -20, san: 5 },
      },
    ],
  },
  {
    id: 'xhs_viral',
    series: '社交名利场',
    title: '【小红书爆了】',
    narration: '你随手发的一条吐槽港硕生活的帖子，一夜之间点赞过万。评论区吵翻了——有人说你"矫情"，有人说你"太真实了"。私信里涌进来三个MCN公司的合作邀请。你的手机震到快没电。',
    choices: [
      {
        text: '📱 接合作，搞副业赚零花钱',
        effects: { hkd: 15, san: -10, gpa: -5 },
      },
      {
        text: '🙈 吓到删帖，社恐发作',
        effects: { san: -5 },
      },
      {
        text: '📝 趁热打铁继续更新，打造个人品牌',
        effects: { hkd: 10, san: -5, english: 5 },
      },
    ],
  },
  {
    id: 'ding_ding_epiphany',
    series: '城市漫游',
    title: '【叮叮车上的顿悟】',
    narration: '你坐上了从筲箕湾到坚尼地城的叮叮车。票价2.6港币，全程一个多小时。窗外的霓虹招牌、老旧骑楼、晾满衣服的天台，像一部慢速播放的纪录片。坐在你旁边的阿婆，突然用不太标准的普通话问你："后生仔，你从哪里来啊？"',
    choices: [
      {
        text: '🗣️ 用蹩脚粤语聊天，阿婆笑得很开心',
        effects: { cantonese: 10, san: 15 },
      },
      {
        text: '📷 戴上耳机看窗外，把这一刻留在记忆里',
        effects: { san: 10 },
      },
    ],
  },

  // ── 港味对白系列 (Hong Kong Slang / Konglish Events) ──
  {
    id: 'hk_cha_chaan_teng',
    series: '港式生存',
    title: '【红磡茶餐厅的语言考试】',
    narration: '午饭时间，你走进了学校附近最旺的茶餐厅。侍应阿姐手持纸笔，用粤语机关枪式地问："后生仔，食咩啊？快啲啦，后面好多人排队。"身后十几双眼睛齐刷刷看过来。这不是点餐，这是实战考试。',
    choices: [
      {
        text: '🗣️ "一份沙爹牛面，冻奶茶走甜，唔该。"',
        effects: { cantonese: 15, san: 10 },
      },
      {
        text: '😅 "请问有菜单吗？"（普通话）',
        effects: { cantonese: -5, san: -5 },
      },
      {
        text: '🌐 "One... 呢个 Set A，冻 Milk Tea，Thanks."',
        effects: { cantonese: 5, english: 5 },
      },
    ],
  },
  {
    id: 'hk_advisor_konglish',
    series: 'Konglish 修罗场',
    title: '【导师 Office Hour 的训话】',
    narration: '你鼓起勇气去导师 Office Hour 讨论论文，结果被劈头盖脸训了一顿："你呢份 Project 嘅 Logic 有问题，AI 帮到你写 Code，但帮唔到你思考。你咁样落去，我惊你 Graduate 唔到啊。"你的脑子在高速运转：是认错还是硬刚？',
    choices: [
      {
        text: '🙏 "Sorry Prof，我会再执执个 Logic。"',
        effects: { gpa: 10, san: -5, cantonese: 5 },
      },
      {
        text: '💪 "但係呢个 Vibe Coding 係而家最 Hit 嘅嘢喎。"',
        effects: { gpa: -15, san: 5, english: 5 },
      },
      {
        text: '📝 默默记下所有修改意见，回去通宵改',
        effects: { gpa: 15, energy: -15, san: -10 },
      },
    ],
  },
  {
    id: 'hk_konglish_meeting',
    series: 'Konglish 修罗场',
    title: '【Group Meeting 的"语言切换"】',
    narration: '"呢个 Project 个 Deadline 好赶，仲要 Run 一个 Model，真係好 Chur。"你的香港同学一句话里夹了五个英文单词。你在纸上疯狂记笔记——不是会议内容，是新学的港式英语词汇。你发现自己的中文表达能力正在不可逆地退化。',
    choices: [
      {
        text: '🗣️ 主动融入，"我哋可以 Split 个 Task，各自 Own 一个 Part"',
        effects: { cantonese: 10, english: 10, san: 5 },
      },
      {
        text: '📖 坚守普通话阵地，"我觉得我们可以分工"',
        effects: { san: -5, gpa: 5 },
      },
      {
        text: '🤫 潜水不说话，在群里打字沟通',
        effects: { san: -10 },
      },
    ],
  },
  {
    id: 'hk_freerider_drama',
    series: '港式社交',
    title: '【Free-rider 的消失魔术】',
    narration: '"佢真係一个大 Free-rider，成个 Sem 都消失咗。"组员在群里怒吼。那个说"我负责写 Introduction"的同学，已经连续两周已读不回。Deadline 只剩三天，你打开他的文档——还是一片空白。群里炸了锅，有人@了导师。',
    choices: [
      {
        text: '😤 公开对质，在群里贴出 Contribution Log',
        effects: { gpa: 5, san: -10, cantonese: 5 },
      },
      {
        text: '💻 顶硬上！自己扛起来连夜写完',
        effects: { gpa: 15, energy: -20, san: -10 },
      },
      {
        text: '🤝 私下打电话催，给他最后一次机会',
        effects: { san: -5, cantonese: 10 },
      },
    ],
  },
  {
    id: 'hk_survival_slang',
    series: '港式生存',
    title: '【"食谷种"的日子】',
    narration: '月底了。你打开银行APP——余额数字小到需要放大才看得清。"我最近真係好穷，穷到要食谷种。"室友看着你拿出第三天连续吃的泡面，默默把自己的两餸饭分了一半给你。"无办法啦，死就死啦，顶硬上！"你含泪吃完了这碗带着友情的剩饭。',
    choices: [
      {
        text: '🍜 加底唔该！去找最便宜的两餸饭续命',
        effects: { hkd: 5, san: 5, energy: 5 },
      },
      {
        text: '💪 顶硬上！去便利店应聘夜班赚外快',
        effects: { hkd: 15, energy: -15, cantonese: 10 },
      },
      {
        text: '📱 打开外卖APP对比全红磡最低价套餐',
        effects: { hkd: 5, san: -5 },
      },
    ],
  },

  // ── 女性专属事件 (Female-specific events) ──
  {
    id: 'female_mtr_gaze',
    series: '安全边界',
    title: '【东铁线的"目光检测"】',
    narration: '深夜从学校回来，车厢里人很少。你发现一个行为怪异的人一直盯着你看。车窗玻璃的反光里，那个人的目光像一根刺。你的手不自觉地握紧了背包带。',
    gender: 'female',
    choices: [
      {
        text: '🚶‍♀️ 走到车厢连接处，寻找乘务员或同行者',
        effects: { san: -10, energy: -5 },
      },
      {
        text: '📱 拿起手机假装打电话，语气强硬',
        effects: { cantonese: 5, san: -5 },
      },
      {
        text: '😠 摘下耳机，用冰冷到极致的眼神回击',
        effects: { san: 5, energy: -5 },
      },
    ],
  },
  {
    id: 'female_xhs_traffic',
    series: '流量陷阱',
    title: '【小红书的"流量密码"】',
    narration: '你在坚尼地城海边随手拍了一张背影照，评论区一夜之间暴涨到几百条。点赞、收藏、转发，数据好看得不真实。但私信里也混进了一些让你不舒服的内容——有人要"约拍"，有人问"一个人来香港的吗"。',
    gender: 'female',
    choices: [
      {
        text: '💄 认真营业，经营"港硕女神"人设接商单',
        effects: { hkd: 15, san: -20 },
      },
      {
        text: '🔒 关掉评论区，我来香港是读书的',
        effects: { gpa: 10, san: 10 },
      },
      {
        text: '🧪 反向操作，发一张实验室灰头土脸的照片',
        effects: { gpa: 5, san: 5 },
      },
    ],
  },

  // ── 男性专属事件 (Male-specific events) ──
  {
    id: 'male_beer_bros',
    series: '兄弟社交',
    title: '【凌晨两点的"大蓝妹"局】',
    narration: '论文刚写完，同系的developer们拉你去红磡路边摊喝酒。"来嘛，聊聊创业的事！"——你看了眼时间，凌晨两点。明天早上九点还有课，但兄弟们已经把你名字写进了外卖接龙。',
    gender: 'male',
    choices: [
      {
        text: '🍺 义气应约，人脉就是资源，早课翘了',
        effects: { cantonese: 15, energy: -25, hkd: -10 },
      },
      {
        text: '🙅‍♂️ 理性拒绝："对不起，明早还要投简历"',
        effects: { english: 10, cantonese: -10 },
      },
      {
        text: '🤝 拉人下水："帮我解Bug，我就陪你喝到底"',
        effects: { gpa: 10, energy: -10 },
      },
    ],
  },
  {
    id: 'male_moving_labor',
    series: '体力透支',
    title: '【搬家公司的"编外人员"】',
    narration: '同班女生要从红磡搬到大埔，因为不舍得花钱请搬家公司，在群里发了条求助消息。两个28寸行李箱，五楼无电梯唐楼。你看到消息的时候，已经有三个男生在下面回复"我来"了。',
    gender: 'male',
    choices: [
      {
        text: '💪 苦力担当，一个人扛两个箱子上五楼',
        effects: { energy: -30, cantonese: 20 },
      },
      {
        text: '🧠 技术指导："我帮你用AI规划最省钱的搬家路线"',
        effects: { san: -10 },
      },
      {
        text: '💸 偷偷叫了个Lalamove，谎称是朋友帮忙',
        effects: { hkd: -15, san: 5 },
      },
    ],
  },

  // ── 港大专属系列 (HKU exclusive) ──
  {
    id: 'hku_vertical_marathon',
    series: '港大日常',
    title: '【垂直马拉松：庄月明电梯迷踪】',
    narration: '你要在5分钟内从大学站赶到本部大楼上课，但著名的"百周年校园"电梯排队人潮一眼望不到头。庄月明楼的电梯就像一道永远排不完的关卡……',
    universityId: 'hku',
    choices: [
      {
        text: '🏔️ 硬爬楼梯，发挥"登山者"精神',
        effects: { energy: -20, san: -5 },
      },
      {
        text: '🧘 佛系等待，在电梯里刷完半篇文献',
        effects: { gpa: -5, san: 5 },
      },
      {
        text: '🗺️ 从西营盘绕路找传说中的捷径',
        effects: { energy: -10, san: -10 },
      },
    ],
  },
  {
    id: 'hku_red_brick_outsider',
    series: '港大日常',
    title: '【红砖墙下的"局外人"】',
    narration: '课间你路过充满历史感的本部大楼走廊，周围全是穿着"HKU"帽衫、谈论着中环实习的本地精英。红砖墙上刻满了百年校训，你突然意识到自己是个"外来者"。',
    universityId: 'hku',
    choices: [
      {
        text: '🧥 去纪念品店买一件最贵的HKU Hoodie穿上',
        effects: { hkd: -15, cantonese: 10 },
      },
      {
        text: '📸 拍一张氛围感照片发小红书',
        effects: { san: -10 },
      },
      {
        text: '📚 低头赶路回图书馆，专注代码',
        effects: { gpa: 15 },
      },
    ],
  },
  {
    id: 'hku_central_networking',
    series: '港大日常',
    title: '【中环Networking的"入场券"】',
    narration: '因为港大的名号，一位在IFC（国际金融中心）工作的校友学长邀请你去喝咖啡，这可能是你拿内推码的最佳机会。但一杯中环咖啡60块……',
    universityId: 'hku',
    choices: [
      {
        text: '👔 斥巨资购买西装，通宵准备Elevator Pitch',
        effects: { hkd: -20, english: 15, energy: -15 },
      },
      {
        text: '🤙 穿卫衣去，坦诚聊聊Vibe Coding探索',
        effects: { english: 5, san: 5 },
      },
      {
        text: '💸 算了，这个月房租还没交',
        effects: { hkd: 5, english: -5 },
      },
    ],
  },
  {
    id: 'hku_kennedy_sunset',
    series: '港大日常',
    title: '【坚尼地城的日落幻觉】',
    narration: '论文写到崩溃，你走出校门下坡到了坚尼地城海旁，那是港大留子的心理避难所。远处大屿山的轮廓在夕阳中若隐若现，海风吹散了一天的焦虑……',
    universityId: 'hku',
    choices: [
      {
        text: '🌅 海边发呆，思考这一年到底值不值',
        effects: { san: 20, energy: -5 },
      },
      {
        text: '☕ 挤进游客堆拍%Arabica咖啡配海景',
        effects: { san: 5, hkd: -5 },
      },
      {
        text: '🚶 走到西环码头吹风，远离人群',
        effects: { san: 15, energy: -5 },
      },
    ],
  },

  // ═══ CUHK-Exclusive Events ═══════════════════════════════════
  {
    id: 'cuhk_shuttle_survival',
    series: '中大日常',
    title: '【校巴站的"生存法则"】',
    narration: '你在大学站下车，离新亚书院的课还有10分钟。校巴站排起了长龙，而这已经是你等到的第三辆车，依然挤不上去。山坡上的风呼啸而过，仿佛在嘲笑你。',
    universityId: 'cuhk',
    choices: [
      {
        text: '💪 强行挤门，拿出在内地挤地铁的劲头',
        effects: { energy: -10, san: -5 },
      },
      {
        text: '🥾 徒步登山，用双脚丈量中大',
        effects: { energy: -30 },
      },
      {
        text: '☕ 就地躺平，去康本买杯咖啡等下一班',
        effects: { gpa: -5, san: 10 },
      },
    ],
  },
  {
    id: 'cuhk_pavilion_romance',
    series: '中大日常',
    title: '【天人合一的"限时浪漫"】',
    narration: '你终于来到了著名的合一亭，想拍一张无敌海景图，却发现这里挤满了专门来打卡的游客。吐露港的海风很好，但取景框里全是人头。',
    universityId: 'cuhk',
    choices: [
      {
        text: '📸 专业修图，回家用AI P掉所有路人',
        effects: { san: -5 },
      },
      {
        text: '🌙 深夜独占，凌晨两点再来看马鞍山灯火',
        effects: { san: 20, energy: -15 },
      },
      {
        text: '😏 冷眼旁观："这水池还没我老家澡堂大"',
        effects: { san: 5 },
      },
    ],
  },
  {
    id: 'cuhk_rail_crisis',
    series: '中大日常',
    title: '【大埔火灾后的"断路危机"】',
    narration: '突发事件！大埔附近发生火灾，东铁线瘫痪。你被困在大学站，此时天色已晚，你还得回深圳罗湖。手机疯狂弹出消息，室友问你今晚还能回去吗。',
    universityId: 'cuhk',
    choices: [
      {
        text: '🚕 打车去落马洲，哪怕的士起步价翻倍',
        effects: { hkd: -30, energy: -40 },
      },
      {
        text: '🛏️ 找书院同学挤一晚，哪怕只能睡地板',
        effects: { san: -10 },
      },
      {
        text: '🗺️ 极限求生，小巴转公交绕过封锁线',
        effects: { energy: -20, san: -5 },
      },
    ],
  },
  {
    id: 'cuhk_monkey_toll',
    series: '中大日常',
    title: '【猴子的"过路费"】',
    narration: '你提着在深圳买的"鲍师傅"走在回宿舍的小径上，几只野猕猴正蹲在围栏上，盯着你手里的袋子。它们的眼神像极了路边收保护费的社团大哥。',
    universityId: 'cuhk',
    choices: [
      {
        text: '🍞 上供，把袋子扔给猴子保命要紧',
        effects: { hkd: -5, san: 5 },
      },
      {
        text: '🏃 加速冲锋，抱紧袋子狂奔',
        effects: { energy: -15, san: -10 },
      },
      {
        text: '☂️ 狐假虎威，拿出长柄雨伞疯狂挥舞',
        effects: { san: 5, energy: -5 },
      },
    ],
  },

  // ═══ HKUST-Exclusive Events ══════════════════════════════════
  {
    id: 'hkust_11m_judgement',
    series: '科大日常',
    title: '【11M小巴的"末日审判"】',
    narration: '晚上11:30，你刚从图书馆出来，想去坑口吃个宵夜。11M小巴站前排起了长龙，而末班车的时间正在一秒秒逼近。清水湾的夜风格外清冷。',
    universityId: 'hkust',
    choices: [
      {
        text: '🏃 极限加塞，拿出"科大走位"挤进人群',
        effects: { cantonese: -15, energy: 10 },
      },
      {
        text: '🥾 徒步下山，沿清水湾道开启夜间远足',
        effects: { energy: -40, san: -5 },
      },
      {
        text: '🔬 返回实验室，走不了就回Lab通宵',
        effects: { gpa: 20, san: -15 },
      },
    ],
  },
  {
    id: 'hkust_red_bird',
    series: '科大日常',
    title: '【"红鸟"下的毕业倒计时】',
    narration: '你站在南闸的红鸟日晷下，阳光刺眼。那是每个科大人的精神图腾，但此时你只感到它像一个巨大的时钟，在催促你还没跑通的代码。',
    universityId: 'hkust',
    choices: [
      {
        text: '🙏 赛博祈祷，摸红鸟底座求Mid-term不挂',
        effects: { san: 5 },
      },
      {
        text: '🍗 拒绝打卡，径直走入LG1吃"夺命大鸡腿"',
        effects: { san: 10, energy: 5 },
      },
      {
        text: '💻 Vibe Coding，坐长椅上用科大极速WiFi调教AI',
        effects: { gpa: 10, english: 5 },
      },
    ],
  },
  {
    id: 'hkust_ocean_library',
    series: '科大日常',
    title: '【海景图书馆的"虚无时刻"】',
    narration: '你坐在科大那面著名的海景窗前，窗外是湛蓝的吐露港。你本来在看量化金融，但海浪的声音让你陷入了长久的走神。远处有渔船缓缓驶过。',
    universityId: 'hkust',
    choices: [
      {
        text: '📸 沉溺美景，精修100张发小红书',
        effects: { gpa: -10, san: 5 },
      },
      {
        text: '🪟 强行拉帘，我是来卷的不是来看海的',
        effects: { san: -20, gpa: 15 },
      },
      {
        text: '🧠 学术冥想，盯着海面思考神经网络模拟海浪',
        effects: { gpa: 5, san: -5 },
      },
    ],
  },
  {
    id: 'hkust_saikung_escape',
    series: '科大日常',
    title: '【西贡的"逃离计划"】',
    narration: '连轴转了三周，你感觉自己快要在山里发疯了。你决定周五晚上去西贡透透气。码头上灯火辉煌，海鲜的香气飘来，你已经很久没有闻到"人间烟火"了。',
    universityId: 'hkust',
    choices: [
      {
        text: '🦞 海鲜豪赌，在西贡码头来一顿大餐',
        effects: { hkd: -30, san: 50 },
      },
      {
        text: '🌙 夜间Hiking，翻越龙虾湾在山顶看星星',
        effects: { energy: -30, san: 30 },
      },
      {
        text: '🤝 跨校联谊，在西贡偶遇其他留子交换情报',
        effects: { cantonese: 10, english: 10 },
      },
    ],
  },

  // ═══ PolyU-Exclusive Events ══════════════════════════════════
  {
    id: 'polyu_bridge_mobius',
    series: '理工日常',
    title: '【红磡天桥的"莫比乌斯环"】',
    narration: '你从红磡站A出口出来，想去创新楼参加Vibe Coding讲座。面对错综复杂、像蜘蛛网一样的天桥系统，你第N次陷入了方向迷失。',
    universityId: 'polyu',
    choices: [
      {
        text: '🧱 直觉导航，哪儿红砖多往哪儿走',
        effects: { energy: -15, san: -5 },
      },
      {
        text: '🚶 随波逐流，跟着背图纸筒的学长走',
        effects: { cantonese: 5, energy: -10 },
      },
      {
        text: '🚇 穿越红磡转车站，从地下通道突围',
        effects: { san: -10, energy: -10 },
      },
    ],
  },
  {
    id: 'polyu_red_brick_maker',
    series: '理工日常',
    title: '【"红砖"里的实战派】',
    narration: '导师要求你做一个关于"AI与未来娱乐"的项目。PolyU极其看重实操和落地，你的方案必须能够直接Demo给工业界的评委看。',
    universityId: 'polyu',
    choices: [
      {
        text: '🔧 极致Demo，没日没夜焊电路板调代码',
        effects: { gpa: 20, energy: -30 },
      },
      {
        text: '📊 PPT战神，渲染图精美满口"赋能""生态"',
        effects: { cantonese: 15, english: 10 },
      },
      {
        text: '🤝 跨系组队，拉设计+CS的同学一起搞',
        effects: { cantonese: 30, hkd: -10 },
      },
    ],
  },
  {
    id: 'polyu_midnight_feast',
    series: '理工日常',
    title: '【红磡深夜的"幸福烦恼"】',
    narration: '晚上11点，你刚走出实验室。摆在你面前的是红磡美食圈的终极考验：黄埔日料、必嘉街串烧、还是宝其利街车仔面？',
    universityId: 'polyu',
    choices: [
      {
        text: '🍱 省钱之王，走向那家熟悉的两餸饭',
        effects: { hkd: 10, san: 10 },
      },
      {
        text: '🍢 报复性消费，叫舍友去吃串烧配大排档',
        effects: { hkd: -20, san: 40, energy: -10 },
      },
      {
        text: '🍜 自律惩罚，回宿舍泡面攒钱买开发套件',
        effects: { hkd: 15, san: -15 },
      },
    ],
  },
  {
    id: 'polyu_tunnel_lullaby',
    series: '理工日常',
    title: '【过海隧道的"催眠曲"】',
    narration: '你住在红磡的旧楼里，窗外就是红磡过海隧道入口。24小时不间断的引擎轰鸣声和急刹车声是你生活的BGM。你已经连续三天没有睡好了。',
    universityId: 'polyu',
    choices: [
      {
        text: '🎧 降噪生存，戴上索尼XM5强行入睡',
        effects: { hkd: -25, energy: 20 },
      },
      {
        text: '🎵 融入生活，把车流声录成氛围音乐项目',
        effects: { san: 10, english: 5 },
      },
      {
        text: '📦 深夜搬家念头，浏览西贡大埔的房租信息',
        effects: { san: -10, energy: -5 },
      },
    ],
  },

  // ═══ CityU-Exclusive Events ══════════════════════════════════
  {
    id: 'cityu_festival_walk',
    series: '城大日常',
    title: '【又一城的"迷失幻境"】',
    narration: '你从九龙塘站出来，要去教六上课。你必须穿过充满香水味和奢侈品柜台的"又一城"商场。看着橱窗里2万块的包和自己手里50块的提神咖啡，你产生了一种强烈的错觉。',
    universityId: 'cityu',
    choices: [
      {
        text: '🚶 消费主义抵抗，目不斜视直奔教学楼',
        effects: { san: -5 },
      },
      {
        text: '👜 奢侈品"洗礼"，试背名牌包拍照发小红书',
        effects: { hkd: -15, san: 5 },
      },
      {
        text: '🍔 美食广场博弈，和穿名牌的上班族抢座',
        effects: { hkd: -8, energy: 20 },
      },
    ],
  },
  {
    id: 'cityu_cmc_expedition',
    series: '城大日常',
    title: '【CMC的"孤岛远征"】',
    narration: '你的专业在邵逸夫创意媒体中心。那座像银白色战舰一样的建筑在半山上，离主校区有一段"致命"的距离。34度的太阳正烤着达之路。',
    universityId: 'cityu',
    choices: [
      {
        text: '☀️ 达之路苦行，顶着烈日一路向上爬',
        effects: { energy: -30, san: -5 },
      },
      {
        text: '🚌 穿梭巴士博弈，等那班永远挤不上的Shuttle',
        effects: { san: -10, energy: -5 },
      },
      {
        text: '💻 赛博逃课，在宿舍云参与算了',
        effects: { gpa: -5, san: 20 },
      },
    ],
  },
  {
    id: 'cityu_nam_shan_kitchen',
    series: '城大日常',
    title: '【南山邨的"深夜食堂"】',
    narration: '凌晨一点，CMC的项目终于做完了。你饥肠辘辘地走下山，面对的是充满人间烟火气的南山邨。老旧公屋的绿墙在路灯下泛着温暖的光。',
    universityId: 'cityu',
    choices: [
      {
        text: '🍌 南山三宝，吃香蕉糕在绿墙前思考人生',
        effects: { hkd: -5, san: 30 },
      },
      {
        text: '🍺 大排档对酒，和阿伯一起看深夜赛马直播',
        effects: { cantonese: 20, energy: -15 },
      },
      {
        text: '🌃 孤独回城，看一眼已关灯的又一城感受空寂',
        effects: { san: -10 },
      },
    ],
  },
  {
    id: 'cityu_elevator_war',
    series: '城大日常',
    title: '【垂直校园的"电梯大战"】',
    narration: '城大是向上长的。你在杨建文楼为了抢到一部能上到黄区的电梯，面临着汹涌的学生潮。电梯门开了——里面已经站满了人。',
    universityId: 'cityu',
    choices: [
      {
        text: '⚡ 电梯刺客，凭多年抢地铁经验闪现进入',
        effects: { energy: -5, san: 5 },
      },
      {
        text: '🧗 走防火楼梯，垂直攀爬到黄区',
        effects: { energy: -25, san: -5 },
      },
      {
        text: '😅 社交避让，看到导师果断退缩等下一部',
        effects: { san: 5, energy: -5 },
      },
    ],
  },

  // ═══ Crisis Events (auto-triggered when stats drop below threshold) ══
  {
    id: 'crisis_money',
    series: '🚨 数值危机',
    title: '【深水埗的秘密雇佣】',
    narration: '账户余额已经不够付下周的房租了。你在Telegram频道看到一条消息——去深水埗旧楼搬运"不明电子元件"，日薪现金结算。还有一个选项是去西环货柜码头帮工。你的手在屏幕上悬了很久。',
    choices: [
      {
        text: '📦 接下黑工，体力换钱，风险自担',
        effects: { hkd: 20, energy: -25, san: -15 },
      },
      {
        text: '📞 向家里伸手，撒谎说消费太高',
        effects: { hkd: 25, san: -30 },
      },
      {
        text: '🎧 变卖降噪耳机和二手相机，断舍离',
        effects: { hkd: 15, san: -10 },
      },
    ],
  },
  {
    id: 'crisis_energy',
    series: '🚨 数值危机',
    title: '【红外线的红色警告】',
    narration: '你在罗湖口岸过关时突然眼前一黑，体温39.5℃。红外测温仪疯狂报警，工作人员的面孔在视线里变成了重影。你被扶到一边坐下，身体在发出最后通牒。',
    choices: [
      {
        text: '🏥 去伊利沙伯医院急诊，排队8小时',
        effects: { energy: 15, hkd: -10, gpa: -5 },
      },
      {
        text: '🚗 咬牙打车回深圳三甲医院',
        effects: { energy: 20, hkd: -15, san: -5 },
      },
      {
        text: '💊 学校医务室拿两粒Panadol硬扛',
        effects: { energy: 10, san: -20 },
      },
    ],
  },
  {
    id: 'crisis_san',
    series: '🚨 数值危机',
    title: '【中环天桥的幻觉】',
    narration: '你站在通往IFC的天桥上，看着桥下川流不息的红色小巴和行色匆匆的中环白领。突然，所有声音都消失了。你觉得自己像一个透明的旁观者，和这座城市之间隔着一层看不见的玻璃。手机在响，但你不想接。',
    choices: [
      {
        text: '📞 拨打学校心理辅导热线',
        effects: { san: 15, gpa: -5 },
      },
      {
        text: '🚶 漫无目的地走，从中环走到西环再走到坚尼地城',
        effects: { san: 5, energy: -15 },
      },
      {
        text: '💬 给最好的朋友发一条很长的微信',
        effects: { san: 10, cantonese: 5 },
      },
    ],
  },

  // ═══ 🎰 赛博锦鲤：港城奇迹 (Miracle Reversal Events) ═══════════
  {
    id: 'miracle_horse_oracle',
    series: '🎰 港城奇迹',
    title: '【马场的神谕】',
    narration: '你已经穷到连叮叮车都坐不起了。绝望之际，同学拉你去沙田马场"开光"。你随手圈了一匹赔率1:42的冷门马，名字叫"深圳速递"。最后一个弯道，"深圳速递"从第八位杀到第一——全场沸腾，你的八达通像被施了魔法一样回血。',
    choices: [
      {
        text: '💰 全部存起来，这是救命钱不是零花钱',
        effects: { hkd: 50, san: 20 },
      },
      {
        text: '🎉 请全组吃一顿好的，顺便买个新耳机',
        effects: { hkd: 30, san: 30, cantonese: 10 },
      },
      {
        text: '🎲 趁手气好追加投注……赌场没有常胜将军',
        effects: { hkd: -10, san: -15 },
      },
    ],
  },
  {
    id: 'miracle_mark_six',
    series: '🎰 港城奇迹',
    title: '【六合彩奇迹】',
    narration: '你在便利店买水的时候，鬼使神差买了一注六合彩。号码是你的学号后六位。开奖那天，你正在图书馆写论文——手机弹出通知：中了二等奖。你以为是垃圾短信，确认了三遍才相信。',
    choices: [
      {
        text: '🏦 冷静理财，这笔钱够付剩下所有房租了',
        effects: { hkd: 45, san: 25, energy: 10 },
      },
      {
        text: '✈️ 给爸妈买两张机票来香港旅游',
        effects: { hkd: 20, san: 40 },
      },
    ],
  },
  {
    id: 'miracle_ssp_granny',
    series: '🎰 港城奇迹',
    title: '【深水埗大娘的秘密简历】',
    narration: '你在深水埗吃最便宜的叉烧饭时，旁边坐了一个穿着朴素的阿婆。她主动跟你聊天，问你学什么的。你苦笑说在找工作。她递给你一张名片——上面写着某上市公司CTO的名字，"我细路仔嘅公司，你发个CV过嚟啦。"',
    choices: [
      {
        text: '📧 当晚就发了简历，附上最好的项目Portfolio',
        effects: { hkd: 30, gpa: 15, english: 15 },
      },
      {
        text: '🙏 先帮阿婆收档口，第二天再正式联系',
        effects: { hkd: 25, cantonese: 20, san: 15 },
      },
    ],
  },
  {
    id: 'miracle_advisor_bonus',
    series: '🎰 港城奇迹',
    title: '【导师的深夜红包】',
    narration: '凌晨两点，你收到导师的邮件："你最近的论文写得不错，我有一笔额外的RA经费，想请你帮忙做个小项目。"附件里是一份金额让你瞪大眼睛的合同。你揉了揉眼睛确认自己没在做梦。',
    choices: [
      {
        text: '🔬 全力投入项目，这是学术+经济双丰收',
        effects: { hkd: 35, gpa: 20, energy: -10 },
      },
      {
        text: '🤝 接下项目但合理安排时间，别把自己累垮',
        effects: { hkd: 25, gpa: 10, san: 10 },
      },
    ],
  },
  {
    id: 'miracle_xhs_explosion',
    series: '🎰 港城奇迹',
    title: '【小红书的"核爆级"流量】',
    narration: '你随手录了一段在港铁上用AI写代码的视频，配文"港硕的真实日常"。一觉醒来——50万播放，3万赞，私信里全是品牌合作邀请。最离谱的是，一家科技公司的HR说"我们就需要这种能整活的人才"。',
    choices: [
      {
        text: '💼 抓住机会面试，用流量证明自己的影响力',
        effects: { hkd: 30, english: 15, gpa: 10 },
      },
      {
        text: '📱 趁热打铁签MCN，自媒体才是未来',
        effects: { hkd: 40, san: -10 },
      },
      {
        text: '🎓 低调处理，把这段经历写进简历的"特长"',
        effects: { hkd: 15, gpa: 15, san: 10 },
      },
    ],
  },
  {
    id: 'miracle_extreme_creation',
    series: '🎰 港城奇迹',
    title: '【Extreme Creation夺冠】',
    narration: '你硬着头皮参加了学校的创业比赛。你的AI项目在Demo Day上惊艳全场——评委是某知名VC的合伙人，他当场递来名片："这个项目，我们愿意投种子轮。"台下的同学们目瞪口呆，你的双手在发抖。',
    choices: [
      {
        text: '🚀 全力推进，这可能是改变人生的机会',
        effects: { hkd: 40, gpa: 20, english: 10, energy: -15 },
      },
      {
        text: '🤔 冷静评估，先毕业再谈创业',
        effects: { hkd: 20, gpa: 15, san: 15 },
      },
    ],
  },
];

/** Probability (0-1) of a random event triggering after each chapter. */
export const EVENT_TRIGGER_CHANCE = 0.4;

/** Stats below this threshold trigger crisis events automatically. */
export const CRISIS_THRESHOLD = 20;

/** Map stat key → crisis event id for auto-triggering. */
export const CRISIS_EVENT_MAP: Partial<Record<keyof PlayerStats, string>> = {
  hkd: 'crisis_money',
  energy: 'crisis_energy',
  san: 'crisis_san',
};

// ── Miracle Event System (赛博锦鲤：港城奇迹) ──────────────────────
/** Any core stat below this value makes miracle events eligible. */
export const MIRACLE_STAT_THRESHOLD = 30;

/** Probability (0-1) of a miracle event when eligible. */
export const MIRACLE_TRIGGER_CHANCE = 0.15;

/** Stats checked for miracle eligibility. */
export const MIRACLE_TRIGGER_STATS: (keyof PlayerStats)[] = ['hkd', 'san', 'energy'];

/** All miracle event ids — used for filtering. */
export const MIRACLE_EVENT_IDS = [
  'miracle_horse_oracle',
  'miracle_mark_six',
  'miracle_ssp_granny',
  'miracle_advisor_bonus',
  'miracle_xhs_explosion',
  'miracle_extreme_creation',
] as const;

// ── Final Endings (结局图鉴) ────────────────────────────────────
export interface FinalEnding {
  id: string;
  category: string;
  title: string;
  description: string;
  color: number;
  condition: (stats: PlayerStats) => boolean;
}

export const FINAL_ENDINGS: FinalEnding[] = [
  // Checked in order — first match wins
  // ── Crisis endings (highest priority) ──
  {
    id: 'rooftop_wind',
    category: '极端意外',
    title: '天台的晚风',
    description: '精神值归零。你最后一次站在天台，维港的灯火在脚下闪烁。朋友圈停留在一张没有配文的照片。',
    color: PALETTE.TAG_SPECIAL,
    condition: (s) => s.san <= 5,
  },
  {
    id: 'street_wanderer',
    category: '极端意外',
    title: '红磡街头的流浪者',
    description: '因欠租被房东换了锁。你拖着行李箱坐在红磡街头的长椅上，看着24小时便利店的灯光，不知道今晚该去哪里。',
    color: PALETTE.TAG_SPECIAL,
    condition: (s) => s.hkd <= 5,
  },
  {
    id: 'sick_leave',
    category: '极端意外',
    title: '休学通知书',
    description: '身体亮了红灯。学校发来了休学建议通知，你的港硕之旅被迫按下暂停键。签证、房租、学费——一切都悬而未决。',
    color: PALETTE.TAG_SPECIAL,
    condition: (s) => s.energy <= 5,
  },
  {
    id: 'sleepwalker',
    category: '极端意外',
    title: '弥敦道的梦游者',
    description: '你在弥敦道走了一整夜，从旺角走到尖沙咀再走到天星码头。天亮时被巡警叫醒，你已经不记得自己是怎么到这里的。',
    color: PALETTE.TAG_SPECIAL,
    condition: (s) => s.san <= 10,
  },
  {
    id: 'broken_dream',
    category: '极端意外',
    title: '被中断的梦',
    description: '因为无法承受压力而中途退赛，香港成为了不敢回忆的伤痕。',
    color: PALETTE.TAG_SPECIAL,
    condition: (s) => s.san <= 10 || s.gpa <= 10,
  },
  // ── Miracle endings (hidden, require extreme luck + stats) ──
  {
    id: 'miracle_early_retire',
    category: '港城奇迹',
    title: '提前退休的港硕',
    description: '靠着一次不可思议的横财和精明的理财，你在毕业前就实现了"财务自由"。同学还在投简历，你已经在西贡租了间海景房准备写回忆录。',
    color: PALETTE.NEON_YELLOW,
    condition: (s) => s.hkd >= 85 && s.san >= 60,
  },
  {
    id: 'miracle_rising_star',
    category: '港城奇迹',
    title: '行业新星',
    description: '从创业比赛冠军到种子轮融资，你的AI项目登上了南华早报。VC们排队约你喝咖啡，你成为了港硕群体中最耀眼的逆袭故事。',
    color: PALETTE.NEON_MAGENTA,
    condition: (s) => s.gpa >= 80 && s.hkd >= 60 && s.english >= 55,
  },
  {
    id: 'ifc_peak',
    category: '留港精英',
    title: '中环之巅',
    description: '在IFC的落地窗前俯瞰维港，你成为了"新香港人"。一切的付出都值了。',
    color: PALETTE.NEON_CYAN,
    condition: (s) => s.english >= 65 && s.gpa >= 70 && s.hkd >= 50,
  },
  {
    id: 'cyberport_maker',
    category: '留港精英',
    title: '数码港创客',
    description: '带着AI项目入驻数码港园区，你找到了留港的另一条赛道。',
    color: PALETTE.TAG_GPA,
    condition: (s) => s.gpa >= 65 && s.english >= 50 && s.san >= 50,
  },
  {
    id: 'sai_wan_hero',
    category: '极简生存',
    title: '西环英雄',
    description: '为了那一纸IANG签证，在西环分拣猪肉或送外卖。苦是苦，但你留下来了，等待翻身。',
    color: PALETTE.TAG_ENERGY,
    condition: (s) => s.hkd <= 30 && s.san >= 30,
  },
  {
    id: 'dual_city_partner',
    category: '大湾区人',
    title: '双城合伙人',
    description: '融入大湾区生活圈，在深港之间找到了最舒服的平衡点。两边通吃，自成一派。',
    color: PALETTE.TAG_CANTONESE,
    condition: (s) => s.cantonese >= 35 && s.hkd >= 45,
  },
  {
    id: 'hometown_dreamer',
    category: '回归故里',
    title: '老家的梦游者',
    description: '回到北方或东部城市，在稳定的办公桌前，时常想起红磡的潮湿空气和叮叮车的铃声。',
    color: PALETTE.TEXT_DIM,
    condition: (s) => s.gpa <= 50 && s.cantonese <= 20 && s.english <= 50,
  },
  {
    id: 'expensive_tourist',
    category: '梦幻离场',
    title: '昂贵的过客',
    description: '香港对你来说只是一场为期一年的、昂贵的、带滤镜的长途旅行。朋友圈的照片比毕业证有用。',
    color: PALETTE.NEON_MAGENTA,
    condition: (s) => s.san >= 60 && s.gpa <= 55,
  },
  // Default fallback
  {
    id: 'survivor_ending',
    category: '港硕幸存者',
    title: '港硕幸存者',
    description: '不算完美，不算失败。你活下来了，带着一年的记忆和一纸学位，走向下一段人生。',
    color: PALETTE.NEON_CYAN,
    condition: () => true,
  },
];

// ── Settlement Enhancement: Ending Type Classification ──────────
export type EndingType = 'stay_hk' | 'leave_hk' | 'dropout';

/** Maps each ending id to its broader category for verdict / stamp. */
export const ENDING_TYPE_MAP: Record<string, EndingType> = {
  // Stay in HK
  ifc_peak: 'stay_hk',
  cyberport_maker: 'stay_hk',
  sai_wan_hero: 'stay_hk',
  dual_city_partner: 'stay_hk',
  miracle_early_retire: 'stay_hk',
  miracle_rising_star: 'stay_hk',
  // Leave HK
  hometown_dreamer: 'leave_hk',
  expensive_tourist: 'leave_hk',
  survivor_ending: 'leave_hk',
  // Dropout / Bankruptcy
  rooftop_wind: 'dropout',
  street_wanderer: 'dropout',
  sick_leave: 'dropout',
  sleepwalker: 'dropout',
  broken_dream: 'dropout',
} as const;

// ── Soul Verdicts ─────────────────────────────────────────────────
export const SOUL_VERDICTS: Record<EndingType, string> = {
  stay_hk: '你终于留在了这座离你最近也最远的城市，祝你不再是幽灵。',
  leave_hk: '你带走了学位，留下了一年份的尾气与海风，维港再无你的回声。',
  dropout: '这场倍速播放的幻觉提前终止，香港不相信眼泪，只记得你的代码。',
} as const;

// ── Status Stamp ──────────────────────────────────────────────────
export interface StatusStampDef {
  text: string;
  color: number;
}

export const STATUS_STAMPS: Record<EndingType, StatusStampDef> = {
  stay_hk: { text: 'IANG ISSUED', color: 0xff3344 },
  leave_hk: { text: 'EXITED', color: 0x556677 },
  dropout: { text: 'TERMINATED', color: 0x556677 },
} as const;

// ── Personality Analysis (赛博人格侧写) ──────────────────────────
export interface PersonalityDimension {
  statKey: keyof PlayerStats;
  label: string;
  icon: string;
}

export const PERSONALITY_DIMENSIONS: PersonalityDimension[] = [
  { statKey: 'hkd', label: '生存本能', icon: '◈' },
  { statKey: 'san', label: '精神韧性', icon: '◈' },
  { statKey: 'energy', label: '行动力', icon: '◈' },
  { statKey: 'gpa', label: '学术潜力', icon: '◈' },
  { statKey: 'cantonese', label: '文化融入', icon: '◈' },
  { statKey: 'english', label: '国际视野', icon: '◈' },
] as const;

/** Returns a short text descriptor based on stat value range. */
export function getPersonalityDescriptor(statKey: keyof PlayerStats, value: number): string {
  const descriptors: Record<keyof PlayerStats, [string, string, string, string]> = {
    hkd: ['赤贫边缘', '精打细算', '小康水平', '理财达人'],
    san: ['濒临崩溃', '勉强维持', '心态稳定', '精神钢铁'],
    energy: ['油尽灯枯', '疲态尽显', '精力充沛', '永动机'],
    gpa: ['摆烂选手', '及格万岁', '绩优潜力', '学术新星'],
    cantonese: ['语言绝缘', '入门水平', '日常流利', '本地化完成'],
    english: ['哑巴英语', '基础沟通', '学术自如', '双语精英'],
  };
  const d = descriptors[statKey];
  if (value <= 25) return d[0];
  if (value <= 50) return d[1];
  if (value <= 75) return d[2];
  return d[3];
}

/** Simulated percentile for "你超过了全港 X% 的留子" display. */
export function getStatPercentile(value: number): number {
  // Percentile curve: low values map to low percentile, high to high
  // Using a smooth sigmoid-like mapping
  if (value <= 10) return 5 + Math.floor(Math.random() * 10);
  if (value <= 25) return 15 + Math.floor(Math.random() * 15);
  if (value <= 40) return 30 + Math.floor(Math.random() * 15);
  if (value <= 55) return 45 + Math.floor(Math.random() * 15);
  if (value <= 70) return 60 + Math.floor(Math.random() * 15);
  if (value <= 85) return 78 + Math.floor(Math.random() * 12);
  return 90 + Math.floor(Math.random() * 9);
}

// ── Personality Summary Tags (人格总结标签) ───────────────────────
export interface PersonalityTagDef {
  label: string;
  color: number;
  condition: (stats: PlayerStats) => boolean;
}

export const PERSONALITY_TAGS: PersonalityTagDef[] = [
  { label: '六边形战士', color: PALETTE.NEON_CYAN, condition: (s) => s.hkd >= 45 && s.san >= 45 && s.energy >= 45 && s.gpa >= 45 && s.cantonese >= 25 && s.english >= 40 },
  { label: '理性主义者', color: PALETTE.TAG_GPA, condition: (s) => s.gpa >= 60 && s.english >= 50 },
  { label: '学术苦行僧', color: PALETTE.TAG_GPA, condition: (s) => s.gpa >= 70 && s.energy <= 30 },
  { label: '街头生存家', color: PALETTE.TAG_HKD, condition: (s) => s.hkd >= 60 && s.san <= 40 },
  { label: '精算求生者', color: PALETTE.TAG_HKD, condition: (s) => s.hkd >= 50 && s.gpa <= 40 },
  { label: '文化变色龙', color: PALETTE.TAG_CANTONESE, condition: (s) => s.cantonese >= 40 && s.english >= 40 },
  { label: '本土融入者', color: PALETTE.TAG_CANTONESE, condition: (s) => s.cantonese >= 50 },
  { label: '钢铁意志', color: PALETTE.TAG_SAN, condition: (s) => s.san >= 70 && s.energy >= 50 },
  { label: '情绪废墟行者', color: PALETTE.TAG_SPECIAL, condition: (s) => s.san <= 25 },
  { label: '永动机体质', color: PALETTE.TAG_ENERGY, condition: (s) => s.energy >= 70 },
  { label: '燃尽综合征', color: PALETTE.TAG_SPECIAL, condition: (s) => s.energy <= 20 && s.gpa >= 50 },
  { label: '深港钟摆人', color: PALETTE.TAG_ENERGY, condition: (s) => s.energy <= 40 && s.hkd >= 50 },
  { label: '赛博漂流者', color: PALETTE.TEXT_DIM, condition: () => true },
];

/** Maximum personality tags to display. */
export const MAX_PERSONALITY_TAGS = 3;

// ── Settlement Layout Constants ───────────────────────────────────
export const SETTLE = {
  // Soul Verdict section
  VERDICT_H: 72,
  VERDICT_FONT_SIZE: 20,
  VERDICT_BORDER_W: 3,

  // Personality Analysis section
  PERSONALITY_HEADER_H: 28,
  PERSONALITY_BAR_H: 26,
  PERSONALITY_BAR_GAP: 6,
  PERSONALITY_LABEL_W: 110,
  PERSONALITY_VALUE_W: 50,
  PERSONALITY_DESC_W: 100,
  PERSONALITY_PCT_W: 260,
  PERSONALITY_TAG_H: 34,
  PERSONALITY_TAG_GAP: 12,
  PERSONALITY_TAG_PAD_X: 16,

  // Status Stamp
  STAMP_W: 200,
  STAMP_H: 48,
  STAMP_FONT_SIZE: 20,
  STAMP_BORDER_W: 3,
  STAMP_OFFSET_X: 60,
  STAMP_OFFSET_Y: 36,

  // Barcode
  BARCODE_H: 40,
  BARCODE_BAR_COUNT: 50,
  BARCODE_MIN_W: 2,
  BARCODE_MAX_W: 5,
  BARCODE_GAP: 2,
  BARCODE_LABEL_W: 300,
} as const;

// ── Barcode Type Labels ───────────────────────────────────────────
export interface BarcodeTypeDef {
  code: string;
  label: string;
}

export const BARCODE_TYPES: Record<EndingType, BarcodeTypeDef> = {
  stay_hk: { code: 'CYBER PENDULUM', label: '赛博钟摆' },
  leave_hk: { code: 'PHANTOM ECHO', label: '幻影回声' },
  dropout: { code: 'BROKEN SIGNAL', label: '断裂信号' },
} as const;

// ── Warm Memo (温情备忘录) ────────────────────────────────────────
export type MemoType = 'pressure' | 'lonely' | 'career' | 'setback';

export interface WarmMemoDef {
  type: MemoType;
  emoji: string;
  subtitle: string;
  body: string;
  condition: (stats: PlayerStats, endingType: EndingType) => boolean;
}

export const WARM_MEMOS: WarmMemoDef[] = [
  {
    type: 'setback',
    emoji: '🕯️',
    subtitle: '允许所有的发生',
    condition: (_s, et) => et === 'dropout',
    body: '如果这个结局不如你所愿，请不要气馁。香港这一课，教给你的不仅是知识，更是关于"失去"与"重建"的必修课。\n\n游戏可以重来，人生也可以重启。那一纸学历证明不了你的全部，那些深夜里的崩溃也并非毫无意义。它们是肥料，会让你在未来的某个时刻，开出比别人更坚韧的花。去看看维港的海吧，它接纳所有的垃圾，也倒映所有的星光。\n\n允许自己失败，允许自己脆弱，然后，像香港这座城市一样，在废墟与霓虹中，再一次倔强地生长。',
  },
  {
    type: 'pressure',
    emoji: '🕊️',
    subtitle: '放过自己，回归当下',
    condition: (s) => s.san <= 35 || (s.energy <= 30 && s.san <= 50),
    body: '同学，辛苦了。过去这一年，你是不是总在追逐远处的高山，却忘了低头看一眼脚边的草木？GPA、实习、IANG，这些是通往未来的入场券，但不应成为囚禁灵魂的枷锁。\n\n如果你此时正感到压抑，不妨去中山纪念公园的那片大草坪坐坐。看看那些在游乐设施上嬉笑的小朋友，他们并不在乎维港的房价，只在乎眼前的滑梯。去吹吹没有目的的海风，你会发现：人生不是为了活出一段完美的逻辑代码，而是为了体验这一场名为"生活"的随机事件。\n\n所谓拥有，不过是那一刻你感受到的风，和你心里的平静。',
  },
  {
    type: 'lonely',
    emoji: '🌊',
    subtitle: '你不是幽灵，你是见证者',
    condition: (s) => s.cantonese <= 20 && s.san <= 50,
    body: '这一年，你是否觉得自己像个在香港上空盘旋的幽灵，离繁华很近，却从未落地？请记得，"过客"本身就是一种极其珍贵的身份。\n\n正因为你不属于这里，你才能看清维港海面上轮船驶过的弧线，看清深水埗巷弄里的人间烟火。孤独不是失败，而是一种清醒。\n\n离别时不需要盛大的告别，因为你走过的每一寸红砖、路过的每一部校巴，都已成为了你生命纹路的一部分。你带不走这座城市，但这座城市的坚韧与浪漫，已经悄悄长进了你的骨子里。',
  },
  {
    type: 'career',
    emoji: '🏗️',
    subtitle: '重新定义成功',
    condition: (s) => s.hkd >= 50 || (s.gpa >= 55 && s.english >= 45),
    body: '你拼尽全力想要挤进那座名为"中环"的玻璃幻镜，这没有错。但请在赶路的时候偶尔停一下，去看看西环码头落日时的波光。\n\n生活最讽刺的地方在于，我们总是在追求"更好的生活"时，弄丢了"生活"本身。香港很快，快到让你以为慢一点就是犯罪。但其实，真正的成功，是你在经历了这一年的兵荒马乱后，依然拥有去海滨长廊散步的心境，依然拥有对路边一朵野花的惊叹。\n\n别让野心吞噬了你的感知力，你值得拥有除工作之外的、更广阔的人间。',
  },
  {
    // Default fallback — gentle encouragement for anyone
    type: 'lonely',
    emoji: '🌊',
    subtitle: '你不是幽灵，你是见证者',
    condition: () => true,
    body: '这一年，你是否觉得自己像个在香港上空盘旋的幽灵，离繁华很近，却从未落地？请记得，"过客"本身就是一种极其珍贵的身份。\n\n正因为你不属于这里，你才能看清维港海面上轮船驶过的弧线，看清深水埗巷弄里的人间烟火。孤独不是失败，而是一种清醒。\n\n离别时不需要盛大的告别，因为你走过的每一寸红砖、路过的每一部校巴，都已成为了你生命纹路的一部分。你带不走这座城市，但这座城市的坚韧与浪漫，已经悄悄长进了你的骨子里。',
  },
];

/** Match the best warm memo for a player's final state. */
export function matchWarmMemo(stats: PlayerStats, endingType: EndingType): WarmMemoDef {
  for (const memo of WARM_MEMOS) {
    if (memo.condition(stats, endingType)) return memo;
  }
  return WARM_MEMOS[WARM_MEMOS.length - 1];
}

// ── Glitch Effect (Cyber Interference) ───────────────────────────
/** Stats that trigger glitch when below CRISIS_THRESHOLD (20%). */
export const GLITCH_TRIGGER_STATS: (keyof PlayerStats)[] = ['hkd', 'san', 'energy'];

/** Full-screen desaturation / sickly green overlay. */
export const GLITCH_OVERLAY_COLOR = 0x0aff33;
export const GLITCH_OVERLAY_ALPHA = 0.08;
export const GLITCH_DESAT_COLOR = 0x1a2a1a;
export const GLITCH_DESAT_ALPHA = 0.25;

/** Horizontal tear bars. */
export const GLITCH_STRIP_COUNT = 8;
export const GLITCH_STRIP_COLOR = 0x00ff44;
export const GLITCH_STRIP_ALPHA = 0.18;
export const GLITCH_STRIP_H = 2;
export const GLITCH_STRIP_JITTER = 6;

/** RGB split simulation. */
export const GLITCH_RGB_R_COLOR = 0xff0033;
export const GLITCH_RGB_C_COLOR = 0x00ffcc;
export const GLITCH_RGB_ALPHA = 0.04;
export const GLITCH_RGB_OFFSET = 4;

/** Pulsation cycle (seconds). */
export const GLITCH_PULSE_SPEED = 1.5;

/** Audio IDs. */
export const GLITCH_AUDIO_HEARTBEAT = 'glitch-heartbeat';
export const GLITCH_AUDIO_WHISPER = 'glitch-whisper';

// ── Events ────────────────────────────────────────────────────────
export const EVENTS = {
  SCENE_MENU: 'scene:menu',
  SCENE_GAME: 'scene:game',
  SCENE_SETTLEMENT: 'scene:settlement',
  CHOICE_SELECTED: 'choice:selected',
  CONTINUE_STORY: 'story:continue',
  START_GAME: 'game:start',
  RESTART_GAME: 'game:restart',
} as const;

// ── Stat Labels ───────────────────────────────────────────────────
export const STAT_LABELS: Record<keyof PlayerStats, string> = {
  hkd: 'HKD 资金',
  san: 'SAN 精神',
  energy: '体力',
  gpa: 'GPA/CV',
  cantonese: '粤语',
  english: '英语',
} as const;

export const STAT_COLORS: Record<keyof PlayerStats, number> = {
  hkd: PALETTE.TAG_HKD,
  san: PALETTE.TAG_SAN,
  energy: PALETTE.TAG_ENERGY,
  gpa: PALETTE.TAG_GPA,
  cantonese: PALETTE.TAG_CANTONESE,
  english: PALETTE.TAG_ENGLISH,
} as const;

// ── System Toast Prompts (粤语调侃提示) ──────────────────────────
/** Threshold below which a stat triggers a system toast. */
export const TOAST_STAT_THRESHOLD = 25;

/** Mapping of core stat → Cantonese roasting messages (randomly picked). */
export const SYSTEM_TOAST_MESSAGES: Partial<Record<keyof PlayerStats, string[]>> = {
  energy: [
    '你个人已经残晒啦，仲唔去休息？想猝死系 Lab 啊？',
    '行路都打晒蛇形，你真系铁做嘅？仲唔训觉？',
    '体力条红到发黑，你系人定系机器啊？',
  ],
  hkd: [
    '荷包干硬化，你连西北风都无得食，仲去买 Coffee？',
    '八达通余额告急！再咁落去你要瞓街啦！',
    '穷到连两餸饭都食唔起，快啲谂办法搵钱啦！',
  ],
  san: [
    '你个人已经谢咗，睇下海啦，唔好再钻牛角尖。',
    '精神状态拉闸，你需要嘅唔系论文，系一个拥抱。',
    'San 值见底，再咁落去你要变弥敦道梦游者啦！',
  ],
};
