"use client";

import { useEmRouter } from "../runtime/router";
import { useWx } from "../runtime/wx";
import { MateIcon } from "./MateIcon";

export function NavBar({
  isFrame,
  onReset,
}: {
  isFrame: boolean;
  onReset: () => void;
}) {
  const { current, canGoBack, navigateBack, switchTab } = useEmRouter();
  const { navTitleOverride, showActionSheet, showToast } = useWx();

  const title = navTitleOverride || current.title;

  async function onMoreClick() {
    const items = isFrame
      ? ["回到小程序首页", "重置演示数据"]
      : ["回到小程序首页", "重置演示数据", "返回案例详情"];
    const res = await showActionSheet({ itemList: items });
    if (!res) return;
    if (res.tapIndex === 0) {
      switchTab("/pages/home/index");
    } else if (res.tapIndex === 1) {
      onReset();
      switchTab("/pages/home/index");
      showToast({ title: "演示数据已重置", icon: "success" });
    } else if (res.tapIndex === 2 && typeof window !== "undefined") {
      window.location.href = "/cases/english-mate";
    }
  }

  function onCloseClick() {
    if (!isFrame && typeof window !== "undefined") {
      window.location.href = "/cases/english-mate";
      return;
    }
    switchTab("/pages/home/index");
  }

  return (
    <header className="em-nav-bar">
      <div className="em-nav-left">
        {canGoBack && (
          <button
            type="button"
            className="em-nav-back"
            onClick={() => navigateBack(1)}
            aria-label="返回"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#252A28" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
        )}
      </div>
      <div className="em-nav-title">{title}</div>
      <div className="em-nav-right">
        <div className="em-capsule">
          <button
            type="button"
            className="em-capsule-btn"
            onClick={onMoreClick}
            aria-label="更多操作"
          >
            <MateIcon name="ellipsis" size={16} tone="ink" />
          </button>
          <span className="em-capsule-divider" />
          <button
            type="button"
            className="em-capsule-btn"
            onClick={onCloseClick}
            aria-label={isFrame ? "回到首页" : "返回案例详情"}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#252A28" strokeWidth="2">
              <circle cx="12" cy="12" r="8" />
              <circle cx="12" cy="12" r="3" fill="#252A28" stroke="none" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
