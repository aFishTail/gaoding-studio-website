"use client";

import { useEffect, useState } from "react";
import { NavBar } from "./components/NavBar";
import { StatusBar } from "./components/StatusBar";
import { TabBar } from "./components/TabBar";
import { resetDemoState } from "./mock/service";
import { ChatPage } from "./pages/Chat";
import { ConfirmPage } from "./pages/Confirm";
import { GamePage } from "./pages/Game";
import { HomePage } from "./pages/Home";
import { LessonDetailPage } from "./pages/LessonDetail";
import { LessonsPage } from "./pages/Lessons";
import { MaterialAddPage } from "./pages/MaterialAdd";
import { MyPage } from "./pages/My";
import { ParsingPage } from "./pages/Parsing";
import { PracticeTabPage } from "./pages/PracticeTab";
import { QuickLearnPage } from "./pages/QuickLearn";
import { RecapPage } from "./pages/Recap";
import { ReviewPage } from "./pages/Review";
import { SentencePage } from "./pages/Sentence";
import { SessionPage } from "./pages/Session";
import { StatsPage } from "./pages/Stats";
import { RouterProvider, type StackEntry, useEmRouter } from "./runtime/router";
import { setTtsAutoSpeakMuted } from "./runtime/tts";
import { WxOverlays, WxProvider } from "./runtime/wx";
import "./styles/app.css";

export interface ArtboardSpec {
  id: string;
  title: string;
  tag: string;
  route: string;
}

export interface ArtboardGroup {
  title: string;
  desc: string;
  items: ArtboardSpec[];
}

export const ARTBOARD_GROUPS: ArtboardGroup[] = [
  {
    title: "01 · 底部 4 大主导航与学习统计",
    desc: "今日学习首页、学习资料库、AI 对练场景库、个人积累与 7 日统计",
    items: [
      {
        id: "01-home",
        title: "01 · 今日首页",
        tag: "/pages/home/index",
        route: "/pages/home/index",
      },
      {
        id: "02-lessons",
        title: "02 · 学习资料 Tab",
        tag: "/pages/lessons/index",
        route: "/pages/lessons/index",
      },
      {
        id: "03-practice",
        title: "03 · AI 对练 Tab",
        tag: "/pages/practice/index",
        route: "/pages/practice/index",
      },
      {
        id: "04-my",
        title: "04 · 我的 Tab",
        tag: "/pages/my/index",
        route: "/pages/my/index",
      },
      {
        id: "05-stats",
        title: "05 · 学习统计",
        tag: "/packages/library/pages/stats/index",
        route: "/packages/library/pages/stats/index",
      },
    ],
  },
  {
    title: "02 · 资料导入、AI 结构化解析与单元详情",
    desc: "支持图片/PDF/文本三合一导入、AI 三阶段解析、词条勾选确认与打卡海报生成",
    items: [
      {
        id: "06-material-add",
        title: "06 · 添加学习资料",
        tag: "/packages/material/pages/add/index",
        route: "/packages/material/pages/add/index",
      },
      {
        id: "07-parsing",
        title: "07 · AI 解析三阶段进度",
        tag: "/packages/material/pages/parsing/index",
        route: "/packages/material/pages/parsing/index?static=1",
      },
      {
        id: "08-confirm",
        title: "08 · 确认学习内容",
        tag: "/packages/material/pages/confirm/index",
        route: "/packages/material/pages/confirm/index?draftId=draft-demo",
      },
      {
        id: "09-lesson-detail",
        title: "09 · 学习单元详情",
        tag: "/packages/study/pages/lesson-detail/index",
        route: "/packages/study/pages/lesson-detail/index?id=lesson-smalltalk",
      },
      {
        id: "10-share-sheet",
        title: "10 · 打卡分享与海报面板",
        tag: "components/share-panel",
        route: "/pages/home/index?share=1",
      },
    ],
  },
  {
    title: "03 · 记忆闪卡、今日串联与造句三风格润色",
    desc: "从遮盖回忆、自评熟练度，到结合语境造句并获得 AI 语法纠错与自然/口语/正式三版润色",
    items: [
      {
        id: "11-quick-learn",
        title: "11 · 今日学习串联",
        tag: "/packages/study/pages/quick-learn/index",
        route: "/packages/study/pages/quick-learn/index",
      },
      {
        id: "12-review-front",
        title: "12 · 单词回忆 · 正面",
        tag: "/packages/study/pages/review/index",
        route: "/packages/study/pages/review/index?lessonId=lesson-smalltalk&type=word",
      },
      {
        id: "13-review-back",
        title: "13 · 单词回忆 · 翻面揭晓",
        tag: "/packages/study/pages/review/index (revealed)",
        route:
          "/packages/study/pages/review/index?lessonId=lesson-smalltalk&type=word&revealed=1",
      },
      {
        id: "14-sentence-prompt",
        title: "14 · 造句练习 · 作答态",
        tag: "/packages/study/pages/sentence/index",
        route: "/packages/study/pages/sentence/index?lessonId=lesson-smalltalk",
      },
      {
        id: "15-sentence-feedback",
        title: "15 · 造句练习 · AI 纠错与润色",
        tag: "/packages/study/pages/sentence/index (feedback)",
        route:
          "/packages/study/pages/sentence/index?lessonId=lesson-smalltalk&submitted=1",
      },
    ],
  },
  {
    title: "04 · 单词消消乐与 AI 语音场景对练闭环",
    desc: "双栏配对巩固、场景角色与推荐词准备、三档渐进提示的 AI 语音对练，以及词句命中复盘",
    items: [
      {
        id: "16-game",
        title: "16 · 单词消消乐配对",
        tag: "/packages/study/pages/game/index",
        route: "/packages/study/pages/game/index?lessonId=lesson-smalltalk",
      },
      {
        id: "17-session",
        title: "17 · 对练场景准备",
        tag: "/packages/practice/pages/session/index",
        route: "/packages/practice/pages/session/index?scenarioId=sc-networking",
      },
      {
        id: "18-chat-start",
        title: "18 · AI 语音对练 · 开场",
        tag: "/packages/practice/pages/chat/index",
        route: "/packages/practice/pages/chat/index?sessionId=session-demo",
      },
      {
        id: "19-chat-active",
        title: "19 · AI 语音对练 · 多轮与建议",
        tag: "/packages/practice/pages/chat/index (turns)",
        route:
          "/packages/practice/pages/chat/index?sessionId=session-demo&demoTurns=1",
      },
      {
        id: "20-recap",
        title: "20 · 对练复盘报告",
        tag: "/packages/practice/pages/recap/index",
        route: "/packages/practice/pages/recap/index?sessionId=session-demo",
      },
    ],
  },
];

function renderPage(entry: StackEntry) {
  switch (entry.key) {
    case "home":
      return <HomePage query={entry.query} />;
    case "lessons":
      return <LessonsPage />;
    case "practice":
      return <PracticeTabPage />;
    case "my":
      return <MyPage />;
    case "material-add":
      return <MaterialAddPage />;
    case "material-parsing":
      return <ParsingPage query={entry.query} />;
    case "material-confirm":
      return <ConfirmPage query={entry.query} />;
    case "study-lesson-detail":
      return <LessonDetailPage query={entry.query} />;
    case "study-quick-learn":
      return <QuickLearnPage query={entry.query} />;
    case "study-review":
      return <ReviewPage query={entry.query} />;
    case "study-sentence":
      return <SentencePage query={entry.query} />;
    case "study-game":
      return <GamePage query={entry.query} />;
    case "practice-session":
      return <SessionPage query={entry.query} />;
    case "practice-chat":
      return <ChatPage query={entry.query} />;
    case "practice-recap":
      return <RecapPage query={entry.query} />;
    case "library-stats":
      return <StatsPage />;
    default:
      return <HomePage query={entry.query} />;
  }
}

function Shell({ isFrame }: { isFrame: boolean }) {
  const { stack, current } = useEmRouter();

  return (
    <div
      className="em-app"
      data-frame={isFrame ? "1" : "0"}
      data-standalone={isFrame ? "0" : "1"}
    >
      <StatusBar visible={isFrame} />
      <NavBar isFrame={isFrame} onReset={resetDemoState} />
      <div className="em-page-host">
        {stack.map((entry) => {
          const active = entry.id === current.id;
          return (
            <div
              key={entry.id}
              className="em-viewport"
              data-em-page={entry.key}
              style={{ display: active ? "block" : "none" }}
            >
              {renderPage(entry)}
            </div>
          );
        })}
        <TabBar />
        <WxOverlays />
        {isFrame && <div className="em-home-indicator" aria-hidden="true" />}
      </div>
    </div>
  );
}

function ArtboardInstance({
  item,
  autoHeight,
  onOpenInteractive,
}: {
  item: ArtboardSpec;
  autoHeight: boolean;
  onOpenInteractive: (route: string) => void;
}) {
  return (
    <div className="em-artboard-card" id={`artboard-${item.id}`}>
      <div className="em-artboard-meta">
        <div>
          <div className="em-artboard-name">{item.title}</div>
          <div className="em-artboard-tag">{item.tag}</div>
        </div>
        <button
          type="button"
          className="em-artboard-open"
          onClick={() => onOpenInteractive(item.route)}
        >
          单屏交互 ↗
        </button>
      </div>
      <div
        className="em-artboard-device"
        data-auto-height={autoHeight ? "1" : "0"}
      >
        <WxProvider>
          <RouterProvider
            initialUrl={item.route}
            syncHash={false}
            onResetRequest={resetDemoState}
          >
            <Shell isFrame={true} />
          </RouterProvider>
        </WxProvider>
      </div>
    </div>
  );
}

export function EnglishMateApp({
  initialFrame = false,
  initialView = "single",
}: {
  initialFrame?: boolean;
  initialView?: "single" | "artboards";
}) {
  const [isFrame] = useState(() => {
    if (initialFrame) return true;
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("frame") === "1";
    }
    return false;
  });

  const [viewMode, setViewMode] = useState<"single" | "artboards">(() => {
    if (initialView === "artboards") return "artboards";
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("view") === "artboards") return "artboards";
    }
    return "single";
  });

  const [autoHeight, setAutoHeight] = useState(true);

  useEffect(() => {
    setTtsAutoSpeakMuted(viewMode === "artboards");
    return () => {
      setTtsAutoSpeakMuted(false);
    };
  }, [viewMode]);

  function openSingleWithRoute(route?: string) {
    if (typeof window !== "undefined") {
      if (route) {
        window.location.hash = `#${route}`;
      }
      const url = new URL(window.location.href);
      url.searchParams.delete("view");
      window.history.replaceState(null, "", url.pathname + url.search + window.location.hash);
    }
    setViewMode("single");
  }

  function openArtboardsView() {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("view", "artboards");
      window.history.replaceState(null, "", url.pathname + url.search + window.location.hash);
    }
    setViewMode("artboards");
  }

  if (viewMode === "artboards") {
    return (
      <div className="em-artboards-canvas">
        <header className="em-artboards-toolbar">
          <div className="em-artboards-toolbar__left">
            <span className="em-artboards-toolbar__badge">Figma 全画板视图</span>
            <span className="em-artboards-toolbar__title">
              拿来练英语 · 20 张核心页面与交互态画板（390px 标准宽）
            </span>
            <span className="em-artboards-toolbar__sub">
              使用 html.to.design 抓取当前单页即可一次性导入全部 20 张画板，也支持直接在任意画板内点击交互
            </span>
          </div>
          <div className="em-artboards-toolbar__actions">
            <button
              type="button"
              className="em-artboards-btn"
              onClick={() => setAutoHeight((v) => !v)}
            >
              画板高度：{autoHeight ? "完整展开长图 (推荐导入 Figma)" : "固定 390×844 屏幕"}
            </button>
            <button
              type="button"
              className="em-artboards-btn em-artboards-btn--primary"
              onClick={() => openSingleWithRoute()}
            >
              切换单机交互模式
            </button>
          </div>
        </header>

        {ARTBOARD_GROUPS.map((group) => (
          <section key={group.title} className="em-artboards-group">
            <div className="em-artboards-group__head">
              <div className="em-artboards-group__title">{group.title}</div>
              <div className="em-artboards-group__desc">{group.desc}</div>
            </div>
            <div className="em-artboards-grid">
              {group.items.map((item) => (
                <ArtboardInstance
                  key={item.id}
                  item={item}
                  autoHeight={autoHeight}
                  onOpenInteractive={openSingleWithRoute}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    );
  }

  return (
    <>
      <WxProvider>
        <RouterProvider onResetRequest={resetDemoState}>
          <Shell isFrame={isFrame} />
        </RouterProvider>
      </WxProvider>
      {!isFrame && (
        <button
          type="button"
          className="em-floating-view-switch"
          onClick={openArtboardsView}
        >
          <span>20 页全画板平铺（Figma 视图）</span>
        </button>
      )}
    </>
  );
}
