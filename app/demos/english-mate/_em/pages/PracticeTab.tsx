"use client";

import { useCallback, useEffect } from "react";
import { MateIcon } from "../components/MateIcon";
import { mateService, subscribeDemoState, type ScenarioView } from "../mock/service";
import { useEmRouter } from "../runtime/router";
import { useSetData } from "../runtime/useSetData";
import { useWx } from "../runtime/wx";

interface ScenarioRow extends ScenarioView {
  suggestedWordsText: string;
  suggestedExpressionsText: string;
  suggestionLabel: string;
}

export function PracticeTabPage() {
  const { navigateTo, showSeq } = useEmRouter();
  const { showToast, showActionSheet } = useWx();

  const [data, setData, ref] = useSetData({
    lessons: [] as Array<{ id: string; name: string }>,
    scenarios: [] as ScenarioRow[],
    currentLessonId: "",
    filterLabel: "全部单元",
    loading: true,
    loadError: "",
  });

  const loadScenarios = useCallback(
    async (lessonId: string) => {
      const list = await mateService.listScenarios(lessonId || undefined);
      const rows: ScenarioRow[] = list.map((s) => ({
        ...s,
        lessonName: s.lessonName || "",
        suggestedWordsText: (s.suggestedWords || [])
          .map((w) => w.text)
          .slice(0, 4)
          .join(" · "),
        suggestedExpressionsText: (s.suggestedExpressions || [])
          .map((e) => e.text)
          .slice(0, 3)
          .join(" · "),
        suggestionLabel: (s.suggestedWords || []).length > 0 ? "可提示" : "自由对话",
      }));
      setData({ scenarios: rows });
    },
    [setData],
  );

  const refresh = useCallback(async () => {
    setData({ loading: true, loadError: "" });
    try {
      const lessons = await mateService.listLessons();
      setData({ lessons: lessons.map((l) => ({ id: l.id, name: l.name })) });
      await loadScenarios(ref.current.currentLessonId);
      setData({ loading: false, loadError: "" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "请检查网络后重试。";
      setData({ loading: false, loadError: message });
      showToast({
        title: error instanceof Error ? error.message : "加载失败",
        icon: "none",
      });
    }
  }, [loadScenarios, ref, setData, showToast]);

  useEffect(() => {
    void refresh();
  }, [refresh, showSeq]);

  useEffect(() => {
    return subscribeDemoState(() => {
      void refresh();
    });
  }, [refresh]);

  async function onLessonFilter() {
    const lessons = ref.current.lessons;
    const items = ["全部单元", ...lessons.map((l) => `${l.name}`)];
    const res = await showActionSheet({ itemList: items });
    if (!res) return;
    const idx = res.tapIndex;
    const lessonId = idx === 0 ? "" : lessons[idx - 1]?.id || "";
    setData({
      currentLessonId: lessonId,
      filterLabel: items[idx] || "全部单元",
      loading: true,
      loadError: "",
    });
    try {
      await loadScenarios(lessonId);
      setData({ loading: false });
    } catch (error) {
      setData({
        loading: false,
        loadError: error instanceof Error ? error.message : "请检查网络后重试。",
      });
    }
  }

  return (
    <div className="page page--tab practice-page">
      <div className="practice-head">
        <div className="h1">AI 对练</div>
        <span className="practice-intro">把资料里的英语，用在一次对话里。</span>
      </div>
      <button
        type="button"
        className="practice-filter"
        onClick={() => void onLessonFilter()}
        aria-label={`筛选资料，当前${data.filterLabel}`}
      >
        <MateIcon name="book-open" size={17} tone="muted" />
        <span>{data.filterLabel}</span>
        <MateIcon name="chevron-down" size={16} tone="muted" />
      </button>

      {data.loading ? (
        <div className="practice-state">
          <span className="muted">正在加载对练场景…</span>
        </div>
      ) : data.loadError ? (
        <div className="practice-state">
          <div className="h2">场景暂时没有加载出来</div>
          <span className="muted">{data.loadError}</span>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => void refresh()}
          >
            重新加载
          </button>
        </div>
      ) : data.scenarios.length > 0 ? (
        <div className="scenarios">
          {data.scenarios.map((item) => (
            <button
              key={item.id}
              type="button"
              className="scenario-row"
              onClick={() =>
                navigateTo(
                  `/packages/practice/pages/session/index?scenarioId=${item.id}&lessonId=${item.lessonId}`,
                )
              }
            >
              <div className="scenario-top">
                <div className="scenario-name">{item.name}</div>
                <MateIcon name="chevron-right" size={19} tone="muted" />
              </div>
              <span className="scenario-goal">{item.goal || item.description}</span>
              {item.lessonName ? (
                <span className="scenario-lesson">{item.lessonName}</span>
              ) : null}
            </button>
          ))}
        </div>
      ) : (
        <div className="practice-state">
          <div className="h2">还没有对练场景</div>
          <span className="muted">添加一份学习资料，整理内容后就能练习相关场景。</span>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => navigateTo("/packages/material/pages/add/index")}
          >
            添加学习资料
          </button>
        </div>
      )}
    </div>
  );
}
