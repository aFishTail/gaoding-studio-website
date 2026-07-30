import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://gaoding-creative-studio.sites.openai.com"),
  title: {
    default: "高定创造工作室｜让设计真正落地",
    template: "%s｜高定创造工作室",
  },
  description:
    "从需求梳理、产品设计到系统开发与交付，高定创造工作室为企业提供数字化产品、数据可视化与 AI 工作流解决方案。",
  openGraph: {
    title: "高定创造工作室｜让设计真正落地",
    description: "把复杂项目做成可用、好用、好看的数字产品。",
    type: "website",
    locale: "zh_CN",
    images: [
      {
        url: "/og.png",
        width: 1734,
        height: 907,
        alt: "高定创造工作室｜让设计真正落地",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "高定创造工作室｜让设计真正落地",
    description: "把复杂项目做成可用、好用、好看的数字产品。",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
