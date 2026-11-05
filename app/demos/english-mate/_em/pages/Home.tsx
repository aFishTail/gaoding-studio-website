"use client";

import { useCallback, useEffect } from "react";
import { MateIcon } from "../components/MateIcon";
import { SharePanel } from "../components/SharePanel";
import { mateService, subscribeDemoState } from "../mock/service";
import { promptScaleClass } from "../runtime/prompt-size";
import { useEmRouter } from "../runtime/router";
import { speakText } from "../runtime/tts";
import { useSetData } from "../runtime/useSetData";
import { useWx } from "../runtime/wx";
import type { DashboardData, DashboardFocusContent } from "../types";

export function HomePage() {
  const { navigateTo, switchTab, showSeq } = useEmRouter();
  const { showToast } = useWx();

  const [data, setData, ref] = useSetData({
    dashboard: null as DashboardData | null,
    loading: true,
    todayLabel: "10月31日 · 周六",
    error: "",
    learningMode: "quick" as "quick" | "full",
    focus: null as DashboardFocusContent | null,
    focusClass: "",
    focusType: "",
    taskSummary: "",
    startLabel: "开始今日学习",
    startDisabled: false,
    shareVisible: false,
  });

  const refresh = useCallback(async () => {
    setData({ loading: true, error: "" });
    try {
      const dashboard = await mateService.getDashboard();
      const candidate = dashboard.hasQueue ? dashboard.focusContent : undefined;
      const focus =
        candidate &&
        typeof candidate.prompt === "string" &&
        candidate.prompt.trim() &&
        candidate.itemId &&
        candidate.lessonId &&
        candidate.lessonName
          ? candidate
          : null;
      const focusType = focus
        ? ({ word: "单词", expression: "经典表达", grammar: "语法" }[focus.type] || "")
        : "";
      const taskSummary = dashboard.todayTasks
        .filter((task) => task.total > task.done)
        .map((task) => `${task.total - task.done} 项${task.label}`)
        .join(" · ");
      const studiedToday =
        dashboard.todayDoneCount > 0 || dashboard.todayMinutesUsed > 0;

      setData({
        dashboard,
        loading: false,
        focus,
        focusType,
        focusClass: focus ? promptScaleClass(focus.prompt) : "",
        taskSummary,
        startLabel: studiedToday ? "继续今日学习" : "开始今日学习",
      });
    } catch {
      setData({ loading: false, error: "学习内容暂时未能加载，请重试。" });
    }
  }, [setData]);

  useEffect(() => {
    void refresh();
  }, [refresh, showSeq]);

  useEffect(() => {
    return subscribeDemoState(() => {
      void refresh();
    });
  }, [refresh]);

  function startLearning() {
    const dashboard = ref.current.dashboard;
    if (!dashboard?.hasQueue) {
      showToast({ title: "今天还没有待学习内容", icon: "none" });
      return;
    }
    if (ref.current.learningMode === "full") {
      navigateTo("/packages/study/pages/quick-learn/index?mode=full");
    } else {
      navigateTo("/packages/study/pages/quick-learn/index");
    }
  }

  const { dashboard } = data;

  return (
    <>
      <div className="page page--tab home-page">
        <div className="home-head row row--between">
          <div>
            <div className="h1">今天</div>
            <span className="home-date">{data.todayLabel}</span>
          </div>
          <button
            type="button"
            className="home-add"
            onClick={() => navigateTo("/packages/material/pages/add/index")}
          >
            <MateIcon name="plus" size={18} tone="accent" />
            添加资料
          </button>
        </div>

        {data.error ? (
          <div className="home-error">
            <MateIcon name="x" size={18} tone="accent" />
            <span className="grow">{data.error}</span>
            <button
              type="button"
              className="btn btn--sm btn--secondary"
              onClick={() => void refresh()}
            >
              重试
            </button>
          </div>
        ) : null}

        {dashboard ? (
          <>
            {dashboard.hasQueue ? (
              <>
                {data.focus ? (
                  <div className="home-focus">
                    <div className="home-focus-line">
                      <span className={`word-hero ${data.focusClass}`}>
                        {data.focus.prompt}
                      </span>
                      <button
                        type="button"
                        className="speaker"
                        onClick={() => void speakText(data.focus!.prompt)}
                        aria-label="播放英文发音"
                      >
                        <MateIcon name="volume-2" size={22} tone="ink" />
                      </button>
                    </div>
                    <div className="home-focus-meta">
                      <span>{data.focusType}</span>
                      <span className="muted">待学习</span>
                    </div>
                    <button
                      type="button"
                      className="home-source"
                      onClick={() =>
                        navigateTo(
                          `/packages/study/pages/lesson-detail/index?id=${encodeURIComponent(
                            data.focus!.lessonId,
                          )}`,
                        )
                      }
                    >
                      <MateIcon name="book-open" size={17} tone="muted" />
                      <div className="grow">
                        <div className="muted">来自你的资料</div>
                        <div className="home-source-name">
                          {data.focus.lessonName}
                        </div>
                      </div>
                    </button>
                  </div>
                ) : (
                  <div className="home-focus">
                    <div className="home-summary-title">继续今天的积累</div>
                    <div className="home-summary-copy">{data.taskSummary}</div>
                    {dashboard.recentLessons.length > 0 && (
                      <div className="home-summary-source">
                        资料：{dashboard.recentLessons[0].name}
                      </div>
                    )}
                  </div>
                )}

                <div className="mode-switch" role="radiogroup" aria-label="学习模式">
                  <button
                    type="button"
                    className={`mode-option ${data.learningMode === "quick" ? "mode-option--active" : ""}`}
                    onClick={() => setData({ learningMode: "quick" })}
                    role="radio"
                    aria-checked={data.learningMode === "quick"}
                  >
                    快速学习
                  </button>
                  <button
                    type="button"
                    className={`mode-option ${data.learningMode === "full" ? "mode-option--active" : ""}`}
                    onClick={() => setData({ learningMode: "full" })}
                    role="radio"
                    aria-checked={data.learningMode === "full"}
                  >
                    完整学习
                  </button>
                </div>

                <div className="mode-help">
                  {data.learningMode === "full"
                    ? "回忆、造句与 AI 对练"
                    : "回忆与造句"}{" "}
                  · 约 {dashboard.todayMinutes + (data.learningMode === "full" ? 8 : 0)} 分钟
                </div>

                <button
                  type="button"
                  className="btn btn--primary btn--block"
                  disabled={data.startDisabled}
                  onClick={startLearning}
                >
                  {data.startLabel}{" "}
                  <MateIcon name="chevron-right" size={18} tone="inverse" />
                </button>

                <div className="home-progress">
                  <span>
                    今日完成{" "}
                    <span className="home-progress-value">
                      {dashboard.todayDoneCount} / {dashboard.todayTotalCount} 项
                    </span>
                  </span>
                  <span>
                    已学{" "}
                    <span className="home-progress-value">
                      {dashboard.todayMinutesUsed} 分钟
                    </span>
                  </span>
                </div>
              </>
            ) : !dashboard.hasLearningContent ? (
              <div className="home-empty">
                <div className="home-empty-title">
                  从你的一份资料，<div>开始积累英语。</div>
                </div>
                <div className="home-empty-copy">
                  上传书页、PDF，或粘贴一段英文。
                  <div>把你想学的内容，变成自己的表达。</div>
                </div>
                <button
                  type="button"
                  className="btn btn--primary btn--block"
                  onClick={() => navigateTo("/packages/material/pages/add/index")}
                >
                  添加第一份资料 <MateIcon name="plus" size={18} tone="inverse" />
                </button>
                <div className="home-empty-step">
                  <MateIcon name="file-text" size={20} tone="accent" />
                  <div>
                    <div>先整理，再由你确认</div>
                    <div className="muted">选择想学的单词、表达和语法。</div>
                  </div>
                </div>
                <div className="home-empty-step">
                  <MateIcon name="messages-square" size={20} tone="accent" />
                  <div>
                    <div>从回忆走到开口</div>
                    <div className="muted">用造句和场景对练，把内容用起来。</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="home-empty">
                <div className="home-empty-title">
                  今天的学习，<div>完成了。</div>
                </div>
                <div className="home-empty-copy">
                  现在没有待完成内容。
                  <div>你可以回看资料，或继续练习表达。</div>
                </div>
                <button
                  type="button"
                  className="btn btn--primary btn--block"
                  onClick={() => switchTab("/pages/lessons/index")}
                >
                  查看学习资料{" "}
                  <MateIcon name="chevron-right" size={18} tone="inverse" />
                </button>
              </div>
            )}

            {dashboard.todayActive && (
              <button
                type="button"
                className="home-checkin"
                onClick={() => setData({ shareVisible: true })}
              >
                <MateIcon name="calendar-check" size={22} tone="accent" />
                <div className="grow">
                  <div>
                    {dashboard.checkedInToday
                      ? "今日已打卡"
                      : "打卡分享今天的学习"}
                  </div>
                  <div className="muted">
                    {dashboard.checkedInToday
                      ? "可以再发给好友，或生成打卡海报"
                      : "让好友看到你的坚持"}
                  </div>
                </div>
                <MateIcon name="chevron-right" size={18} tone="muted" />
              </button>
            )}

            <div className="home-shortcuts">
              <button
                id="shortcut-add"
                type="button"
                className="home-shortcut"
                onClick={() => navigateTo("/packages/material/pages/add/index")}
              >
                <MateIcon
                  className="home-shortcut-icon"
                  name="plus"
                  size={22}
                  tone="accent"
                />
                <span className="home-shortcut-label">添加资料</span>
              </button>
              <button
                id="shortcut-lessons"
                type="button"
                className="home-shortcut"
                onClick={() => switchTab("/pages/lessons/index")}
              >
                <MateIcon
                  className="home-shortcut-icon"
                  name="book-open"
                  size={22}
                  tone="ink"
                />
                <span className="home-shortcut-label">学习单元</span>
              </button>
              <button
                id="shortcut-practice"
                type="button"
                className="home-shortcut"
                onClick={() => switchTab("/pages/practice/index")}
              >
                <MateIcon
                  className="home-shortcut-icon"
                  name="messages-square"
                  size={22}
                  tone="ink"
                />
                <span className="home-shortcut-label">AI 对练</span>
              </button>
            </div>

            {dashboard.hasLearningContent && (
              <>
                <div className="section-head">
                  <div className="h2">你的资料</div>
                  <button
                    type="button"
                    className="home-all"
                    onClick={() => switchTab("/pages/lessons/index")}
                  >
                    全部
                  </button>
                </div>
                {dashboard.recentLessons.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="recent-row"
                    onClick={() =>
                      navigateTo(
                        `/packages/study/pages/lesson-detail/index?id=${item.id}`,
                      )
                    }
                  >
                    <div className="grow">
                      <div className="recent-name">{item.name}</div>
                      <div className="muted">
                        {item.wordCount} 个单词 · {item.expressionCount} 条表达 ·
                        已学 {item.progress}%
                      </div>
                    </div>
                    <MateIcon name="chevron-right" size={18} tone="muted" />
                  </button>
                ))}

                {dashboard.recommendedScenario && (
                  <button
                    type="button"
                    className="home-practice"
                    onClick={() =>
                      navigateTo(
                        `/packages/practice/pages/session/index?scenarioId=${dashboard.recommendedScenario!.scenarioId}&lessonId=${dashboard.recommendedScenario!.lessonId}`,
                      )
                    }
                  >
                    <MateIcon name="messages-square" size={24} tone="accent" />
                    <div className="grow">
                      <div>把学过的内容说出来</div>
                      <div className="muted">
                        {dashboard.recommendedScenario.scenarioName}
                      </div>
                    </div>
                    <MateIcon name="chevron-right" size={18} tone="muted" />
                  </button>
                )}

                {dashboard.backlogItemCount > 0 && (
                  <button
                    type="button"
                    className="home-backlog"
                    onClick={() => switchTab("/pages/lessons/index")}
                  >
                    另有 {dashboard.backlogItemCount} 项到期内容，去资料中复习{" "}
                    <MateIcon name="chevron-right" size={16} tone="muted" />
                  </button>
                )}
              </>
            )}
          </>
        ) : data.loading ? (
          <div className="empty">
            <div className="empty__desc">正在读取你的学习内容…</div>
          </div>
        ) : null}
      </div>

      <SharePanel
        show={data.shareVisible}
        kind="checkin"
        onClose={() => {
          setData({ shareVisible: false });
          void refresh();
        }}
      />
    </>
  );
}
