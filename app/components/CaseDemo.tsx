"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { CaseItem } from "../data";

export function CaseDemo({ item }: { item: CaseItem }) {
  const demo = item.demo;
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const [activeRoute, setActiveRoute] = useState<string>(
    demo?.tour[0]?.route || "/pages/home/index",
  );

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      const data = event.data;
      if (!data || typeof data !== "object") return;
      if (data.type === "em:route" && typeof data.route === "string") {
        setActiveRoute(data.route);
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  if (!demo) return null;

  function sendToFrame(payload: { type: "em:navigate"; route: string } | { type: "em:reset" }) {
    const win = frameRef.current?.contentWindow;
    if (!win) return;
    win.postMessage(payload, window.location.origin);
    if (payload.type === "em:navigate") {
      setActiveRoute(payload.route);
    } else {
      setActiveRoute("/pages/home/index");
    }
  }

  function isStepActive(stepRoute: string): boolean {
    const stepPath = stepRoute.split("?")[0];
    const currentPath = activeRoute.split("?")[0];
    if (stepPath === currentPath) return true;
    // Highlight parent tour step when in sub-step of same flow
    if (
      stepPath.includes("/material/pages/add") &&
      currentPath.includes("/material/pages/parsing")
    ) {
      return true;
    }
    if (
      stepPath.includes("/practice/pages/session") &&
      (currentPath.includes("/practice/pages/chat") ||
        currentPath.includes("/practice/pages/recap"))
    ) {
      return true;
    }
    if (
      stepPath.includes("/study/pages/game") &&
      currentPath.includes("/library/pages/stats")
    ) {
      return true;
    }
    return false;
  }

  return (
    <section className="case-demo shell" id="demo">
      <div className="case-demo-head">
        <div>
          <span className="section-index">LIVE DEMO / 交互原型在线体验</span>
          <h2>在真机尺寸里，直接上手试一试</h2>
        </div>
        <p>
          左侧为 1:1 还原的静态交互原型，可直接点击体验；也可以点按右侧导览步骤快速切换核心页面。
        </p>
      </div>

      <div className="case-demo-body">
        <div className="demo-stage">
          <div className="demo-device">
            <div className="demo-device-notch" aria-hidden="true" />
            <iframe
              ref={frameRef}
              src={`${demo.href}?frame=1`}
              title={`${item.title} 在线交互原型`}
              className="demo-iframe"
            />
          </div>
          <div className="demo-mobile-Cta">
            <Link href={demo.href} className="btn-primary">
              全屏打开交互原型 ↗
            </Link>
          </div>
        </div>

        <div className="demo-sidebar">
          <div className="demo-sidebar-top">
            <div>
              <strong>核心体验路线</strong>
              <span>点击任一步骤，左侧模拟器将立即跳转至对应页面</span>
            </div>
            <div className="demo-actions">
              <button
                type="button"
                className="demo-btn"
                onClick={() => sendToFrame({ type: "em:reset" })}
              >
                重置演示数据
              </button>
              <Link
                href={demo.href}
                target="_blank"
                rel="noopener noreferrer"
                className="demo-btn demo-btn-primary"
              >
                独立窗口体验 ↗
              </Link>
            </div>
          </div>

          <ol className="demo-tour" aria-label="交互原型体验步骤">
            {demo.tour.map((step) => {
              const active = isStepActive(step.route);
              return (
                <li key={step.route}>
                  <button
                    type="button"
                    className={active ? "demo-tour-item active" : "demo-tour-item"}
                    onClick={() =>
                      sendToFrame({ type: "em:navigate", route: step.route })
                    }
                  >
                    <div className="demo-tour-title">
                      <b>{step.title}</b>
                      <span>{active ? "当前体验中" : "点击跳转 →"}</span>
                    </div>
                    <p>{step.description}</p>
                  </button>
                </li>
              );
            })}
          </ol>

          <p className="demo-note">
            注：当前为静态交互原型，内置「商务闲聊与跨文化沟通」真实课程示例数据，AI 整理、批改与语音对练均采用前端脚本模拟，不会上传任何个人数据。
          </p>
        </div>
      </div>
    </section>
  );
}
