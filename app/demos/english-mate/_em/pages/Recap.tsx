"use client";

import { useCallback, useEffect } from "react";
import { MateIcon } from "../components/MateIcon";
import { SharePanel } from "../components/SharePanel";
import { mateService } from "../mock/service";
import { useEmRouter } from "../runtime/router";
import { useSetData } from "../runtime/useSetData";
import { useWx } from "../runtime/wx";
import type { PracticeRecap } from "../types";

interface UsageRow {
  itemId: string;
  text: string;
  used: boolean;
  kind: "word" | "expression";
}

function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  const min = Math.floor(s / 60);
  const sec = s % 60;
  if (min === 0) return `${sec} 秒`;
  return `${min} 分 ${sec} 秒`;
}

export function RecapPage({ query }: { query: Record<string, string> }) {
  const { redirectTo, switchTab } = useEmRouter();
  const { showToast } = useWx();

  const sessionId = query.sessionId || "session-demo";

  const [data, setData, ref] = useSetData({
    sessionId,
    recap: null as PracticeRecap | null,
    lessonId: "",
    loading: true,
    loadError: "",
    wordRows: [] as UsageRow[],
    expressionRows: [] as UsageRow[],
    durationLabel: "",
    savedIndices: [] as boolean[],
    scenarioName: "",
    goodSentenceTexts: [] as string[],
    shareVisible: false,
  });

  const load = useCallback(async () => {
    setData({ loading: true, loadError: "", sessionId });
    try {
      const session = await mateService.getPracticeSession(sessionId);
      let recap = session.recap;
      if (!recap) {
        recap = await mateService.completePractice(
          session.id,
          session.durationSeconds || 185,
        );
      }

      const usedIds = new Set([
        ...(recap.usage.usedWordIds || []),
        ...(recap.usage.usedExpressionIds || []),
      ]);

      let targetWordIds = session.targetWordIds;
      let targetExpressionIds = session.targetExpressionIds;
      if (!targetWordIds || !targetExpressionIds) {
        const lesson = await mateService.getLesson(session.lessonId);
        if (!targetWordIds) targetWordIds = lesson.words.map((w) => w.id);
        if (!targetExpressionIds) {
          targetExpressionIds = lesson.expressions.map((e) => e.id);
        }
      }

      const resolvedWords = mateService.resolveItemsByIds(targetWordIds || []);
      const resolvedExpressions = mateService.resolveItemsByIds(
        targetExpressionIds || [],
      );

      const wordRows: UsageRow[] = resolvedWords.map((w) => ({
        itemId: w.id,
        text: w.text,
        used: usedIds.has(w.id),
        kind: "word",
      }));

      const expressionRows: UsageRow[] = resolvedExpressions.map((e) => ({
        itemId: e.id,
        text: e.text,
        used: usedIds.has(e.id),
        kind: "expression",
      }));

      setData({
        sessionId: session.id,
        recap,
        loading: false,
        loadError: "",
        lessonId: session.lessonId,
        scenarioName: session.scenarioName,
        durationLabel: formatDuration(recap.durationSeconds),
        goodSentenceTexts: (recap.goodSentences || [])
          .map((s) => s.sentence)
          .filter(Boolean),
        wordRows,
        expressionRows,
        savedIndices: (recap.goodSentences || []).map(() => false),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "请检查网络后重试。";
      setData({ loading: false, loadError: message });
      showToast({
        title: error instanceof Error ? error.message : "加载失败",
        icon: "none",
      });
    }
  }, [sessionId, setData, showToast]);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveGoodSentence(idx: number) {
    const recap = ref.current.recap;
    if (!recap || ref.current.savedIndices[idx]) return;
    const sentence = recap.goodSentences[idx];
    if (!sentence) return;
    try {
      await mateService.saveRecapSentence(ref.current.sessionId, sentence.sentence);
      const saved = [...ref.current.savedIndices];
      saved[idx] = true;
      setData({ savedIndices: saved });
      showToast({ title: "已收藏到我的句子", icon: "success" });
    } catch {
      showToast({ title: "收藏失败", icon: "none" });
    }
  }

  function done() {
    switchTab("/pages/home/index");
  }

  function openShare() {
    if (!ref.current.recap) return;
    setData({ shareVisible: true });
  }

  function closeShare() {
    setData({ shareVisible: false });
  }

  function goLesson() {
    if (ref.current.lessonId) {
      redirectTo(
        `/packages/study/pages/lesson-detail/index?id=${ref.current.lessonId}`,
      );
    } else {
      switchTab("/pages/lessons/index");
    }
  }

  const { recap } = data;

  return (
    <>
      {recap ? (
        <div className="page recap-page">
          <div className="recap-head">
            <div className="h1">对练复盘</div>
            <span className="recap-scenario">{data.scenarioName}</span>
          </div>

          {recap.goodSentences.length > 0 ? (
            <div className="recap-section">
              <div className="h2">你说得好的句子</div>
              {recap.goodSentences.map((item, index) => (
                <div key={index} className="good-entry">
                  <span className="good-sentence">{item.sentence}</span>
                  <div className="good-note">
                    <span>{item.comment}</span>
                    <button
                      type="button"
                      className="save-sentence"
                      onClick={() => void saveGoodSentence(index)}
                      aria-label={
                        data.savedIndices[index] ? "这句话已收藏" : "收藏这句话"
                      }
                    >
                      <MateIcon
                        name={data.savedIndices[index] ? "check" : "star"}
                        size={17}
                        tone="accent"
                      />
                      <span>{data.savedIndices[index] ? "已收藏" : "收藏"}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {recap.issues.length > 0 ? (
            <div className="recap-section">
              <div className="h2">可以说得更好的表达</div>
              {recap.issues.map((item) => (
                <div key={item.original} className="issue-entry">
                  <span className="expression-label">你的表达</span>
                  <span className="issue-original">{item.original}</span>
                  <span className="expression-label">建议这样说</span>
                  <span className="issue-suggested">{item.suggested}</span>
                  <span className="issue-reason">{item.reason}</span>
                </div>
              ))}
            </div>
          ) : null}

          {recap.summary ? (
            <div className="recap-section">
              <div className="h2">这次的收获</div>
              <span className="recap-summary">{recap.summary}</span>
            </div>
          ) : null}

          {recap.suggestion ? (
            <div className="recap-section">
              <div className="h2">下次试着这样说</div>
              <span className="recap-summary">{recap.suggestion}</span>
            </div>
          ) : null}

          <div className="recap-section usage-section">
            <div className="h2">词句使用情况</div>
            {data.wordRows.length > 0 ? (
              <>
                <span className="usage-label">单词</span>
                <div className="usage-list">
                  {data.wordRows.map((item) => (
                    <div key={item.itemId} className="usage-item">
                      <span className="usage-word">{item.text}</span>
                      <span
                        className={`usage-status ${item.used ? "usage-status--used" : ""}`}
                      >
                        {item.used ? "已使用" : "未用到"}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : null}
            {data.expressionRows.length > 0 ? (
              <>
                <span className="usage-label">经典表达</span>
                <div className="usage-list">
                  {data.expressionRows.map((item) => (
                    <div key={item.itemId} className="usage-item">
                      <span className="usage-word">{item.text}</span>
                      <span
                        className={`usage-status ${item.used ? "usage-status--used" : ""}`}
                      >
                        {item.used ? "已使用" : "未用到"}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : null}
            {data.wordRows.length === 0 && data.expressionRows.length === 0 ? (
              <span className="recap-summary muted">
                本次场景没有设置推荐词或表达。
              </span>
            ) : null}
          </div>

          <button
            type="button"
            className="btn btn--ghost btn--block recap-share"
            onClick={openShare}
          >
            <MateIcon name="share-2" size={18} tone="ink" />
            分享这次对练
          </button>

          <div className="recap-meta">
            <span>对练时长 {data.durationLabel}</span>
            <span>{recap.turnCount} 轮对话</span>
          </div>

          <div className="action-bar recap-actions">
            <button type="button" className="btn btn--secondary" onClick={goLesson}>
              回到学习单元
            </button>
            <button type="button" className="btn btn--primary" onClick={done}>
              完成
            </button>
          </div>
        </div>
      ) : (
        <div className="page recap-state">
          {data.loading ? (
            <span className="muted">正在加载这次对练的复盘…</span>
          ) : (
            <>
              <div className="h2">复盘暂时没有加载出来</div>
              <span className="muted">{data.loadError || "请稍后重试。"}</span>
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => void load()}
              >
                重新加载
              </button>
              <button type="button" className="btn btn--ghost" onClick={done}>
                返回首页
              </button>
            </>
          )}
        </div>
      )}

      <SharePanel
        show={data.shareVisible}
        kind="practice"
        sourceId={data.sessionId}
        sentences={data.goodSentenceTexts}
        onClose={closeShare}
      />
    </>
  );
}
