"use client";

import { useCallback, useEffect } from "react";
import { MateIcon } from "../components/MateIcon";
import { mateService, subscribeDemoState } from "../mock/service";
import { useEmRouter } from "../runtime/router";
import { useSetData } from "../runtime/useSetData";
import { useWx } from "../runtime/wx";
import type { Lesson } from "../types";

interface LessonRow extends Lesson {
  progressLabel: string;
}

export function LessonsPage() {
  const { navigateTo, showSeq } = useEmRouter();
  const { showToast } = useWx();

  const [data, setData] = useSetData({
    lessons: [] as LessonRow[],
    loading: true,
    error: "",
  });

  const refresh = useCallback(async () => {
    setData({ loading: true, error: "" });
    try {
      const lessons = await mateService.listLessons();
      const rows: LessonRow[] = lessons.map((l) => ({
        ...l,
        progressLabel: `${l.progress}%`,
      }));
      setData({ lessons: rows, loading: false });
    } catch (error) {
      setData({ loading: false, error: "资料暂时未能加载，请重试。" });
      showToast({
        title: error instanceof Error ? error.message : "加载失败",
        icon: "none",
      });
    }
  }, [setData, showToast]);

  useEffect(() => {
    void refresh();
  }, [refresh, showSeq]);

  useEffect(() => {
    return subscribeDemoState(() => {
      void refresh();
    });
  }, [refresh]);

  function openLesson(id: string) {
    navigateTo(`/packages/study/pages/lesson-detail/index?id=${id}`);
  }

  function goAdd() {
    navigateTo("/packages/material/pages/add/index");
  }

  return (
    <div className="page page--tab lessons-page">
      <div className="lessons-head row row--between">
        <div>
          <div className="h1">你的学习资料</div>
          <div className="lessons-intro">每一份资料，都能慢慢变成自己的表达</div>
        </div>
        <button
          type="button"
          className="lessons-add"
          onClick={goAdd}
          aria-label="添加资料"
        >
          <MateIcon name="plus" size={22} tone="accent" />
        </button>
      </div>

      {data.loading && !data.lessons.length ? (
        <div className="empty">
          <div className="empty__desc">正在读取资料…</div>
        </div>
      ) : data.error ? (
        <div className="lessons-error">
          <div>{data.error}</div>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => void refresh()}
          >
            重新加载
          </button>
        </div>
      ) : data.lessons.length > 0 ? (
        <div className="lessons">
          {data.lessons.map((item) => (
            <button
              key={item.id}
              type="button"
              className="lesson-row"
              onClick={() => openLesson(item.id)}
            >
              <div className="row gap-16">
                <div className="grow">
                  <div className="lesson-name">{item.name}</div>
                  <div className="lesson-meta">
                    {item.wordCount} 个单词 · {item.expressionCount} 条表达 ·{" "}
                    {item.grammarCount} 项语法
                  </div>
                </div>
                <MateIcon name="chevron-right" size={18} tone="muted" />
              </div>
              <div className="lesson-progress-meta">
                <span>学习进度</span>
                <span>{item.progressLabel}</span>
              </div>
              <div className="progress-track progress-track--thin">
                <div
                  className="progress-fill"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="empty">
          <div className="empty__title">添加你的第一份资料</div>
          <div className="empty__desc">
            上传书页、PDF 或文本，再选择想学的单词、表达和语法。
          </div>
          <button
            type="button"
            className="btn btn--primary btn--block"
            onClick={goAdd}
          >
            添加学习资料
          </button>
        </div>
      )}
    </div>
  );
}
