"use client";

import { useCallback, useEffect } from "react";
import { MateIcon } from "../components/MateIcon";
import { mateService, subscribeDemoState } from "../mock/service";
import { useEmRouter } from "../runtime/router";
import { useSetData } from "../runtime/useSetData";
import { useWx } from "../runtime/wx";
import { ENGLISH_LEVELS } from "../types";

interface MyUserView {
  nickname: string;
  avatarUrl: string;
  levelLabel: string;
}

export function MyPage() {
  const { navigateTo, showSeq } = useEmRouter();
  const { showToast } = useWx();

  const [data, setData] = useSetData({
    user: null as MyUserView | null,
    avatarInitial: "林",
    avatarFailed: false,
    statCards: [
      { label: "单词", value: 10 },
      { label: "表达", value: 3 },
      { label: "已掌握", value: 4 },
      { label: "对练", value: 3 },
    ],
    sentencesCount: 2,
    favoritesCount: 4,
    loading: true,
  });

  const refresh = useCallback(async () => {
    try {
      const [dashboard, stats] = await Promise.all([
        mateService.getDashboard(),
        mateService.getStats(),
      ]);
      const levelMeta = ENGLISH_LEVELS.find(
        (l) => l.key === dashboard.user?.englishLevel,
      );
      const levelLabel = levelMeta
        ? `${levelMeta.label} · ${levelMeta.enLabel}`
        : "";
      const nickname = dashboard.user?.nickname?.trim() || "英语学习者";
      const avatarUrl = dashboard.user?.avatarUrl || "";

      setData({
        avatarInitial: Array.from(nickname)[0] || "英",
        avatarFailed: false,
        user: dashboard.user
          ? {
              nickname,
              avatarUrl,
              levelLabel,
            }
          : null,
        statCards: [
          { label: "单词", value: stats.total.words },
          { label: "表达", value: stats.total.expressions },
          { label: "已掌握", value: stats.total.masteredCount },
          { label: "对练", value: stats.total.practiceSessions },
        ],
        sentencesCount: stats.total.savedSentences,
        favoritesCount: 4,
        loading: false,
      });
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

  function goStats() {
    navigateTo("/packages/library/pages/stats/index");
  }

  function goSettings() {
    navigateTo("/packages/library/pages/settings/index");
  }

  function goFavorites() {
    navigateTo("/packages/library/pages/favorites/index");
  }

  function goMyEnglishTarget(target: "words" | "expressions" | "sentences") {
    navigateTo(`/packages/library/pages/${target}/index`);
  }

  function goLevel() {
    navigateTo("/packages/library/pages/level/index");
  }

  return (
    <div className="page page--tab my-page">
      <div className="my-head">
        <div className="avatar profile-avatar">
          {data.user && data.user.avatarUrl && !data.avatarFailed ? (
            <img
              src={data.user.avatarUrl}
              alt={data.user.nickname}
              onError={() => setData({ avatarFailed: true })}
              className="profile-img"
            />
          ) : (
            <span className="avatar__text">{data.avatarInitial}</span>
          )}
        </div>
        <div className="col grow my-id">
          <div className="h2">
            {data.user ? data.user.nickname : "英语学习者"}
          </div>
          {data.user && data.user.levelLabel ? (
            <div className="profile-level">{data.user.levelLabel}</div>
          ) : (
            <span
              className="link"
              role="button"
              tabIndex={0}
              onClick={goLevel}
            >
              设置英语水平
            </span>
          )}
        </div>
        <button
          type="button"
          className="my-settings"
          onClick={goSettings}
          aria-label="个人设置"
        >
          <MateIcon name="settings" size={21} tone="muted" />
        </button>
      </div>

      <div className="my-group h2">我的积累</div>
      <div className="my-list">
        <button
          type="button"
          className="my-row"
          onClick={() => goMyEnglishTarget("words")}
        >
          <MateIcon name="languages" size={20} tone="ink" />
          <span className="grow">单词</span>
          {data.statCards.length > 0 && (
            <span className="my-count">{data.statCards[0].value}</span>
          )}
          <MateIcon name="chevron-right" size={18} tone="muted" />
        </button>
        <button
          type="button"
          className="my-row"
          onClick={() => goMyEnglishTarget("expressions")}
        >
          <MateIcon name="quote" size={20} tone="ink" />
          <span className="grow">表达</span>
          {data.statCards.length > 0 && (
            <span className="my-count">{data.statCards[1].value}</span>
          )}
          <MateIcon name="chevron-right" size={18} tone="muted" />
        </button>
        <button
          type="button"
          className="my-row"
          onClick={() => goMyEnglishTarget("sentences")}
        >
          <MateIcon name="pencil-line" size={20} tone="ink" />
          <span className="grow">句子</span>
          <span className="my-count">{data.sentencesCount}</span>
          <MateIcon name="chevron-right" size={18} tone="muted" />
        </button>
        <button type="button" className="my-row" onClick={goFavorites}>
          <MateIcon name="star" size={20} tone="ink" />
          <span className="grow">收藏</span>
          <span className="my-count">{data.favoritesCount}</span>
          <MateIcon name="chevron-right" size={18} tone="muted" />
        </button>
      </div>

      <div className="my-group h2">记录与偏好</div>
      <div className="my-list">
        <button type="button" className="my-row" onClick={goStats}>
          <MateIcon name="chart-column" size={20} tone="ink" />
          <div className="grow">
            <div>学习统计</div>
            {data.statCards.length > 0 && (
              <div className="my-record">
                已掌握 {data.statCards[2].value} 项 · 对练{" "}
                {data.statCards[3].value} 次
              </div>
            )}
          </div>
          <MateIcon name="chevron-right" size={18} tone="muted" />
        </button>
        <button type="button" className="my-row" onClick={goSettings}>
          <MateIcon name="settings" size={20} tone="ink" />
          <span className="grow">设置与偏好</span>
          <MateIcon name="chevron-right" size={18} tone="muted" />
        </button>
      </div>
    </div>
  );
}
