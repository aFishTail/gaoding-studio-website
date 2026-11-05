"use client";

import { useCallback, useEffect } from "react";
import { MateIcon } from "../components/MateIcon";
import { SharePanel } from "../components/SharePanel";
import { mateService, subscribeDemoState } from "../mock/service";
import { useEmRouter } from "../runtime/router";
import { useSetData } from "../runtime/useSetData";
import { useWx } from "../runtime/wx";
import type { LessonDetail } from "../types";

interface SectionStats {
  label: string;
  done: number;
  total: number;
  percent: number;
}

export function LessonDetailPage({ query }: { query: Record<string, string> }) {
  const { navigateTo, switchTab, navigateBack, showSeq } = useEmRouter();
  const { showToast, showModal, showActionSheet } = useWx();

  const lessonId = query.id || "lesson-smalltalk";

  const [data, setData, ref] = useSetData({
    lesson: null as LessonDetail | null,
    lessonId,
    loading: true,
    loadError: "",
    sections: [] as SectionStats[],
    overall: 0,
    levelLabel: "",
    masteredCount: 0,
    masteryTotal: 0,
    started: false,
    shareVisible: false,
  });

  const load = useCallback(async () => {
    setData({ loading: true, loadError: "", lessonId });
    try {
      const lesson = await mateService.getLesson(lessonId);
      const masteryItems = [
        ...lesson.words,
        ...lesson.expressions,
        ...lesson.grammars,
      ];
      const sentenceTotal =
        lesson.sentenceTasks.length ||
        Math.max(lesson.sentencesDone, lesson.sentenceCount);
      const sentenceDone = sentenceTotal
        ? Math.min(lesson.sentencesDone, sentenceTotal)
        : 0;
      const practiceTotal = Math.max(lesson.practicesDone, lesson.scenarioCount);
      const practiceDone = practiceTotal
        ? Math.min(lesson.practicesDone, practiceTotal)
        : 0;
      const sections: SectionStats[] = [
        {
          label: "单词",
          done: lesson.wordsLearned,
          total: lesson.words.length,
          percent: lesson.words.length
            ? Math.round((lesson.wordsLearned / lesson.words.length) * 100)
            : 0,
        },
        {
          label: "经典表达",
          done: lesson.expressionsLearned,
          total: lesson.expressions.length,
          percent: lesson.expressions.length
            ? Math.round(
                (lesson.expressionsLearned / lesson.expressions.length) * 100,
              )
            : 0,
        },
        {
          label: "语法",
          done: lesson.grammarsLearned,
          total: lesson.grammars.length,
          percent: lesson.grammars.length
            ? Math.round((lesson.grammarsLearned / lesson.grammars.length) * 100)
            : 0,
        },
        {
          label: "造句",
          done: sentenceDone,
          total: sentenceTotal,
          percent: sentenceTotal
            ? Math.round((sentenceDone / sentenceTotal) * 100)
            : 0,
        },
        {
          label: "AI 对练",
          done: practiceDone,
          total: practiceTotal,
          percent: practiceTotal
            ? Math.round((practiceDone / practiceTotal) * 100)
            : 0,
        },
      ];
      setData({
        lesson,
        lessonId: lesson.id,
        sections,
        overall: lesson.progress,
        masteredCount: masteryItems.filter((item) => item.mastery === "mastered")
          .length,
        masteryTotal: masteryItems.length,
        started:
          lesson.progress > 0 ||
          Boolean(lesson.lastStudiedAt) ||
          lesson.wordsLearned +
            lesson.expressionsLearned +
            lesson.grammarsLearned +
            lesson.sentencesDone +
            lesson.practicesDone >
            0,
        loading: false,
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "加载失败，请重试";
      setData({ loading: false, loadError: msg });
      showToast({
        title: error instanceof Error ? error.message : "加载失败",
        icon: "none",
      });
    }
  }, [lessonId, setData, showToast]);

  useEffect(() => {
    void load();
  }, [load, showSeq]);

  useEffect(() => {
    return subscribeDemoState(() => {
      void load();
    });
  }, [load]);

  function startWords() {
    const id = ref.current.lesson?.id || lessonId;
    navigateTo(
      `/packages/study/pages/review/index?lessonId=${id}&type=word&practice=1`,
    );
  }

  function startExpressions() {
    const id = ref.current.lesson?.id || lessonId;
    navigateTo(
      `/packages/study/pages/review/index?lessonId=${id}&type=expression&practice=1`,
    );
  }

  function startGrammars() {
    const id = ref.current.lesson?.id || lessonId;
    navigateTo(
      `/packages/study/pages/review/index?lessonId=${id}&type=grammar&practice=1`,
    );
  }

  function startSentences() {
    const id = ref.current.lesson?.id || lessonId;
    navigateTo(`/packages/study/pages/sentence/index?lessonId=${id}`);
  }

  function startGame() {
    const id = ref.current.lesson?.id || lessonId;
    navigateTo(`/packages/study/pages/game/index?lessonId=${id}`);
  }

  function startSpelling() {
    const id = ref.current.lesson?.id || lessonId;
    navigateTo(`/packages/study/pages/spelling/index?lessonId=${id}`);
  }

  function openScenario(scenarioId: string) {
    const id = ref.current.lesson?.id || lessonId;
    navigateTo(
      `/packages/practice/pages/session/index?scenarioId=${scenarioId}&lessonId=${id}`,
    );
  }

  function openSource() {
    const id = ref.current.lesson?.id || lessonId;
    navigateTo(`/packages/material/pages/source/index?id=${id}`);
  }

  function continueLearning() {
    const id = ref.current.lesson?.id || lessonId;
    navigateTo(`/packages/study/pages/quick-learn/index?lessonId=${id}`);
  }

  function goPracticeTab() {
    switchTab("/pages/practice/index");
  }

  function openShare() {
    if (!ref.current.lesson) return;
    setData({ shareVisible: true });
  }

  function closeShare() {
    setData({ shareVisible: false });
  }

  function editLesson() {
    const id = ref.current.lesson?.id || lessonId;
    navigateTo(
      `/packages/study/pages/lesson-edit/index?id=${encodeURIComponent(id)}`,
    );
  }

  async function deleteLesson() {
    const lesson = ref.current.lesson;
    if (!lesson) return;
    const res = await showModal({
      title: "删除学习单元",
      content: `删除「${lesson.name}」将同时删除关联的单词、表达、句子和学习记录；若没有其他单元使用该资料，原始文本与上传文件也会一并删除。已收藏的句子会保留。`,
      confirmText: "删除",
      confirmColor: "#EB7F6A",
    });
    if (!res.confirm) return;
    try {
      await mateService.deleteLesson(lesson.id);
      showToast({ title: "已删除", icon: "success" });
      setTimeout(() => navigateBack(), 600);
    } catch (error) {
      showToast({
        title: error instanceof Error ? error.message : "删除失败",
        icon: "none",
      });
    }
  }

  async function openLessonMenu() {
    if (!ref.current.lesson) return;
    const res = await showActionSheet({
      itemList: ["分享学习单元", "编辑学习单元", "删除学习单元"],
      itemColor: "#252A28",
    });
    if (!res) return;
    if (res.tapIndex === 0) openShare();
    else if (res.tapIndex === 1) editLesson();
    else if (res.tapIndex === 2) void deleteLesson();
  }

  const { lesson } = data;

  return (
    <>
      {data.loading && !lesson ? (
        <div className="page">
          <div className="empty">
            <span className="muted">正在读取学习资料…</span>
          </div>
        </div>
      ) : !lesson && data.loadError ? (
        <div className="page">
          <div className="empty">
            <div className="empty__title">学习资料加载失败</div>
            <span className="muted">{data.loadError}</span>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => void load()}
            >
              重试
            </button>
          </div>
        </div>
      ) : lesson ? (
        <div className="page detail-page">
          <div className="detail-head">
            <div className="grow">
              <div className="h1 lesson-title">{lesson.name}</div>
              {lesson.summary ? (
                <span className="lesson-summary">{lesson.summary}</span>
              ) : null}
            </div>
            <button
              type="button"
              className="head-more"
              onClick={openShare}
              aria-label="分享给好友"
            >
              <MateIcon name="share-2" size={22} tone="muted" />
            </button>
            <button
              type="button"
              className="head-more"
              onClick={() => void openLessonMenu()}
              aria-label="学习单元操作"
            >
              <MateIcon name="ellipsis" size={24} tone="muted" />
            </button>
          </div>

          {lesson.origin ? (
            <div className="source-entry source-entry--origin">
              <MateIcon name="user-plus" size={18} tone="muted" />
              <span>来自 {lesson.origin.sharerNickname || "好友"} 的分享</span>
            </div>
          ) : (
            <button
              type="button"
              className="source-entry"
              onClick={openSource}
            >
              <MateIcon name="file-text" size={18} tone="muted" />
              <span>查看原始资料</span>
              <MateIcon name="chevron-right" size={16} tone="muted" />
            </button>
          )}

          {(lesson.shareImports || 0) > 0 ? (
            <span className="share-imports">
              已有 {lesson.shareImports} 位好友添加了这个单元
            </span>
          ) : null}

          <div className="detail-progress">
            <div className="row row--between">
              <span>已学习 {lesson.progress}%</span>
              {data.masteryTotal ? (
                <span>
                  已掌握 {data.masteredCount} / {data.masteryTotal}
                </span>
              ) : null}
            </div>
            <div className="progress-track progress-track--thin">
              <div
                className="progress-fill"
                style={{ width: `${lesson.progress}%` }}
              />
            </div>
            <span className="progress-note">
              进度包含回忆与造句；掌握数量按熟练阶段计算
            </span>
          </div>

          <div className="section-head">
            <div className="h2">回忆</div>
          </div>

          <div className="study-section" onClick={startWords}>
            <div className="grow">
              <div className="section-line">
                <span className="h3">单词</span>
                <span className="sec-count">
                  {lesson.wordsLearned} / {lesson.words.length} 已学习
                </span>
              </div>
              <span className="muted">听发音，回忆含义</span>
            </div>
            <MateIcon name="chevron-right" size={18} tone="muted" />
          </div>

          <div className="study-section" onClick={startExpressions}>
            <div className="grow">
              <div className="section-line">
                <span className="h3">经典表达</span>
                <span className="sec-count">
                  {lesson.expressionsLearned} / {lesson.expressions.length} 已学习
                </span>
              </div>
              <span className="muted">回忆表达与使用场景</span>
            </div>
            <MateIcon name="chevron-right" size={18} tone="muted" />
          </div>

          <div className="study-section" onClick={startGrammars}>
            <div className="grow">
              <div className="section-line">
                <span className="h3">语法</span>
                <span className="sec-count">
                  {lesson.grammarsLearned} / {lesson.grammars.length} 已学习
                </span>
              </div>
              <span className="muted">理解结构，回看原文例句</span>
            </div>
            <MateIcon name="chevron-right" size={18} tone="muted" />
          </div>

          <div className="review-tools">
            <button type="button" onClick={startSpelling}>
              <MateIcon name="pencil" size={18} tone="ink" />
              单词拼写
            </button>
            <button type="button" onClick={startGame}>
              <MateIcon name="layout-grid" size={18} tone="ink" />
              单词消消乐
            </button>
          </div>

          <div className="section-head">
            <div className="h2">造句</div>
          </div>

          <div className="study-section" onClick={startSentences}>
            <div className="grow">
              <div className="section-line">
                <span className="h3">把内容写成自己的句子</span>
                <span className="sec-count">{lesson.sentencesDone} 次</span>
              </div>
              <span className="muted">作答后查看纠错与润色</span>
            </div>
            <MateIcon name="chevron-right" size={18} tone="muted" />
          </div>

          <div className="section-head">
            <div className="h2">对练</div>
            <button
              type="button"
              className="more-link"
              onClick={goPracticeTab}
            >
              全部场景
            </button>
          </div>

          {lesson.scenarios.map((item) => (
            <div
              key={item.id}
              className="scenario-item"
              onClick={() => openScenario(item.id)}
            >
              <div className="scenario-head">
                <span className="scenario-title">{item.name}</span>
                <MateIcon name="chevron-right" size={18} tone="muted" />
              </div>
              <span className="scenario-goal">{item.goal}</span>
            </div>
          ))}

          {!lesson.scenarios.length ? (
            <span className="muted">这份资料还没有对练场景</span>
          ) : null}

          <div className="action-bar">
            <button
              type="button"
              className="btn btn--primary btn--block"
              onClick={continueLearning}
            >
              {data.started ? "继续学习" : "开始学习"}{" "}
              <MateIcon name="chevron-right" size={18} tone="inverse" />
            </button>
          </div>
        </div>
      ) : null}

      <SharePanel
        show={data.shareVisible}
        kind="lesson"
        sourceId={lesson?.id || lessonId}
        onClose={closeShare}
      />
    </>
  );
}
