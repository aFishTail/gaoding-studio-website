import type { Metadata, Viewport } from "next";
import { EnglishMateApp } from "./_em/EnglishMateApp";

export const metadata: Metadata = {
  title: "拿来练英语 · 在线交互原型",
  description:
    "基于用户自有资料的 AI 英语学习小程序静态交互原型：涵盖资料解析确认、快速回忆、造句润色与 AI 语音对练复盘。",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function EnglishMateDemoPage({
  searchParams,
}: {
  searchParams?: Promise<{ frame?: string }>;
}) {
  const resolved = searchParams ? await searchParams : {};
  const isFrame = resolved?.frame === "1";
  return <EnglishMateApp initialFrame={isFrame} />;
}
