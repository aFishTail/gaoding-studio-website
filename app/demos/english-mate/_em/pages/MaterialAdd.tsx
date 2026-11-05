"use client";

import { MateIcon } from "../components/MateIcon";
import { SAMPLE_IMPORT_TEXT, SAMPLE_IMPORT_TITLE } from "../mock/data";
import { mateService } from "../mock/service";
import { useEmRouter } from "../runtime/router";
import { useSetData } from "../runtime/useSetData";
import { useWx } from "../runtime/wx";
import type { MaterialType } from "../types";

export function MaterialAddPage() {
  const { navigateTo } = useEmRouter();
  const { showToast, showLoading, hideLoading } = useWx();

  const [data, setData, ref] = useSetData({
    selectedType: "text" as MaterialType,
    text: SAMPLE_IMPORT_TEXT,
    title: SAMPLE_IMPORT_TITLE,
    submitting: false,
    hasText: SAMPLE_IMPORT_TEXT.trim().length > 0,
  });

  function selectType(selectedType: MaterialType) {
    if (ref.current.submitting || !["image", "pdf", "text"].includes(selectedType)) {
      return;
    }
    setData({ selectedType });
  }

  function onInput(value: string) {
    setData({ text: value, hasText: value.trim().length > 0 });
  }

  function onTitleInput(value: string) {
    setData({ title: value });
  }

  function chooseImage() {
    if (ref.current.submitting) return;
    showToast({ title: "演示版使用示例资料进入解析", icon: "none" });
    navigateTo(
      "/packages/material/pages/parsing/index?materialId=mat-smalltalk&jobId=job-demo&type=image",
    );
  }

  function choosePdf() {
    if (ref.current.submitting) return;
    showToast({ title: "演示版使用示例资料进入解析", icon: "none" });
    navigateTo(
      "/packages/material/pages/parsing/index?materialId=mat-smalltalk&jobId=job-demo&type=pdf",
    );
  }

  async function submitText() {
    const text = ref.current.text.trim();
    if (!text) {
      showToast({ title: "请先粘贴或输入英语内容", icon: "none" });
      return;
    }
    if (text.length > 30000) {
      showToast({ title: "文本最多 30000 字符", icon: "none" });
      return;
    }
    if (ref.current.submitting) return;
    setData({ submitting: true });
    showLoading({ title: "正在整理学习内容…", mask: true });
    try {
      const material = await mateService.createMaterial({
        type: "text",
        title: ref.current.title.trim() || "我的文本资料",
      });
      await mateService.commitMaterial({ materialId: material.id, text });
      const job = await mateService.startParse({ materialId: material.id });
      hideLoading();
      setData({ submitting: false });
      navigateTo(
        `/packages/material/pages/parsing/index?materialId=${material.id}&jobId=${job.jobId}`,
      );
    } catch (error) {
      hideLoading();
      setData({ submitting: false });
      showToast({
        title: error instanceof Error ? error.message : "解析失败，请稍后重试",
        icon: "none",
      });
    }
  }

  function clearText() {
    setData({ text: "", hasText: false });
  }

  return (
    <div className="page material-add-page">
      <div className="import-head">
        <div className="h1">添加学习资料</div>
        <span className="muted">把想学的内容，整理成自己的英语手册。</span>
      </div>

      <div className="type-selector" role="group" aria-label="选择资料类型">
        <button
          type="button"
          className={`type-option ${data.selectedType === "image" ? "type-option--active" : ""}`}
          onClick={() => selectType("image")}
          disabled={data.submitting}
          aria-label={`图片，${data.selectedType === "image" ? "已选择" : "未选择"}`}
        >
          <MateIcon
            name="image"
            size={18}
            tone={data.selectedType === "image" ? "accent" : "muted"}
          />
          <span>图片</span>
        </button>
        <button
          type="button"
          className={`type-option ${data.selectedType === "pdf" ? "type-option--active" : ""}`}
          onClick={() => selectType("pdf")}
          disabled={data.submitting}
          aria-label={`PDF，${data.selectedType === "pdf" ? "已选择" : "未选择"}`}
        >
          <MateIcon
            name="file-text"
            size={18}
            tone={data.selectedType === "pdf" ? "accent" : "muted"}
          />
          <span>PDF</span>
        </button>
        <button
          type="button"
          className={`type-option ${data.selectedType === "text" ? "type-option--active" : ""}`}
          onClick={() => selectType("text")}
          disabled={data.submitting}
          aria-label={`文本，${data.selectedType === "text" ? "已选择" : "未选择"}`}
        >
          <MateIcon
            name="pencil-line"
            size={18}
            tone={data.selectedType === "text" ? "accent" : "muted"}
          />
          <span>文本</span>
        </button>
      </div>

      {data.selectedType === "image" ? (
        <div className="import-panel">
          <div className="import-title">从一张书页开始</div>
          <span className="import-description">
            拍下书页、课堂板书或笔记，也可以从相册选择。
          </span>
          <div className="import-detail">
            <span>每次最多 9 张，单张不超过 3MB。</span>
            <span>请按阅读顺序选择，保持文字清晰、页面平整。</span>
          </div>
          <div className="privacy-note">
            整理后，你可以对照原图核对内容，再选择要学的词句。
          </div>
        </div>
      ) : data.selectedType === "pdf" ? (
        <div className="import-panel">
          <div className="import-title">带上正在读的文档</div>
          <span className="import-description">
            从微信聊天导入 PDF，支持文本或扫描文档。
          </span>
          <div className="import-detail">
            <span>
              点击下方按钮后，会先打开聊天列表。选择存有 PDF 的聊天，再选择文件。
            </span>
            <span>
              如果 PDF 在手机里，请先发送到微信「文件传输助手」，再回来选择。
            </span>
            <span>每次选择 1 份 PDF，不超过 10MB。</span>
          </div>
          <div className="privacy-note">
            PDF 将通过 MinerU 文档解析服务提取文字，请勿上传包含敏感个人信息的文件。
          </div>
        </div>
      ) : (
        <div className="import-panel import-panel--text">
          <div className="field">
            <div className="field__label">英语原文</div>
            <textarea
              className="textarea import-textarea"
              placeholder="粘贴英语文章、课堂笔记…"
              value={data.text}
              maxLength={30000}
              onChange={(e) => onInput(e.target.value)}
            />
            <div className="text-toolbar">
              {data.text ? (
                <button
                  type="button"
                  className="text-action"
                  onClick={clearText}
                >
                  清空
                </button>
              ) : null}
              <span className="text-count">{data.text.length} / 30000</span>
            </div>
          </div>
          <div className="field">
            <div className="field__label">
              资料名称 <span className="muted">（可选）</span>
            </div>
            <input
              className="input"
              placeholder="例如 Unit 3 Travel"
              value={data.title}
              onChange={(e) => onTitleInput(e.target.value)}
            />
          </div>
          <div className="privacy-note">
            原文会保留在资料中，方便你随时回来核对。
          </div>
        </div>
      )}

      <div className="action-bar">
        {data.selectedType === "image" ? (
          <button
            type="button"
            className="btn btn--primary btn--block"
            disabled={data.submitting}
            onClick={chooseImage}
          >
            {data.submitting ? "正在上传…" : "选择图片并整理"}
          </button>
        ) : data.selectedType === "pdf" ? (
          <button
            type="button"
            className="btn btn--primary btn--block"
            disabled={data.submitting}
            onClick={choosePdf}
          >
            {data.submitting ? "正在上传…" : "从微信聊天选择 PDF"}
          </button>
        ) : (
          <button
            type="button"
            className="btn btn--primary btn--block"
            disabled={data.submitting || !data.hasText}
            onClick={() => void submitText()}
          >
            {data.submitting ? "正在整理…" : "开始 AI 整理"}
          </button>
        )}
      </div>
    </div>
  );
}
