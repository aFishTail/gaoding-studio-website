"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { stopAudio } from "./tts";
import { useWx } from "./wx";

export type PageKey =
  | "home"
  | "lessons"
  | "practice"
  | "my"
  | "material-add"
  | "material-parsing"
  | "material-confirm"
  | "study-lesson-detail"
  | "study-quick-learn"
  | "study-review"
  | "study-sentence"
  | "study-game"
  | "practice-session"
  | "practice-chat"
  | "practice-recap"
  | "library-stats";

export interface RouteMeta {
  key: PageKey;
  path: string;
  title: string;
  isTab?: boolean;
}

export const ROUTES: Record<string, RouteMeta> = {
  "/pages/home/index": { key: "home", path: "/pages/home/index", title: "拿来练英语", isTab: true },
  "/pages/lessons/index": { key: "lessons", path: "/pages/lessons/index", title: "学习", isTab: true },
  "/pages/practice/index": { key: "practice", path: "/pages/practice/index", title: "AI 对练", isTab: true },
  "/pages/my/index": { key: "my", path: "/pages/my/index", title: "我的", isTab: true },
  "/packages/material/pages/add/index": {
    key: "material-add",
    path: "/packages/material/pages/add/index",
    title: "添加学习资料",
  },
  "/packages/material/pages/parsing/index": {
    key: "material-parsing",
    path: "/packages/material/pages/parsing/index",
    title: "正在整理学习内容",
  },
  "/packages/material/pages/confirm/index": {
    key: "material-confirm",
    path: "/packages/material/pages/confirm/index",
    title: "确认学习内容",
  },
  "/packages/study/pages/lesson-detail/index": {
    key: "study-lesson-detail",
    path: "/packages/study/pages/lesson-detail/index",
    title: "学习单元",
  },
  "/packages/study/pages/quick-learn/index": {
    key: "study-quick-learn",
    path: "/packages/study/pages/quick-learn/index",
    title: "今日学习",
  },
  "/packages/study/pages/review/index": {
    key: "study-review",
    path: "/packages/study/pages/review/index",
    title: "学习回忆",
  },
  "/packages/study/pages/sentence/index": {
    key: "study-sentence",
    path: "/packages/study/pages/sentence/index",
    title: "造句练习",
  },
  "/packages/study/pages/game/index": {
    key: "study-game",
    path: "/packages/study/pages/game/index",
    title: "单词消消乐",
  },
  "/packages/practice/pages/session/index": {
    key: "practice-session",
    path: "/packages/practice/pages/session/index",
    title: "对练场景",
  },
  "/packages/practice/pages/chat/index": {
    key: "practice-chat",
    path: "/packages/practice/pages/chat/index",
    title: "AI 语音对练",
  },
  "/packages/practice/pages/recap/index": {
    key: "practice-recap",
    path: "/packages/practice/pages/recap/index",
    title: "对练复盘",
  },
  "/packages/library/pages/stats/index": {
    key: "library-stats",
    path: "/packages/library/pages/stats/index",
    title: "学习统计",
  },
};

export interface StackEntry {
  id: string;
  key: PageKey;
  path: string;
  fullUrl: string;
  query: Record<string, string>;
  title: string;
  isTab: boolean;
}

export function parseMiniUrl(rawUrl: string): {
  path: string;
  fullUrl: string;
  query: Record<string, string>;
} {
  const trimmed = (rawUrl || "/pages/home/index").trim();
  const normalized = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  const qIndex = normalized.indexOf("?");
  const path = qIndex >= 0 ? normalized.slice(0, qIndex) : normalized;
  const search = qIndex >= 0 ? normalized.slice(qIndex + 1) : "";
  const query: Record<string, string> = {};
  if (search) {
    const params = new URLSearchParams(search);
    params.forEach((v, k) => {
      query[k] = v;
    });
  }
  return { path, fullUrl: normalized, query };
}

let seq = 1;
function createEntry(rawUrl: string): StackEntry | null {
  const { path, fullUrl, query } = parseMiniUrl(rawUrl);
  const meta = ROUTES[path];
  if (!meta) return null;
  return {
    id: `em-page-${seq++}`,
    key: meta.key,
    path: meta.path,
    fullUrl,
    query,
    title: meta.title,
    isTab: Boolean(meta.isTab),
  };
}

interface RouterContextValue {
  stack: StackEntry[];
  current: StackEntry;
  canGoBack: boolean;
  showSeq: number;
  navigateTo: (url: string) => void;
  redirectTo: (url: string) => void;
  switchTab: (url: string) => void;
  reLaunch: (url: string) => void;
  navigateBack: (delta?: number) => void;
  jumpFromTour: (url: string) => void;
}

const RouterContext = createContext<RouterContextValue | null>(null);

export function RouterProvider({
  children,
  onResetRequest,
  initialUrl,
  syncHash = true,
}: {
  children: React.ReactNode;
  onResetRequest?: () => void;
  initialUrl?: string;
  syncHash?: boolean;
}) {
  const { showToast, setNavigationBarTitle, setTabBarHidden, dismissOverlays } = useWx();
  const [stack, setStack] = useState<StackEntry[]>(() => {
    const home = createEntry("/pages/home/index")!;
    if (initialUrl) {
      const target = createEntry(initialUrl);
      if (target) {
        return target.isTab ? [target] : [home, target];
      }
    }
    if (syncHash && typeof window !== "undefined" && window.location.hash.length > 1) {
      const hashRoute = decodeURIComponent(window.location.hash.slice(1));
      const target = createEntry(hashRoute);
      if (target) {
        return target.isTab ? [target] : [home, target];
      }
    }
    return [home];
  });
  const [showSeq, setShowSeq] = useState(1);
  const resetRef = useRef(onResetRequest);

  useEffect(() => {
    resetRef.current = onResetRequest;
  }, [onResetRequest]);

  const current = stack[stack.length - 1];
  const canGoBack = stack.length > 1;

  const resetPageChrome = useCallback(() => {
    stopAudio();
    dismissOverlays();
    setNavigationBarTitle(null);
    setTabBarHidden(false);
    setShowSeq((s) => s + 1);
  }, [dismissOverlays, setNavigationBarTitle, setTabBarHidden]);

  useEffect(() => {
    if (!syncHash) return;
    stopAudio();
    if (typeof window !== "undefined") {
      try {
        window.history.replaceState(null, "", `#${current.fullUrl}`);
      } catch {
        // ignore
      }
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(
          { type: "em:route", route: current.fullUrl, path: current.path, key: current.key },
          window.location.origin,
        );
      }
    }
  }, [syncHash, current.id, current.fullUrl, current.path, current.key]);

  const navigateTo = useCallback(
    (url: string) => {
      const entry = createEntry(url);
      if (!entry) {
        showToast({ title: "完整版小程序中提供", icon: "none" });
        return;
      }
      resetPageChrome();
      if (entry.isTab) {
        setStack([entry]);
        return;
      }
      setStack((prev) => [...prev, entry]);
    },
    [showToast, resetPageChrome],
  );

  const redirectTo = useCallback(
    (url: string) => {
      const entry = createEntry(url);
      if (!entry) {
        showToast({ title: "完整版小程序中提供", icon: "none" });
        return;
      }
      resetPageChrome();
      if (entry.isTab) {
        setStack([entry]);
        return;
      }
      setStack((prev) => [...prev.slice(0, -1), entry]);
    },
    [showToast, resetPageChrome],
  );

  const switchTab = useCallback(
    (url: string) => {
      const entry = createEntry(url);
      if (!entry) {
        showToast({ title: "完整版小程序中提供", icon: "none" });
        return;
      }
      resetPageChrome();
      setStack([entry]);
    },
    [showToast, resetPageChrome],
  );

  const reLaunch = useCallback(
    (url: string) => {
      const entry = createEntry(url);
      if (!entry) {
        showToast({ title: "完整版小程序中提供", icon: "none" });
        return;
      }
      resetPageChrome();
      setStack(entry.isTab ? [entry] : [createEntry("/pages/home/index")!, entry]);
    },
    [showToast, resetPageChrome],
  );

  const navigateBack = useCallback(
    (delta = 1) => {
      resetPageChrome();
      setStack((prev) => {
        if (prev.length <= 1) return prev;
        const keep = Math.max(1, prev.length - Math.max(1, delta));
        return prev.slice(0, keep);
      });
    },
    [resetPageChrome],
  );

  const jumpFromTour = useCallback(
    (url: string) => {
      const entry = createEntry(url);
      if (!entry) return;
      resetPageChrome();
      if (entry.isTab) {
        setStack([entry]);
      } else {
        setStack([createEntry("/pages/home/index")!, entry]);
      }
    },
    [resetPageChrome],
  );

  useEffect(() => {
    if (!syncHash) return;
    function onMessage(e: MessageEvent) {
      if (e.origin !== window.location.origin) return;
      const data = e.data;
      if (!data || typeof data !== "object") return;
      if (data.type === "em:navigate" && typeof data.route === "string") {
        jumpFromTour(data.route);
      } else if (data.type === "em:reset") {
        resetRef.current?.();
        resetPageChrome();
        setStack([createEntry("/pages/home/index")!]);
        showToast({ title: "演示数据已重置", icon: "success" });
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [syncHash, jumpFromTour, resetPageChrome, showToast]);

  return (
    <RouterContext.Provider
      value={{
        stack,
        current,
        canGoBack,
        showSeq,
        navigateTo,
        redirectTo,
        switchTab,
        reLaunch,
        navigateBack,
        jumpFromTour,
      }}
    >
      {children}
    </RouterContext.Provider>
  );
}

export function useEmRouter() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error("useEmRouter must be used within RouterProvider");
  return ctx;
}
