"use client";

import { useEmRouter } from "../runtime/router";
import { useWx } from "../runtime/wx";
import { MateIcon } from "./MateIcon";

const TABS = [
  { pagePath: "/pages/home/index", text: "首页", icon: "house" },
  { pagePath: "/pages/lessons/index", text: "学习", icon: "book-open" },
  { pagePath: "/pages/practice/index", text: "AI对练", icon: "message-circle" },
  { pagePath: "/pages/my/index", text: "我的", icon: "user-round" },
];

export function TabBar() {
  const { current, switchTab } = useEmRouter();
  const { tabBarHidden } = useWx();

  if (!current.isTab || tabBarHidden) return null;

  return (
    <nav className="tab-bar" aria-label="底部导航">
      {TABS.map((item) => {
        const selected = current.path === item.pagePath;
        return (
          <button
            key={item.pagePath}
            type="button"
            className={`tab-item ${selected ? "tab-item--selected" : ""}`}
            onClick={() => {
              if (!selected) switchTab(item.pagePath);
            }}
            aria-label={`${item.text}${selected ? "，当前页面" : ""}`}
          >
            <MateIcon name={item.icon} size={23} tone={selected ? "accent" : "muted"} />
            <span className="tab-label">{item.text}</span>
          </button>
        );
      })}
    </nav>
  );
}
