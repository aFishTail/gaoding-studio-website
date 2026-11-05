"use client";

import { useCallback, useEffect, useRef } from "react";
import { MateIcon } from "../components/MateIcon";
import { mateService } from "../mock/service";
import { useEmRouter } from "../runtime/router";
import { speakText, stopAudio } from "../runtime/tts";
import { useSetData } from "../runtime/useSetData";
import { useWx } from "../runtime/wx";
import type { HintLevel, PracticeMode } from "../types";

interface ChatMessage {
  role: "ai" | "user";
  text: string;
  audioPath?: string;
  isHint?: boolean;
  isError?: boolean;
  retryText?: string;
  suggestionState?: "loading" | "ready" | "error";
  suggestionExpression?: string;
  suggestionExplanation?: string;
  suggestionError?: string;
  suggestionVisible?: boolean;
}

function loadingHint(level: number): string {
  if (level === 1) return "💡 用中文给你一个思路…";
  if (level === 2) return "💡 给出关键词…";
  return "💡 给出一句参考表达…";
}

function demoHint(level: number): string {
  if (level === 1) return "告诉对方，你的航班延误了，需要改签或晚到。";
  if (level === 2) return "关键词：flight / delayed";
  return "参考表达：I'm afraid my flight has been delayed. Would it be possible to change to an earlier flight?";
}

export function ChatPage({ query }: { query: Record<string, string> }) {
  const { redirectTo, navigateBack } = useEmRouter();
  const {
    showToast,
    showLoading,
    hideLoading,
    showModal,
    setNavigationBarTitle,
  } = useWx();

  const initialMode = (query.mode as PracticeMode) || "guided";

  const [data, setData, ref] = useSetData({
    sessionId: query.sessionId || "session-demo",
    mode: initialMode,
    messages: [] as ChatMessage[],
    recording: false,
    recordingStarting: false,
    transcribing: false,
    sending: false,
    showingSuggestions: false,
    hintLevel: 0,
    hintText: "",
    hintVisible: false,
    scenarioExpanded: false,
    scenarioName: "",
    suggestedWords: [] as string[],
    suggestedExpressions: [] as string[],
    aiRole: "AI",
    userRole: "你",
    goal: "",
    finished: false,
    closing: false,
    startTime: Date.now(),
    transcriptDraft: "",
    showTranscriptModal: false,
    keyboardHeight: 0,
    guidedVisible: initialMode !== "free",
    goalCompleted: false,
  });

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const pointerDownAtRef = useRef<number>(0);
  const voiceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transcribeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finishedRef = useRef(false);

  const clearVoiceTimers = useCallback(() => {
    if (voiceTimerRef.current) {
      clearTimeout(voiceTimerRef.current);
      voiceTimerRef.current = null;
    }
    if (transcribeTimerRef.current) {
      clearTimeout(transcribeTimerRef.current);
      transcribeTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function initSession() {
      const requestedSessionId = query.sessionId || "session-demo";
      try {
        let session = await mateService.getPracticeSession(requestedSessionId);
        if (!session) {
          const started = await mateService.startPractice(
            "sc-networking",
            (query.mode as PracticeMode) || "guided",
          );
          session = await mateService.getPracticeSession(started.sessionId);
        }
        const scenario = await mateService.getScenario(
          session.scenarioId || "sc-networking",
        );
        if (cancelled) return;

        const mode = (query.mode as PracticeMode) || session.mode || "guided";
        const scenarioName = session.scenarioName || scenario.name;
        setNavigationBarTitle(scenarioName);

        const initialMessages: ChatMessage[] = [];
        for (const turn of session.turns || []) {
          if (turn.userText) {
            initialMessages.push({
              role: "user",
              text: turn.userText,
            });
          }
          if (turn.assistantText) {
            initialMessages.push({
              role: "ai",
              text: turn.assistantText,
              audioPath: turn.audioPath,
            });
          }
        }

        const userTurnsCount = initialMessages.filter((m) => m.role === "user").length;

        setData({
          sessionId: session.id,
          mode,
          guidedVisible: mode !== "free",
          scenarioName,
          userRole: scenario.userRole || "你",
          aiRole: scenario.aiRole || "AI",
          goal: scenario.goal || "",
          suggestedWords: (scenario.suggestedWords || []).map((w) => w.text),
          suggestedExpressions: (scenario.suggestedExpressions || []).map(
            (e) => e.text,
          ),
          messages: initialMessages,
          goalCompleted: userTurnsCount >= 2,
          startTime: Date.now(),
        });
      } catch {
        if (!cancelled) {
          showToast({ title: "对练启动失败，请重试", icon: "none" });
        }
      }
    }

    void initSession();
    return () => {
      cancelled = true;
      clearVoiceTimers();
      stopAudio();
    };
  }, [query.sessionId, query.mode, clearVoiceTimers, setData, setNavigationBarTitle, showToast]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [data.messages.length, data.hintVisible, data.sending]);

  function toggleScenario() {
    setData({ scenarioExpanded: !ref.current.scenarioExpanded });
  }

  function playMessage(index: number) {
    if (ref.current.recording || ref.current.recordingStarting) return;
    const message = ref.current.messages[index];
    if (!message || message.isError || !message.text) return;
    void speakText(message.text);
  }

  async function requestSuggestion(index: number) {
    const messages = ref.current.messages;
    const message = messages[index];
    if (!message || message.role !== "user" || message.suggestionState === "loading") {
      return;
    }
    if (message.suggestionState === "ready") {
      const next = [...messages];
      next[index] = {
        ...message,
        suggestionVisible: !message.suggestionVisible,
      };
      setData({ messages: next });
      return;
    }

    const userTurnIndex = messages
      .slice(0, index)
      .filter((m) => m.role === "user").length;

    const loadingMessages = [...messages];
    loadingMessages[index] = {
      ...message,
      suggestionState: "loading",
      suggestionVisible: true,
    };
    setData({ messages: loadingMessages });

    try {
      const result = await mateService.getTurnSuggestion(
        ref.current.sessionId,
        userTurnIndex,
      );
      const updated = [...ref.current.messages];
      if (updated[index]) {
        updated[index] = {
          ...updated[index],
          suggestionState: "ready",
          suggestionExpression: result.expression,
          suggestionExplanation: result.explanation,
          suggestionVisible: true,
        };
        setData({ messages: updated });
      }
    } catch (error) {
      const updated = [...ref.current.messages];
      if (updated[index]) {
        updated[index] = {
          ...updated[index],
          suggestionState: "error",
          suggestionError:
            error instanceof Error ? error.message : "建议生成失败，点击重试",
        };
        setData({ messages: updated });
      }
    }
  }

  const finishVoiceCapture = useCallback(() => {
    if (!ref.current.recording) return;
    setData({ recording: false, transcribing: true });
    showLoading({ title: "正在识别…", mask: true });
    transcribeTimerRef.current = setTimeout(() => {
      transcribeTimerRef.current = null;
      hideLoading();
      const sample = mateService.getNextVoiceSample(ref.current.sessionId);
      setData({
        transcribing: false,
        showTranscriptModal: true,
        transcriptDraft: sample,
        keyboardHeight: 0,
      });
    }, 400);
  }, [hideLoading, ref, setData, showLoading]);

  function startVoice() {
    if (
      ref.current.closing ||
      ref.current.recording ||
      ref.current.recordingStarting ||
      ref.current.sending ||
      ref.current.transcribing ||
      ref.current.showTranscriptModal
    ) {
      return;
    }
    clearVoiceTimers();
    pointerDownAtRef.current = Date.now();
    setData({ recordingStarting: false, recording: true });
  }

  function stopVoice() {
    if (!ref.current.recording) return;
    const elapsed = Date.now() - pointerDownAtRef.current;
    const remaining = Math.max(0, 600 - elapsed);
    if (voiceTimerRef.current) clearTimeout(voiceTimerRef.current);
    voiceTimerRef.current = setTimeout(() => {
      voiceTimerRef.current = null;
      finishVoiceCapture();
    }, remaining);
  }

  function handleMicClick() {
    // Support keyboard activation (Enter/Space) when pointer events didn't trigger recording
    if (
      !ref.current.recording &&
      !ref.current.transcribing &&
      !ref.current.showTranscriptModal &&
      Date.now() - pointerDownAtRef.current > 1000
    ) {
      startVoice();
      stopVoice();
    }
  }

  function cancelTranscript() {
    setData({
      showTranscriptModal: false,
      transcriptDraft: "",
      keyboardHeight: 0,
    });
  }

  async function confirmTranscript() {
    const text = ref.current.transcriptDraft.trim();
    if (!text) {
      showToast({ title: "请先输入要说的话", icon: "none" });
      return;
    }
    setData({
      showTranscriptModal: false,
      transcriptDraft: "",
      keyboardHeight: 0,
    });
    await sendUserText(text);
  }

  function openKeyboard() {
    if (ref.current.closing) return;
    const draft =
      ref.current.transcriptDraft.trim() ||
      mateService.getNextVoiceSample(ref.current.sessionId);
    setData({
      showTranscriptModal: true,
      transcriptDraft: draft,
      keyboardHeight: 0,
    });
  }

  async function sendUserText(text: string) {
    if (ref.current.closing || ref.current.sending) return;
    const userMsg: ChatMessage = { role: "user", text };
    setData({
      messages: [...ref.current.messages, userMsg],
      sending: true,
      hintVisible: false,
      hintLevel: 0,
    });
    try {
      const result = await mateService.practiceTurn(ref.current.sessionId, text);
      const aiMsg: ChatMessage = {
        role: "ai",
        text: result.assistantText,
        audioPath: result.audioPath,
      };
      setData({
        messages: [...ref.current.messages, aiMsg],
        sending: false,
        goalCompleted: Boolean(result.goalCompleted),
      });
      if (result.assistantText) {
        void speakText(result.assistantText, { silent: true });
      }
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "抱歉，这次没回复成功。";
      setData({
        messages: [
          ...ref.current.messages,
          { role: "ai", text: message, isError: true, retryText: text },
        ],
        sending: false,
      });
    }
  }

  async function retrySend(index: number) {
    if (ref.current.closing || ref.current.sending) return;
    const message = ref.current.messages[index];
    if (!message || !message.isError || !message.retryText) return;
    const text = message.retryText;
    const messages = ref.current.messages.slice(0, index);
    const last = messages[messages.length - 1];
    if (last && last.role === "user" && last.text === text) {
      messages.pop();
    }
    setData({ messages });
    await sendUserText(text);
  }

  async function requestHint() {
    const nextLevel = ((ref.current.hintLevel % 3) + 1) as HintLevel;
    setData({
      hintLevel: nextLevel,
      hintText: loadingHint(nextLevel),
      hintVisible: true,
    });
    try {
      const result = await mateService.getPracticeHint(
        ref.current.sessionId,
        nextLevel,
      );
      setData({ hintText: result.text });
    } catch {
      setData({ hintText: demoHint(nextLevel) });
    }
  }

  async function endPractice() {
    const res = await showModal({
      title: "结束对练",
      content: "结束本次对练并查看复盘吗？",
      confirmText: "结束",
      cancelText: "继续练",
    });
    if (res.confirm) {
      await finishAndRecap();
    }
  }

  async function finishAndRecap() {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setData({ finished: true, closing: true, showTranscriptModal: false });
    const duration = Math.max(
      1,
      Math.round((Date.now() - ref.current.startTime) / 1000),
    );
    showLoading({ title: "AI 正在复盘…", mask: true });
    try {
      await mateService.completePractice(ref.current.sessionId, duration);
      hideLoading();
      redirectTo(
        `/packages/practice/pages/recap/index?sessionId=${ref.current.sessionId}`,
      );
    } catch (error) {
      finishedRef.current = false;
      setData({ finished: false });
      hideLoading();
      const res = await showModal({
        title: "复盘生成失败",
        content:
          error instanceof Error
            ? error.message
            : "网络异常，已保存的对话不会丢失。",
        confirmText: "重试",
        cancelText: "稍后",
      });
      if (res.confirm) {
        await finishAndRecap();
      }
    }
  }

  if (data.finished) {
    return null;
  }

  return (
    <div className="chat-page">
      {/* 推荐标签（提示对练模式） */}
      {data.guidedVisible ? (
        <div className="suggest-bar" style={{ overflowX: "auto" }}>
          <div className="suggest-inner">
            <span className="suggest-label">试试说：</span>
            {data.suggestedWords.map((item) => (
              <span key={`w-${item}`} className="chip chip--green">
                {item}
              </span>
            ))}
            {data.suggestedExpressions.map((item) => (
              <span key={`e-${item}`} className="chip chip--sky">
                {item}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {/* 消息流 */}
      <div className="chat-scroll" style={{ overflowY: "auto" }}>
        <div className="chat-list">
          {data.messages.map((item, index) => (
            <div key={index}>
              <div
                className={`msg-row ${item.role === "user" ? "msg-row--user" : "msg-row--ai"}`}
              >
                <div
                  className={`message-content ${item.role === "user" ? "message-content--user" : ""}`}
                >
                  <div className="message-bubble-group">
                    <div
                      className={`bubble ${item.role === "user" ? "bubble--user" : "bubble--ai"} ${item.isHint ? "bubble--hint" : ""} ${item.isError ? "bubble--error" : ""}`}
                    >
                      {item.text}
                    </div>
                    {item.isError && item.retryText && !data.closing ? (
                      <div className="message-actions message-actions--retry">
                        <button
                          type="button"
                          className="message-action"
                          onClick={() => void retrySend(index)}
                          aria-label="重试这条回复"
                        >
                          重试
                        </button>
                      </div>
                    ) : null}
                    {!item.isError && item.text ? (
                      <div
                        className={`message-actions ${item.role === "user" ? "message-actions--user" : ""}`}
                      >
                        <button
                          type="button"
                          className="message-action"
                          onClick={() => playMessage(index)}
                          aria-label="播放这条消息的英文发音"
                        >
                          <MateIcon name="volume-2" size={18} tone="ink" />
                        </button>
                        {item.role === "user" && data.guidedVisible ? (
                          <button
                            type="button"
                            className="message-action message-action--ai"
                            onClick={() => void requestSuggestion(index)}
                            aria-label={
                              item.suggestionState === "ready" &&
                              item.suggestionVisible
                                ? "收起 AI 建议"
                                : "查看 AI 建议"
                            }
                          >
                            <span aria-hidden="true">AI</span>
                          </button>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                  {item.role === "user" && item.suggestionVisible ? (
                    <div className="message-suggestion">
                      {item.suggestionState === "loading" ? (
                        <span>AI 建议生成中…</span>
                      ) : item.suggestionState === "ready" ? (
                        <>
                          <span className="suggestion-label">AI 建议</span>
                          <span className="suggestion-expression">
                            {item.suggestionExpression}
                          </span>
                          <span>{item.suggestionExplanation}</span>
                        </>
                      ) : item.suggestionState === "error" ? (
                        <button
                          type="button"
                          className="suggestion-retry"
                          onClick={() => void requestSuggestion(index)}
                        >
                          {item.suggestionError || "建议生成失败，点击重试"}
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>

              {index === 0 && item.role === "ai" ? (
                <div className="scenario-info">
                  <button
                    type="button"
                    className="scenario-toggle"
                    onClick={toggleScenario}
                    aria-label={
                      data.scenarioExpanded ? "收起场景提示" : "展开场景提示"
                    }
                  >
                    <span>场景提示</span>
                    <span className="scenario-arrow">
                      {data.scenarioExpanded ? "收起" : "展开"}
                    </span>
                    <MateIcon
                      name={data.scenarioExpanded ? "chevron-up" : "chevron-down"}
                      size={16}
                      tone="muted"
                    />
                  </button>
                  {data.scenarioExpanded ? (
                    <div className="scenario-details">
                      <span>你 · {data.userRole}</span>
                      <span>AI · {data.aiRole}</span>
                      {data.goal ? <span>对话目标 · {data.goal}</span> : null}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          ))}

          {/* 提示 */}
          {data.hintVisible ? (
            <div className="msg-row msg-row--ai">
              <div className="bubble bubble--hint">{data.hintText}</div>
            </div>
          ) : null}

          {/* 正在输入 */}
          {data.sending ? (
            <div className="msg-row msg-row--ai">
              <div className="bubble bubble--ai typing-dots">
                <span>AI 思考中…</span>
              </div>
            </div>
          ) : null}

          <div id="msg-bottom" ref={bottomRef} style={{ height: 8 }} />
        </div>
      </div>

      {/* 目标完成提示 */}
      {data.goalCompleted && !data.sending && !data.closing ? (
        <div className="hint-bar" onClick={() => void endPractice()}>
          <div className="hint-btn" style={{ cursor: "pointer" }}>
            <MateIcon name="check" size={16} tone="ink" />
            <span>目标已完成，结束并查看复盘</span>
          </div>
        </div>
      ) : null}

      {/* 提示按钮 */}
      {!data.sending && data.guidedVisible && !data.closing ? (
        <div className="hint-bar" onClick={() => void requestHint()}>
          <div className="hint-btn" style={{ cursor: "pointer" }}>
            <MateIcon name="lightbulb" size={16} tone="ink" />
            <span>提示（{(data.hintLevel % 3) + 1}/3）</span>
          </div>
        </div>
      ) : null}

      {/* 底部操作 */}
      <div className="chat-footer">
        {data.closing ? (
          <div>
            <span className="muted-sm">本次对练已停止，复盘尚未确认保存。</span>
            <button
              type="button"
              className="btn btn--primary btn--block"
              onClick={() => void finishAndRecap()}
            >
              重试保存复盘
            </button>
            <button
              type="button"
              className="btn btn--ghost btn--block"
              onClick={() => navigateBack()}
            >
              返回
            </button>
          </div>
        ) : (
          <div className="chat-tools">
            <button
              type="button"
              className="tool-btn"
              onClick={() => void endPractice()}
            >
              <MateIcon name="x" size={18} tone="muted" />
              <span>结束</span>
            </button>
            <div
              className={`mic-wrap ${data.recording ? "mic-wrap--recording" : ""}`}
              role="button"
              tabIndex={0}
              style={{ cursor: "pointer" }}
              aria-label={data.recording ? "正在录音，松开发送" : "按住说话"}
              onPointerDown={startVoice}
              onPointerUp={stopVoice}
              onPointerCancel={stopVoice}
              onClick={handleMicClick}
            >
              <div className="mic-icon">
                <MateIcon name="mic" size={20} tone="inverse" />
                <span>{data.recording ? "录音中" : "说话"}</span>
              </div>
              <span className="mic-label">
                {data.recordingStarting
                  ? "正在启动…"
                  : data.transcribing
                    ? "正在识别…"
                    : data.recording
                      ? "松开发送"
                      : "按住说话"}
              </span>
            </div>
            <button type="button" className="tool-btn" onClick={openKeyboard}>
              <MateIcon name="keyboard" size={18} tone="muted" />
              <span>键盘</span>
            </button>
          </div>
        )}
      </div>

      {/* 转写/文本输入（轮次式降级 + 键盘） */}
      {data.showTranscriptModal && !data.closing ? (
        <div
          className="modal-mask"
          id="transcript-mask"
          style={{ paddingBottom: `${data.keyboardHeight}px` }}
          onClick={(e) => {
            if ((e.target as HTMLElement).id === "transcript-mask") {
              cancelTranscript();
            }
          }}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <span className="h3">说点什么</span>
              <button
                type="button"
                className="modal-cancel"
                onClick={cancelTranscript}
              >
                取消
              </button>
            </div>
            <textarea
              className="textarea modal-textarea"
              value={data.transcriptDraft}
              onChange={(e) => setData({ transcriptDraft: e.target.value })}
              placeholder="输入英文句子…"
              maxLength={800}
            />
            <button
              type="button"
              className="btn btn--primary btn--block"
              onClick={() => void confirmTranscript()}
            >
              发送
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
