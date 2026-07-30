import Link from "next/link";
import { CaseGallery } from "./components/CaseGallery";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { MiniVisual } from "./components/MiniVisual";
import { cases, services } from "./data";

export default function Home() {
  return (
    <main id="top">
      <Header />

      <section className="hero shell" id="home">
        <div className="hero-copy">
          <span className="eyebrow"><i /> DIGITAL PRODUCT STUDIO · 2026</span>
          <h1>好看的设计，<br />也要<span>真正落地</span></h1>
          <p>从需求梳理、产品设计到系统开发与交付，我们把复杂项目做成可用、好用、好看的数字产品。</p>
          <div className="hero-actions">
            <Link href="/contact" className="button primary">预约沟通 <b>↗</b></Link>
            <Link href="/cases" className="button ghost">查看案例 <b>→</b></Link>
          </div>
          <div className="hero-note"><span>可从 0 到 1 完整交付</span><span>也可加入现有团队协作</span></div>
        </div>

        <div className="hero-art" aria-label="高定工作室数字产品能力展示">
          <div className="orb orb-one" /><div className="orb orb-two" />
          <div className="glass-board">
            <div className="board-top"><span /><span /><span /><em>LIVE PROJECT</em></div>
            <div className="metric-row">
              <div><small>数据接入</small><strong>28,560</strong><i>↑ 18.6%</i></div>
              <div><small>稳定运行</small><strong>99.9%</strong><i>实时同步</i></div>
            </div>
            <div className="chart"><div className="chart-grid" /><div className="chart-line line-one" /><div className="chart-line line-two" /><span className="chart-dot d1" /><span className="chart-dot d2" /><span className="chart-dot d3" /></div>
          </div>
          <div className="floating-card float-one"><b>01</b><span>策略与原型</span></div>
          <div className="floating-card float-two"><b>04</b><span>开发与交付</span></div>
          <div className="hero-badge"><span>GD</span><b>DESIGN<br />IN MOTION</b></div>
        </div>
      </section>

      <section className="trust-strip shell">
        <p>我们关注的不只是页面，而是完整的业务结果</p>
        <div><span>数据可视化</span><span>管理系统</span><span>小程序 / APP</span><span>企业官网</span><span>AI 工作流</span></div>
      </section>

      <section className="section shell" id="services">
        <div className="section-head">
          <div><span className="section-index">01 / SERVICES</span><h2>从一个想法，到稳定上线</h2></div>
          <p>清晰拆解目标、路径与交付物，让每一步都可见、可控、可验收。</p>
        </div>
        <div className="service-grid">
          {services.slice(0, 6).map((service, index) => (
            <article className="service-card" key={service.title}>
              <div className="service-number">{String(index + 1).padStart(2, "0")}</div>
              <div className="service-icon">{service.icon}</div>
              <h3>{service.title}</h3><p>{service.description}</p><span>{service.tags.join(" · ")}</span>
            </article>
          ))}
        </div>
        <div className="section-link"><Link href="/services">查看全部服务 <span>↗</span></Link></div>
      </section>

      <section className="section cases-section" id="cases">
        <div className="shell">
          <div className="section-head light">
            <div><span className="section-index">02 / SELECTED WORK</span><h2>精选项目案例</h2></div>
            <p>设计不是装饰，而是让信息、流程与决策变得更清晰。</p>
          </div>
          <CaseGallery items={cases.slice(0, 6)} compact />
          <div className="section-link light-link"><Link href="/cases">探索全部案例 <span>→</span></Link></div>
        </div>
      </section>

      <section className="section shell" id="process">
        <div className="section-head">
          <div><span className="section-index">03 / PROCESS</span><h2>让合作过程同样专业</h2></div>
          <p>以阶段成果推进项目，不让模糊需求成为时间和预算的黑洞。</p>
        </div>
        <div className="process-wrap">
          {[
            ["01", "理解问题", "业务访谈、目标确认、范围界定"],
            ["02", "梳理方案", "信息架构、原型验证、技术评估"],
            ["03", "设计开发", "视觉系统、功能开发、持续联调"],
            ["04", "上线陪跑", "验收部署、使用培训、迭代支持"],
          ].map((item, index) => (
            <article className="process-item" key={item[0]}>
              <span>{item[0]}</span><div className="process-visual"><i style={{ "--step": index } as React.CSSProperties} /></div>
              <h3>{item[1]}</h3><p>{item[2]}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section insight-section">
        <div className="shell insight-grid">
          <div><span className="section-index">04 / WHY US</span><h2>设计、技术与业务<br />在同一张桌上</h2><p>减少沟通损耗，更早暴露风险，更快做出正确的产品决策。</p><Link href="/about" className="text-link">认识我们 <span>↗</span></Link></div>
          <div className="insight-cards">
            <article><strong>01</strong><h3>先问为什么</h3><p>不急着画页面，先找到真正值得解决的问题。</p></article>
            <article><strong>02</strong><h3>边做边验证</h3><p>用原型和阶段演示，让重要决策有依据。</p></article>
            <article><strong>03</strong><h3>交付可持续</h3><p>兼顾体验、性能、维护成本与后续扩展。</p></article>
            <MiniVisual />
          </div>
        </div>
      </section>

      <section className="cta shell">
        <div className="cta-copy"><span className="section-index">START A PROJECT</span><h2>有一个想法？<br />一起把它做成。</h2><p>告诉我们项目背景、目标和时间计划，通常 1 个工作日内回复。</p><Link href="/contact" className="button white">聊聊你的项目 <b>↗</b></Link></div>
        <div className="cta-orbit" aria-hidden="true"><div className="orbit-ring ring-a" /><div className="orbit-ring ring-b" /><div className="orbit-core">GD</div><span className="orbit-dot od1" /><span className="orbit-dot od2" /><span className="orbit-dot od3" /></div>
      </section>

      <Footer />
    </main>
  );
}
