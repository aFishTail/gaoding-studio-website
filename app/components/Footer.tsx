import Link from "next/link";

export function Footer() {
  return (
    <footer className="footer">
      <div className="shell footer-grid">
        <div className="footer-brand">
          <Link href="/" className="brand">
            <span className="brand-mark">G</span>
            <span>
              <strong>搞定创造工作室</strong>
              <small>GAODING STUDIO</small>
            </span>
          </Link>
          <p>用设计与技术，创造真正有价值的数字体验。</p>
        </div>
        <div>
          <small>联系</small>
          <a href="mailto:1765174487@qq.com">1765174487@qq.com</a>
          <a href="tel:+8618688880008">15895881789</a>
        </div>
        <div>
          <small>导航</small>
          <Link href="/services">服务能力</Link>
          <Link href="/cases">项目案例</Link>
          <Link href="/about">关于我们</Link>
        </div>
        <div>
          <small>办公时间</small>
          <p>
            周一至周五
            <br />
            09:00 — 21:00
          </p>
          <span>中国 · 远程协作</span>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© 2026 GAODING STUDIO</span>
        <span>DESIGNED &amp; BUILT WITH CARE</span>
        <a href="#top">回到顶部 ↑</a>
      </div>
    </footer>
  );
}
