import type { CaseItem } from "../data";

export function CaseVisual({ item }: { item: CaseItem }) {
  if (item.image) {
    return (
      <div className="case-visual case-visual-image">
        <img src={item.image.src} alt={item.image.alt} />
      </div>
    );
  }

  if (item.visual === "mobile" && item.screens && item.screens.length >= 2) {
    return (
      <div className={`case-visual visual-mobile visual-mobile-screens ${item.tone}`}>
        <div className="phone p1 phone-screen">
          <img src={item.screens[0].src} alt={item.screens[0].alt} />
        </div>
        <div className="phone p2 phone-screen">
          <img src={item.screens[1].src} alt={item.screens[1].alt} />
        </div>
        {item.demo ? <div className="visual-bubble">可在线交互体验</div> : null}
      </div>
    );
  }

  if (item.visual === "mobile") {
    return <div className={`case-visual visual-mobile ${item.tone}`}><div className="phone p1"><i /><b /><span /><span /><em /></div><div className="phone p2"><i /><b /><span /><span /><em /></div><div className="visual-bubble">+21%</div></div>;
  }
  if (item.visual === "ai") {
    return <div className={`case-visual visual-ai ${item.tone}`}><div className="ai-core">AI</div><i className="ai-line l1" /><i className="ai-line l2" /><i className="ai-line l3" /><span className="ai-node n1">DOC</span><span className="ai-node n2">RAG</span><span className="ai-node n3">API</span></div>;
  }
  if (item.visual === "brand") {
    return <div className={`case-visual visual-brand ${item.tone}`}><div className="brand-leaf leaf1" /><div className="brand-leaf leaf2" /><div className="brand-poster"><span>RE</span><b>NEW</b><small>circular future</small></div></div>;
  }
  if (item.visual === "commerce") {
    return <div className={`case-visual visual-commerce ${item.tone}`}><div className="product-card pc1"><i /><b>MOVE</b><span>01</span></div><div className="product-card pc2"><i /><b>FORM</b><span>02</span></div><em>SHOP / 26</em></div>;
  }
  return (
    <div className={`case-visual visual-dashboard ${item.tone}`}>
      <div className="dash-window"><div className="dash-side"><b>G</b><i /><i /><i /><i /></div><div className="dash-main"><div className="dash-metrics"><span /><span /><span /></div><div className="dash-content"><div className="bar-chart"><i /><i /><i /><i /><i /></div><div className="dash-map"><i /><i /><i /></div></div><div className="dash-bottom"><span /><span /><span /><span /></div></div></div>
    </div>
  );
}
