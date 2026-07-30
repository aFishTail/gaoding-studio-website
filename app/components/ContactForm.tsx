"use client";

import { FormEvent, useState } from "react";

export function ContactForm() {
  const [sent, setSent] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
  }

  if (sent) {
    return <div className="form-success" role="status"><span>✓</span><h3>需求已记录</h3><p>感谢你的信任。正式接入后端前，请同时发送邮件至 hello@gaoding.studio，我们会尽快回复。</p><button onClick={() => setSent(false)}>再提交一条</button></div>;
  }

  return (
    <form className="contact-form" onSubmit={submit}>
      <div className="field-row"><label>你的称呼<input name="name" required placeholder="怎么称呼你？" /></label><label>公司 / 团队<input name="company" placeholder="选填" /></label></div>
      <div className="field-row"><label>联系方式<input name="contact" required placeholder="手机、微信或邮箱" /></label><label>期望上线时间<select name="date" defaultValue=""><option value="" disabled>请选择</option><option>1 个月内</option><option>1–3 个月</option><option>3–6 个月</option><option>暂未确定</option></select></label></div>
      <fieldset><legend>需要什么服务？</legend><div className="option-grid">{["数据可视化", "管理系统", "小程序 / App", "企业官网", "AI 工作流", "其他"].map((item) => <label key={item}><input type="checkbox" name="service" value={item} /><span>{item}</span></label>)}</div></fieldset>
      <label>大致预算<select name="budget" defaultValue=""><option value="" disabled>请选择预算范围</option><option>3 万以内</option><option>3–8 万</option><option>8–20 万</option><option>20 万以上</option><option>需要评估</option></select></label>
      <label>项目描述<textarea name="message" required rows={5} placeholder="简单介绍背景、目标、目前阶段和你最关心的问题…" /></label>
      <button className="button primary submit-button" type="submit">提交需求 <b>↗</b></button>
      <small className="form-note">提交即表示同意我们仅将信息用于项目沟通。</small>
    </form>
  );
}
