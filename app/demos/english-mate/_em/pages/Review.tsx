"use client";

import { useCallback, useEffect } from "react";
import { MateIcon } from "../components/MateIcon";
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
  RecallResult,
  WordContent,
} from "../types";

interface RevealCard {
  item: LearningItem;
  prompt: string;
  promptClass: string;
  frontLabel: string;
  subPrompt: string;
  backTitle: string;
  backLines: string[];
  backTail?: string;
  speakerText: string;
}

const TYPE_TITLES: Record<ItemType, string> = {
  word: "单词回忆",
  expression: "表达回忆",
  grammar: "语法回忆",
};

const TYPE_BACK_HINTS: Record<ItemType, string> = {
  word: "查看答案",
  expression: "查看答案",
  grammar: "查看说明",
};

const TYPE_FRONT_LABELS: Record<ItemType, string> = {
  word: "单词",
  expression: "经典表达",
  grammar: "语法结构",
};

function toCard(item: LearningItem, type: ItemType): RevealCard {
  const frontLabel = TYPE_FRONT_LABELS[type];
  if (type === "word") {
    const c = item.content as WordContent;
    return {
      item,
      prompt: c.word,
      promptClass: promptScaleClass(c.word),
      frontLabel,
      subPrompt: [c.phonetic, c.pos].filter(Boolean).join(" · "),
      backTitle: c.meaning,
      backLines: [
        ...(c.collocations?.length ? [`搭配：${c.collocations.join(" / ")}`] : []),
        `例句：${c.simpleSentence}`,
      ],
      backTail: c.originalSentence ? `原文：${c.originalSentence}` : "",
      speakerText: c.word,
    };
  }
  if (type === "expression") {
    const c = item.content as ExpressionContent;
    return {
      item,
      prompt: c.expression,
      promptClass: promptScaleClass(c.expression),
      frontLabel,
      subPrompt: "",
      backTitle: c.meaning,
      backLines: [
        ...(c.usage ? [`说明：${c.usage}`] : []),
        ...(c.scenario ? [`场景：${c.scenario}`] : []),
      ],
      backTail: c.originalSentence ? `例句：${c.originalSentence}` : "",
      speakerText: c.expression,
    };
  }
  const c = item.content as GrammarContent;
  const prompt = c.structure || c.name;
  return {
    item,
    prompt,
    promptClass: promptScaleClass(prompt),
    frontLabel,
    subPrompt: "",
    backTitle: c.name,
    backLines: [
      c.rule ? `规则：${c.rule}` : "",
      c.example ? `示例：${c.example}` : "",
    ].filter(Boolean),
    backTail: c.originalSentence ? `原文：${c.originalSentence}` : "",
    speakerText: "",
  };
}

export function ReviewPage({ query }: { query: Record<string, string> }) {
  const { navigateTo, navigateBack } = useEmRouter();
  const { showToast, setNavigationBarTitle } = useWx();

  const rawType = query.type as ItemType | undefined;
  const type: ItemType =
    rawType === "expression" || rawType === "grammar" ? rawType : "word";
  const lessonId = query.lessonId || "lesson-smalltalk";

  const [data, setData, ref] = useSetData({
    lessonId,
    lessonName: "",
    type,
    items: [] as LearningItem[],
    cards: [] as RevealCard[],
    index: 0,
    revealed: false,
    submitting: false,
    finished: false,
    loading: true,
    loadError: "",
    doneCount: 0,
    totalCount: 0,
    progressPercent: 0,
    levelLabel: "",
    resultCounts: {
      unfamiliar: 0,
      impression: 0,
      mastered: 0,
    } as Record<RecallResult, number>,
    emptyDue: false,
    emptyTitle: "",
    pageTitle: TYPE_TITLES[type],
    revealLabel: TYPE_BACK_HINTS[type],
    pendingRecalls: 0,
    recallSyncFailed: false,
    practiceMode: false,
    practiceAvailable: 0,
    hasContent: false,
  });

  useEffect(() => {
    setNavigationBarTitle(TYPE_TITLES[type]);
    return () => {
      stopAudio();
    };
  }, [type, setNavigationBarTitle]);

  const loadCards = useCallback(
    async (wantPractice?: boolean) => {
      setData({
        loading: true,
        loadError: "",
        lessonId,
        type,
        pageTitle: TYPE_TITLES[type],
        revealLabel: TYPE_BACK_HINTS[type],
      });
      try {
        const lesson = await mateService.getLesson(lessonId);
        const allOfType =
          type === "word"
            ? lesson.words
            : type === "expression"
              ? lesson.expressions
              : lesson.grammars;

        // Always load all items of the requested type so the flashcard view is immediately active
        const ordered = [...allOfType];
        const cards: RevealCard[] = ordered.map((item) => toCard(item, type));
        const practiceMode = Boolean(wantPractice);

        setData({
          lessonId: lesson.id,
          lessonName: lesson.name || "",
          items: ordered,
          cards,
          index: 0,
          doneCount: 0,
          finished: false,
          loading: false,
          totalCount: cards.length,
          progressPercent: 0,
          revealed: query.revealed === "1",
          practiceMode,
          practiceAvailable: allOfType.length,
          hasContent: allOfType.length > 0,
          emptyDue: false,
          emptyTitle:
            cards.length > 0
              ? ""
              : `这个单元还没有${
                  type === "word" ? "单词" : type === "expression" ? "表达" : "语法"
                }内容`,
          resultCounts: { unfamiliar: 0, impression: 0, mastered: 0 },
        });

        if (type === "word" && cards[0]?.speakerText) {
          void speakText(cards[0].speakerText, { silent: true });
        }
      } catch (error) {
        const msg =
          error instanceof Error && error.message
            ? error.message
            : "加载失败，请重试";
        setData({ loading: false, loadError: msg });
      }
    },
    [lessonId, query.revealed, setData, type],
  );

  useEffect(() => {
    void loadCards(false);
  }, [loadCards]);

  function openLesson() {
    const id = ref.current.lessonId || lessonId;
    if (id) {
      navigateTo(
        `/packages/study/pages/lesson-detail/index?id=${encodeURIComponent(id)}`,
      );
    }
  }

  function reveal() {
    const cards = ref.current.cards;
    if (!cards.length) return;
    const card = cards[ref.current.index];
    setData({ revealed: true });
    if (ref.current.type === "expression" && card?.speakerText) {
      void speakText(card.speakerText, { silent: true });
    }
  }

  function onSpeak(e: React.MouseEvent) {
    e.stopPropagation();
    const card = ref.current.cards[ref.current.index];
    if (ref.current.type !== "grammar" && card?.speakerText) {
      void speakText(card.speakerText);
    }
  }

  function submitResult(result: RecallResult) {
    if (ref.current.submitting || !ref.current.revealed) return;
    const card = ref.current.cards[ref.current.index];
    if (!card) return;
    setData({ submitting: true });
    try {
      void mateService.submitRecall(
        card.item.id,
        result,
        undefined,
        undefined,
        ref.current.practiceMode,
      );
      stopAudio();
      const done = ref.current.doneCount + 1;
      const counts = { ...ref.current.resultCounts };
      counts[result] += 1;
      const next = ref.current.index + 1;

      if (next >= ref.current.cards.length) {
        setData({
          doneCount: done,
          resultCounts: counts,
          submitting: false,
          finished: true,
          progressPercent: 100,
        });
      } else {
        const nextCard = ref.current.cards[next];
        setData({
          doneCount: done,
          resultCounts: counts,
          submitting: false,
          index: next,
          revealed: false,
          progressPercent: Math.round((done / ref.current.totalCount) * 100),
        });
        if (ref.current.type === "word" && nextCard?.speakerText) {
          void speakText(nextCard.speakerText, { silent: true });
        }
      }
    } catch (error) {
      setData({ submitting: false });
      showToast({
        title: error instanceof Error ? error.message : "提交失败",
        icon: "none",
      });
    }
  }

  function startPractice() {
    stopAudio();
    void loadCards(true);
  }

  function doneExit() {
    navigateBack();
  }

  function goPracticeSentence() {
    const id = ref.current.lessonId || lessonId;
    navigateTo(`/packages/study/pages/sentence/index?lessonId=${id}`);
  }

  const currentCard = data.cards[data.index];

  return (
    <div className="page review-page">
      {data.loading ? (
        <div className="empty">
          <div className="empty__desc">正在加载学习内容…</div>
        </div>
      ) : data.loadError ? (
        <div className="empty">
          <div className="empty__title">学习内容加载失败</div>
          <div className="empty__desc">{data.loadError}</div>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => void loadCards(false)}
          >
            重试
          </button>
        </div>
      ) : (
        <>
          {data.recallSyncFailed && !data.finished ? (
            <div className="sync-notice">
              <span>学习记录待同步 {data.pendingRecalls} 项</span>
              <button type="button">重试同步</button>
            </div>
          ) : null}

          {!data.finished && data.cards.length > 0 && currentCard ? (
            <>
              <div className="review-progress">
                {data.practiceMode ? (
                  <div className="practice-tag">巩固练习 · 不推进复习间隔</div>
                ) : null}
                <div className="row row--between">
                  <span className="muted">
                    第 {data.index + 1} / {data.totalCount} 张
                  </span>
                  <span className="muted">{data.doneCount} 已评价</span>
                </div>
                <div className="progress-track progress-track--thin">
                  <div
                    className="progress-fill"
                    style={{ width: `${data.progressPercent}%` }}
                  />
                </div>
              </div>

              <div className="review-reading">
                <div className="prompt-row">
                  <span className={`word-hero ${currentCard.promptClass}`}>
                    {currentCard.prompt}
                  </span>
                  {data.type === "word" ||
                  (data.type === "expression" && data.revealed) ? (
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
                  <span className="content-type">{currentCard.frontLabel}</span>
                  {currentCard.subPrompt ? (
                    <span>{currentCard.subPrompt}</span>
                  ) : null}
                </div>

                {data.revealed ? (
                  <div className="review-answer">
                    <span className="review-meaning">
                      {currentCard.backTitle}
                    </span>
                    {currentCard.backLines.map((line, idx) => (
                      <span key={idx} className="review-line">
                        {line}
                      </span>
                    ))}
                    {currentCard.backTail ? (
                      <span className="review-origin">
                        {currentCard.backTail}
                      </span>
                    ) : null}
                  </div>
                ) : (
                  <div className="review-hint">
                    <div>先回忆它的意思，</div>
                    <div>再看看自己记住了多少。</div>
                  </div>
                )}

                {data.lessonName ? (
                  <button
                    type="button"
                    className="review-source"
                    onClick={openLesson}
                  >
                    <MateIcon name="book-open" size={17} tone="muted" />
                    <div>
                      <span className="muted">来自你的资料</span>
                      <span className="source-name">{data.lessonName}</span>
                    </div>
                  </button>
                ) : null}
              </div>

              <div className="study-footer">
                {!data.revealed ? (
                  <button
                    type="button"
                    className="btn btn--primary btn--block"
                    onClick={reveal}
                  >
                    {data.revealLabel}{" "}
                    <MateIcon name="chevron-right" size={18} tone="inverse" />
                  </button>
                ) : (
                  <>
                    <div className="rating-label">你掌握得怎么样？</div>
                    <div className="ratings">
                      <button
                        type="button"
                        className="rating rating--unfamiliar"
                        onClick={() => submitResult("unfamiliar")}
                        disabled={data.submitting}
                      >
                        不熟
                      </button>
                      <button
                        type="button"
                        className="rating"
                        onClick={() => submitResult("impression")}
                        disabled={data.submitting}
                      >
                        有印象
                      </button>
                      <button
                        type="button"
                        className="rating rating--mastered"
                        onClick={() => submitResult("mastered")}
                        disabled={data.submitting}
                      >
                        掌握
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : null}

          {!data.finished && data.cards.length === 0 ? (
            <div className="empty">
              <div className="empty__title">{data.emptyTitle}</div>
              {data.emptyDue && data.practiceAvailable ? (
                <div className="empty__desc">
                  可以继续巩固已学内容，不会打乱复习计划
                </div>
              ) : data.emptyDue ? (
                <div className="empty__desc">
                  可以稍后再来，或去我的英语里查看已学内容
                </div>
              ) : null}
              {data.emptyDue && data.practiceAvailable ? (
                <button
                  type="button"
                  className="btn btn--primary btn--block"
                  onClick={startPractice}
                >
                  继续巩固
                </button>
              ) : null}
              <button
                type="button"
                className={`btn btn--ghost ${
                  data.emptyDue && data.practiceAvailable ? "btn--block" : ""
                }`}
                onClick={doneExit}
              >
                返回
              </button>
            </div>
          ) : null}

          {data.finished ? (
            <div className="done-wrap">
              <MateIcon name="check" size={28} tone="accent" />
              <div className="h1">
                {data.practiceMode ? "本组巩固完成" : "本组学习完成"}
              </div>
              <div className="done-summary">
                <div>
                  <span className="done-num">{data.resultCounts.mastered}</span>
                  <span className="muted">掌握</span>
                </div>
                <div>
                  <span className="done-num">
                    {data.resultCounts.impression}
                  </span>
                  <span className="muted">有印象</span>
                </div>
                <div>
                  <span className="done-num">
                    {data.resultCounts.unfamiliar}
                  </span>
                  <span className="muted">不熟</span>
                </div>
              </div>
              <span className="muted">
                {data.practiceMode
                  ? "巩固结果不会推迟复习日期，不熟的内容已安排今天再练"
                  : "不熟的内容会更快出现在你的复习计划里"}
              </span>
              {data.pendingRecalls ? (
                <span className="muted">
                  学习记录待同步 {data.pendingRecalls} 项
                </span>
              ) : null}
              {data.recallSyncFailed ? (
                <button type="button" className="btn btn--ghost">
                  重试同步
                </button>
              ) : null}
              <button
                type="button"
                className="btn btn--primary btn--block"
                onClick={doneExit}
              >
                完成
              </button>
              {data.hasContent ? (
                <button
                  type="button"
                  className="btn btn--outline btn--block"
                  onClick={startPractice}
                >
                  继续巩固
                </button>
              ) : null}
              <button
                type="button"
                className="btn btn--outline btn--block"
                onClick={goPracticeSentence}
              >
                去造句练习
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
