import Link from "next/link";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";

export const metadata = {
  title: "关于我们",
  description: "认识搞定创造工作室，以及我们对设计、技术和长期合作的理解。",
};

export default function AboutPage() {
  return (
    <main id="top">
      <Header />
      <section className="sub-hero shell about-hero">
        <span className="section-index">ABOUT / 关于我们</span>
        <h1>
          一群相信“落地”
          <br />
          <span>比概念更重要的人</span>
        </h1>
        <p>我们是由产品、设计与开发组成的小型数字产品工作室。</p>
      </section>
      <section className="about-banner shell">
        <div className="about-shape s1" />
        <div className="about-shape s2" />
        <div className="about-word">
          GAO
          <br />
          DING
        </div>
        <span>CREATIVE DIGITAL STUDIO</span>
      </section>
      <section className="about-copy shell">
        <div>
          <span className="section-index">OUR POINT OF VIEW</span>
          <h2>
            好产品来自
            <br />
            同一个目标
          </h2>
        </div>
        <div>
          <p>
            我们不把策略、设计和技术分割成彼此孤立的环节。每个角色都理解业务目标，每个设计决定都考虑实现与维护。
          </p>
          <p>
            工作室规模不大，这让核心成员能始终参与项目，也让沟通更直接、决策更敏捷。
          </p>
        </div>
      </section>
      <section className="values shell">
        {[
          ["01", "真诚沟通", "清晰说明选择、风险与边界，不用术语掩盖问题。"],
          ["02", "快速验证", "先做最需要验证的部分，让投入始终有依据。"],
          ["03", "长期主义", "关注产品上线后的可用性、维护性与成长空间。"],
          ["04", "共同负责", "把客户目标当作共同目标，对结果而非过程负责。"],
        ].map((v) => (
          <article key={v[0]}>
            <span>{v[0]}</span>
            <h3>{v[1]}</h3>
            <p>{v[2]}</p>
          </article>
        ))}
      </section>
      <section className="team-strip">
        <div className="shell">
          <span>PRODUCT STRATEGY</span>
          <i>×</i>
          <span>EXPERIENCE DESIGN</span>
          <i>×</i>
          <span>FULL-STACK DEVELOPMENT</span>
        </div>
      </section>
      <section className="service-cta shell">
        <div>
          <span>想和我们一起工作？</span>
          <h2>把你的挑战交给我们。</h2>
        </div>
        <Link href="/contact" className="button primary">
          联系工作室 ↗
        </Link>
      </section>
      <Footer />
    </main>
  );
}
