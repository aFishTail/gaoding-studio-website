import Link from "next/link";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { services } from "../data";

export const metadata = {
  title: "服务能力",
  description:
    "从产品策略、界面设计到技术开发与 AI 工作流，搞定创造工作室提供完整的数字产品服务。",
};

export default function ServicesPage() {
  return (
    <main id="top">
      <Header />
      <section className="sub-hero shell">
        <span className="section-index">SERVICES / 服务能力</span>
        <h1>
          解决真实问题，
          <br />
          <span>而不只是交付页面</span>
        </h1>
        <p>选择对应服务，也可以带着一个尚未成形的想法来找我们。</p>
      </section>
      <section className="shell service-list">
        {services.map((service, index) => (
          <article key={service.title}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <div className="service-icon large">{service.icon}</div>
            <div>
              <h2>{service.title}</h2>
              <p>{service.description}</p>
            </div>
            <ul>
              {service.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>
      <section className="service-cta shell">
        <div>
          <span>不知道该选哪一项？</span>
          <h2>先说说你想解决的问题。</h2>
        </div>
        <Link href="/contact" className="button primary">
          预约一次沟通 ↗
        </Link>
      </section>
      <Footer />
    </main>
  );
}
