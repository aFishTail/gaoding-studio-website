"use client";

import { useState } from "react";
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
import { WxOverlays, WxProvider } from "./runtime/wx";
import "./styles/app.css";

function renderPage(entry: StackEntry) {
  switch (entry.key) {
    case "home":
      return <HomePage />;
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
      return <HomePage />;
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

export function EnglishMateApp({ initialFrame = false }: { initialFrame?: boolean }) {
  const [isFrame] = useState(() => {
    if (initialFrame) return true;
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("frame") === "1" || window.parent !== window;
    }
    return false;
  });

  return (
    <WxProvider>
      <RouterProvider onResetRequest={resetDemoState}>
        <Shell isFrame={isFrame} />
      </RouterProvider>
    </WxProvider>
  );
}
