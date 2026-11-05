"use client";

import { useCallback, useEffect } from "react";
import { MateIcon } from "../components/MateIcon";
import { mateService, type ScenarioView } from "../mock/service";
import { useEmRouter } from "../runtime/router";
import { useSetData } from "../runtime/useSetData";
import { useWx } from "../runtime/wx";
import type { PracticeMode } from "../types";

export function SessionPage({ query }: { query: Record<string, string> }) {
  const { navigateTo, navigateBack, switchTab, canGoBack } = useEmRouter();
  const { showToast } = useWx();

  const scenarioId = query.scenarioId || "sc-networking";
  const lessonId = query.lessonId || "";

  const [data, setData, ref] = useSetData({
    scenarioId,
    lessonId,
    scenario: null as ScenarioView | null,
    mode: "guided" as PracticeMode,
    starting: false,
    loading: true,
    loadError: "",
  });

  const load = useCallback(async () => {
    setData({ loading: true, loadError: "" });
    try {
      const scenario = await mateService.getScenario(scenarioId);
      setData({ scenario, loading: false, loadError: "" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "请检查网络后重试。";
      setData({ loading: false, loadError: message });
      showToast({
        title: error instanceof Error ? error.message : "加载失败",
        icon: "none",
      });
    }
  }, [scenarioId, setData, showToast]);

  useEffect(() => {
    setData({ scenarioId, lessonId });
    void load();
  }, [scenarioId, lessonId, load, setData]);

  function pickMode(mode: PracticeMode) {
    setData({ mode });
  }

  function goBack() {
    if (canGoBack) {
      navigateBack();
    } else {
      switchTab("/pages/practice/index");
    }
  }

  async function start() {
    const scenario = ref.current.scenario;
    const mode = ref.current.mode;
    if (!scenario || ref.current.starting) return;
    setData({ starting: true });
    try {
      const result = await mateService.startPractice(scenario.id, mode);
      if (typeof window !== "undefined") {
        try {
          window.sessionStorage.setItem(
            "em-practice-session-ctx",
            JSON.stringify({
              sessionId: result.sessionId,
              scenarioName: result.scenario.name,
              userRole: result.scenario.userRole,
              aiRole: result.scenario.aiRole,
              goal: result.scenario.goal,
              suggestedWords: result.suggestedWords || [],
              suggestedExpressions: result.suggestedExpressions || [],
              mode,
            }),
          );
        } catch {
          // ignore
        }
      }
      navigateTo(
        `/packages/practice/pages/chat/index?sessionId=${result.sessionId}&mode=${mode}`,
      );
    } catch (error) {
      showToast({
        title: error instanceof Error ? error.message : "启动失败",
        icon: "none",
      });
    } finally {
      setData({ starting: false });
    }
  }

  const { scenario, mode, starting, loading, loadError } = data;

  if (scenario) {
    const hasSuggestions =
      (scenario.suggestedWords && scenario.suggestedWords.length > 0) ||
      (scenario.suggestedExpressions && scenario.suggestedExpressions.length > 0);

    return (
      <div className="page session-page">
        <div className="session-title">{scenario.name}</div>
        {scenario.description ? (
          <span className="session-description">{scenario.description}</span>
        ) : null}
        {scenario.goal ? (
          <div className="session-goal">
            <div className="session-label">这次要说成什么</div>
            <span className="session-goal-copy">{scenario.goal}</span>
          </div>
        ) : null}
        <div className="session-roles">
          <div className="session-role">
            <span className="role-label">你</span>
            <span className="role-copy">{scenario.userRole}</span>
          </div>
          <div className="session-role">
            <span className="role-label">AI</span>
            <span className="role-copy">{scenario.aiRole}</span>
          </div>
        </div>
        {hasSuggestions ? (
          <div className="session-words">
            <div className="session-section-title">这次可以用上</div>
            <div className="session-chips">
              {(scenario.suggestedWords || []).map((item) => (
                <span key={item.id} className="session-chip">
                  {item.text}
                </span>
              ))}
              {(scenario.suggestedExpressions || []).map((item) => (
                <span key={item.id} className="session-chip">
                  {item.text}
                </span>
              ))}
            </div>
          </div>
        ) : null}
        <div className="session-modes">
          <button
            type="button"
            className={`session-mode ${mode === "guided" ? "session-mode--active" : ""}`}
            onClick={() => pickMode("guided")}
            aria-label={`提示对练，${mode === "guided" ? "已选择" : "未选择"}`}
          >
            {mode === "guided" ? <div className="mode-dot" /> : null}
            <span>提示对练</span>
          </button>
          <button
            type="button"
            className={`session-mode ${mode === "free" ? "session-mode--active" : ""}`}
            onClick={() => pickMode("free")}
            aria-label={`自由对练，${mode === "free" ? "已选择" : "未选择"}`}
          >
            {mode === "free" ? <div className="mode-dot" /> : null}
            <span>自由对练</span>
          </button>
        </div>
        <span className="session-mode-help">
          {mode === "guided"
            ? "对话中提供推荐词句和提示，帮你顺利开口。"
            : "保留场景与角色，由你自行组织语言。"}
        </span>
        {scenario.lessonName ? (
          <div className="session-source">
            <MateIcon name="book-open" size={16} tone="muted" />
            <span>{scenario.lessonName}</span>
          </div>
        ) : null}
        <div className="action-bar session-action">
          <button
            type="button"
            className="btn btn--primary btn--block"
            onClick={() => void start()}
            disabled={starting}
          >
            {!starting ? <MateIcon name="mic" size={18} tone="inverse" /> : null}
            <span>{starting ? "准备中…" : "开始语音对练"}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page session-state">
      {loading ? (
        <span className="muted">正在加载对练场景…</span>
      ) : (
        <>
          <div className="h2">暂时无法打开这个场景</div>
          <span className="muted">
            {loadError || "场景可能已移除，请返回选择其他场景。"}
          </span>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => void load()}
          >
            重新加载
          </button>
          <button type="button" className="btn btn--ghost" onClick={goBack}>
            返回场景列表
          </button>
        </>
      )}
    </div>
  );
}
