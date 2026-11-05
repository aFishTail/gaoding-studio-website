"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { CaseItem } from "../data";
import { CaseVisual } from "./CaseVisual";

export function CaseGallery({ items, compact = false }: { items: CaseItem[]; compact?: boolean }) {
  const categories = ["全部", ...Array.from(new Set(items.map((item) => item.category)))];
  const [active, setActive] = useState("全部");
  const visible = useMemo(() => active === "全部" ? items : items.filter((item) => item.category === active), [active, items]);

  return (
    <>
      <div className="case-filters" role="tablist" aria-label="案例分类">
        {categories.map((category) => <button key={category} className={active === category ? "active" : ""} onClick={() => setActive(category)} role="tab" aria-selected={active === category}>{category}</button>)}
      </div>
      <div className={compact ? "case-grid compact" : "case-grid"}>
        {visible.map((item, index) => (
          <Link href={`/cases/${item.slug}`} className="case-card" key={item.slug}>
            <CaseVisual item={item} />
            {item.demo ? <span className="case-demo-badge">在线体验</span> : null}
            <div className="case-card-copy"><span>{item.category} · {item.industry}</span><h3>{item.title}</h3><p>{item.outcome}</p><div><small>{item.duration}</small><b>{item.demo ? "在线体验 Demo ↗" : "查看案例 ↗"}</b></div></div>
            <em>{String(index + 1).padStart(2, "0")}</em>
          </Link>
        ))}
      </div>
    </>
  );
}
