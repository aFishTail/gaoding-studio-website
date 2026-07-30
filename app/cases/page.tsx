import { CaseGallery } from "../components/CaseGallery";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { cases } from "../data";

export const metadata = { title: "项目案例", description: "高定创造工作室的数据可视化、管理系统、移动端、品牌官网与 AI 项目案例。" };

export default function CasesPage() {
  return <main id="top"><Header /><section className="sub-hero shell"><span className="section-index">WORK / 项目案例</span><h1>每一个成果，<br /><span>都来自对问题的理解</span></h1><p>从业务目标到最终上线，看看我们如何让复杂项目清晰落地。</p></section><section className="shell cases-page"><CaseGallery items={cases} /></section><Footer /></main>;
}
