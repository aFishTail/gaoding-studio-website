"use client";

import { useEffect } from "react";
import { MateIcon } from "../components/MateIcon";
import { useEmRouter } from "../runtime/router";
import { useSetData } from "../runtime/useSetData";

const STEPS = ["正在提取资料文字", "正在整理学习内容", "正在生成学习单元"];
const STEP_INTERVAL_MS = 900;

function getStepCopy(stepIndex: number, type?: string): { title: string; subtitle: string } {
  if (stepIndex === 0) {
    if (type === "image") {
      return { title: "正在提取图片文字", subtitle: "正在按图片顺序识别英语内容" };
    }
    if (type === "pdf") {
      return { title: "正在解析 PDF", subtitle: "正在提取文档文字，可能需要几分钟" };
    }
    return { title: "正在提取资料文字", subtitle: "即将开始提取文字内容" };
  }
  if (stepIndex === 1) {
    return { title: "正在整理学习内容", subtitle: "正在提炼单词、表达和语法点" };
  }
  if (stepIndex === 2) {
    return { title: "正在生成学习单元", subtitle: "正在生成造句练习与 AI 对练场景" };
  }
  return { title: "解析完成", subtitle: "正在打开学习内容确认页" };
}

export function ParsingPage({ query }: { query: Record<string, string> }) {
  const { redirectTo, navigateTo } = useEmRouter();

  const initialCopy = getStepCopy(0, query.type);

  const [data, setData] = useSetData({
    materialId: query.materialId || "mat-smalltalk",
    jobId: query.jobId || "job-demo",
    title: initialCopy.title,
    subtitle: initialCopy.subtitle,
    errorMessage: "",
    failed: false,
    waitingPaused: false,
    retrying: false,
    steps: STEPS.map((text, idx) => ({
      text,
      done: false,
      active: idx === 0,
    })),
  });

  useEffect(() => {
    const timers: Array<ReturnType<typeof setTimeout>> = [];

    const applyStep = (stepIndex: number) => {
      const ready = stepIndex >= STEPS.length;
      const copy = getStepCopy(stepIndex, query.type);
      setData({
        title: copy.title,
        subtitle: copy.subtitle,
        steps: STEPS.map((text, idx) => ({
          text,
          done: ready || idx < stepIndex,
          active: !ready && idx === stepIndex,
        })),
      });
    };

    applyStep(0);

    timers.push(
      setTimeout(() => {
        applyStep(1);
      }, STEP_INTERVAL_MS),
    );

    timers.push(
      setTimeout(() => {
        applyStep(2);
      }, STEP_INTERVAL_MS * 2),
    );

    timers.push(
      setTimeout(() => {
        applyStep(3);
        redirectTo("/packages/material/pages/confirm/index?draftId=draft-demo");
      }, STEP_INTERVAL_MS * 3),
    );

    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, [query.type, redirectTo, setData]);

  function viewSource() {
    if (!data.materialId) return;
    navigateTo(
      `/packages/material/pages/source/index?materialId=${encodeURIComponent(
        data.materialId,
      )}`,
    );
  }

  function addMaterialAgain() {
    navigateTo("/packages/material/pages/add/index");
  }

  return (
    <div className="page parsing-page">
      <div className="parsing-status">
        {!data.failed && !data.waitingPaused ? (
          <div className="spinner" />
        ) : data.failed ? (
          <MateIcon name="x" size={24} tone="accent" />
        ) : (
          <MateIcon name="clock" size={24} tone="muted" />
        )}
      </div>
      <div className="h1">{data.title}</div>
      <span className="parsing-subtitle">{data.subtitle}</span>

      <div className="parsing-steps">
        {data.steps.map((item) => (
          <div key={item.text} className="parse-step">
            <div
              className={`step-dot ${item.done ? "step-dot--done" : ""} ${item.active ? "step-dot--active" : ""}`}
            >
              {item.done && <MateIcon name="check" size={14} tone="inverse" />}
            </div>
            <span
              className={`step-text ${item.active ? "step-text--active" : ""} ${item.done ? "step-text--done" : ""}`}
            >
              {item.text}
            </span>
          </div>
        ))}
      </div>

      {data.errorMessage ? (
        <div className="parse-notice">{data.errorMessage}</div>
      ) : null}

      {(data.failed || data.waitingPaused) && (
        <div className="parse-actions">
          {data.waitingPaused && !data.failed && (
            <button type="button" className="btn btn--primary">
              继续查询
            </button>
          )}
          {data.failed && (
            <>
              <button
                type="button"
                className="btn btn--primary"
                disabled={data.retrying}
              >
                重试本步骤
              </button>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={viewSource}
              >
                查看原资料
              </button>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={addMaterialAgain}
              >
                重新添加资料
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
