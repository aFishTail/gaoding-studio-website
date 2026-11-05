"use client";

import { useCallback, useEffect } from "react";
import { MateIcon } from "../components/MateIcon";
import { SharePanel } from "../components/SharePanel";
import { mateService } from "../mock/service";
import { promptScaleClass } from "../runtime/prompt-size";
import { useEmRouter } from "../runtime/router";
import { speakText, stopAudio } from "../runtime/tts";
import { useSetData } from "../runtime/useSetData";
import { useWx } from "../runtime/wx";
import type {
  ExpressionContent,
  GrammarContent,
  ItemType,
  LearningItem,
  PolishStyle,
  PracticeScenario,
  RecallResult,
  SentenceTask,
  WordContent,
} from "../types";

type Stage =
  | "word"
  | "expression"
  | "grammar"
  | "sentence"
  | "practice"
  | "empty"
  | "done";

const QUICK_SAMPLE_SENTENCE =
  "Small talk help us deal with unsuitable conversation topics and keep the chat acceptable.";

function buildCardDisplay(item: LearningItem | null) {
  if (!item) {
    return {
      currentPrompt: "",
      currentPromptClass: "",
      currentSub: "",
      currentBackTitle: "",
      currentBackLines: [] as string[],
    };
  }
  if (item.type === "word") {
    const c = item.content as WordContent;
    return {
      currentPrompt: c.word,
      currentPromptClass: promptScaleClass(c.word),
      currentSub: [c.phonetic, c.pos].filter(Boolean).join(" · "),
      currentBackTitle: c.meaning,
      currentBackLines: [
        ...(c.collocations?.length ? [`搭配：${c.collocations.join(" / ")}`] : []),
        `例句：${c.simpleSentence}`,
        ...(c.originalSentence ? [`原文：${c.originalSentence}`] : []),
      ],
    };
  }
  if (item.type === "expression") {
    const c = item.content as ExpressionContent;
    return {
      currentPrompt: c.expression,
      currentPromptClass: promptScaleClass(c.expression),
      currentSub: "",
      currentBackTitle: c.meaning,
      currentBackLines: [
        ...(c.usage ? [`说明：${c.usage}`] : []),
        ...(c.scenario ? [`场景：${c.scenario}`] : []),
        ...(c.originalSentence ? [`例句：${c.originalSentence}`] : []),
      ],
    };
  }
  const c = item.content as GrammarContent;
  return {
    currentPrompt: c.structure || c.name,
    currentPromptClass: promptScaleClass(c.structure || c.name),
    currentSub: "",
    currentBackTitle: c.name,
    currentBackLines: [
      ...(c.rule ? [`规则：${c.rule}`] : []),
      ...(c.example ? [`示例：${c.example}`] : []),
      ...(c.originalSentence ? [`原文：${c.originalSentence}`] : []),
    ],
  };
}

export function QuickLearnPage({ query }: { query: Record<string, string> }) {
  const { navigateTo, redirectTo, switchTab } = useEmRouter();
  const { showToast, showLoading, hideLoading } = useWx();

  const lessonId = query.lessonId || "";
  const mode: "quick" | "full" = query.mode === "full" ? "full" : "quick";

  const [data, setData, ref] = useSetData({
    lessonId,
    mode,
    stage: "word" as Stage,
    stageIndex: 0,
    stages: [] as Array<{ key: Stage; label: string }>,
    items: [] as LearningItem[],
    itemIndex: 0,
    itemType: "word" as ItemType,
    revealed: false,
    sentenceTasks: [] as SentenceTask[],
    sentenceTaskIndex: 0,
    sentenceTask: null as SentenceTask | null,
    sentenceInput: "",
    sentenceFeedback: "",
    sentenceSubmitted: false,
    scenario: null as PracticeScenario | null,
    doneCount: 0,
    totalCount: 0,
    loading: true,
    loadError: "",
    hasInput: false,
    currentPrompt: "",
    currentPromptClass: "",
    currentSub: "",
    currentBackTitle: "",
    currentBackLines: [] as string[],
    pendingRecalls: 0,
    recallSyncFailed: false,
    defaultStyle: "natural" as PolishStyle,
    emptyLesson: false,
    shareVisible: false,
    checkinPreparing: false,
    showReminderPrompt: true,
    reminderTimeLabel: "20:00",
  });

  const prepare = useCallback(async () => {
    setData({ loading: true, loadError: "", lessonId, mode });
    try {
      const bootstrap = await mateService.bootstrap().catch(() => null);
      const defaultStyle = (bootstrap?.user?.polishStyle ||
        "natural") as PolishStyle;
      const reminderEnabled = Boolean(bootstrap?.user?.reminder?.enabled);
      const queue = await mateService.getStudyQueue(lessonId || undefined);

      const words = queue.items
        .filter((x) => x.item.type === "word")
        .map((x) => x.item);
      const expressions = queue.items
        .filter((x) => x.item.type === "expression")
        .map((x) => x.item);
      const grammars = queue.items
        .filter((x) => x.item.type === "grammar")
        .map((x) => x.item);
      const sentenceTasks = queue.sentenceTasks || [];
      const scenario = (mode === "full" ? queue.scenario : null) || null;

      const stages: Array<{ key: Stage; label: string }> = [];
      if (words.length) stages.push({ key: "word", label: `单词 (${words.length})` });
      if (expressions.length) {
        stages.push({
          key: "expression",
          label: `经典表达 (${expressions.length})`,
        });
      }
      if (grammars.length) {
        stages.push({ key: "grammar", label: `语法 (${grammars.length})` });
      }
      if (sentenceTasks.length) {
        stages.push({
          key: "sentence",
          label: `造句 (${sentenceTasks.length})`,
        });
      }
      if (scenario && mode === "full") {
        stages.push({ key: "practice", label: "AI 对练" });
      }

      const allItems = [...words, ...expressions, ...grammars];
      const totalCount = allItems.length + sentenceTasks.length;

      if (stages.length === 0) {
        setData({
          stages: [],
          items: [],
          scenario: null,
          sentenceTasks: [],
          sentenceTaskIndex: 0,
          sentenceTask: null,
          defaultStyle,
          totalCount: 0,
          doneCount: 0,
          loading: false,
          emptyLesson: Boolean(lessonId),
          stage: "empty",
        });
        return;
      }

      const firstStage = stages[0].key;
      const firstItems = allItems.filter((i) => i.type === firstStage);
      const cardDisplay = buildCardDisplay(firstItems[0] || null);
      const initialSentence =
        sentenceTasks[0]?.id === "st-1"
          ? QUICK_SAMPLE_SENTENCE
          : sentenceTasks[0]?.reference || QUICK_SAMPLE_SENTENCE;

      setData({
        stages,
        items: allItems,
        scenario,
        sentenceTasks,
        sentenceTaskIndex: 0,
        sentenceTask: sentenceTasks[0] || null,
        sentenceInput: initialSentence,
        hasInput: initialSentence.trim().length > 0,
        sentenceFeedback: "",
        sentenceSubmitted: false,
        defaultStyle,
        totalCount,
        doneCount: 0,
        loading: false,
        emptyLesson: Boolean(lessonId),
        stageIndex: 0,
        stage: firstStage,
        itemIndex: 0,
        revealed: false,
        showReminderPrompt: !reminderEnabled,
        reminderTimeLabel: "20:00",
        ...cardDisplay,
      });

      if (firstItems[0]?.type === "word") {
        void speakText((firstItems[0].content as WordContent).word, {
          silent: true,
        });
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "加载失败，请重试";
      setData({ loading: false, loadError: msg });
      showToast({ title: msg, icon: "none" });
    }
  }, [lessonId, mode, setData, showToast]);

  useEffect(() => {
    void prepare();
    return () => {
      stopAudio();
    };
  }, [prepare]);

  function getCurrentItem(
    stage = ref.current.stage,
    itemIndex = ref.current.itemIndex,
  ): LearningItem | null {
    const stageItems = ref.current.items.filter((i) => i.type === stage);
    return stageItems[itemIndex] || null;
  }

  function openCurrentLesson() {
    const item = getCurrentItem();
    const targetId = item?.lessonId || ref.current.lessonId || "lesson-smalltalk";
    navigateTo(
      `/packages/study/pages/lesson-detail/index?id=${encodeURIComponent(targetId)}`,
    );
  }

  function reveal() {
    setData({ revealed: true });
    const item = getCurrentItem();
    if (item?.type === "expression") {
      void speakText((item.content as ExpressionContent).expression, {
        silent: true,
      });
    }
  }

  function onSpeak(e: React.MouseEvent) {
    e.stopPropagation();
    if (ref.current.stage !== "grammar" && ref.current.currentPrompt) {
      void speakText(ref.current.currentPrompt);
    }
  }

  function finishFlow() {
    stopAudio();
    setData({ stage: "done" });
  }

  function advanceToStage(nextIdx: number, nextDoneCount: number) {
    const stages = ref.current.stages;
    if (nextIdx >= stages.length) {
      setData({ doneCount: nextDoneCount, stage: "done" });
      return;
    }
    const nextStage = stages[nextIdx].key;
    const stageItems = ref.current.items.filter((i) => i.type === nextStage);
    const firstItem = stageItems[0] || null;
    const cardDisplay = buildCardDisplay(firstItem);
    const firstTask = ref.current.sentenceTasks[0] || null;
    const prefill =
      firstTask?.id === "st-1"
        ? QUICK_SAMPLE_SENTENCE
        : firstTask?.reference || QUICK_SAMPLE_SENTENCE;

    setData({
      stageIndex: nextIdx,
      stage: nextStage,
      itemIndex: 0,
      revealed: false,
      sentenceTaskIndex: 0,
      sentenceTask: firstTask,
      sentenceInput: prefill,
      sentenceFeedback: "",
      sentenceSubmitted: false,
      hasInput: prefill.trim().length > 0,
      doneCount: nextDoneCount,
      ...cardDisplay,
    });

    if (firstItem?.type === "word") {
      void speakText((firstItem.content as WordContent).word, { silent: true });
    }
  }

  function answerCard(result: RecallResult) {
    if (!ref.current.revealed) return;
    const item = getCurrentItem();
    if (!item) return;
    void mateService.submitRecall(item.id, result);
    stopAudio();

    const stageItems = ref.current.items.filter(
      (i) => i.type === ref.current.stage,
    );
    const nextIndex = ref.current.itemIndex + 1;
    const nextDone = ref.current.doneCount + 1;

    if (nextIndex >= stageItems.length) {
      advanceToStage(ref.current.stageIndex + 1, nextDone);
    } else {
      const nextItem = stageItems[nextIndex] || null;
      const cardDisplay = buildCardDisplay(nextItem);
      setData({
        doneCount: nextDone,
        itemIndex: nextIndex,
        revealed: false,
        ...cardDisplay,
      });
      if (nextItem?.type === "word") {
        void speakText((nextItem.content as WordContent).word, { silent: true });
      }
    }
  }

  function onSentenceInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const v = e.target.value;
    setData({ sentenceInput: v, hasInput: v.trim().length > 0 });
  }

  async function submitSentence() {
    const task = ref.current.sentenceTask;
    if (!task || !ref.current.hasInput) return;
    showLoading({ title: "AI 批改中…", mask: true });
    try {
      const result = await mateService.saveSentenceAttempt({
        lessonId: task.lessonId,
        taskId: task.id,
        taskType: task.type,
        prompt: task.instruction,
        hintExpression: task.hintExpression,
        keywords: task.keywords,
        userSentence: ref.current.sentenceInput,
        polishStyle: ref.current.defaultStyle,
      });
      const styled = result.feedback.styles?.[ref.current.defaultStyle];
      setData({
        sentenceSubmitted: true,
        sentenceFeedback: styled || result.feedback.corrected,
        doneCount: ref.current.doneCount + 1,
      });
      hideLoading();
    } catch {
      hideLoading();
      showToast({ title: "批改失败", icon: "none" });
    }
  }

  function nextSentence() {
    const next = ref.current.sentenceTaskIndex + 1;
    if (next >= ref.current.sentenceTasks.length) {
      advanceToStage(ref.current.stageIndex + 1, ref.current.doneCount);
      return;
    }
    const nextTask = ref.current.sentenceTasks[next];
    const prefill = nextTask?.reference || "";
    setData({
      sentenceTaskIndex: next,
      sentenceTask: nextTask,
      sentenceInput: prefill,
      sentenceFeedback: "",
      sentenceSubmitted: false,
      hasInput: prefill.trim().length > 0,
    });
  }

  async function subscribeReminder() {
    try {
      await mateService.updateReminder({ enabled: true, hour: 20, minute: 0 });
      setData({ showReminderPrompt: false });
      showToast({ title: "已开启明晚 20:00 学习提醒", icon: "success" });
    } catch {
      showToast({ title: "提醒设置失败，可在设置中重试", icon: "none" });
    }
  }

  function openCheckin() {
    if (ref.current.checkinPreparing) return;
    setData({ shareVisible: true });
  }

  function closeShare() {
    setData({ shareVisible: false });
  }

  function goPractice() {
    const scenario = ref.current.scenario;
    if (scenario) {
      navigateTo(
        `/packages/practice/pages/session/index?scenarioId=${scenario.id}&lessonId=${scenario.lessonId}&mode=guided`,
      );
    }
  }

  function done() {
    switchTab("/pages/home/index");
  }

  function toLesson() {
    if (ref.current.lessonId) {
      redirectTo(
        `/packages/study/pages/lesson-detail/index?id=${ref.current.lessonId}`,
      );
    } else {
      switchTab("/pages/lessons/index");
    }
  }

  function goAdd() {
    redirectTo("/packages/material/pages/add/index");
  }

  return (
    <>
      {data.loading ? (
        <div className="page">
          <div className="empty">
            <span className="muted">正在准备学习内容…</span>
          </div>
        </div>
      ) : data.loadError ? (
        <div className="page">
          <div className="empty">
            <div className="empty__title">学习内容加载失败</div>
            <span className="muted">{data.loadError}</span>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => void prepare()}
            >
              重试
            </button>
          </div>
        </div>
      ) : data.stage !== "done" && data.stage !== "empty" ? (
        <div className="page quick-page">
          {data.recallSyncFailed ? (
            <div className="sync-notice">
              <span>学习记录待同步 {data.pendingRecalls} 项</span>
              <button type="button">重试同步</button>
            </div>
          ) : null}

          <div className="quick-progress">
            <div className="row row--between">
              <span className="muted">
                {data.stageIndex + 1} / {data.stages.length} ·{" "}
                {data.stages[data.stageIndex]?.label}
              </span>
              <span className="muted">
                已看过 {data.doneCount} / {data.totalCount}
              </span>
            </div>
            <div className="progress-track progress-track--thin">
              <div
                className="progress-fill"
                style={{
                  width: `${
                    data.totalCount
                      ? (data.doneCount / data.totalCount) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          {data.stage === "word" ||
          data.stage === "expression" ||
          data.stage === "grammar" ? (
            <>
              <div className="quick-reading">
                <div className="prompt-row">
                  <span className={`word-hero ${data.currentPromptClass}`}>
                    {data.currentPrompt}
                  </span>
                  {data.stage === "word" ||
                  (data.stage === "expression" && data.revealed) ? (
                    <button
                      type="button"
                      className="speaker speaker-button"
                      aria-label="播放发音"
                      onClick={onSpeak}
                    >
                      <MateIcon name="volume-2" size={20} tone="ink" />
                    </button>
                  ) : null}
                </div>
                <div className="prompt-meta">
                  <span className="content-type">
                    {data.stage === "word"
                      ? "单词"
                      : data.stage === "expression"
                        ? "经典表达"
                        : "语法结构"}
                  </span>
                  {data.currentSub ? <span>{data.currentSub}</span> : null}
                </div>
                {data.revealed ? (
                  <div className="quick-answer">
                    <span className="quick-meaning">{data.currentBackTitle}</span>
                    {data.currentBackLines.map((line, idx) => (
                      <span key={idx} className="answer-line">
                        {line}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="quick-hint">
                    <div>先回忆它的意思，</div>
                    <div>再看看自己记住了多少。</div>
                  </div>
                )}
                <button
                  type="button"
                  className="quick-source"
                  onClick={openCurrentLesson}
                >
                  <MateIcon name="book-open" size={17} tone="muted" />
                  <span>查看这条内容所属的资料</span>
                  <MateIcon name="chevron-right" size={16} tone="muted" />
                </button>
              </div>
              <div className="study-footer">
                {!data.revealed ? (
                  <button
                    type="button"
                    className="btn btn--primary btn--block"
                    onClick={reveal}
                  >
                    查看答案{" "}
                    <MateIcon name="chevron-right" size={18} tone="inverse" />
                  </button>
                ) : (
                  <>
                    <div className="rating-label">你掌握得怎么样？</div>
                    <div className="ratings">
                      <button
                        type="button"
                        className="rating rating--unfamiliar"
                        onClick={() => answerCard("unfamiliar")}
                      >
                        不熟
                      </button>
                      <button
                        type="button"
                        className="rating"
                        onClick={() => answerCard("impression")}
                      >
                        有印象
                      </button>
                      <button
                        type="button"
                        className="rating rating--mastered"
                        onClick={() => answerCard("mastered")}
                      >
                        掌握
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : null}

          {data.stage === "sentence" && data.sentenceTask ? (
            <>
              <div className="sentence-question">
                <span className="question-text">
                  {data.sentenceTask.instruction}
                </span>
                {data.sentenceTask.hintExpression ? (
                  <span className="muted">
                    可用表达：{data.sentenceTask.hintExpression}
                  </span>
                ) : null}
              </div>
              {!data.sentenceSubmitted ? (
                <div className="field">
                  <div className="field__label">你的句子</div>
                  <textarea
                    className="textarea"
                    placeholder="输入你的英文句子…"
                    value={data.sentenceInput}
                    onChange={onSentenceInput}
                  />
                </div>
              ) : (
                <div className="quick-feedback">
                  <div className="feedback-original">
                    <span className="muted">你的原句</span>
                    <span className="answer-line">{data.sentenceInput}</span>
                  </div>
                  <div className="h3">AI 建议</div>
                  <span className="answer-line">{data.sentenceFeedback}</span>
                </div>
              )}
              <div className="study-footer">
                {!data.sentenceSubmitted ? (
                  <button
                    type="button"
                    className="btn btn--primary btn--block"
                    disabled={!data.hasInput}
                    onClick={() => void submitSentence()}
                  >
                    提交造句
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn--primary btn--block"
                    onClick={nextSentence}
                  >
                    继续
                  </button>
                )}
              </div>
            </>
          ) : null}

          {data.stage === "practice" && data.scenario ? (
            <div className="practice-brief">
              <div className="h1">{data.scenario.name}</div>
              <span className="practice-goal">{data.scenario.goal}</span>
              <div className="practice-roles">
                <span>你 · {data.scenario.userRole}</span>
                <span>AI · {data.scenario.aiRole}</span>
              </div>
              <button
                type="button"
                className="btn btn--primary btn--block"
                onClick={goPractice}
              >
                开始 AI 对练
              </button>
              <button
                type="button"
                className="btn btn--outline btn--block"
                onClick={finishFlow}
              >
                今天先练到这
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      {!data.loading && !data.loadError && data.stage === "done" ? (
        <div className="page">
          <div className="done-wrap">
            <MateIcon name="check" size={28} tone="accent" />
            <div className="h1">本次学习完成</div>
            <span className="muted">
              本次看过 {data.doneCount} 项 ·{" "}
              {data.pendingRecalls
                ? `学习记录待同步 ${data.pendingRecalls} 项`
                : "学习记录已保存"}
            </span>
            {data.recallSyncFailed ? (
              <button type="button" className="btn btn--ghost">
                重试同步
              </button>
            ) : null}
            <div className="done-checkin">
              <button
                type="button"
                className="btn btn--primary btn--block"
                onClick={openCheckin}
                disabled={data.checkinPreparing}
              >
                <MateIcon name="calendar-check" size={18} tone="inverse" />
                打卡分享今天的学习
              </button>
              <span className="muted">
                好友能看到你的连续天数和今天的学习数据
              </span>
            </div>
            {data.showReminderPrompt ? (
              <div className="done-reminder">
                <MateIcon name="bell" size={20} tone="accent" />
                <span className="grow">
                  明天 {data.reminderTimeLabel} 提醒我继续学习
                </span>
                <button
                  type="button"
                  className="btn btn--sm btn--secondary"
                  onClick={() => void subscribeReminder()}
                >
                  提醒我
                </button>
              </div>
            ) : null}
            <button
              type="button"
              className="btn btn--secondary btn--block"
              onClick={done}
            >
              回到首页
            </button>
            <button
              type="button"
              className="btn btn--ghost btn--block"
              onClick={toLesson}
            >
              查看学习单元
            </button>
          </div>
        </div>
      ) : null}

      {!data.loading && !data.loadError && data.stage === "empty" ? (
        <div className="page">
          <div className="done-wrap">
            <div className="h1">
              {data.emptyLesson ? "本单元暂无到期内容" : "还没有可学习内容"}
            </div>
            <span className="muted">
              {data.emptyLesson
                ? "可以先查看学习单元，或明天再来复习"
                : "先添加一份英语资料，生成学习单元后再开始"}
            </span>
            {!data.emptyLesson ? (
              <button
                type="button"
                className="btn btn--primary btn--block"
                onClick={goAdd}
              >
                添加学习资料
              </button>
            ) : null}
            <button
              type="button"
              className={`btn ${data.emptyLesson ? "btn--primary" : "btn--outline"} btn--block`}
              onClick={toLesson}
            >
              {data.emptyLesson ? "返回学习单元" : "查看学习单元"}
            </button>
          </div>
        </div>
      ) : null}

      <SharePanel
        show={data.shareVisible}
        kind="checkin"
        onClose={closeShare}
      />
    </>
  );
}
