"use client";

import type {
  CheckinPayload,
  DashboardData,
  HintLevel,
  HintPayload,
  ItemType,
  LearningItem,
  Lesson,
  LessonDetail,
  LessonDraft,
  LessonSharePayload,
  Material,
  ParseAdvanceResult,
  ParseJob,
  PolishStyle,
  PracticeMode,
  PracticeRecap,
  PracticeScenario,
  PracticeSession,
  PracticeSharePayload,
  PracticeTurnResult,
  RecallResult,
  ReminderSettings,
  SavedSentence,
  SentenceAttempt,
  SentenceFeedback,
  SentenceSource,
  ShareReady,
  StatsData,
  StudyQueue,
  UserProfile,
  WordContent,
  ExpressionContent,
  GrammarContent,
} from "../types";
import {
  INITIAL_DRAFT,
  INITIAL_LESSONS,
  INITIAL_SAVED_SENTENCES,
  INITIAL_STATS,
  INITIAL_USER,
  PRACTICE_SCRIPTS,
  PRESET_SENTENCE_FEEDBACKS,
  SAMPLE_IMPORT_TEXT,
  SAMPLE_IMPORT_TITLE,
} from "./data";

const STORAGE_KEY = "em-demo-state-v2";

export interface DemoStoreState {
  user: UserProfile;
  lessons: LessonDetail[];
  draft: LessonDraft;
  savedSentences: SavedSentence[];
  stats: StatsData;
  todayDoneCount: number;
  todayTotalCount: number;
  todayMinutesUsed: number;
  checkedInToday: boolean;
  sessions: Record<string, PracticeSession>;
  parseJobs: Record<string, { step: number; materialTitle: string; materialType: string }>;
}

function clone<T>(val: T): T {
  return JSON.parse(JSON.stringify(val));
}

function buildInitialState(): DemoStoreState {
  const defaultSession: PracticeSession = {
    id: "session-demo",
    ownerUserId: "user-demo",
    lessonId: "lesson-smalltalk",
    lessonName: "Business Small Talk and Communication Skills",
    scenarioId: "sc-networking",
    mode: "guided",
    scenarioName: "Business Networking Meet",
    targetWordIds: ["w-context", "w-acceptable", "w-smalltalk", "w-commute", "w-rapport"],
    targetExpressionIds: ["e-haventseen", "e-unsuitable"],
    turns: [
      {
        userText: "",
        assistantText: PRACTICE_SCRIPTS["sc-networking"].aiGreeting,
      },
    ],
    durationSeconds: 185,
    status: "completed",
    recap: {
      sessionId: "session-demo",
      ...PRACTICE_SCRIPTS["sc-networking"].defaultRecap,
    },
    createdAt: "2026-10-31T09:30:00.000Z",
    endedAt: "2026-10-31T09:33:05.000Z",
  };

  return {
    user: clone(INITIAL_USER),
    lessons: clone(INITIAL_LESSONS),
    draft: clone(INITIAL_DRAFT),
    savedSentences: clone(INITIAL_SAVED_SENTENCES),
    stats: clone(INITIAL_STATS),
    todayDoneCount: 0,
    todayTotalCount: 11,
    todayMinutesUsed: 8,
    checkedInToday: false,
    sessions: {
      "session-demo": defaultSession,
    },
    parseJobs: {},
  };
}

let memoryState: DemoStoreState | null = null;
const listeners = new Set<() => void>();

export function getDemoState(): DemoStoreState {
  if (memoryState) return memoryState;
  if (typeof window !== "undefined") {
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        memoryState = JSON.parse(raw) as DemoStoreState;
        return memoryState;
      }
    } catch {
      // ignore
    }
  }
  memoryState = buildInitialState();
  return memoryState;
}

function saveDemoState(next: DemoStoreState) {
  memoryState = next;
  if (typeof window !== "undefined") {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }
  listeners.forEach((fn) => fn());
}

export function resetDemoState() {
  const fresh = buildInitialState();
  saveDemoState(fresh);
}

export function subscribeDemoState(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function delay(ms = 120): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function findItemById(state: DemoStoreState, itemId: string): LearningItem | undefined {
  for (const lesson of state.lessons) {
    for (const list of [lesson.words, lesson.expressions, lesson.grammars]) {
      const found = list.find((i) => i.id === itemId);
      if (found) return found;
    }
  }
  return undefined;
}

function findScenarioById(state: DemoStoreState, scenarioId: string): PracticeScenario | undefined {
  for (const lesson of state.lessons) {
    const found = lesson.scenarios.find((s) => s.id === scenarioId);
    if (found) return found;
  }
  return state.lessons[0]?.scenarios[0];
}

export type ScenarioView = PracticeScenario & {
  suggestedWords: Array<{ id: string; text: string }>;
  suggestedExpressions: Array<{ id: string; text: string }>;
};

function toScenarioView(state: DemoStoreState, scenario: PracticeScenario): ScenarioView {
  const suggestedWords = scenario.suggestedWordIds
    .map((id) => {
      const item = findItemById(state, id);
      const text = item ? (item.content as WordContent).word : "";
      return text ? { id, text } : null;
    })
    .filter((v): v is { id: string; text: string } => Boolean(v));

  const suggestedExpressions = scenario.suggestedExpressionIds
    .map((id) => {
      const item = findItemById(state, id);
      const text = item ? (item.content as ExpressionContent).expression : "";
      return text ? { id, text } : null;
    })
    .filter((v): v is { id: string; text: string } => Boolean(v));

  return {
    ...scenario,
    suggestedWords,
    suggestedExpressions,
  };
}

export const mateService = {
  async bootstrap() {
    const state = getDemoState();
    return { user: state.user, needLevelSetup: false };
  },

  async getDashboard(): Promise<DashboardData> {
    const state = getDemoState();
    const primaryLesson = state.lessons[0];
    const hasQueue = state.todayDoneCount < state.todayTotalCount;
    const allItems = primaryLesson
      ? [...primaryLesson.words, ...primaryLesson.expressions, ...primaryLesson.grammars]
      : [];
    const nextItem = allItems[state.todayDoneCount % Math.max(1, allItems.length)] || allItems[0];
    const promptText = nextItem
      ? nextItem.type === "word"
        ? (nextItem.content as WordContent).word
        : nextItem.type === "expression"
          ? (nextItem.content as ExpressionContent).expression
          : (nextItem.content as GrammarContent).name
      : "small talk";

    return {
      user: state.user,
      todayTasks: [
        { kind: "word", label: "单词", total: 8, done: Math.min(8, state.todayDoneCount) },
        {
          kind: "expression",
          label: "经典表达",
          total: 2,
          done: Math.max(0, Math.min(2, state.todayDoneCount - 8)),
        },
        {
          kind: "sentence",
          label: "造句练习",
          total: 1,
          done: state.todayDoneCount >= 11 ? 1 : 0,
        },
      ],
      todayDoneCount: state.todayDoneCount,
      todayTotalCount: state.todayTotalCount,
      todayMinutes: 13,
      todayMinutesUsed: state.todayMinutesUsed,
      dailyGoalMinutes: state.user.dailyGoalMinutes,
      recommendedScenario: primaryLesson?.scenarios[0]
        ? {
            lessonId: primaryLesson.id,
            lessonName: primaryLesson.name,
            scenarioId: primaryLesson.scenarios[0].id,
            scenarioName: primaryLesson.scenarios[0].name,
          }
        : undefined,
      recentLessons: state.lessons.map((l) => ({
        id: l.id,
        name: l.name,
        wordCount: l.wordCount,
        expressionCount: l.expressionCount,
        progress: l.progress,
        updatedAt: l.updatedAt,
      })),
      focusContent:
        hasQueue && nextItem
          ? {
              itemId: nextItem.id,
              type: nextItem.type,
              prompt: promptText,
              lessonId: nextItem.lessonId,
              lessonName: nextItem.lessonName,
            }
          : undefined,
      dueItemCount: Math.max(0, state.todayTotalCount - state.todayDoneCount),
      backlogItemCount: 0,
      hasQueue,
      hasLearningContent: state.lessons.length > 0,
      needLevelSetup: false,
      todayActive: state.todayMinutesUsed > 0,
      checkedInToday: state.checkedInToday,
    };
  },

  async createMaterial(input: { type: string; title?: string }): Promise<Material> {
    await delay(150);
    const id = `mat-${Date.now()}`;
    return {
      id,
      type: (input.type as Material["type"]) || "text",
      title: input.title || SAMPLE_IMPORT_TITLE,
      files: [],
      text: SAMPLE_IMPORT_TEXT,
      status: "uploaded",
      createdAt: new Date().toISOString(),
    };
  },

  async commitMaterial(input: { materialId: string; text?: string; files?: unknown[] }): Promise<Material> {
    await delay(120);
    return {
      id: input.materialId,
      type: "text",
      title: SAMPLE_IMPORT_TITLE,
      files: [],
      text: input.text || SAMPLE_IMPORT_TEXT,
      status: "analyzing",
      createdAt: new Date().toISOString(),
    };
  },

  async startParse(input: { materialId: string }): Promise<{ jobId: string }> {
    const state = getDemoState();
    const jobId = `job-${input.materialId}-${Date.now()}`;
    state.parseJobs[jobId] = {
      step: 0,
      materialTitle: SAMPLE_IMPORT_TITLE,
      materialType: "text",
    };
    saveDemoState({ ...state });
    return { jobId };
  },

  async restartParse(materialId: string): Promise<{ jobId: string }> {
    return this.startParse({ materialId });
  },

  async getParseJob(materialId: string): Promise<ParseJob | null> {
    return {
      id: "job-demo",
      materialId,
      status: "ready",
      stage: "ready",
      progress: 100,
      draftId: "draft-demo",
      updatedAt: new Date().toISOString(),
    };
  },

  async analyzeMaterial(input: { jobId: string }): Promise<ParseAdvanceResult> {
    await delay(550);
    const state = getDemoState();
    const job = state.parseJobs[input.jobId] || {
      step: 0,
      materialTitle: SAMPLE_IMPORT_TITLE,
      materialType: "text",
    };
    job.step += 1;
    state.parseJobs[input.jobId] = job;
    saveDemoState({ ...state });

    if (job.step === 1) {
      return {
        id: input.jobId,
        materialId: "mat-smalltalk",
        status: "analyzing",
        stage: "extracting",
        progress: 35,
      };
    }
    if (job.step === 2) {
      return {
        id: input.jobId,
        materialId: "mat-smalltalk",
        status: "validating",
        stage: "structuring",
        progress: 75,
      };
    }
    return {
      id: input.jobId,
      materialId: "mat-smalltalk",
      status: "ready",
      stage: "ready",
      progress: 100,
      draftId: "draft-demo",
    };
  },

  async getDraft(draftId?: string): Promise<LessonDraft | null> {
    const state = getDemoState();
    const copy = clone(state.draft);
    if (draftId) copy.draftId = draftId;
    return copy;
  },

  async confirmDraft(_draftId: string, draft: LessonDraft): Promise<{ lessonId: string; lesson: Lesson }> {
    await delay(300);
    const state = getDemoState();
    state.draft = clone(draft);
    const lesson = state.lessons[0];
    if (lesson) {
      lesson.name = draft.title || lesson.name;
      lesson.summary = draft.summary || lesson.summary;
      lesson.wordCount = draft.words.filter((w) => w.selected).length || lesson.wordCount;
      lesson.expressionCount =
        draft.expressions.filter((e) => e.selected).length || lesson.expressionCount;
      lesson.grammarCount =
        draft.grammars.filter((g) => g.selected).length || lesson.grammarCount;
      lesson.scenarioCount =
        draft.scenarios.filter((s) => s.selected).length || lesson.scenarioCount;
    }
    saveDemoState({ ...state });
    return { lessonId: lesson.id, lesson };
  },

  async listLessons(): Promise<Lesson[]> {
    const state = getDemoState();
    return clone(state.lessons);
  },

  async getLesson(lessonId: string): Promise<LessonDetail> {
    const state = getDemoState();
    const found = state.lessons.find((l) => l.id === lessonId) || state.lessons[0];
    return clone(found);
  },

  async deleteLesson(lessonId: string): Promise<{ deleted: boolean }> {
    const state = getDemoState();
    if (state.lessons.length > 1) {
      state.lessons = state.lessons.filter((l) => l.id !== lessonId);
      saveDemoState({ ...state });
    }
    return { deleted: true };
  },

  async getStudyQueue(lessonId?: string): Promise<StudyQueue> {
    const state = getDemoState();
    const lesson =
      (lessonId && state.lessons.find((l) => l.id === lessonId)) || state.lessons[0];
    const items = [
      ...lesson.words.slice(0, 3).map((item) => ({ item: clone(item), mode: "en2zh" as const })),
      ...lesson.expressions.slice(0, 1).map((item) => ({ item: clone(item), mode: "en2zh" as const })),
      ...lesson.grammars.slice(0, 1).map((item) => ({ item: clone(item), mode: "en2zh" as const })),
    ];
    return {
      lessonId: lesson.id,
      items,
      sentenceTasks: clone(lesson.sentenceTasks.slice(0, 1)),
      scenario: lesson.scenarios[0] ? clone(lesson.scenarios[0]) : undefined,
    };
  },

  async submitRecall(
    itemId: string,
    result: RecallResult,
    _operationId?: string,
    _recordedAt?: number,
    practice?: boolean,
  ): Promise<LearningItem> {
    const state = getDemoState();
    const item = findItemById(state, itemId);
    if (item) {
      item.lastResult = result;
      item.reviewCount += 1;
      if (result === "mastered") {
        item.mastery = "mastered";
        item.correctCount += 1;
      } else if (result === "impression") {
        item.mastery = "familiar";
        item.correctCount += 1;
      } else {
        item.mastery = "learning";
        item.wrongCount += 1;
      }
      if (!practice) {
        state.todayDoneCount = Math.min(state.todayTotalCount, state.todayDoneCount + 1);
        state.todayMinutesUsed += 1;
        state.stats.today.learnedCount += 1;
        state.stats.today.minutes = state.todayMinutesUsed;
      }
      saveDemoState({ ...state });
      return clone(item);
    }
    return clone(state.lessons[0].words[0]);
  },

  async submitMatchResult(
    itemIds: string[],
    correctIds: string[],
    practice?: boolean,
  ): Promise<{ correct: number; total: number }> {
    const state = getDemoState();
    state.todayMinutesUsed += practice ? 1 : 2;
    state.stats.today.minutes = state.todayMinutesUsed;
    saveDemoState({ ...state });
    return { correct: correctIds.length, total: itemIds.length };
  },

  async saveSentenceAttempt(input: {
    lessonId: string;
    taskId: string;
    taskType?: string;
    prompt: string;
    hintExpression?: string;
    keywords?: string[];
    userSentence: string;
    usedItemIds?: string[];
    polishStyle?: PolishStyle;
  }): Promise<{ attempt: SentenceAttempt; feedback: SentenceFeedback }> {
    await delay(450);
    const state = getDemoState();
    const preset =
      PRESET_SENTENCE_FEEDBACKS[input.taskId] || PRESET_SENTENCE_FEEDBACKS["st-1"];
    const trimmed = input.userSentence.trim();

    // Build deterministic feedback tailored to user input while keeping rich 3-style polishes
    const mistakes = [...preset.mistakes];
    if (/very\s+like/i.test(trimmed)) {
      mistakes.unshift({
        original: trimmed,
        suggested: trimmed.replace(/very\s+like/i, "really like"),
        reason: "very 不能直接修饰动词 like，地道表达应使用 really like。",
      });
    }

    const feedback: SentenceFeedback = {
      ...preset,
      mistakes,
    };

    state.todayDoneCount = Math.min(state.todayTotalCount, state.todayDoneCount + 1);
    state.todayMinutesUsed += 2;
    saveDemoState({ ...state });

    const attempt: SentenceAttempt = {
      id: `att-${Date.now()}`,
      ownerUserId: state.user.id,
      lessonId: input.lessonId,
      taskId: input.taskId,
      taskType: (input.taskType as SentenceAttempt["taskType"]) || "guided",
      prompt: input.prompt,
      userSentence: trimmed,
      corrected: feedback.corrected,
      mistakes: feedback.mistakes,
      styles: feedback.styles,
      polishStyle: input.polishStyle || state.user.polishStyle || "natural",
      usedItemIds: feedback.usedItems.map((u) => u.itemId),
      favorite: false,
      createdAt: new Date().toISOString(),
    };
    return { attempt, feedback };
  },

  async saveSentenceToLibrary(input: {
    lessonId?: string;
    original: string;
    improved?: string;
    source?: SentenceSource;
    sourceSentence?: string;
  }): Promise<SavedSentence> {
    const state = getDemoState();
    const entry: SavedSentence = {
      id: `ss-${Date.now()}`,
      ownerUserId: state.user.id,
      source: input.source || "attempt",
      lessonId: input.lessonId || "lesson-smalltalk",
      lessonName: "Business Small Talk and Communication Skills",
      original: input.original,
      improved: input.improved || input.original,
      sourceSentence: input.sourceSentence,
      createdAt: new Date().toISOString(),
      favorite: true,
    };
    state.savedSentences = [entry, ...state.savedSentences];
    state.stats.total.savedSentences = state.savedSentences.length;
    saveDemoState({ ...state });
    return entry;
  },

  async listScenarios(lessonId?: string): Promise<ScenarioView[]> {
    const state = getDemoState();
    const lessons = lessonId
      ? state.lessons.filter((l) => l.id === lessonId)
      : state.lessons;
    const all: ScenarioView[] = [];
    for (const l of lessons) {
      for (const s of l.scenarios) {
        all.push(toScenarioView(state, s));
      }
    }
    return all;
  },

  async getScenario(scenarioId: string): Promise<ScenarioView> {
    const state = getDemoState();
    const found = findScenarioById(state, scenarioId)!;
    return toScenarioView(state, found);
  },

  async startPractice(scenarioId: string, mode: PracticeMode) {
    await delay(220);
    const state = getDemoState();
    const scenario = findScenarioById(state, scenarioId)!;
    const view = toScenarioView(state, scenario);
    const script = PRACTICE_SCRIPTS[scenario.id] || PRACTICE_SCRIPTS["sc-networking"];
    const sessionId = `session-${Date.now()}`;
    const session: PracticeSession = {
      id: sessionId,
      ownerUserId: state.user.id,
      lessonId: scenario.lessonId,
      lessonName: scenario.lessonName,
      scenarioId: scenario.id,
      mode,
      scenarioName: scenario.name,
      targetWordIds: scenario.suggestedWordIds,
      targetExpressionIds: scenario.suggestedExpressionIds,
      turns: [
        {
          userText: "",
          assistantText: script.aiGreeting,
        },
      ],
      durationSeconds: 0,
      status: "active",
      createdAt: new Date().toISOString(),
    };
    state.sessions[sessionId] = session;
    saveDemoState({ ...state });

    return {
      sessionId,
      scenario: { ...scenario, lessonName: scenario.lessonName },
      suggestedWords: view.suggestedWords.map((w) => w.text),
      suggestedExpressions: view.suggestedExpressions.map((e) => e.text),
    };
  },

  async practiceTurn(sessionId: string, transcript?: string): Promise<PracticeTurnResult> {
    await delay(650);
    const state = getDemoState();
    const session = state.sessions[sessionId] || state.sessions["session-demo"];
    const script =
      PRACTICE_SCRIPTS[session?.scenarioId || "sc-networking"] ||
      PRACTICE_SCRIPTS["sc-networking"];

    const userTurnsCount = session
      ? session.turns.filter((t) => Boolean(t.userText)).length
      : 0;
    const userText =
      (transcript && transcript.trim()) ||
      script.userSamples[userTurnsCount % script.userSamples.length];
    const replyText =
      script.aiReplies[userTurnsCount % script.aiReplies.length];
    const goalCompleted = userTurnsCount + 1 >= 2;

    if (session) {
      session.turns.push({
        userText,
        assistantText: replyText,
      });
      saveDemoState({ ...state });
    }

    return {
      transcript: userText,
      assistantText: replyText,
      goalCompleted,
      detectedUsage: [],
      silentIssues: [],
    };
  },

  async getPracticeHint(sessionId: string, level: HintLevel): Promise<HintPayload> {
    await delay(180);
    const state = getDemoState();
    const session = state.sessions[sessionId];
    const script =
      PRACTICE_SCRIPTS[session?.scenarioId || "sc-networking"] ||
      PRACTICE_SCRIPTS["sc-networking"];
    const idx = Math.max(0, Math.min(2, level - 1));
    const kinds: Array<"idea" | "keywords" | "expression"> = [
      "idea",
      "keywords",
      "expression",
    ];
    return {
      level,
      kind: kinds[idx],
      text: script.hints[idx],
    };
  },

  async getTurnSuggestion(
    sessionId: string,
    turnIndex: number,
  ): Promise<{ expression: string; explanation: string }> {
    await delay(280);
    const state = getDemoState();
    const session = state.sessions[sessionId];
    const script =
      PRACTICE_SCRIPTS[session?.scenarioId || "sc-networking"] ||
      PRACTICE_SCRIPTS["sc-networking"];
    return script.suggestions[turnIndex % script.suggestions.length];
  },

  async completePractice(sessionId: string, durationSeconds: number): Promise<PracticeRecap> {
    await delay(500);
    const state = getDemoState();
    const session = state.sessions[sessionId] || state.sessions["session-demo"];
    const script =
      PRACTICE_SCRIPTS[session?.scenarioId || "sc-networking"] ||
      PRACTICE_SCRIPTS["sc-networking"];

    // Detect which target words/expressions the user actually used in turns!
    const allUserText = (session?.turns || [])
      .map((t) => t.userText || "")
      .join(" ")
      .toLowerCase();

    const usedWordIds = new Set<string>(script.defaultRecap.usage.usedWordIds);
    const usedExpressionIds = new Set<string>(script.defaultRecap.usage.usedExpressionIds);

    for (const wordId of session?.targetWordIds || []) {
      const item = findItemById(state, wordId);
      const word = item ? (item.content as WordContent).word.toLowerCase() : "";
      if (word && allUserText.includes(word)) usedWordIds.add(wordId);
    }
    for (const expId of session?.targetExpressionIds || []) {
      const item = findItemById(state, expId);
      const exp = item ? (item.content as ExpressionContent).expression.toLowerCase() : "";
      if (exp && allUserText.includes(exp.slice(0, 12))) usedExpressionIds.add(expId);
    }

    const recap: PracticeRecap = {
      sessionId: session?.id || "session-demo",
      durationSeconds: durationSeconds || script.defaultRecap.durationSeconds,
      turnCount: Math.max(
        1,
        (session?.turns || []).filter((t) => Boolean(t.userText)).length ||
          script.defaultRecap.turnCount,
      ),
      usage: {
        usedWordIds: Array.from(usedWordIds),
        usedExpressionIds: Array.from(usedExpressionIds),
      },
      issues: script.defaultRecap.issues,
      goodSentences: script.defaultRecap.goodSentences,
      summary: script.defaultRecap.summary,
      suggestion: script.defaultRecap.suggestion,
    };

    if (session) {
      session.status = "completed";
      session.durationSeconds = recap.durationSeconds;
      session.recap = recap;
    }
    state.todayMinutesUsed += 3;
    state.stats.today.minutes = state.todayMinutesUsed;
    state.stats.total.practiceSessions += 1;
    saveDemoState({ ...state });
    return clone(recap);
  },

  async getPracticeSession(sessionId: string): Promise<PracticeSession> {
    const state = getDemoState();
    const session = state.sessions[sessionId] || state.sessions["session-demo"];
    return clone(session);
  },

  async saveRecapSentence(sessionId: string, sentence: string): Promise<SavedSentence> {
    const state = getDemoState();
    const session = state.sessions[sessionId] || state.sessions["session-demo"];
    return this.saveSentenceToLibrary({
      lessonId: session?.lessonId || "lesson-smalltalk",
      original: sentence,
      improved: sentence,
      source: "practice",
    });
  },

  async getStats(): Promise<StatsData> {
    const state = getDemoState();
    return clone(state.stats);
  },

  async createLessonShare(lessonId: string): Promise<ShareReady> {
    await delay(180);
    const lesson = await this.getLesson(lessonId);
    const payload: LessonSharePayload = {
      name: lesson.name,
      theme: lesson.theme,
      summary: lesson.summary,
      wordCount: lesson.wordCount,
      expressionCount: lesson.expressionCount,
      grammarCount: lesson.grammarCount,
      words: lesson.words.map((w) => w.content as WordContent),
      expressions: lesson.expressions.map((e) => e.content as ExpressionContent),
      grammars: lesson.grammars.map((g) => g.content as GrammarContent),
      sentenceTasks: lesson.sentenceTasks.map((t) => ({
        type: t.type,
        instruction: t.instruction,
      })),
      scenarios: lesson.scenarios.map((s) => ({
        name: s.name,
        userRole: s.userRole,
        aiRole: s.aiRole,
        goal: s.goal,
      })),
    };
    return {
      shareId: `share-lesson-${lesson.id}`,
      kind: "lesson",
      path: `/packages/share/pages/landing/index?shareId=share-lesson-${lesson.id}`,
      sharer: { nickname: getDemoState().user.nickname },
      payload,
    };
  },

  async createCheckin(): Promise<ShareReady> {
    await delay(180);
    const state = getDemoState();
    state.checkedInToday = true;
    saveDemoState({ ...state });
    const payload: CheckinPayload = {
      dateKey: "2026-10-31",
      streakDays: state.stats.week.streakDays,
      minutes: state.todayMinutesUsed,
      reviewedCount: Math.max(5, state.todayDoneCount),
      wordReviews: 4,
      expressionReviews: 1,
      practiceMinutes: 4,
      planCompleted: state.todayDoneCount >= state.todayTotalCount,
      dailyGoalMinutes: state.user.dailyGoalMinutes,
      highlight: {
        type: "expression",
        text: "deal with unsuitable conversation topics",
        meaning: "应对不合适的谈话话题",
      },
    };
    return {
      shareId: "share-checkin-demo",
      kind: "checkin",
      path: "/packages/share/pages/landing/index?shareId=share-checkin-demo",
      sharer: { nickname: state.user.nickname },
      payload,
    };
  },

  async createPracticeShare(sessionId: string, sentenceIndex: number): Promise<ShareReady> {
    await delay(180);
    const session = await this.getPracticeSession(sessionId);
    const recap = session.recap || PRACTICE_SCRIPTS["sc-networking"].defaultRecap;
    const picked =
      sentenceIndex >= 0 && recap.goodSentences[sentenceIndex]
        ? recap.goodSentences[sentenceIndex].sentence
        : undefined;
    const payload: PracticeSharePayload = {
      scenarioName: session.scenarioName,
      userRole: "参会者（学生 / 新员工）",
      aiRole: "另一公司的代表",
      mode: session.mode,
      durationSeconds: recap.durationSeconds,
      turnCount: recap.turnCount,
      usedCount:
        recap.usage.usedWordIds.length + recap.usage.usedExpressionIds.length,
      dateKey: "2026-10-31",
      sentence: picked,
    };
    return {
      shareId: `share-practice-${session.id}`,
      kind: "practice",
      path: `/packages/share/pages/landing/index?shareId=share-practice-${session.id}`,
      sharer: { nickname: getDemoState().user.nickname },
      payload,
    };
  },

  async updateReminder(patch: {
    enabled?: boolean;
    hour?: number;
    minute?: number;
  }): Promise<ReminderSettings> {
    const state = getDemoState();
    const next: ReminderSettings = {
      enabled: patch.enabled ?? true,
      hour: patch.hour ?? 20,
      minute: patch.minute ?? 0,
      credits: (state.user.reminder?.credits || 1) + 1,
      lastSentDate: "",
    };
    state.user.reminder = next;
    saveDemoState({ ...state });
    return next;
  },

  // Helper to get next scripted voice transcript in chat
  getNextVoiceSample(sessionId: string): string {
    const state = getDemoState();
    const session = state.sessions[sessionId];
    const script =
      PRACTICE_SCRIPTS[session?.scenarioId || "sc-networking"] ||
      PRACTICE_SCRIPTS["sc-networking"];
    const userTurnsCount = session
      ? session.turns.filter((t) => Boolean(t.userText)).length
      : 0;
    return script.userSamples[userTurnsCount % script.userSamples.length];
  },

  // Helper to resolve item objects from IDs (for Recap usage display)
  resolveItemsByIds(ids: string[]): Array<{ id: string; text: string; type: ItemType }> {
    const state = getDemoState();
    return ids
      .map((id) => {
        const item = findItemById(state, id);
        if (!item) return null;
        const text =
          item.type === "word"
            ? (item.content as WordContent).word
            : item.type === "expression"
              ? (item.content as ExpressionContent).expression
              : (item.content as GrammarContent).name;
        return { id, text, type: item.type };
      })
      .filter((v): v is { id: string; text: string; type: ItemType } => Boolean(v));
  },
};
