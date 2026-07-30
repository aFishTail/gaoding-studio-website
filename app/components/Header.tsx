"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function Header() {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  }, [dark]);

  return (
    <header className="site-header">
      <div className="header-inner shell">
        <Link href="/" className="brand" aria-label="搞定创造工作室首页">
          <span className="brand-mark">G</span>
          <span>
            <strong>搞定创造工作室</strong>
            <small>GAODING STUDIO</small>
          </span>
        </Link>
        <nav className={open ? "nav open" : "nav"} aria-label="主导航">
          <Link href="/" onClick={() => setOpen(false)}>
            首页
          </Link>
          <Link href="/services" onClick={() => setOpen(false)}>
            服务
          </Link>
          <Link href="/cases" onClick={() => setOpen(false)}>
            案例
          </Link>
          <Link href="/about" onClick={() => setOpen(false)}>
            关于我们
          </Link>
          <Link href="/contact" onClick={() => setOpen(false)}>
            联系合作
          </Link>
        </nav>
        <div className="header-actions">
          <button
            className="theme-toggle"
            onClick={() => setDark(!dark)}
            aria-label={dark ? "切换浅色模式" : "切换深色模式"}
          >
            <span>{dark ? "☾" : "☼"}</span>
          </button>
          <button
            className={open ? "menu-toggle active" : "menu-toggle"}
            onClick={() => setOpen(!open)}
            aria-label="打开菜单"
            aria-expanded={open}
          >
            <i />
            <i />
          </button>
        </div>
      </div>
    </header>
  );
}
