"use client";

import { useCallback, useEffect } from "react";
import { MateIcon } from "../components/MateIcon";
import { mateService } from "../mock/service";
import { useEmRouter } from "../runtime/router";
import { useSetData } from "../runtime/useSetData";
import { useWx } from "../runtime/wx";
import type { WordContent } from "../types";

const BATCH = 6;

interface MatchCard {
  key: string;
  text: string;
  sub: string;
  kind: "word" | "meaning";
  itemId: string;
  matched: boolean;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function GamePage({ query }: { query: Record<string, string> }) {
  const { navigateBack } = useEmRouter();
  const { showToast } = useWx();

  const lessonId = query.lessonId || "lesson-smalltalk";

  const [data, setData, ref] = useSetData({
    lessonId,
    cards: [] as MatchCard[],
    selectedKey: "",
    selectedText: "",
    selectedKind: "" as "" | "word" | "meaning",
    matched: [] as string[],
    wrongKey: "",
    correctCount: 0,
    wrongCount: 0,
    finished: false,
    loaded: false,
    loadError: "",
    roundResults: [] as Array<{ itemId: string; correct: boolean }>,
    targetItemIds: [] as string[],
    emptyDue: false,
    practiceMode: false,
    practiceAvailable: 0,
    nextLabel: "再玩一次",
  });

  const load = useCallback(
    async (wantPractice?: boolean) => {
      setData({ loaded: false, loadError: "", lessonId });
      try {
        const lesson = await mateService.getLesson(lessonId);
        const words = lesson.words.filter((w) => {
          const content = w.content as Partial<WordContent>;
          return (
            typeof content.word === "string" &&
            content.word.trim() &&
            typeof content.meaning === "string" &&
            content.meaning.trim()
          );
        });

        const picked = words.slice(0, BATCH);
        const wordCards: MatchCard[] = picked.map((w, i) => ({
          key: `w-${i}`,
          text: (w.content as WordContent).word,
          sub: (w.content as WordContent).pos || "",
          kind: "word",
          itemId: w.id,
          matched: false,
        }));
        const meaningCards: MatchCard[] = picked.map((w, i) => ({
          key: `m-${i}`,
          text: (w.content as WordContent).meaning,
          sub: "",
          kind: "meaning",
          itemId: w.id,
          matched: false,
        }));

        const shuffledWords = shuffle(wordCards);
        const shuffledMeanings = shuffle(meaningCards);

        setData({
          lessonId: lesson.id,
          cards: shuffledWords.flatMap((card, index) => [
            card,
            shuffledMeanings[index],
          ]),
          targetItemIds: picked.map((w) => w.id),
          emptyDue: false,
          practiceMode: Boolean(wantPractice),
          practiceAvailable: words.length,
          nextLabel: "再玩一次",
          loaded: true,
        });
      } catch (error) {
        setData({
          loadError: error instanceof Error ? error.message : "加载失败，请重试",
        });
      }
    },
    [lessonId, setData],
  );

  useEffect(() => {
    void load(false);
  }, [load]);

  async function finishGame(results: Array<{ itemId: string; correct: boolean }>) {
    const matchedPairs = new Map<string, boolean>();
    results.forEach((r) => {
      matchedPairs.set(r.itemId, (matchedPairs.get(r.itemId) ?? true) && r.correct);
    });
    const correctIds = [...matchedPairs.entries()]
      .filter(([, ok]) => ok)
      .map(([id]) => id);
    setData({ finished: true });
    try {
      await mateService.submitMatchResult(
        ref.current.targetItemIds,
        correctIds,
        ref.current.practiceMode,
      );
    } catch {
      showToast({ title: "复习记录保存失败", icon: "none" });
    }
  }

  function onTapCard(key: string) {
    if (!ref.current.loaded || ref.current.finished) return;
    if (!ref.current.cards.some((card) => card.key === key)) return;
    const matched = ref.current.matched;
    if (matched.includes(key)) return;

    if (ref.current.selectedKey === key) {
      setData({
        selectedKey: "",
        selectedText: "",
        selectedKind: "",
        wrongKey: "",
      });
      return;
    }

    if (!ref.current.selectedKey) {
      const card = ref.current.cards.find((c) => c.key === key)!;
      setData({
        selectedKey: key,
        selectedText: card.text,
        selectedKind: card.kind,
        wrongKey: "",
      });
      return;
    }

    const first = ref.current.cards.find(
      (c) => c.key === ref.current.selectedKey,
    )!;
    const second = ref.current.cards.find((c) => c.key === key)!;
    if (first.kind === second.kind) {
      setData({
        selectedKey: key,
        selectedText: second.text,
        selectedKind: second.kind,
        wrongKey: "",
      });
      return;
    }

    if (first.itemId === second.itemId) {
      const newMatched = [...matched, ref.current.selectedKey, key];
      const results = [
        ...ref.current.roundResults,
        { itemId: first.itemId, correct: true },
      ];
      const correctCount = ref.current.correctCount + 1;
      setData({
        matched: newMatched,
        cards: ref.current.cards.map((card) =>
          newMatched.includes(card.key) ? { ...card, matched: true } : card,
        ),
        selectedKey: "",
        selectedText: "",
        selectedKind: "",
        correctCount,
        roundResults: results,
        wrongKey: "",
      });
      if (newMatched.length === ref.current.cards.length) {
        void finishGame(results);
      }
    } else {
      setData({
        wrongKey: key,
        wrongCount: ref.current.wrongCount + 1,
        roundResults: [
          ...ref.current.roundResults,
          { itemId: first.itemId, correct: false },
          { itemId: second.itemId, correct: false },
        ],
      });
    }
  }

  function restart() {
    setData({
      cards: [],
      selectedKey: "",
      selectedText: "",
      selectedKind: "",
      matched: [],
      wrongKey: "",
      correctCount: 0,
      wrongCount: 0,
      finished: false,
      loaded: false,
      loadError: "",
      roundResults: [],
      targetItemIds: [],
      emptyDue: false,
    });
    void load(true);
  }

  function done() {
    navigateBack();
  }

  if (!data.loaded) {
    return (
      <div className="page">
        <div className="empty">
          {data.loadError ? (
            <div className="empty__title">单词加载失败</div>
          ) : null}
          <span className="muted">{data.loadError || "正在加载单词…"}</span>
          {data.loadError ? (
            <button
              type="button"
              className="btn btn--primary btn--block"
              onClick={() => void load(false)}
            >
              重试
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  if (!data.finished && data.cards.length === 0) {
    return (
      <div className="page">
        <div className="empty">
          <div className="empty__title">
            {data.emptyDue
              ? data.practiceAvailable
                ? "到期单词已练完"
                : "当前没有到期单词"
              : "暂无可配对的单词"}
          </div>
          <span className="muted">
            {data.emptyDue
              ? data.practiceAvailable
                ? "可以继续巩固已学单词，不会打乱复习计划"
                : "稍后再来复习，或回学习单元继续学习"
              : "当前学习单元没有可配对的单词和释义"}
          </span>
          {data.emptyDue && data.practiceAvailable ? (
            <button
              type="button"
              className="btn btn--primary btn--block"
              onClick={restart}
            >
              继续巩固
            </button>
          ) : null}
          <button
            type="button"
            className={`btn ${
              data.emptyDue && data.practiceAvailable
                ? "btn--ghost"
                : "btn--primary"
            } btn--block`}
            onClick={done}
          >
            返回学习单元
          </button>
        </div>
      </div>
    );
  }

  if (!data.finished && data.cards.length > 0) {
    return (
      <div className="page game-page">
        <div className="game-head">
          {data.practiceMode ? (
            <div className="practice-tag">巩固练习 · 不推进复习间隔</div>
          ) : null}
          <div className="h1">单词消消乐</div>
          <div className="game-score">
            <span>
              已配对 {data.correctCount} / {data.targetItemIds.length}
            </span>
            <span>错误 {data.wrongCount}</span>
          </div>
          <div className="game-prompt" aria-live="polite">
            {data.selectedKey ? (
              <>
                <span className="game-prompt__label">已选：</span>
                <span className="game-prompt__word">{data.selectedText}</span>
                <span>
                  ，请选择对应{data.selectedKind === "word" ? "释义" : "英文"}
                </span>
              </>
            ) : (
              <span>选择一张卡片，再找出对应的另一张</span>
            )}
          </div>
        </div>

        <div className="match-columns">
          <span>英文</span>
          <span>中文释义</span>
        </div>

        <div className="match-grid">
          {data.cards.map((item) => {
            const isSelected = data.selectedKey === item.key;
            const isWrong = data.wrongKey === item.key;
            return (
              <div
                key={item.key}
                className={`match-card ${
                  item.kind === "word"
                    ? "match-card--word"
                    : "match-card--meaning"
                } ${item.matched ? "match-card--matched" : ""} ${
                  isSelected ? "match-card--selected" : ""
                } ${isWrong ? "match-card--wrong" : ""}`}
                onClick={() => onTapCard(item.key)}
                role="button"
                aria-label={`${item.text} ${
                  item.matched
                    ? "已配对"
                    : isSelected
                      ? "已选中"
                      : isWrong
                        ? "不匹配，请重试"
                        : ""
                }`}
              >
                <span className="match-text">{item.text}</span>
                {item.sub && !item.matched ? (
                  <span className="match-sub">{item.sub}</span>
                ) : null}
                {item.matched ? (
                  <div className="match-state match-state--matched">
                    <MateIcon
                      name="check"
                      size={18}
                      color="#195C3A"
                      weight={3}
                    />
                    <span>已配对</span>
                  </div>
                ) : isWrong ? (
                  <span className="match-state">不匹配，再试试</span>
                ) : isSelected ? (
                  <span className="match-state">已选中 · 再点取消</span>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="done-wrap">
        <MateIcon name="check" size={28} tone="ink" />
        <div className="h1">
          {data.practiceMode ? "巩固完成" : "配对完成"}
        </div>
        <div className="done-summary">
          <div className="done-stat">
            <span className="done-num">{data.correctCount}</span>
            <span className="done-label">正确</span>
          </div>
          <div className="done-stat">
            <span className="done-num">{data.wrongCount}</span>
            <span className="done-label">错误</span>
          </div>
        </div>
        <span className="muted">
          {data.practiceMode
            ? "巩固结果不会推迟复习日期，点错的单词已安排今天再练"
            : "点错过的单词会更快进入复习队列"}
        </span>
        <button
          type="button"
          className="btn btn--primary btn--block"
          onClick={restart}
        >
          {data.nextLabel}
        </button>
        <button
          type="button"
          className="btn btn--ghost btn--block"
          onClick={done}
        >
          完成
        </button>
      </div>
    </div>
  );
}
