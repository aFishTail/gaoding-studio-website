// ============================================================
// 拿来练英语 领域类型 —— 客户端 / 云函数 / 本地仓库共享契约
// ============================================================

export type Id = string
export type ISODate = string
export type DateTime = string

// ---------- 基础枚举（字面量联合） ----------
export type EnglishLevel = 'beginner' | 'intermediate' | 'upper_intermediate' | 'advanced'
export type EnglishLevelKey = 'beginner' | 'intermediate' | 'upper_intermediate' | 'advanced'

export interface EnglishLevelMeta {
  key: EnglishLevelKey
  label: string
  enLabel: string
}

export const ENGLISH_LEVELS: EnglishLevelMeta[] = [
  { key: 'beginner', label: '初级', enLabel: 'Beginner' },
  { key: 'intermediate', label: '中级', enLabel: 'Intermediate' },
  { key: 'upper_intermediate', label: '中高级', enLabel: 'Upper Intermediate' },
  { key: 'advanced', label: '高级', enLabel: 'Advanced' },
]

export type MaterialType = 'image' | 'pdf' | 'text' | 'shared'
export type ParseStatus = 'uploaded' | 'analyzing' | 'validating' | 'ready' | 'failed' | 'partial'
export type ParseChannel = 'text-model' | 'ocr' | 'mineru'

export type ItemType = 'word' | 'expression' | 'grammar'
export type Mastery = 'new' | 'learning' | 'familiar' | 'mastered'
export type RecallResult = 'unfamiliar' | 'impression' | 'mastered'
export type ReviewMode = 'en2zh' | 'zh2en' | 'spelling' | 'collocation'

export type SentenceType = 'guided' | 'chinese' | 'scenario'
export type PolishStyle = 'natural' | 'colloquial' | 'formal'
export type SentenceSource = 'attempt' | 'practice' | 'ai_expression'

export type PracticeMode = 'guided' | 'free'
export type PracticeStatus = 'active' | 'completing' | 'completed' | 'abandoned'

export interface MasteryMeta {
  key: Mastery
  label: string
  enLabel?: string
}

export const MASTERY_META: Record<Mastery, MasteryMeta> = {
  new: { key: 'new', label: '新内容' },
  learning: { key: 'learning', label: '学习中' },
  familiar: { key: 'familiar', label: '基本掌握' },
  mastered: { key: 'mastered', label: '熟练' },
}

export const RECALL_META: Record<RecallResult, { label: string; short: string }> = {
  unfamiliar: { label: '不熟', short: '不熟' },
  impression: { label: '有印象', short: '有印象' },
  mastered: { label: '掌握', short: '掌握' },
}

export const POLISH_STYLES: { key: PolishStyle; label: string; hint: string }[] = [
  { key: 'natural', label: '简单自然', hint: '清晰、自然的日常表达' },
  { key: 'colloquial', label: '地道口语', hint: '更接近母语者的口语说法' },
  { key: 'formal', label: '商务正式', hint: '正式、得体的书面或商务表达' },
]

// ---------- 用户 ----------
export interface UserProfile {
  id: Id
  nickname: string
  avatarUrl: string
  englishLevel: EnglishLevel
  dailyGoalMinutes: 5 | 10 | 15 | 20
  autoPlayAudio: boolean
  polishStyle: PolishStyle
  createdAt: DateTime
  updatedAt: DateTime
  levelConfigured: boolean
  /** 最近一次打卡的日期（YYYY-MM-DD） */
  lastCheckinDate?: ISODate
  /** 学习提醒；未设置时为空，按默认值展示 */
  reminder?: Partial<ReminderSettings>
}

export interface ReminderSettings {
  enabled: boolean
  /** 北京时间小时，0–23 */
  hour: number
  /** 北京时间分钟，0/15/30/45（旧数据没有该字段时按 0） */
  minute: number
  /** 剩余可发送次数（一次性订阅消息） */
  credits: number
  lastSentDate: ISODate | ''
}

export const DEFAULT_DAILY_GOALS: Array<5 | 10 | 15 | 20> = [5, 10, 15, 20]

// ---------- 资料与解析 ----------
export interface Material {
  id: Id
  type: MaterialType
  title: string
  description?: string
  files: MaterialFile[]
  text?: string
  status: ParseStatus
  lessonId?: Id
  createdAt: DateTime
}

export interface MaterialFile {
  path: string
  name: string
  size: number
  pageCount?: number
  assetIndex?: number
}

export interface ParseJob {
  id: Id
  materialId: Id
  status: ParseStatus
  stage?: string
  progress: number
  channel?: ParseChannel
  errorCode?: string
  errorMessage?: string
  retryPaused?: boolean
  nextRetryAt?: number
  draftId?: Id
  updatedAt: DateTime
}

export interface ParseAdvanceResult {
  id: Id
  materialId: Id
  status: ParseStatus
  stage?: string
  progress: number
  channel?: ParseChannel
  errorCode?: string
  errorMessage?: string
  retryPaused?: boolean
  nextRetryAt?: number
  draftId?: Id
}

// ---------- Lesson 草稿（AI 输出协议 LessonDraft） ----------
export interface DraftWord {
  id: string
  word: string
  phonetic: string
  pos: string
  meaning: string
  collocations: string[]
  originalSentence: string
  simpleSentence: string
  sourceRef?: string
  needsSourceReview?: boolean
  selected: boolean
}
export interface DraftExpression {
  id: string
  expression: string
  meaning: string
  usage: string
  scenario: string
  originalSentence: string
  structure?: string
  sourceRef?: string
  needsSourceReview?: boolean
  selected: boolean
}
export interface DraftGrammar {
  id: string
  name: string
  structure: string
  rule: string
  originalSentence: string
  example: string
  sourceRef?: string
  needsSourceReview?: boolean
  selected: boolean
}
export type DraftEditKind = 'word' | 'expression' | 'grammar'
export type DraftEditableItem = DraftWord | DraftExpression | DraftGrammar
/** 确认页 → 条目编辑页 */
export interface DraftEditInit {
  kind: DraftEditKind
  item: DraftEditableItem
  isNew?: boolean
  materialId?: string
  /** 带上时为学习单元模式：保存直接写入该单元，成功后才返回 */
  lessonId?: string
}
/** 条目编辑页 → 确认页 */
export interface DraftEditSave {
  kind: DraftEditKind
  item: DraftEditableItem
  isNew: boolean
}
export interface DraftScenario {
  id: string
  name: string
  description: string
  userRole: string
  aiRole: string
  goal: string
  suggestedWords: string[]
  suggestedExpressions: string[]
  selected: boolean
}
export interface DraftSentenceTask {
  id: string
  type: SentenceType
  instruction: string
  hintExpression?: string
  keywords: string[]
  reference: string
  selected: boolean
}

export interface LessonDraft {
  draftId: string
  materialId: string
  title: string
  theme: string
  summary: string
  words: DraftWord[]
  expressions: DraftExpression[]
  grammars: DraftGrammar[]
  scenarios: DraftScenario[]
  sentenceTasks: DraftSentenceTask[]
  sourceNotes?: string[]
  sourceQuality?: Array<{
    assetIndex: number
    label: string
    confidence: number | null
    needsReview: boolean
  }>
  modelVersion?: string
  promptVersion?: string
  createdAt: DateTime
}

// ---------- Lesson ----------
export interface Lesson {
  id: Id
  ownerUserId: Id
  name: string
  theme: string
  summary: string
  materialId?: Id
  materialType?: MaterialType
  materialTitle?: string
  wordCount: number
  expressionCount: number
  grammarCount: number
  sentenceCount: number
  scenarioCount: number
  // 进度
  wordsLearned: number
  expressionsLearned: number
  grammarsLearned: number
  sentencesDone: number
  practicesDone: number
  // 最近学习状态
  lastStudiedAt?: DateTime
  progress: number
  createdAt: DateTime
  updatedAt: DateTime
  version: number
  status: 'active' | 'deleted'
  /** 从好友分享添加的单元 */
  origin?: LessonOrigin
}

export interface LessonOrigin {
  type: 'share'
  shareId: Id
  sharerNickname: string
}

export interface LessonDetail extends Lesson {
  words: LearningItem[]
  expressions: LearningItem[]
  grammars: LearningItem[]
  sentenceTasks: SentenceTask[]
  scenarios: PracticeScenario[]
  /** 通过本人分享添加了这个单元的好友数 */
  shareImports?: number
}

// ---------- 学习项（word / expression / grammar 统一存储） ----------
export interface WordContent {
  word: string
  phonetic: string
  pos: string
  meaning: string
  collocations: string[]
  originalSentence: string
  simpleSentence: string
  sourceRef?: string
}

export interface ExpressionContent {
  expression: string
  meaning: string
  usage: string
  scenario: string
  originalSentence: string
  structure?: string
  sourceRef?: string
}

export interface GrammarContent {
  name: string
  structure: string
  rule: string
  originalSentence: string
  example: string
  sourceRef?: string
}

export type ItemContent = WordContent | ExpressionContent | GrammarContent

export interface LearningItem {
  id: Id
  ownerUserId: Id
  lessonId: Id
  lessonName: string
  type: ItemType
  content: ItemContent
  favorite: boolean
  reviewStep: number // 0..5 对应 当天/1/3/7/14/30 天
  mastery: Mastery
  dueAt: string // ISO 日期，到期复习
  lastResult?: RecallResult
  reviewCount: number
  correctCount: number
  wrongCount: number
  outputEvidenceCount: number
  /** 最近一次实际复习的本地日期（YYYY-MM-DD），用于今日学习统计 */
  lastReviewDate?: string
  createdAt: DateTime
  updatedAt: DateTime
  version: number
  status: 'active' | 'deleted'
}

// 列表视图投影
export interface LibraryWordRow extends LearningItem {
  content: WordContent
}
export interface LibraryExpressionRow extends LearningItem {
  content: ExpressionContent
}

// ---------- 造句 ----------
export interface SentenceTask {
  id: Id
  lessonId: Id
  type: SentenceType
  instruction: string
  hintExpression?: string
  hintItemId?: Id
  keywords: string[]
  reference: string
  createdAt: DateTime
}

export interface SentenceFeedback {
  corrected: string
  mistakes: Array<{ original: string; suggested: string; reason: string }>
  styles: Partial<Record<PolishStyle, string>>
  usedItems: Array<{ itemId: Id; evidence: string }>
  comment: string
  score?: number
}

export interface SentenceAttempt {
  id: Id
  ownerUserId: Id
  lessonId: Id
  taskId: Id
  taskType: SentenceType
  prompt: string
  userSentence: string
  corrected: string
  mistakes: Array<{ original: string; suggested: string; reason: string }>
  styles: Partial<Record<PolishStyle, string>>
  polishStyle: PolishStyle
  usedItemIds: Id[]
  favorite: boolean
  createdAt: DateTime
}

export interface SavedSentence {
  id: Id
  ownerUserId: Id
  source: SentenceSource
  lessonId?: Id
  lessonName?: string
  original: string
  improved: string
  sourceSentence?: string
  createdAt: DateTime
  favorite: boolean
}

// ---------- AI 对练 ----------
export interface PracticeScenario {
  id: Id
  ownerUserId: Id
  lessonId: Id
  lessonName: string
  name: string
  description: string
  userRole: string
  aiRole: string
  goal: string
  suggestedWordIds: Id[]
  suggestedExpressionIds: Id[]
  status: 'active' | 'deleted'
  createdAt: DateTime
}

export interface PracticeTurn {
  userText: string
  assistantText: string
  usedItemIds?: Id[]
  silentIssues?: Array<{ original: string; suggested: string; reason: string }>
  audioPath?: string
  moderated?: boolean
}

export interface RecapIssue {
  original: string
  suggested: string
  reason: string
}
export interface RecapGoodSentence {
  sentence: string
  comment?: string
}
export interface RecapUsage {
  wordIds: Id[]
  expressionIds: Id[]
}

export interface PracticeSession {
  id: Id
  ownerUserId: Id
  lessonId: Id
  lessonName?: string
  scenarioId: Id
  mode: PracticeMode
  scenarioName: string
  targetWordIds?: Id[]
  targetExpressionIds?: Id[]
  turns: PracticeTurn[]
  durationSeconds: number
  status: PracticeStatus
  // 复盘
  recap?: PracticeRecap
  endedAt?: DateTime
  createdAt: DateTime
}

export interface PracticeRecap {
  sessionId: Id
  durationSeconds: number
  turnCount: number
  usage: {
    usedWordIds: Id[]
    usedExpressionIds: Id[]
  }
  issues: RecapIssue[]
  goodSentences: RecapGoodSentence[]
  summary: string
  suggestion: string
  modelVersion?: string
}

// ---------- 今日任务 / 首页 ----------
export type TaskKind = 'word' | 'expression' | 'grammar' | 'sentence'

export interface TodayTask {
  kind: TaskKind
  label: string
  total: number
  done: number
}

export interface StudyQueueItem {
  item: LearningItem
  practice?: PracticeScenario
}

export interface StudyQueue {
  lessonId?: Id
  items: Array<{ item: LearningItem; mode: ReviewMode }>
  sentenceTasks: SentenceTask[]
  scenario?: PracticeScenario
}

export interface RecentLesson {
  id: Id
  name: string
  wordCount: number
  expressionCount: number
  progress: number
  updatedAt: DateTime
}

/** 首页预览，仅含学习项正面提示及所属资料，不含释义或参考答案。 */
export interface DashboardFocusContent {
  itemId: Id
  type: ItemType
  prompt: string
  lessonId: Id
  lessonName: string
}

export interface DashboardData {
  user: UserProfile | null
  todayTasks: TodayTask[]
  todayDoneCount: number
  todayTotalCount: number
  todayMinutes: number
  todayMinutesUsed: number
  dailyGoalMinutes: number
  recommendedScenario?: {
    lessonId: Id
    lessonName: string
    scenarioId: Id
    scenarioName: string
  }
  recentLessons: RecentLesson[]
  /** 老版本服务或没有可预览的待学内容时缺省。 */
  focusContent?: DashboardFocusContent
  dueItemCount: number
  /** 今日计划之外、仍然到期的积压内容数量 */
  backlogItemCount: number
  hasQueue: boolean
  hasLearningContent: boolean
  needLevelSetup: boolean
  /** 今天有学习分钟或对练时长，可以打卡 */
  todayActive?: boolean
  checkedInToday?: boolean
}

// ---------- 分享与打卡 ----------
export type ShareKind = 'lesson' | 'checkin' | 'practice'

export interface LessonSharePayload {
  name: string
  theme: string
  summary: string
  wordCount: number
  expressionCount: number
  grammarCount: number
  words: Array<Partial<WordContent>>
  expressions: Array<Partial<ExpressionContent>>
  grammars: Array<Partial<GrammarContent>>
  sentenceTasks: Array<{ type: SentenceType; instruction: string }>
  scenarios: Array<{ name: string; userRole?: string; aiRole?: string; goal?: string }>
}

export interface CheckinPayload {
  dateKey: ISODate
  streakDays: number
  minutes: number
  reviewedCount: number
  wordReviews: number
  expressionReviews: number
  practiceMinutes: number
  planCompleted: boolean
  dailyGoalMinutes: number
  highlight?: { type: 'word' | 'expression'; text: string; meaning: string }
}

export interface PracticeSharePayload {
  scenarioName: string
  userRole: string
  aiRole: string
  mode: PracticeMode
  durationSeconds: number
  turnCount: number
  usedCount: number
  dateKey: ISODate
  sentence?: string
}

export type SharePayload = LessonSharePayload | CheckinPayload | PracticeSharePayload

export interface ShareReady {
  shareId: Id
  kind: ShareKind
  path: string
  sharer: { nickname: string; avatarFileId?: string }
  payload: SharePayload
}

export interface ShareView {
  shareId: Id
  kind: ShareKind
  payload: SharePayload
  sharer: { nickname: string; avatarUrl: string }
  isOwner: boolean
  imported: boolean
  importedLessonId?: Id
  ownLessonId?: Id
  stats?: { visitors: number; imports: number }
  createdAt: DateTime
  updatedAt: DateTime
}

export interface AcceptShareResult {
  lessonId: Id
  own: boolean
  needLevelSetup: boolean
}

// ---------- 统计 ----------
export interface StatsData {
  today: {
    minutes: number
    learnedCount: number
    newWords: number
  }
  week: {
    minutes: number
    newWords: number
    newExpressions: number
    practiceMinutes: number
    streakDays: number
  }
  total: {
    lessons: number
    words: number
    expressions: number
    grammar: number
    masteredCount: number
    practiceSessions: number
    savedSentences: number
  }
  daily: Array<{ date: string; minutes: number }>
}

// ---------- API 信封 ----------
export interface ApiError {
  code: string
  message: string
  requestId?: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: ApiError
  meta?: {
    requestId: string
    timestamp: string
    promptVersion?: string
    modelVersion?: string
  }
}

// ---------- 云函数 action 契约（文档化） ----------
// mateApi: bootstrap | getDashboard | saveProfile | updateSettings |
//   createMaterial | commitMaterial | getMaterial | getParseJob | retryParseJob |
//   listLessons | getLesson | deleteLesson |
//   getStudyQueue | submitRecall | submitMatchResult | submitSpelling |
//   saveSentenceAttempt |
//   listLibrary | toggleFavorite | saveSentenceToLibrary | deleteSavedSentence |
//   listScenarios | getScenario | startPractice | completePractice | saveRecapSentence |
//   getStats | deleteMyData |
//   createLessonShare | createCheckin | createPracticeShare | openShare | acceptLessonShare | getShareQrCode |
//   updateReminder | addReminderCredits
// mateAI: transcribe | evaluateSentence | synthesize | practiceTurn | practiceHint | practiceSuggestion | buildRecap
// mateParser: createJob | analyzeMaterial | fallbackExtract
// mateReminder: 定时触发（每小时），不对小程序开放

// 对练会话持久化（本地使用）
export interface PracticeTurnResult {
  transcript: string
  assistantText: string
  goalCompleted: boolean
  detectedUsage: Array<{ itemId: Id; evidence: string }>
  silentIssues: Array<{ original: string; suggested: string; reason: string }>
  audioPath?: string
  // AI 原回复未通过内容安全检测，已替换为场景内的拉回句
  moderated?: boolean
}

export type HintLevel = 1 | 2 | 3
export interface HintPayload {
  level: HintLevel
  text: string
  kind: 'idea' | 'keywords' | 'expression'
}

// ---------- 对练复盘建议（会话级） ----------
export interface PracticeHint {
  sessionId: Id
  level: HintLevel
  text: string
  kind: 'idea' | 'keywords' | 'expression'
}

export interface PracticeSuggestion {
  text: string
  items?: Id[]
}
