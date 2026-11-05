"use client";

import { useEffect, useState } from "react";
import { mateService } from "../mock/service";
import { useWx } from "../runtime/wx";
import type {
  CheckinPayload,
  LessonSharePayload,
  PracticeSharePayload,
  ShareKind,
  SharePayload,
} from "../types";
import { MateIcon } from "./MateIcon";

const KIND_COPY: Record<
  ShareKind,
  { heading: string; visible: string; hidden: string }
> = {
  lesson: {
    heading: "分享学习单元",
    visible:
      "单元名称与简介、单词、表达、语法、例句、造句题和对练场景，以及你的昵称和头像。",
    hidden:
      "你的学习进度、收藏、原始资料文件与来源图片。好友添加后得到自己的一份，之后互不影响。",
  },
  checkin: {
    heading: "今日打卡",
    visible:
      "你的昵称和头像、连续学习天数、今天的学习时长与复习数量，以及一条今天学到的内容。",
    hidden: "你的学习资料、作答内容和其他学习记录。",
  },
  practice: {
    heading: "分享这次对练",
    visible: "场景与角色、对练时长和轮数，以及你选择展示的一句话。",
    hidden: "对话全文、复盘建议和你的学习资料。",
  },
};

const POSTER_BACKGROUNDS = [
  { name: "林间", src: "/demos/english-mate/poster/forest.jpg" },
  { name: "海岸", src: "/demos/english-mate/poster/coast.jpg" },
  { name: "山雾", src: "/demos/english-mate/poster/mountain.jpg" },
];

function buildPreview(kind: ShareKind, payload: SharePayload, nickname: string): {
  title: string;
  lines: string[];
} {
  if (kind === "lesson") {
    const p = payload as LessonSharePayload;
    return {
      title: p.name,
      lines: [
        `${p.wordCount} 个单词 · ${p.expressionCount} 条表达 · ${p.grammarCount} 项语法`,
        `来自 ${nickname} 整理的学习单元`,
      ],
    };
  }
  if (kind === "practice") {
    const p = payload as PracticeSharePayload;
    const mins = Math.max(1, Math.round(p.durationSeconds / 60));
    const lines = [
      `对练 ${mins} 分钟 · ${p.turnCount} 轮对话 · 用上 ${p.usedCount} 项词句`,
    ];
    if (p.sentence) lines.push(`“${p.sentence}”`);
    return {
      title: p.scenarioName,
      lines,
    };
  }
  const p = payload as CheckinPayload;
  const lines = [
    `今日学习 ${p.minutes} 分钟 · 复习 ${p.reviewedCount} 项内容`,
  ];
  if (p.highlight) {
    lines.push(`今日学到：${p.highlight.text}（${p.highlight.meaning}）`);
  }
  return {
    title: `已连续学习 ${p.streakDays} 天`,
    lines,
  };
}

export function SharePanel({
  show,
  kind,
  sourceId = "",
  sentences = [],
  onClose,
}: {
  show: boolean;
  kind: ShareKind;
  sourceId?: string;
  sentences?: string[];
  onClose: () => void;
}) {
  const { showToast, setTabBarHidden } = useWx();
  const [status, setStatus] = useState<"idle" | "preparing" | "ready" | "error">("idle");
  const [selected, setSelected] = useState(0);
  const [previewTitle, setPreviewTitle] = useState("");
  const [previewLines, setPreviewLines] = useState<string[]>([]);
  const [posterBackground, setPosterBackground] = useState(0);
  const [posterReady, setPosterReady] = useState(false);
  const [posterBusy, setPosterBusy] = useState(false);
  const [checkinPayload, setCheckinPayload] = useState<CheckinPayload | null>(null);

  useEffect(() => {
    setTabBarHidden(show);
    return () => {
      setTabBarHidden(false);
    };
  }, [show, setTabBarHidden]);

  useEffect(() => {
    if (!show) return;
    let cancelled = false;

    async function load() {
      await Promise.resolve();
      if (cancelled) return;
      setStatus("preparing");
      setPosterReady(false);
      try {
        const share =
          kind === "lesson"
            ? await mateService.createLessonShare(sourceId || "lesson-smalltalk")
            : kind === "practice"
              ? await mateService.createPracticeShare(
                  sourceId || "session-demo",
                  selected,
                )
              : await mateService.createCheckin();
        if (cancelled) return;
        const spec = buildPreview(share.kind, share.payload, share.sharer.nickname);
        setPreviewTitle(spec.title);
        setPreviewLines(spec.lines);
        if (share.kind === "checkin") {
          setCheckinPayload(share.payload as CheckinPayload);
        }
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [show, kind, sourceId, selected]);

  if (!show) return null;

  const copy = KIND_COPY[kind] || KIND_COPY.lesson;
  const isCheckin = kind === "checkin";

  function handleMakePoster() {
    setPosterBusy(true);
    setTimeout(() => {
      setPosterBusy(false);
      setPosterReady(true);
    }, 360);
  }

  return (
    <>
      <div className="share-mask" onClick={onClose} />
      <div className="share-sheet" role="dialog" aria-label={copy.heading}>
        <div className="share-sheet__content" style={{ maxHeight: "82vh", overflowY: "auto" }}>
          <div className="share-head">
            <div className="h2">{copy.heading}</div>
            <button
              type="button"
              className="share-close"
              onClick={onClose}
              aria-label="关闭"
            >
              <MateIcon name="x" size={20} tone="muted" />
            </button>
          </div>

          {kind === "practice" && sentences.length > 0 && (
            <div className="share-section">
              <span className="share-label">展示一句你说得好的话</span>
              {sentences.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`share-option ${selected === idx ? "share-option--active" : ""}`}
                  onClick={() => setSelected(idx)}
                  role="radio"
                  aria-checked={selected === idx}
                >
                  <MateIcon
                    name={selected === idx ? "circle-check" : "quote"}
                    size={18}
                    tone={selected === idx ? "accent" : "muted"}
                  />
                  <span className="grow">{item}</span>
                </button>
              ))}
              <button
                type="button"
                className={`share-option ${selected === -1 ? "share-option--active" : ""}`}
                onClick={() => setSelected(-1)}
                role="radio"
                aria-checked={selected === -1}
              >
                <MateIcon
                  name={selected === -1 ? "circle-check" : "x"}
                  size={18}
                  tone={selected === -1 ? "accent" : "muted"}
                />
                <span className="grow">不展示句子</span>
              </button>
            </div>
          )}

          {status === "ready" ? (
            <div className="share-preview">
              <span className="share-preview__title">{previewTitle}</span>
              {previewLines.map((line, i) => (
                <span key={i} className="share-preview__line">
                  {line}
                </span>
              ))}
            </div>
          ) : status === "error" ? (
            <div className="share-state">
              <span className="danger">分享内容准备失败，请重试</span>
              <button
                type="button"
                className="btn btn--sm btn--secondary"
                onClick={() => setStatus("ready")}
              >
                重试
              </button>
            </div>
          ) : (
            <div className="share-state">
              <span className="muted">正在准备分享内容…</span>
            </div>
          )}

          <div className="share-disclosure">
            <div>
              <span className="share-label">好友会看到</span>
              <span className="share-copy">{copy.visible}</span>
            </div>
            <div>
              <span className="share-label">不会公开</span>
              <span className="share-copy">{copy.hidden}</span>
            </div>
          </div>

          {isCheckin && status === "ready" && (
            <div className="poster-backgrounds">
              <span className="share-label">选择海报背景</span>
              <div className="poster-backgrounds__options" role="radiogroup" aria-label="海报背景">
                {POSTER_BACKGROUNDS.map((bg, idx) => (
                  <button
                    key={bg.src}
                    type="button"
                    className={`poster-background ${posterBackground === idx ? "poster-background--active" : ""}`}
                    onClick={() => setPosterBackground(idx)}
                    role="radio"
                    aria-checked={posterBackground === idx}
                  >
                    <img
                      className="poster-background__image"
                      src={bg.src}
                      alt={bg.name}
                    />
                    <span>{bg.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {isCheckin && posterReady && (
            <div className="share-poster">
              <div className="em-poster-card">
                <div className="em-poster-cover">
                  <img
                    src={POSTER_BACKGROUNDS[posterBackground].src}
                    alt={POSTER_BACKGROUNDS[posterBackground].name}
                  />
                  <div className="em-poster-overlay">
                    <div className="em-poster-streak">
                      连续学习 {checkinPayload?.streakDays || 5} 天
                    </div>
                    <div className="em-poster-sub">
                      今日学习 {checkinPayload?.minutes || 8} 分钟 · 复习{" "}
                      {checkinPayload?.reviewedCount || 5} 项
                    </div>
                  </div>
                </div>
                <div className="em-poster-body">
                  <div className="em-poster-word">
                    {checkinPayload?.highlight?.text ||
                      "deal with unsuitable conversation topics"}
                  </div>
                  <div className="em-poster-meaning">
                    {checkinPayload?.highlight?.meaning || "应对不合适的谈话话题"}
                  </div>
                  <div className="em-poster-foot">
                    <span>拿来练英语 · 个人语言手册</span>
                    <span>林知夏</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="share-actions">
            <button
              type="button"
              className="btn btn--primary btn--block"
              disabled={status !== "ready"}
              onClick={() => {
                showToast({ title: "已模拟发送给微信好友", icon: "success" });
                onClose();
              }}
            >
              <MateIcon name="share-2" size={18} tone="inverse" />
              发送给好友
            </button>
            {isCheckin &&
              (posterReady ? (
                <button
                  type="button"
                  className="btn btn--secondary btn--block"
                  onClick={() =>
                    showToast({ title: "海报已准备就绪（演示模式）", icon: "success" })
                  }
                >
                  <MateIcon name="download" size={18} tone="ink" />
                  发朋友圈或保存海报
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn--secondary btn--block"
                  disabled={status !== "ready" || posterBusy}
                  onClick={handleMakePoster}
                >
                  <MateIcon name="image" size={18} tone="ink" />
                  {posterBusy ? "正在生成海报…" : "生成打卡海报"}
                </button>
              ))}
          </div>
        </div>
      </div>
    </>
  );
}
