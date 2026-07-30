import Link from "next/link";
import { notFound } from "next/navigation";
import { CaseVisual } from "../../components/CaseVisual";
import { Footer } from "../../components/Footer";
import { Header } from "../../components/Header";
import { cases, timeline } from "../../data";

export function generateStaticParams() {
  return cases.map((item) => ({ slug: item.slug }));
}

export default async function CaseDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = cases.find((entry) => entry.slug === slug);
  if (!item) notFound();
  const related = cases.find((entry) => entry.slug !== item.slug)!;

  return (
    <main id="top">
      <Header />
      <section className="case-detail-hero shell">
        <Link href="/cases" className="back-link">← 返回全部案例</Link>
        <div className="detail-title">
          <div><span className="section-index">{item.category} / {item.industry}</span><h1>{item.title}</h1><p>{item.summary}</p></div>
          <div className="detail-meta"><div><small>项目周期</small><b>{item.duration}</b></div><div><small>服务内容</small><b>{item.services.join(" · ")}</b></div><div><small>技术方案</small><b>{item.technology.join(" · ")}</b></div></div>
        </div>
        <div className="detail-visual"><CaseVisual item={item} /></div>
      </section>

      <section className="case-story shell">
        <span className="section-index">PROJECT OVERVIEW</span>
        <div className="story-grid"><h2>从分散信息，<br />到统一决策视角</h2><div><p>团队原本需要在多套系统与表格之间来回切换，关键数据更新不同步，现场异常也难以及时发现。我们从真实使用场景出发，重组指标层级和操作路径。</p><p>最终成果不仅是一套更好看的界面，更是一套能被日常工作真正使用的产品系统。</p></div></div>
        <div className="result-cards"><article><strong>1</strong><span>统一数据入口</span></article><article><strong>24h</strong><span>关键状态实时更新</span></article><article><strong>38%</strong><span>信息查找效率提升</span></article></div>
      </section>

      <section className="timeline-section">
        <div className="shell">
          <div className="section-head light"><div><span className="section-index">DELIVERY TIMELINE</span><h2>项目交付时间线</h2></div><p>每一个阶段都有明确目标、成果和评审节点。</p></div>
          <div className="timeline">{timeline.map((step, index) => <article key={step.phase}><div className="timeline-num">{String(index + 1).padStart(2, "0")}</div><div className="timeline-main"><span>{step.period}</span><h3>{step.phase}</h3><p>{step.summary}</p></div><div className="timeline-deliver"><small>阶段交付</small>{step.deliverables.map((d) => <b key={d}>{d}</b>)}</div></article>)}</div>
        </div>
      </section>

      <section className="next-case shell"><span>NEXT PROJECT</span><Link href={`/cases/${related.slug}`}><small>{related.category}</small><h2>{related.title}</h2><b>查看案例 ↗</b></Link></section>
      <Footer />
    </main>
  );
}
