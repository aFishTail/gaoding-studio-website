"use client";

import { useCallback, useEffect } from "react";
import { MateIcon } from "../components/MateIcon";
import { mateService } from "../mock/service";
import { useEmRouter } from "../runtime/router";
import { speakText, stopAudio } from "../runtime/tts";
import { useSetData } from "../runtime/useSetData";
import { useWx } from "../runtime/wx";
import {
  POLISH_STYLES,
  type LessonDetail,
  type PolishStyle,
  type SentenceFeedback,
  type SentenceTask,
} from "../types";

const SAMPLE_SENTENCES: Record<string, string> = {
  "st-1":
    "Small talk help us deal with unsuitable conversation topics and keep the chat acceptable.",
  "st-2":
    "Thank you for your warm hospitality today; my commute here this morning was very smooth.",
  "st-3":
    "Hi there, I haven't seen you around here before — where are you boss and which city you based in?",
};

function renderKeywords(task: SentenceTask): string {
  if (task.type === "guided") {
    const parts = [`目标表达：${task.hintExpression || ""}`];
    if (task.keywords.length) {
      parts.push(`关键词：${task.keywords.join(" / ")}`);
    }
    return parts.filter(Boolean).join("\n");
  }
  return "";
}

function getSampleForTask(task: SentenceTask | null): string {
  if (!task) return SAMPLE_SENTENCES["st-1"];
  return SAMPLE_SENTENCES[task.id] || task.reference || SAMPLE_SENTENCES["st-1"];
}

export function SentencePage({ query }: { query: Record<string, string> }) {
  const { navigateBack } = useEmRouter();
  const { showToast, showLoading, hideLoading, showModal } = useWx();

  const lessonId = query.lessonId || "lesson-smalltalk";

  const [data, setData, ref] = useSetData({
    lessonId,
    tasks: [] as SentenceTask[],
    taskIndex: 0,
    current: null as SentenceTask | null,
    input: "",
    transcribing: false,
    submitting: false,
    feedback: null as SentenceFeedback | null,
    activeStyle: "natural" as PolishStyle,
    defaultStyle: "natural" as PolishStyle,
    styleTabs: POLISH_STYLES.map((s) => ({ key: s.key, label: s.label })),
    keywordsText: "",
    submitted: false,
    saved: false,
    usedItemIds: [] as string[],
    finished: false,
    loading: true,
    loadError: "",
    errorMistakes: [] as Array<{
      original: string;
      suggested: string;
      reason: string;
    }>,
    lessonName: "",
    hasInput: false,
  });

  const load = useCallback(async () => {
    setData({ loading: true, loadError: "", lessonId });
    try {
      const [lesson, bootstrap] = await Promise.all([
        mateService.getLesson(lessonId) as Promise<LessonDetail>,
        mateService.bootstrap().catch(() => null),
      ]);
      const tasks = lesson.sentenceTasks || [];
      const defaultStyle = (bootstrap?.user?.polishStyle ||
        "natural") as PolishStyle;
      const firstTask = tasks[0] || null;
      setData({
        lessonId: lesson.id,
        tasks,
        taskIndex: 0,
        current: firstTask,
        lessonName: lesson.name,
        loading: false,
        finished: tasks.length === 0,
        defaultStyle,
        activeStyle: defaultStyle,
        input: "",
        hasInput: false,
        feedback: null,
        submitted: false,
        saved: false,
        errorMistakes: [],
        keywordsText: firstTask ? renderKeywords(firstTask) : "",
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "加载失败，请重试";
      setData({ loading: false, loadError: msg });
      showToast({ title: msg, icon: "none" });
    }
  }, [lessonId, setData, showToast]);

  useEffect(() => {
    void load();
    return () => {
      stopAudio();
    };
  }, [load]);

  function onInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const input = e.target.value;
    setData({ input, hasInput: input.trim().length > 0 });
  }

  function currentPolish(): string {
    const f = ref.current.feedback;
    if (!f) return "";
    return f.styles?.[ref.current.activeStyle] || f.corrected || "";
  }

  function speakPolish() {
    const text = currentPolish();
    if (text) {
      void speakText(text);
    }
  }

  function useHint() {
    const task = ref.current.current;
    if (!task) return;
    if (task.type === "chinese") {
      void showModal({
        title: "提示",
        content: `参考：${task.reference}`,
        showCancel: false,
      });
    } else if (task.type === "scenario") {
      void showModal({
        title: "提示",
        content: `可参考：${task.reference}`,
        showCancel: false,
      });
    }
  }

  function startVoice() {
    if (ref.current.transcribing) return;
    const sample = getSampleForTask(ref.current.current);
    setData({ transcribing: true });
    showLoading({ title: "正在识别语音…", mask: true });
    setTimeout(() => {
      hideLoading();
      setData({
        input: sample,
        hasInput: sample.trim().length > 0,
        transcribing: false,
      });
      showToast({ title: "语音已转文字", icon: "success" });
    }, 520);
  }

  function fillSample() {
    const sample = getSampleForTask(ref.current.current);
    setData({
      input: sample,
      hasInput: sample.trim().length > 0,
    });
    showToast({ title: "已填入示例句，可直接提交批改", icon: "none" });
  }

  async function submit() {
    const sentence = ref.current.input.trim();
    const task = ref.current.current;
    if (!sentence || !task) {
      showToast({ title: "先写一句英文吧", icon: "none" });
      return;
    }
    if (ref.current.submitting) return;
    setData({ submitting: true });
    showLoading({ title: "AI 正在批改…", mask: true });
    try {
      const result = await mateService.saveSentenceAttempt({
        lessonId: ref.current.lessonId,
        taskId: task.id,
        taskType: task.type,
        prompt: task.instruction,
        hintExpression: task.hintExpression,
        keywords: task.keywords,
        userSentence: sentence,
        usedItemIds: ref.current.usedItemIds,
        polishStyle: ref.current.activeStyle,
      });
      const feedback = result.feedback;
      setData({
        feedback,
        activeStyle: ref.current.defaultStyle,
        submitted: true,
        submitting: false,
        errorMistakes: feedback.mistakes || [],
      });
      hideLoading();
    } catch (error) {
      hideLoading();
      setData({ submitting: false });
      showToast({
        title: error instanceof Error ? error.message : "批改失败",
        icon: "none",
      });
    }
  }

  function switchStyle(key: PolishStyle) {
    setData({ activeStyle: key });
  }

  async function toggleSave() {
    const f = ref.current.feedback;
    if (!f || ref.current.saved) return;
    try {
      const polished =
        f.styles?.[ref.current.activeStyle] || f.corrected || ref.current.input;
      await mateService.saveSentenceToLibrary({
        lessonId: ref.current.lessonId,
        original: ref.current.input,
        improved: polished,
        source: "attempt",
        sourceSentence: ref.current.input,
      });
      setData({ saved: true });
      showToast({ title: "已收藏到我的句子", icon: "success" });
    } catch {
      showToast({ title: "收藏失败", icon: "none" });
    }
  }

  function nextTask() {
    const next = ref.current.taskIndex + 1;
    if (next >= ref.current.tasks.length) {
      setData({ finished: true });
      return;
    }
    const task = ref.current.tasks[next];
    setData({
      taskIndex: next,
      current: task,
      input: "",
      hasInput: false,
      feedback: null,
      activeStyle: ref.current.defaultStyle,
      submitted: false,
      saved: false,
      errorMistakes: [],
      keywordsText: renderKeywords(task),
    });
  }

  function retryTask() {
    setData({
      input: "",
      hasInput: false,
      feedback: null,
      submitted: false,
      saved: false,
      errorMistakes: [],
    });
  }

  function done() {
    navigateBack();
  }

  const { current, feedback } = data;

  if (data.loading && !current) {
    return (
      <div className="page">
        <div className="empty">
          <span className="muted">正在读取造句题目…</span>
        </div>
      </div>
    );
  }

  if (data.loadError && !current) {
    return (
      <div className="page">
        <div className="empty">
          <div className="empty__title">造句题目加载失败</div>
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
    );
  }

  if (current && !data.finished) {
    return (
      <div className="page sentence-page">
        <div className="sentence-progress">
          <span>
            {data.tasks.length > 1
              ? `第 ${data.taskIndex + 1} / ${data.tasks.length} 题`
              : "造句练习"}
          </span>
          {current.type === "guided" ? (
            <span>引导造句</span>
          ) : current.type === "chinese" ? (
            <span>中文造句</span>
          ) : (
            <span>情景造句</span>
          )}
        </div>

        <div className="sentence-question">
          <span className="question-text">{current.instruction}</span>
          {data.keywordsText ? (
            <span className="question-keywords">{data.keywordsText}</span>
          ) : null}
          {!data.submitted && current.type !== "guided" ? (
            <button
              type="button"
              className="hint-button"
              onClick={useHint}
            >
              参考思路{" "}
              <MateIcon name="chevron-right" size={16} tone="muted" />
            </button>
          ) : null}
        </div>

        {!data.submitted ? (
          <>
            <div className="field sentence-field">
              <div className="field__label">你的句子</div>
              <textarea
                className="textarea sentence-input"
                placeholder="在这里输入英文…"
                value={data.input}
                onChange={onInput}
              />
            </div>
            <div className="voice-row">
              <button
                type="button"
                className="voice-input"
                onClick={startVoice}
                disabled={data.transcribing}
              >
                <MateIcon name="mic" size={18} tone="ink" />
                <span>{data.transcribing ? "正在识别…" : "语音输入"}</span>
              </button>
              <button
                type="button"
                className="voice-input"
                onClick={fillSample}
                disabled={data.transcribing}
              >
                <MateIcon name="pencil" size={16} tone="accent" />
                <span>填入示例句</span>
              </button>
              <span className="muted-sm">先转成文字，再提交批改</span>
            </div>
            <div className="action-bar">
              <button
                type="button"
                className="btn btn--primary btn--block"
                disabled={data.submitting || !data.hasInput}
                onClick={() => void submit()}
              >
                {data.submitting ? "AI 批改中…" : "提交，让 AI 批改"}
              </button>
            </div>
          </>
        ) : null}

        {data.submitted && feedback ? (
          <>
            <div className="feedback-original">
              <span className="field__label">你的原句</span>
              <span className="original-sentence">{data.input}</span>
            </div>

            {data.errorMistakes.length > 0 ? (
              <div className="feedback-section">
                <div className="h2">错误纠正</div>
                {data.errorMistakes.map((item, idx) => (
                  <div key={`${idx}-${item.original}`} className="feedback-block">
                    <div className="mistake-line">
                      <span className="mistake-orig">{item.original}</span>
                      <MateIcon name="chevron-right" size={16} tone="muted" />
                      <span className="mistake-fix en">{item.suggested}</span>
                    </div>
                    <span className="muted-sm">{item.reason}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="feedback-section feedback-good">
                <div className="feedback-ok">
                  <MateIcon name="check" size={20} tone="ink" />
                  <span>表达正确</span>
                </div>
                <span className="muted-sm">{feedback.comment}</span>
              </div>
            )}

            <div className="polish-section">
              <div className="h2">更地道的说法</div>
              <div className="mode-switch style-tabs">
                {data.styleTabs.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    className={`mode-option ${
                      data.activeStyle === item.key ? "mode-option--active" : ""
                    }`}
                    onClick={() => switchStyle(item.key)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="style-answer">
                <span className="en polish-sentence">
                  {feedback.styles[data.activeStyle] || feedback.corrected}
                </span>
                <div className="style-actions">
                  <button
                    type="button"
                    className="save-button"
                    onClick={() => void toggleSave()}
                  >
                    <MateIcon
                      name="star"
                      size={18}
                      tone={data.saved ? "accent" : "muted"}
                    />
                    <span>{data.saved ? "已收藏" : "收藏句子"}</span>
                  </button>
                  <button
                    type="button"
                    className="speaker"
                    aria-label="播放润色后句子的发音"
                    onClick={speakPolish}
                  >
                    <MateIcon name="volume-2" size={20} tone="ink" />
                  </button>
                </div>
              </div>
            </div>

            <div className="action-bar action-bar--row">
              <button
                type="button"
                className="btn btn--outline"
                onClick={retryTask}
              >
                再写一次
              </button>
              <button
                type="button"
                className="btn btn--primary"
                onClick={nextTask}
              >
                {data.taskIndex + 1 < data.tasks.length ? "下一题" : "完成"}
              </button>
            </div>
          </>
        ) : null}
      </div>
    );
  }

  return (
    <div className="page">
      <div className="done-wrap">
        <MateIcon name="check" size={28} tone="ink" />
        <div className="h1">
          {data.tasks.length ? "造句练习完成" : "这份资料暂无造句题目"}
        </div>
        <span className="muted">
          {data.tasks.length
            ? "你的句子和反馈已保存，接下来试试 AI 对练吧"
            : "返回学习单元，继续回忆或对练"}
        </span>
        <button
          type="button"
          className="btn btn--primary btn--block"
          onClick={done}
        >
          返回
        </button>
      </div>
    </div>
  );
}
