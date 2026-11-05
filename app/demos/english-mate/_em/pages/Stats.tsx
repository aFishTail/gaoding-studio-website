"use client";

import { useCallback, useEffect } from "react";
import { MateIcon } from "../components/MateIcon";
import { SharePanel } from "../components/SharePanel";
import { mateService, subscribeDemoState } from "../mock/service";
import { useEmRouter } from "../runtime/router";
import { useSetData } from "../runtime/useSetData";
import { useWx } from "../runtime/wx";

interface StatsBar {
  date: string;
  label: string;
  value: number;
  height: number;
  isToday: boolean;
}

interface StatsView {
  todayMinutes: number;
  todayCount: number;
  weekMinutes: number;
  weekNewWords: number;
  weekNewExpressions: number;
  practiceMinutes: number;
  streakDays: number;
  totalWords: number;
  totalExpressions: number;
  masteredCount: number;
  totalLessons: number;
  totalSessions: number;
  totalSentences: number;
  bars: StatsBar[];
}

function weekdayShort(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return ["日", "一", "二", "三", "四", "五", "六"][new Date(y, m - 1, d).getDay()] || "";
}

export function StatsPage() {
  const { showSeq } = useEmRouter();
  const { showToast } = useWx();

  const [data, setData] = useSetData({
    stats: null as StatsView | null,
    loading: true,
    shareVisible: false,
  });

  const refresh = useCallback(async () => {
    try {
      const s = await mateService.getStats();
      const maxMin = Math.max(1, ...s.daily.map((d) => d.minutes));
      const bars: StatsBar[] = s.daily.map((d, idx) => {
        const isToday = idx === s.daily.length - 1 || d.date === "2026-10-31";
        return {
          date: d.date,
          label: isToday ? "今" : weekdayShort(d.date),
          value: Math.round(d.minutes),
          height: Math.max(6, Math.round((d.minutes / maxMin) * 100)),
          isToday,
        };
      });
      const view: StatsView = {
        todayMinutes: Math.round(s.today.minutes),
        todayCount: s.today.learnedCount,
        weekMinutes: Math.round(s.week.minutes),
        weekNewWords: s.week.newWords,
        weekNewExpressions: s.week.newExpressions,
        practiceMinutes: Math.round(s.week.practiceMinutes),
        streakDays: s.week.streakDays,
        totalWords: s.total.words,
        totalExpressions: s.total.expressions,
        masteredCount: s.total.masteredCount,
        totalLessons: s.total.lessons,
        totalSessions: s.total.practiceSessions,
        totalSentences: s.total.savedSentences,
        bars,
      };
      setData({ stats: view, loading: false });
    } catch (error) {
      setData({ loading: false });
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

  const { stats } = data;

  return (
    <>
      <div className="page stats-page">
        {stats ? (
          <>
            <div className="stats-today">
              <div className="h2">今天的学习</div>
              <span className="today-summary">
                {stats.todayMinutes} 分钟 · {stats.todayCount} 项内容
              </span>
              <span className="streak-note">
                已连续学习 {stats.streakDays} 天
              </span>
              {(stats.todayMinutes > 0 || stats.todayCount > 0) && (
                <button
                  type="button"
                  className="btn btn--secondary btn--sm stats-checkin"
                  onClick={() => setData({ shareVisible: true })}
                >
                  <MateIcon name="calendar-check" size={18} tone="ink" />
                  打卡分享
                </button>
              )}
            </div>

            <div className="stats-section">
              <div className="h2">本周</div>
              <div className="week-grid">
                <div className="week-item">
                  <span className="stat-label">学习时长</span>
                  <span className="stat-value">
                    {stats.weekMinutes} <span className="stat-unit">分钟</span>
                  </span>
                </div>
                <div className="week-item">
                  <span className="stat-label">单词复习</span>
                  <span className="stat-value">
                    {stats.weekNewWords} <span className="stat-unit">次</span>
                  </span>
                </div>
                <div className="week-item">
                  <span className="stat-label">表达复习</span>
                  <span className="stat-value">
                    {stats.weekNewExpressions}{" "}
                    <span className="stat-unit">次</span>
                  </span>
                </div>
                <div className="week-item">
                  <span className="stat-label">AI 对练</span>
                  <span className="stat-value">
                    {stats.practiceMinutes}{" "}
                    <span className="stat-unit">分钟</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="stats-section bar-section">
              <div className="bar-head">
                <div className="h2">近 7 天</div>
                <span>学习时长 · 分钟</span>
              </div>
              <div className="bar-chart">
                {stats.bars.map((item) => (
                  <div
                    key={item.date}
                    className="bar-col"
                    aria-label={`${item.label}：${item.value} 分钟`}
                  >
                    <span className="bar-value">{item.value}</span>
                    <div className="bar-track">
                      <div
                        className={`bar-fill ${item.isToday ? "bar-fill--today" : ""}`}
                        style={{ height: `${item.height}%` }}
                      />
                    </div>
                    <span
                      className={`bar-label ${item.isToday ? "bar-label--today" : ""}`}
                    >
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="stats-section">
              <div className="h2">个人积累</div>
              <div className="total-list">
                <div className="total-item">
                  <span>学习单元</span>
                  <span className="total-num">{stats.totalLessons}</span>
                </div>
                <div className="total-item">
                  <span>单词</span>
                  <span className="total-num">{stats.totalWords}</span>
                </div>
                <div className="total-item">
                  <span>表达</span>
                  <span className="total-num">{stats.totalExpressions}</span>
                </div>
                <div className="total-item">
                  <span>已掌握</span>
                  <span className="total-num">{stats.masteredCount}</span>
                </div>
                <div className="total-item">
                  <span>AI 对练</span>
                  <span className="total-num">{stats.totalSessions}</span>
                </div>
                <div className="total-item">
                  <span>收藏句子</span>
                  <span className="total-num">{stats.totalSentences}</span>
                </div>
              </div>
            </div>
          </>
        ) : data.loading ? (
          <div className="library-loading">正在读取学习记录…</div>
        ) : (
          <div className="empty">
            <div className="empty__title">学习记录暂时没有加载出来</div>
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => void refresh()}
            >
              重新加载
            </button>
          </div>
        )}
      </div>

      <SharePanel
        show={data.shareVisible}
        kind="checkin"
        onClose={() => setData({ shareVisible: false })}
      />
    </>
  );
}
