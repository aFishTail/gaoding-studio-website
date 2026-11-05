"use client";

import { useCallback, useEffect } from "react";
import { MateIcon } from "../components/MateIcon";
import { mateService } from "../mock/service";
import { useEmRouter } from "../runtime/router";
import { useSetData } from "../runtime/useSetData";
import { useWx } from "../runtime/wx";
import type { LessonDraft } from "../types";

type Section = "words" | "expressions" | "grammars" | "scenarios";

const SECTIONS: Section[] = ["words", "expressions", "grammars", "scenarios"];

const TABS: Array<{ key: Section; label: string }> = [
  { key: "words", label: "核心单词" },
  { key: "expressions", label: "经典表达" },
  { key: "grammars", label: "语法点" },
  { key: "scenarios", label: "对练场景" },
];

export function ConfirmPage({ query }: { query: Record<string, string> }) {
  const { navigateTo, redirectTo } = useEmRouter();
  const { showToast, showModal, showLoading, hideLoading } = useWx();

  const resolvedDraftId = query.draftId || query.draft || "draft-demo";

  const [data, setData, ref] = useSetData({
    draft: null as LessonDraft | null,
    draftId: resolvedDraftId,
    activeSection: "words" as Section,
    loading: true,
    loadError: "",
    creating: false,
    confirmingReview: false,
    wordCount: 0,
    expCount: 0,
    grammarCount: 0,
    scenarioCount: 0,
    needsSourceReview: false,
    selectedCounts: {
      words: 0,
      expressions: 0,
      grammars: 0,
      scenarios: 0,
    } as Record<Section, number>,
  });

  const applyDraft = useCallback(
    (draft: LessonDraft) => {
      const selectedCounts = {} as Record<Section, number>;
      for (const key of SECTIONS) {
        selectedCounts[key] = draft[key].filter((item) => item.selected).length;
      }
      setData({
        draft,
        selectedCounts,
        wordCount: draft.words.length,
        expCount: draft.expressions.length,
        grammarCount: draft.grammars.length,
        scenarioCount: draft.scenarios.length,
        needsSourceReview: Boolean(
          draft.sourceQuality?.some((source) => source.needsReview),
        ),
        loading: false,
      });
    },
    [setData],
  );

  const loadDraft = useCallback(async () => {
    setData({ loading: true, loadError: "" });
    try {
      const draft = await mateService.getDraft(resolvedDraftId);
      if (!draft) {
        setData({
          loading: false,
          loadError: "没有待确认的学习内容，请先添加学习资料。",
        });
        return;
      }
      applyDraft(draft);
    } catch (error) {
      setData({
        loading: false,
        loadError:
          error instanceof Error ? error.message : "加载失败，请稍后重试",
      });
    }
  }, [applyDraft, resolvedDraftId, setData]);

  useEffect(() => {
    void loadDraft();
  }, [loadDraft]);

  function switchSection(key: Section) {
    setData({ activeSection: key });
  }

  function selectedCount(kind: Section): number {
    const draft = ref.current.draft;
    if (!draft) return 0;
    return (draft[kind] as Array<{ selected: boolean }>).filter(
      (x) => x.selected,
    ).length;
  }

  function toggleItem(kind: Section, index: number) {
    const draft = ref.current.draft;
    if (!draft) return;
    const list = draft[kind] as Array<{ selected: boolean }>;
    const item = list[index];
    if (!item) return;
    if (kind === "grammars" || kind === "scenarios") {
      if (
        !item.selected &&
        (kind === "grammars"
          ? selectedCount("grammars") >= 3
          : selectedCount("scenarios") >= 3)
      ) {
        showToast({
          title: kind === "grammars" ? "语法点最多 3 个" : "场景最多 3 个",
          icon: "none",
        });
        return;
      }
    }
    item.selected = !item.selected;
    applyDraft({ ...draft });
  }

  function toggleSection() {
    const draft = ref.current.draft;
    if (!draft) return;
    const kind = ref.current.activeSection;
    const list = draft[kind] as Array<{ selected: boolean }>;
    if (!list.length) return;
    const limit =
      kind === "grammars" || kind === "scenarios" ? 3 : list.length;
    const target = Math.min(limit, list.length);
    let selected = list.filter((item) => item.selected).length;
    let nextList: Array<{ selected: boolean }>;
    if (selected >= target) {
      nextList = list.map((item) => ({ ...item, selected: false }));
    } else {
      nextList = list.map((item) => {
        if (!item.selected && selected < target) {
          selected += 1;
          return { ...item, selected: true };
        }
        return item;
      });
      if (list.length > limit) {
        showToast({
          title: kind === "grammars" ? "语法点最多 3 个" : "场景最多 3 个",
          icon: "none",
        });
      }
    }
    applyDraft({ ...draft, [kind]: nextList } as LessonDraft);
  }

  function openEdit() {
    showToast({ title: "完整版小程序支持自由编辑词条", icon: "none" });
  }

  function addManualItem() {
    showToast({ title: "完整版小程序支持自由编辑词条", icon: "none" });
  }

  async function deleteItem(kind: Section, index: number) {
    const draft = ref.current.draft;
    if (!draft) return;
    const res = await showModal({
      title: "删除词条",
      content: "确定从本次学习内容中移除该项吗？",
      confirmText: "删除",
    });
    if (!res.confirm) return;
    const list = draft[kind] as Array<unknown>;
    list.splice(index, 1);
    applyDraft({ ...draft });
  }

  function viewSource() {
    const materialId = ref.current.draft?.materialId;
    if (!materialId) return;
    navigateTo(
      `/packages/material/pages/source/index?materialId=${encodeURIComponent(
        materialId,
      )}`,
    );
  }

  async function restartParsing() {
    const materialId = ref.current.draft?.materialId;
    if (!materialId || ref.current.creating) return;
    const res = await showModal({
      title: "重新解析资料",
      content: "会丢弃当前勾选和编辑，重新识别这份资料，确定吗？",
      confirmText: "重新解析",
    });
    if (!res.confirm) return;
    showLoading({ title: "正在重新解析…", mask: true });
    try {
      const job = await mateService.restartParse(materialId);
      hideLoading();
      redirectTo(
        `/packages/material/pages/parsing/index?materialId=${encodeURIComponent(
          materialId,
        )}&jobId=${encodeURIComponent(job.jobId)}`,
      );
    } catch (error) {
      hideLoading();
      showToast({
        title: error instanceof Error ? error.message : "重新解析失败",
        icon: "none",
      });
    }
  }

  function addMaterialAgain() {
    navigateTo("/packages/material/pages/add/index");
  }

  async function createLessonConfirmed() {
    const { draft, creating } = ref.current;
    if (!draft || creating) return;
    const filledWords = draft.words.filter(
      (w) => Boolean(w.word.trim()) || Boolean(w.meaning.trim()),
    );
    const filledExpressions = draft.expressions.filter(
      (e) => Boolean(e.expression.trim()) || Boolean(e.meaning.trim()),
    );
    draft.words = filledWords;
    draft.expressions = filledExpressions;
    setData({ creating: true, draft: { ...draft } });
    showLoading({ title: "正在创建学习单元…", mask: true });
    try {
      await mateService.confirmDraft(draft.draftId, draft);
      hideLoading();
      showToast({ title: "学习单元已创建", icon: "success" });
      redirectTo("/packages/study/pages/lesson-detail/index?id=lesson-smalltalk");
    } catch (error) {
      hideLoading();
      setData({ creating: false });
      showToast({
        title: error instanceof Error ? error.message : "创建失败",
        icon: "none",
      });
    }
  }

  async function createLesson() {
    const { draft, creating, confirmingReview } = ref.current;
    if (!draft || creating || confirmingReview) return;
    const filledWords = draft.words.filter(
      (w) => Boolean(w.word.trim()) || Boolean(w.meaning.trim()),
    );
    const filledExpressions = draft.expressions.filter(
      (e) => Boolean(e.expression.trim()) || Boolean(e.meaning.trim()),
    );
    if (
      filledWords.filter((w) => w.selected).length === 0 &&
      filledExpressions.filter((e) => e.selected).length === 0
    ) {
      showToast({ title: "至少填写一个单词或表达", icon: "none" });
      return;
    }

    const selectedReviewItems = [
      ...filledWords,
      ...filledExpressions,
      ...draft.grammars,
    ].filter((item) => item.selected && item.needsSourceReview).length;

    const hasLegacyReview =
      Boolean(
        draft.sourceNotes?.some((note) =>
          note.includes("原文例句未能在识别文字中核实"),
        ),
      ) &&
      [...filledWords, ...filledExpressions, ...draft.grammars].some(
        (item) =>
          item.selected &&
          item.needsSourceReview === undefined &&
          !item.originalSentence,
      );

    if (selectedReviewItems || hasLegacyReview) {
      setData({ confirmingReview: true });
      const result = await showModal({
        title: "原文需要核对",
        content: hasLegacyReview
          ? "部分选中内容的原文可能需要核对，是否继续开始学习？"
          : `有 ${selectedReviewItems} 项选中内容的原文未核实，是否继续开始学习？`,
        confirmText: "继续学习",
        cancelText: "返回检查",
      });
      setData({ confirmingReview: false });
      if (result.confirm) {
        await createLessonConfirmed();
      }
      return;
    }

    await createLessonConfirmed();
  }

  const { draft, activeSection, selectedCounts, needsSourceReview } = data;

  if (!draft) {
    return (
      <div className="page">
        <div className="empty">
          <div className="empty__title">
            {data.loading ? "正在加载学习内容…" : "暂时无法查看"}
          </div>
          {data.loadError ? (
            <div className="empty__desc">{data.loadError}</div>
          ) : null}
          {!data.loading && (
            <div className="confirm-load-actions">
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => void loadDraft()}
              >
                重新加载
              </button>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={addMaterialAgain}
              >
                添加学习资料
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const currentList = draft[activeSection];
  const toggleLabel =
    (activeSection === "grammars" || activeSection === "scenarios") &&
    currentList.length > 3
      ? selectedCounts[activeSection] >= 3
        ? "清空选择"
        : "选满 3 个"
      : selectedCounts[activeSection] === currentList.length
        ? "取消全选"
        : "全选";

  return (
    <div className="page confirm-page">
      <div className="col gap-8" style={{ marginBottom: 12 }}>
        <div className="h1">{draft.title}</div>
        <span className="muted">
          AI 从资料中整理出以下学习内容，你可以勾选、编辑或删除
        </span>
      </div>

      <div
        className={`card source-review ${needsSourceReview ? "source-review--warning" : ""}`}
      >
        <div className="row source-review-head">
          <span className="h3">
            {needsSourceReview ? "部分原文需要核对" : "核对原始资料"}
          </span>
          <div className="row">
            <span
              className="link"
              role="button"
              tabIndex={0}
              onClick={viewSource}
            >
              查看原资料
            </span>
            <span
              className="link"
              role="button"
              tabIndex={0}
              style={{ marginLeft: 12 }}
              onClick={() => void restartParsing()}
            >
              重新解析
            </span>
          </div>
        </div>
        {draft.sourceNotes?.map((note, i) => (
          <div key={i} className="muted-sm source-review-note">
            {note}
          </div>
        ))}
        {needsSourceReview && (
          <>
            <div className="source-quality">
              {draft.sourceQuality?.map((item) =>
                item.needsReview ? (
                  <span key={item.assetIndex} className="chip chip--amber">
                    {item.label} · 建议核对
                  </span>
                ) : null,
              )}
            </div>
            <div className="muted-sm source-review-note">
              请对照原图检查单词和原文例句，尤其是否定词、数字及缺失的文字。
            </div>
            <span
              className="link source-replace"
              role="button"
              tabIndex={0}
              onClick={addMaterialAgain}
            >
              重新拍摄或添加更清晰的资料
            </span>
          </>
        )}
      </div>

      <div className="chip-row confirm-summary">
        <span className="chip confirm-summary__chip">
          单词 {data.wordCount}
        </span>
        <span className="chip confirm-summary__chip">表达 {data.expCount}</span>
        <span className="chip confirm-summary__chip">
          语法 {data.grammarCount}
        </span>
        <span className="chip confirm-summary__chip">
          场景 {data.scenarioCount}
        </span>
      </div>

      <div className="tabs">
        {TABS.map((item) => (
          <div
            key={item.key}
            role="tab"
            tabIndex={0}
            aria-selected={activeSection === item.key}
            className={`tab ${activeSection === item.key ? "tab--active" : ""}`}
            onClick={() => switchSection(item.key)}
          >
            {item.label}
          </div>
        ))}
      </div>

      <div className="selection-bar">
        <span className="selection-count">
          已选 {selectedCounts[activeSection]} / {currentList.length}
        </span>
        {currentList.length > 0 && (
          <div
            className="selection-toggle"
            role="button"
            tabIndex={0}
            onClick={toggleSection}
          >
            {toggleLabel}
          </div>
        )}
      </div>

      {activeSection === "words" && (
        <div>
          {draft.words.map((item, index) => (
            <div
              key={item.id}
              className={`card item-card ${item.selected ? "item-card--selected" : ""}`}
            >
              <div className="item-head">
                <div
                  className={`check ${item.selected ? "check--on" : ""}`}
                  role="checkbox"
                  aria-checked={item.selected}
                  tabIndex={0}
                  onClick={() => toggleItem("words", index)}
                >
                  {item.selected && (
                    <MateIcon name="check" size={14} tone="inverse" />
                  )}
                </div>
                <div className="item-body">
                  <div
                    className="col item-content"
                    onClick={() => toggleItem("words", index)}
                  >
                    <div className="item-title">
                      <span className="h3 en">{item.word || "（未填写）"}</span>
                      <span className="muted">{item.phonetic}</span>
                    </div>
                    {(item.pos || item.meaning) && (
                      <span className="muted-sm">
                        {item.pos} · {item.meaning}
                      </span>
                    )}
                    {item.needsSourceReview && (
                      <span className="review-badge">原文待核对</span>
                    )}
                  </div>
                  <div className="item-actions">
                    <span
                      className="item-edit"
                      role="button"
                      tabIndex={0}
                      onClick={openEdit}
                    >
                      {item.word ? "编辑" : "填写"}
                    </span>
                    <span
                      className="item-del"
                      role="button"
                      tabIndex={0}
                      onClick={() => void deleteItem("words", index)}
                    >
                      删除
                    </span>
                  </div>
                </div>
              </div>
              {item.originalSentence && (
                <div className="muted-sm item-origin">
                  原文：{item.originalSentence}
                </div>
              )}
              {item.sourceRef && (
                <span
                  className="item-source"
                  role="button"
                  tabIndex={0}
                  onClick={viewSource}
                >
                  来源：{item.sourceRef} · 查看原文
                </span>
              )}
            </div>
          ))}
          <button
            type="button"
            className="btn btn--ghost btn--block add-btn"
            onClick={addManualItem}
          >
            <MateIcon name="plus" size={18} tone="ink" /> 手动添加单词
          </button>
        </div>
      )}

      {activeSection === "expressions" && (
        <div>
          {draft.expressions.map((item, index) => (
            <div
              key={item.id}
              className={`card item-card ${item.selected ? "item-card--selected" : ""}`}
            >
              <div className="item-head">
                <div
                  className={`check ${item.selected ? "check--on" : ""}`}
                  role="checkbox"
                  aria-checked={item.selected}
                  tabIndex={0}
                  onClick={() => toggleItem("expressions", index)}
                >
                  {item.selected && (
                    <MateIcon name="check" size={14} tone="inverse" />
                  )}
                </div>
                <div className="item-body">
                  <div
                    className="col item-content"
                    onClick={() => toggleItem("expressions", index)}
                  >
                    <div className="item-title">
                      <span className="h3 en">
                        {item.expression || "（未填写）"}
                      </span>
                      <span className="muted-sm">{item.structure}</span>
                    </div>
                    {(item.meaning || item.scenario) && (
                      <span className="muted-sm">
                        {item.meaning} · {item.scenario}
                      </span>
                    )}
                    {item.needsSourceReview && (
                      <span className="review-badge">原文待核对</span>
                    )}
                  </div>
                  <div className="item-actions">
                    <span
                      className="item-edit"
                      role="button"
                      tabIndex={0}
                      onClick={openEdit}
                    >
                      {item.expression ? "编辑" : "填写"}
                    </span>
                    <span
                      className="item-del"
                      role="button"
                      tabIndex={0}
                      onClick={() => void deleteItem("expressions", index)}
                    >
                      删除
                    </span>
                  </div>
                </div>
              </div>
              {item.originalSentence && (
                <div className="muted-sm item-origin">
                  {item.originalSentence}
                </div>
              )}
              {item.sourceRef && (
                <span
                  className="item-source"
                  role="button"
                  tabIndex={0}
                  onClick={viewSource}
                >
                  来源：{item.sourceRef} · 查看原文
                </span>
              )}
            </div>
          ))}
          <button
            type="button"
            className="btn btn--ghost btn--block add-btn"
            onClick={addManualItem}
          >
            <MateIcon name="plus" size={18} tone="ink" /> 手动添加表达
          </button>
        </div>
      )}

      {activeSection === "grammars" && (
        <div>
          {draft.grammars.map((item, index) => (
            <div
              key={item.id}
              className={`card item-card ${item.selected ? "item-card--selected" : ""}`}
            >
              <div className="item-head">
                <div
                  className={`check ${item.selected ? "check--on" : ""}`}
                  role="checkbox"
                  aria-checked={item.selected}
                  tabIndex={0}
                  onClick={() => toggleItem("grammars", index)}
                >
                  {item.selected && (
                    <MateIcon name="check" size={14} tone="inverse" />
                  )}
                </div>
                <div className="item-body">
                  <div
                    className="col item-content"
                    onClick={() => toggleItem("grammars", index)}
                  >
                    <span className="h3">{item.name}</span>
                    <span className="muted-sm en">{item.structure}</span>
                    <span className="muted-sm">{item.rule}</span>
                    {item.needsSourceReview && (
                      <span className="review-badge">原文待核对</span>
                    )}
                  </div>
                  <div className="item-actions">
                    <span
                      className="item-edit"
                      role="button"
                      tabIndex={0}
                      onClick={openEdit}
                    >
                      编辑
                    </span>
                    <span
                      className="item-del"
                      role="button"
                      tabIndex={0}
                      onClick={() => void deleteItem("grammars", index)}
                    >
                      删除
                    </span>
                  </div>
                </div>
              </div>
              {item.originalSentence && (
                <div className="muted-sm item-origin">
                  原文：{item.originalSentence}
                </div>
              )}
              {item.sourceRef && (
                <span
                  className="item-source"
                  role="button"
                  tabIndex={0}
                  onClick={viewSource}
                >
                  来源：{item.sourceRef} · 查看原文
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {activeSection === "scenarios" && (
        <div>
          {draft.scenarios.map((item, index) => (
            <div
              key={item.id}
              className={`card item-card ${item.selected ? "item-card--selected" : ""}`}
            >
              <div className="item-head">
                <div
                  className={`check ${item.selected ? "check--on" : ""}`}
                  role="checkbox"
                  aria-checked={item.selected}
                  tabIndex={0}
                  onClick={() => toggleItem("scenarios", index)}
                >
                  {item.selected && (
                    <MateIcon name="check" size={14} tone="inverse" />
                  )}
                </div>
                <div
                  className="col item-body item-content"
                  onClick={() => toggleItem("scenarios", index)}
                >
                  <span className="h3">{item.name}</span>
                  <span className="muted-sm">
                    你：{item.userRole} · AI：{item.aiRole}
                  </span>
                  <span className="muted-sm">目标：{item.goal}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="space-bottom" />

      <div className="action-bar">
        <button
          type="button"
          className="btn btn--primary btn--block"
          disabled={data.creating || data.confirmingReview}
          onClick={() => void createLesson()}
        >
          开始学习
        </button>
      </div>
    </div>
  );
}
