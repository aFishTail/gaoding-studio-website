import type {
  LearningItem,
  LessonDetail,
  LessonDraft,
  PracticeRecap,
  PracticeScenario,
  SavedSentence,
  SentenceFeedback,
  SentenceTask,
  StatsData,
  UserProfile,
} from "../types";

export const SAMPLE_IMPORT_TITLE = "Business Small Talk and Communication Skills";

export const SAMPLE_IMPORT_TEXT = `Unit 3: Business Small Talk and Communication Skills

How would you define small talk? In international business, a few minutes of polite small talk before a meeting helps people build rapport and establish trust. Safe topics include the morning commute, local hospitality, or the venue itself.

However, what is acceptable in one cultural context may feel intrusive in another. Avoid overly personal questions, and pay attention to body language and hand gestures. When someone brings up a sensitive subject, experienced speakers know how to deal with unsuitable conversation topics and make a smooth transition back to the agenda: "I haven't seen you around here before — which team are you with?"`;

export const INITIAL_USER: UserProfile = {
  id: "user-demo",
  nickname: "林知夏",
  avatarUrl: "",
  englishLevel: "upper_intermediate",
  dailyGoalMinutes: 15,
  autoPlayAudio: false,
  polishStyle: "natural",
  createdAt: "2026-10-24T09:00:00.000Z",
  updatedAt: "2026-10-31T09:00:00.000Z",
  levelConfigured: true,
  lastCheckinDate: "",
  reminder: {
    enabled: false,
    hour: 20,
    minute: 0,
    credits: 2,
    lastSentDate: "",
  },
};

export const SMALLTALK_WORDS: LearningItem[] = [
  {
    id: "w-smalltalk",
    ownerUserId: "user-demo",
    lessonId: "lesson-smalltalk",
    lessonName: "Business Small Talk and Communication Skills",
    type: "word",
    content: {
      word: "small talk",
      phonetic: "/smɔːl tɔːk/",
      pos: "n.",
      meaning: "闲聊；寒暄",
      collocations: ["make small talk", "polite small talk", "start with small talk"],
      originalSentence: "How would you define small talk?",
      simpleSentence: "We made a little small talk before the meeting started.",
    },
    favorite: true,
    reviewStep: 1,
    mastery: "learning",
    dueAt: "2026-10-31",
    reviewCount: 2,
    correctCount: 2,
    wrongCount: 0,
    outputEvidenceCount: 1,
    createdAt: "2026-10-25T10:00:00.000Z",
    updatedAt: "2026-10-30T10:00:00.000Z",
    version: 1,
    status: "active",
  },
  {
    id: "w-context",
    ownerUserId: "user-demo",
    lessonId: "lesson-smalltalk",
    lessonName: "Business Small Talk and Communication Skills",
    type: "word",
    content: {
      word: "context",
      phonetic: "/ˈkɒntekst/",
      pos: "n.",
      meaning: "语境；背景；上下文",
      collocations: ["cultural context", "in this context", "business context"],
      originalSentence: "What is acceptable in one cultural context may feel intrusive in another.",
      simpleSentence: "Body language depends on the cultural context.",
    },
    favorite: false,
    reviewStep: 1,
    mastery: "learning",
    dueAt: "2026-10-31",
    reviewCount: 1,
    correctCount: 1,
    wrongCount: 0,
    outputEvidenceCount: 1,
    createdAt: "2026-10-25T10:00:00.000Z",
    updatedAt: "2026-10-30T10:00:00.000Z",
    version: 1,
    status: "active",
  },
  {
    id: "w-acceptable",
    ownerUserId: "user-demo",
    lessonId: "lesson-smalltalk",
    lessonName: "Business Small Talk and Communication Skills",
    type: "word",
    content: {
      word: "acceptable",
      phonetic: "/əkˈseptəbl/",
      pos: "adj.",
      meaning: "可接受的；合乎礼仪的",
      collocations: ["socially acceptable", "acceptable topic", "mutually acceptable"],
      originalSentence: "Make sure your topic is acceptable to everyone at the table.",
      simpleSentence: "Casual dress is acceptable on Fridays.",
    },
    favorite: false,
    reviewStep: 2,
    mastery: "familiar",
    dueAt: "2026-10-31",
    reviewCount: 2,
    correctCount: 2,
    wrongCount: 0,
    outputEvidenceCount: 0,
    createdAt: "2026-10-25T10:00:00.000Z",
    updatedAt: "2026-10-30T10:00:00.000Z",
    version: 1,
    status: "active",
  },
  {
    id: "w-rapport",
    ownerUserId: "user-demo",
    lessonId: "lesson-smalltalk",
    lessonName: "Business Small Talk and Communication Skills",
    type: "word",
    content: {
      word: "rapport",
      phonetic: "/ræˈpɔː(r)/",
      pos: "n.",
      meaning: "融洽关系；互信",
      collocations: ["build rapport", "establish rapport with clients"],
      originalSentence: "A few minutes of polite small talk helps people build rapport.",
      simpleSentence: "She quickly built rapport with the visiting team.",
    },
    favorite: true,
    reviewStep: 2,
    mastery: "familiar",
    dueAt: "2026-11-02",
    reviewCount: 2,
    correctCount: 2,
    wrongCount: 0,
    outputEvidenceCount: 1,
    createdAt: "2026-10-25T10:00:00.000Z",
    updatedAt: "2026-10-30T10:00:00.000Z",
    version: 1,
    status: "active",
  },
  {
    id: "w-commute",
    ownerUserId: "user-demo",
    lessonId: "lesson-smalltalk",
    lessonName: "Business Small Talk and Communication Skills",
    type: "word",
    content: {
      word: "commute",
      phonetic: "/kəˈmjuːt/",
      pos: "n. / v.",
      meaning: "通勤；上下班路程",
      collocations: ["morning commute", "daily commute", "commute by subway"],
      originalSentence: "Safe topics include the morning commute or local hospitality.",
      simpleSentence: "My morning commute takes about thirty minutes.",
    },
    favorite: false,
    reviewStep: 3,
    mastery: "mastered",
    dueAt: "2026-11-05",
    reviewCount: 3,
    correctCount: 3,
    wrongCount: 0,
    outputEvidenceCount: 1,
    createdAt: "2026-10-25T10:00:00.000Z",
    updatedAt: "2026-10-30T10:00:00.000Z",
    version: 1,
    status: "active",
  },
  {
    id: "w-gesture",
    ownerUserId: "user-demo",
    lessonId: "lesson-smalltalk",
    lessonName: "Business Small Talk and Communication Skills",
    type: "word",
    content: {
      word: "gesture",
      phonetic: "/ˈdʒestʃə(r)/",
      pos: "n.",
      meaning: "手势；姿态；表示",
      collocations: ["hand gesture", "friendly gesture", "avoid rude gestures"],
      originalSentence: "Pay attention to body language and hand gestures.",
      simpleSentence: "He made a welcoming gesture toward the guests.",
    },
    favorite: false,
    reviewStep: 2,
    mastery: "familiar",
    dueAt: "2026-11-03",
    reviewCount: 2,
    correctCount: 1,
    wrongCount: 1,
    outputEvidenceCount: 0,
    createdAt: "2026-10-25T10:00:00.000Z",
    updatedAt: "2026-10-30T10:00:00.000Z",
    version: 1,
    status: "active",
  },
  {
    id: "w-hospitality",
    ownerUserId: "user-demo",
    lessonId: "lesson-smalltalk",
    lessonName: "Business Small Talk and Communication Skills",
    type: "word",
    content: {
      word: "hospitality",
      phonetic: "/ˌhɒspɪˈtæləti/",
      pos: "n.",
      meaning: "热情款待；好客",
      collocations: ["warm hospitality", "thank you for your hospitality"],
      originalSentence: "Safe topics include the morning commute, local hospitality, or the venue itself.",
      simpleSentence: "We really appreciate your hospitality during our visit.",
    },
    favorite: false,
    reviewStep: 3,
    mastery: "mastered",
    dueAt: "2026-11-06",
    reviewCount: 3,
    correctCount: 3,
    wrongCount: 0,
    outputEvidenceCount: 1,
    createdAt: "2026-10-25T10:00:00.000Z",
    updatedAt: "2026-10-30T10:00:00.000Z",
    version: 1,
    status: "active",
  },
  {
    id: "w-transition",
    ownerUserId: "user-demo",
    lessonId: "lesson-smalltalk",
    lessonName: "Business Small Talk and Communication Skills",
    type: "word",
    content: {
      word: "transition",
      phonetic: "/trænˈzɪʃn/",
      pos: "n. / v.",
      meaning: "过渡；自然切入正题",
      collocations: ["smooth transition", "transition to the agenda"],
      originalSentence: "Make a smooth transition back to the agenda.",
      simpleSentence: "Let's transition to the main topic of today's call.",
    },
    favorite: false,
    reviewStep: 2,
    mastery: "familiar",
    dueAt: "2026-11-04",
    reviewCount: 2,
    correctCount: 2,
    wrongCount: 0,
    outputEvidenceCount: 0,
    createdAt: "2026-10-25T10:00:00.000Z",
    updatedAt: "2026-10-30T10:00:00.000Z",
    version: 1,
    status: "active",
  },
];

export const SMALLTALK_EXPRESSIONS: LearningItem[] = [
  {
    id: "e-unsuitable",
    ownerUserId: "user-demo",
    lessonId: "lesson-smalltalk",
    lessonName: "Business Small Talk and Communication Skills",
    type: "expression",
    content: {
      expression: "deal with unsuitable conversation topics",
      meaning: "应对不合适的谈话话题",
      usage: "用于委婉地把话题从敏感或尴尬的方向移开",
      scenario: "跨文化会议中，对方提到不合适的私人问题",
      originalSentence:
        "When he brought up politics, she quickly dealt with unsuitable conversation topics.",
      structure: "deal with + 名词短语",
    },
    favorite: true,
    reviewStep: 1,
    mastery: "learning",
    dueAt: "2026-10-31",
    reviewCount: 1,
    correctCount: 1,
    wrongCount: 0,
    outputEvidenceCount: 1,
    createdAt: "2026-10-25T10:00:00.000Z",
    updatedAt: "2026-10-30T10:00:00.000Z",
    version: 1,
    status: "active",
  },
  {
    id: "e-haventseen",
    ownerUserId: "user-demo",
    lessonId: "lesson-smalltalk",
    lessonName: "Business Small Talk and Communication Skills",
    type: "expression",
    content: {
      expression: "I haven't seen you around here before",
      meaning: "以前在这边没见过你（自然搭话开场）",
      usage: "在交流会、茶歇或总部接待中自然开启第一句寒暄",
      scenario: "商务交流活动或跨部门会议初见",
      originalSentence:
        "I haven't seen you around here before — which team are you with?",
      structure: "I haven't seen you + 地点 + before",
    },
    favorite: false,
    reviewStep: 2,
    mastery: "familiar",
    dueAt: "2026-11-02",
    reviewCount: 2,
    correctCount: 2,
    wrongCount: 0,
    outputEvidenceCount: 1,
    createdAt: "2026-10-25T10:00:00.000Z",
    updatedAt: "2026-10-30T10:00:00.000Z",
    version: 1,
    status: "active",
  },
];

export const SMALLTALK_GRAMMARS: LearningItem[] = [
  {
    id: "g-define",
    ownerUserId: "user-demo",
    lessonId: "lesson-smalltalk",
    lessonName: "Business Small Talk and Communication Skills",
    type: "grammar",
    content: {
      name: "How would you define...? 礼貌征询看法",
      structure: "How would you define + 名词 / 概念?",
      rule: "用情态动词 would 软化提问语气，比直接问 What is... 更自然得体，适合商务破冰与跨文化交流讨论。",
      originalSentence: "How would you define small talk?",
      example: "How would you define a successful partnership for this quarter?",
    },
    favorite: false,
    reviewStep: 1,
    mastery: "learning",
    dueAt: "2026-10-31",
    reviewCount: 1,
    correctCount: 1,
    wrongCount: 0,
    outputEvidenceCount: 0,
    createdAt: "2026-10-25T10:00:00.000Z",
    updatedAt: "2026-10-30T10:00:00.000Z",
    version: 1,
    status: "active",
  },
];

export const SMALLTALK_SENTENCES: SentenceTask[] = [
  {
    id: "st-1",
    lessonId: "lesson-smalltalk",
    type: "guided",
    instruction: "在商务茶歇时，对方聊起不合适的私人话题，请用目标表达写一句得体转移话题的话。",
    hintExpression: "deal with unsuitable conversation topics",
    hintItemId: "e-unsuitable",
    keywords: ["small talk", "acceptable"],
    reference:
      "Polite small talk helps us deal with unsuitable conversation topics and keep the chat acceptable.",
    createdAt: "2026-10-25T10:00:00.000Z",
  },
  {
    id: "st-2",
    lessonId: "lesson-smalltalk",
    type: "chinese",
    instruction: "请用英文表达：谢谢你们今天的热情款待，我早上过来的通勤路程非常顺利。",
    hintExpression: "hospitality / commute",
    keywords: ["hospitality", "commute"],
    reference:
      "Thank you for your warm hospitality today; my commute here this morning was very smooth.",
    createdAt: "2026-10-25T10:00:00.000Z",
  },
  {
    id: "st-3",
    lessonId: "lesson-smalltalk",
    type: "scenario",
    instruction: "你在行业交流会上第一次见到另一家公司的代表，请主动打招呼并自然询问对方来自哪个城市。",
    hintExpression: "I haven't seen you around here before",
    keywords: ["based in", "rapport"],
    reference:
      "Hi there, I haven't seen you around here before — which city is your team based in?",
    createdAt: "2026-10-25T10:00:00.000Z",
  },
];

export const SMALLTALK_SCENARIOS: PracticeScenario[] = [
  {
    id: "sc-networking",
    ownerUserId: "user-demo",
    lessonId: "lesson-smalltalk",
    lessonName: "Business Small Talk and Communication Skills",
    name: "Business Networking Meet",
    description: "在两人的商务交流活动中练习闲聊与自我介绍。",
    userRole: "参会者（学生 / 新员工）",
    aiRole: "另一公司的代表",
    goal: "用 small talk 建立关系，并避免文化上不可接受的身体语言。",
    suggestedWordIds: ["w-context", "w-acceptable", "w-smalltalk"],
    suggestedExpressionIds: ["e-haventseen", "e-unsuitable"],
    status: "active",
    createdAt: "2026-10-25T10:00:00.000Z",
  },
  {
    id: "sc-hq",
    ownerUserId: "user-demo",
    lessonId: "lesson-smalltalk",
    lessonName: "Business Small Talk and Communication Skills",
    name: "并购后总部接待",
    description: "集团并购后，在总部茶歇区接待第一次来访的新同事。",
    userRole: "总部员工（Group A），负责欢迎来访人员",
    aiRole: "被收购公司来访员工（Group B）",
    goal: "礼貌问候来访同事，询问通勤与入住体验，建立融洽关系。",
    suggestedWordIds: ["w-hospitality", "w-commute", "w-rapport"],
    suggestedExpressionIds: ["e-haventseen"],
    status: "active",
    createdAt: "2026-10-25T10:00:00.000Z",
  },
  {
    id: "sc-culture",
    ownerUserId: "user-demo",
    lessonId: "lesson-smalltalk",
    lessonName: "Business Small Talk and Communication Skills",
    name: "跨文化话题处理",
    description: "外方代表在餐叙时无意聊起私人收入或敏感话题，你需要得体接话并自然转入中性话题。",
    userRole: "区域项目经理",
    aiRole: "带不当话题或肢体语言的另一方来访人员",
    goal: "识别不合适内容，不让对方难堪地礼貌转移话题。",
    suggestedWordIds: ["w-context", "w-acceptable", "w-gesture", "w-transition"],
    suggestedExpressionIds: ["e-unsuitable"],
    status: "active",
    createdAt: "2026-10-25T10:00:00.000Z",
  },
];

export const TRAVEL_WORDS: LearningItem[] = [
  {
    id: "w-reservation",
    ownerUserId: "user-demo",
    lessonId: "lesson-travel",
    lessonName: "Business Travel & Hotel Check-in",
    type: "word",
    content: {
      word: "reservation",
      phonetic: "/ˌrezəˈveɪʃn/",
      pos: "n.",
      meaning: "预订；预约保留",
      collocations: ["hold a reservation", "under the name of", "confirm a reservation"],
      originalSentence: "I have a reservation under the name of Lin.",
      simpleSentence: "Could you hold my reservation until midnight?",
    },
    favorite: false,
    reviewStep: 2,
    mastery: "familiar",
    dueAt: "2026-11-03",
    reviewCount: 2,
    correctCount: 2,
    wrongCount: 0,
    outputEvidenceCount: 1,
    createdAt: "2026-10-27T10:00:00.000Z",
    updatedAt: "2026-10-30T10:00:00.000Z",
    version: 1,
    status: "active",
  },
  {
    id: "w-boarding",
    ownerUserId: "user-demo",
    lessonId: "lesson-travel",
    lessonName: "Business Travel & Hotel Check-in",
    type: "word",
    content: {
      word: "itinerary",
      phonetic: "/aɪˈtɪnərəri/",
      pos: "n.",
      meaning: "行程单；旅行日程",
      collocations: ["updated itinerary", "flight itinerary"],
      originalSentence: "Please find our updated flight itinerary attached.",
      simpleSentence: "I'll send you the itinerary before we leave.",
    },
    favorite: false,
    reviewStep: 1,
    mastery: "learning",
    dueAt: "2026-11-01",
    reviewCount: 1,
    correctCount: 1,
    wrongCount: 0,
    outputEvidenceCount: 0,
    createdAt: "2026-10-27T10:00:00.000Z",
    updatedAt: "2026-10-30T10:00:00.000Z",
    version: 1,
    status: "active",
  },
];

export const TRAVEL_EXPRESSIONS: LearningItem[] = [
  {
    id: "e-dueto",
    ownerUserId: "user-demo",
    lessonId: "lesson-travel",
    lessonName: "Business Travel & Hotel Check-in",
    type: "expression",
    content: {
      expression: "keep the room for a late check-in",
      meaning: "为深夜抵达保留房间",
      usage: "航班延误或晚到酒店时联系前台保留预订",
      scenario: "差旅途中联系酒店前台",
      originalSentence: "My flight was delayed due to weather — could you keep the room for a late check-in?",
      structure: "keep the room for + 名词",
    },
    favorite: false,
    reviewStep: 2,
    mastery: "familiar",
    dueAt: "2026-11-04",
    reviewCount: 2,
    correctCount: 2,
    wrongCount: 0,
    outputEvidenceCount: 0,
    createdAt: "2026-10-27T10:00:00.000Z",
    updatedAt: "2026-10-30T10:00:00.000Z",
    version: 1,
    status: "active",
  },
];

export const TRAVEL_SCENARIOS: PracticeScenario[] = [
  {
    id: "sc-hotel",
    ownerUserId: "user-demo",
    lessonId: "lesson-travel",
    lessonName: "Business Travel & Hotel Check-in",
    name: "航班延误联系酒店晚到入住",
    description: "因天气原因航班延误两小时，致电酒店前台说明情况并请对方保留房间。",
    userRole: "出差住客",
    aiRole: "酒店前台接待人员",
    goal: "说明航班延误原因，确认预订姓名并请酒店保留房间至深夜。",
    suggestedWordIds: ["w-reservation", "w-boarding"],
    suggestedExpressionIds: ["e-dueto"],
    status: "active",
    createdAt: "2026-10-27T10:00:00.000Z",
  },
];

export const INITIAL_LESSONS: LessonDetail[] = [
  {
    id: "lesson-smalltalk",
    ownerUserId: "user-demo",
    name: "Business Small Talk and Communication Skills",
    theme: "商务交流与跨文化寒暄",
    summary:
      "该资料为英语课程片段，涵盖课程目标（口语、听力）、闲聊定义与价值、身体语言在不同文化中的重要性，以及多段听力与阅读练习，聚焦商务场景下的交流策略。",
    materialId: "mat-smalltalk",
    materialType: "text",
    materialTitle: "Business Small Talk and Communication Skills",
    wordCount: 8,
    expressionCount: 2,
    grammarCount: 1,
    sentenceCount: 3,
    scenarioCount: 3,
    wordsLearned: 8,
    expressionsLearned: 2,
    grammarsLearned: 1,
    sentencesDone: 2,
    practicesDone: 1,
    lastStudiedAt: "2026-10-30T20:15:00.000Z",
    progress: 100,
    createdAt: "2026-10-25T10:00:00.000Z",
    updatedAt: "2026-10-30T20:15:00.000Z",
    version: 1,
    status: "active",
    shareImports: 3,
    words: SMALLTALK_WORDS,
    expressions: SMALLTALK_EXPRESSIONS,
    grammars: SMALLTALK_GRAMMARS,
    sentenceTasks: SMALLTALK_SENTENCES,
    scenarios: SMALLTALK_SCENARIOS,
  },
  {
    id: "lesson-travel",
    ownerUserId: "user-demo",
    name: "Business Travel & Hotel Check-in",
    theme: "差旅入住与行程变更",
    summary:
      "整理自差旅预订邮件与酒店前台常见沟通记录，涵盖航班延误说明、深夜保留房间与行程单核对。",
    materialId: "mat-travel",
    materialType: "pdf",
    materialTitle: "Business Travel Handbook.pdf",
    wordCount: 2,
    expressionCount: 1,
    grammarCount: 0,
    sentenceCount: 1,
    scenarioCount: 1,
    wordsLearned: 1,
    expressionsLearned: 1,
    grammarsLearned: 0,
    sentencesDone: 0,
    practicesDone: 0,
    lastStudiedAt: "2026-10-28T21:00:00.000Z",
    progress: 65,
    createdAt: "2026-10-27T10:00:00.000Z",
    updatedAt: "2026-10-28T21:00:00.000Z",
    version: 1,
    status: "active",
    words: TRAVEL_WORDS,
    expressions: TRAVEL_EXPRESSIONS,
    grammars: [],
    sentenceTasks: [SMALLTALK_SENTENCES[1]],
    scenarios: TRAVEL_SCENARIOS,
  },
];

export const INITIAL_DRAFT: LessonDraft = {
  draftId: "draft-demo",
  materialId: "mat-smalltalk",
  title: "Business Small Talk and Communication Skills",
  theme: "商务交流与跨文化寒暄",
  summary:
    "聚焦跨文化商务场合的寒暄破冰、合适话题边界、身体语言礼仪以及如何自然过渡到会议正题。",
  words: SMALLTALK_WORDS.map((w, idx) => {
    const c = w.content as {
      word: string;
      phonetic: string;
      pos: string;
      meaning: string;
      collocations: string[];
      originalSentence: string;
      simpleSentence: string;
    };
    return {
      id: `dw-${idx + 1}`,
      word: c.word,
      phonetic: c.phonetic,
      pos: c.pos,
      meaning: c.meaning,
      collocations: c.collocations,
      originalSentence: c.originalSentence,
      simpleSentence: c.simpleSentence,
      sourceRef: "正文第 1–2 段",
      needsSourceReview: false,
      selected: true,
    };
  }),
  expressions: SMALLTALK_EXPRESSIONS.map((e, idx) => {
    const c = e.content as {
      expression: string;
      meaning: string;
      usage: string;
      scenario: string;
      originalSentence: string;
      structure?: string;
    };
    return {
      id: `de-${idx + 1}`,
      expression: c.expression,
      meaning: c.meaning,
      usage: c.usage,
      scenario: c.scenario,
      originalSentence: c.originalSentence,
      structure: c.structure,
      sourceRef: "正文第 2 段",
      selected: true,
    };
  }),
  grammars: [
    {
      id: "dg-1",
      name: "How would you define...? 礼貌征询看法",
      structure: "How would you define + 名词 / 概念?",
      rule: "用情态动词 would 软化提问语气，适合商务破冰讨论。",
      originalSentence: "How would you define small talk?",
      example: "How would you define a successful partnership?",
      selected: true,
    },
    {
      id: "dg-2",
      name: "What is + adj. + in one... may feel... 对比陈述",
      structure: "What is [adj.] in one [noun] may feel [adj.] in another.",
      rule: "用主语从句温和指出文化或团队差异，避免绝对化评判。",
      originalSentence:
        "What is acceptable in one cultural context may feel intrusive in another.",
      example: "What is casual in one office may feel too direct in another.",
      selected: true,
    },
  ],
  scenarios: SMALLTALK_SCENARIOS.map((s, idx) => ({
    id: `ds-${idx + 1}`,
    name: s.name,
    description: s.description,
    userRole: s.userRole,
    aiRole: s.aiRole,
    goal: s.goal,
    suggestedWords: ["small talk", "context", "acceptable"],
    suggestedExpressions: ["deal with unsuitable conversation topics"],
    selected: true,
  })),
  sentenceTasks: SMALLTALK_SENTENCES.map((t) => ({
    ...t,
    selected: true,
  })),
  sourceNotes: [
    "已从资料提取 8 个核心单词、2 条经典表达、2 项语法点与 3 个对练场景，原文例句均已核对。",
  ],
  sourceQuality: [
    {
      assetIndex: 1,
      label: "正文第 1–2 段",
      confidence: 98,
      needsReview: false,
    },
  ],
  createdAt: "2026-10-31T09:00:00.000Z",
};

export const INITIAL_SAVED_SENTENCES: SavedSentence[] = [
  {
    id: "ss-1",
    ownerUserId: "user-demo",
    source: "practice",
    lessonId: "lesson-smalltalk",
    lessonName: "Business Small Talk and Communication Skills",
    original: "I haven't seen you here, I am based in Nanjing.",
    improved: "I haven't seen you around here before — our team is based in Nanjing.",
    createdAt: "2026-10-30T20:10:00.000Z",
    favorite: true,
  },
  {
    id: "ss-2",
    ownerUserId: "user-demo",
    source: "attempt",
    lessonId: "lesson-smalltalk",
    lessonName: "Business Small Talk and Communication Skills",
    original: "Small talk help us deal with unsuitable conversation topics.",
    improved:
      "A little polite small talk helps us deal with unsuitable conversation topics gracefully.",
    createdAt: "2026-10-29T21:00:00.000Z",
    favorite: true,
  },
];

export const INITIAL_STATS: StatsData = {
  today: {
    minutes: 8,
    learnedCount: 5,
    newWords: 3,
  },
  week: {
    minutes: 64,
    newWords: 18,
    newExpressions: 6,
    practiceMinutes: 19,
    streakDays: 5,
  },
  total: {
    lessons: 2,
    words: 10,
    expressions: 3,
    grammar: 1,
    masteredCount: 4,
    practiceSessions: 3,
    savedSentences: 2,
  },
  daily: [
    { date: "2026-10-25", minutes: 12 },
    { date: "2026-10-26", minutes: 8 },
    { date: "2026-10-27", minutes: 15 },
    { date: "2026-10-28", minutes: 0 },
    { date: "2026-10-29", minutes: 11 },
    { date: "2026-10-30", minutes: 10 },
    { date: "2026-10-31", minutes: 8 },
  ],
};

export const PRESET_SENTENCE_FEEDBACKS: Record<string, SentenceFeedback> = {
  "st-1": {
    corrected:
      "Polite small talk helps us deal with unsuitable conversation topics and keep the chat acceptable.",
    mistakes: [
      {
        original: "Small talk help us deal with unsuitable conversation topics",
        suggested: "Polite small talk helps us deal with unsuitable conversation topics",
        reason: "small talk 为不可数名词作主语，一般现在时谓语动词应用第三人称单数 helps。",
      },
    ],
    styles: {
      natural:
        "Polite small talk helps us deal with unsuitable conversation topics and keep the chat comfortable.",
      colloquial:
        "A bit of light small talk makes it easy to steer away from awkward topics and keep things friendly.",
      formal:
        "Thoughtful small talk enables us to address unsuitable conversation topics tactfully while maintaining an acceptable tone.",
    },
    usedItems: [
      { itemId: "w-smalltalk", evidence: "small talk" },
      { itemId: "e-unsuitable", evidence: "deal with unsuitable conversation topics" },
    ],
    comment: "准确用上了目标表达 deal with unsuitable conversation topics，语境贴合商务茶歇。",
    score: 88,
  },
  "st-2": {
    corrected:
      "Thank you for your warm hospitality today; my commute here this morning was very smooth.",
    mistakes: [],
    styles: {
      natural:
        "Thank you for your warm hospitality today — my commute here this morning was very smooth.",
      colloquial:
        "Thanks so much for having us today! The commute over this morning was a breeze.",
      formal:
        "We sincerely appreciate your generous hospitality today; the morning commute to your headquarters was remarkably smooth.",
    },
    usedItems: [
      { itemId: "w-hospitality", evidence: "hospitality" },
      { itemId: "w-commute", evidence: "commute" },
    ],
    comment: "自然串联了 hospitality 与 commute 两个核心词，句式得体。",
    score: 94,
  },
  "st-3": {
    corrected:
      "Hi there, I haven't seen you around here before — which city is your team based in?",
    mistakes: [
      {
        original: "Where are you boss and which city you based in?",
        suggested: "Which city is your team based in?",
        reason: "初见寒暄宜询问对方所在团队或城市（be based in），疑问句需保留助动词 is。",
      },
    ],
    styles: {
      natural:
        "Hi there, I haven't seen you around here before — which city is your team based in?",
      colloquial:
        "Hey! I don't think I've seen you around here before — where's your team based?",
      formal:
        "Hello, I don't believe we've met at previous sessions — which office is your team based in?",
    },
    usedItems: [{ itemId: "e-haventseen", evidence: "I haven't seen you around here before" }],
    comment: "开场白自然亲切，很好地开启了破冰对话。",
    score: 90,
  },
};

export interface ScriptedTurn {
  aiGreeting: string;
  userSamples: string[];
  aiReplies: string[];
  hints: [string, string, string];
  suggestions: Array<{ expression: string; explanation: string }>;
  defaultRecap: Omit<PracticeRecap, "sessionId">;
}

export const PRACTICE_SCRIPTS: Record<string, ScriptedTurn> = {
  "sc-networking": {
    aiGreeting:
      "Hi there! Great turnout at today's networking session, isn't it? I'm Alex from the Regional Strategy team.",
    userSamples: [
      "Hi Alex! I haven't seen you around here before. How was your morning commute to the venue?",
      "It's my first time here too. In our cultural context, a little small talk is a great way to build rapport.",
      "By the way, how would you define small talk in your office? Knowing what's acceptable really helps.",
    ],
    aiReplies: [
      "Nice to meet you! My commute was surprisingly smooth today — only twenty minutes by metro. Is this your first time joining this industry mixer?",
      "I completely agree! Starting with light small talk makes everyone feel comfortable before diving into project discussions. What kind of projects is your team focusing on?",
      "That's a thoughtful question! For us, keeping topics light and respecting personal boundaries is always acceptable. It was a pleasure chatting — let's exchange cards before the keynote starts!",
    ],
    hints: [
      "先礼貌回应 Alex，用 I haven't seen you around here before 打招呼，再顺带问一句对方的通勤（commute）情况。",
      "关键词：I haven't seen you around here before / morning commute / build rapport",
      "试试说：Hi Alex! I haven't seen you around here before — how was your morning commute to the venue?",
    ],
    suggestions: [
      {
        expression: "I haven't seen you around here before — how was your commute over?",
        explanation: "用资料里的经典表达自然破冰，紧接着询问通勤路况，是最稳妥的商务寒暄开场。",
      },
      {
        expression: "In a cross-cultural context, light small talk really helps build rapport.",
        explanation: "把 context、small talk 和 build rapport 串成一句完整观点，显得真诚又地道。",
      },
      {
        expression: "How would you define small talk in your workplace culture?",
        explanation: "使用 How would you define...? 句式征询对方看法，礼貌且容易延续对话。",
      },
    ],
    defaultRecap: {
      durationSeconds: 185,
      turnCount: 3,
      usage: {
        usedWordIds: ["w-smalltalk", "w-context", "w-acceptable", "w-commute", "w-rapport"],
        usedExpressionIds: ["e-haventseen"],
      },
      issues: [
        {
          original: "It very like the weather today and we can make small talk.",
          suggested: "I really like the weather today — it makes for easy small talk.",
          reason: "very 不能直接修饰动词 like，表达“非常喜欢”应用 really like。",
        },
        {
          original: "I'm based in.Nanjing? Where are you team based?",
          suggested: "I'm based in Nanjing. Where is your team based?",
          reason: "注意句号后留空格；修饰名词 team 应用形容词性物主代词 your，搭配单数动词 is。",
        },
      ],
      goodSentences: [
        {
          sentence:
            "I haven't seen you around here before — how was your morning commute to the venue?",
          comment: "自然用上目标表达开场，并结合通勤话题拉近距离，非常符合商务交流会语境。",
        },
        {
          sentence:
            "In our cultural context, a little small talk is a great way to build rapport.",
          comment: "一句之内串联了 context、small talk 与 build rapport，表达流畅得体。",
        },
      ],
      summary:
        "本次对练顺利完成了破冰寒暄、询问通勤与探讨跨文化交流习惯的目标，成功在真实语境中主动使用了多个核心词句。",
      suggestion:
        "下次对练可以尝试加入 deal with unsuitable conversation topics，练习当对方聊到敏感话题时如何委婉转换到会议议程（transition to the agenda）。",
    },
  },
};
