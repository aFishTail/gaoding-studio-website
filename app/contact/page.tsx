import { ContactForm } from "../components/ContactForm";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";

export const metadata = { title: "联系合作", description: "告诉高定创造工作室你的项目背景、目标与计划，我们通常会在一个工作日内回复。" };

export default function ContactPage() {
  return (
    <main id="top">
      <Header />
      <section className="contact-page shell">
        <div className="contact-intro"><span className="section-index">CONTACT / 联系合作</span><h1>一起把想法，<br /><span>做成真正的产品</span></h1><p>不需要准备完整需求文档。告诉我们你遇到的问题，剩下的可以一起梳理。</p><div className="contact-direct"><div><small>邮箱</small><a href="mailto:hello@gaoding.studio">hello@gaoding.studio ↗</a></div><div><small>电话 / 微信</small><a href="tel:+8618688880008">186 8888 0008</a></div><div><small>回复时间</small><span>通常在 1 个工作日内</span></div></div></div>
        <div className="contact-form-wrap"><ContactForm /></div>
      </section>
      <section className="contact-steps shell"><span>提交后会发生什么？</span><div><article><b>01</b><h3>了解需求</h3><p>我们先阅读你的项目背景与目标。</p></article><article><b>02</b><h3>初步沟通</h3><p>安排 30–45 分钟线上沟通。</p></article><article><b>03</b><h3>提供建议</h3><p>给出合作方式、周期与预算建议。</p></article></div></section>
      <Footer />
    </main>
  );
}
