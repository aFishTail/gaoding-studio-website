export type CaseTourStep = {
  title: string;
  description: string;
  route: string;
};

export type CaseItem = {
  slug: string;
  title: string;
  category: string;
  industry: string;
  duration: string;
  services: string[];
  technology: string[];
  outcome: string;
  summary: string;
  visual: "dashboard" | "system" | "mobile" | "ai" | "brand" | "commerce";
  tone: string;
  image?: {
    src: string;
    alt: string;
  };
  screens?: {
    src: string;
    alt: string;
  }[];
  demo?: {
    href: string;
    device: "phone";
    tour: CaseTourStep[];
  };
  story?: {
    heading: [string, string];
    paragraphs: string[];
    results: { value: string; label: string }[];
  };
};

export const services = [
  { icon: "⌁", title: "数据可视化大屏", description: "将复杂数据转化为清晰、实时、可决策的可视化界面。", tags: ["指标体系", "实时数据", "多端适配"] },
  { icon: "▦", title: "管理系统", description: "围绕真实业务流程设计高效率、可扩展的管理工具。", tags: ["产品设计", "前后端开发", "权限流程"] },
  { icon: "◫", title: "小程序 / H5 / App", description: "从核心场景出发，打造顺畅、轻量的移动端产品体验。", tags: ["微信生态", "跨端开发", "用户增长"] },
  { icon: "◎", title: "企业官网", description: "兼顾品牌表达、内容维护、SEO 与业务线索获取。", tags: ["品牌官网", "内容系统", "性能优化"] },
  { icon: "✦", title: "AI Skills 与工作流", description: "把重复工作交给 AI，让团队专注高价值判断与创造。", tags: ["Agent", "知识库", "自动化"] },
  { icon: "⤧", title: "系统升级与二开", description: "在现有系统上梳理问题、重塑体验并补齐关键能力。", tags: ["体验升级", "架构优化", "功能扩展"] },
  { icon: "⌘", title: "AI 功能接入", description: "把文本、图像与数据智能能力嵌入现有产品。", tags: ["大模型", "RAG", "智能助手"] },
  { icon: "◇", title: "咨询与原型验证", description: "用轻量原型快速验证商业想法与关键产品路径。", tags: ["需求梳理", "MVP", "可用性测试"] },
];

export const cases: CaseItem[] = [
  {
    slug: "mining-dashboard",
    title: "矿山运营管理平台大屏",
    category: "数据可视化",
    industry: "能源与工业",
    duration: "8 周",
    services: ["需求梳理", "UI 设计", "前端开发", "数据接入"],
    technology: ["Vue 3", "ECharts", "WebSocket", "Vite"],
    outcome: "将分散的生产数据汇聚为实时决策中枢。",
    summary: "覆盖产能、安全、设备与人员四大场景，为管理者建立统一的数据视角。",
    visual: "dashboard",
    tone: "blue",
    image: {
      src: "/cases/mine-dashboard.png",
      alt: "天津矿山协同管控平台数据大屏",
    },
  },
  {
    slug: "english-mate",
    title: "拿来练英语 · AI 英语学习小程序",
    category: "小程序 / App",
    industry: "教育与语言学习",
    duration: "2 周",
    services: ["产品设计", "UI 设计", "小程序开发", "AI 能力接入"],
    technology: ["微信小程序", "TypeScript", "CloudBase", "大模型 / ASR / TTS"],
    outcome: "把用户自己的资料，变成能回忆、能开口的英语练习。",
    summary:
      "支持拍照、PDF 或粘贴英文导入，经 AI 整理与人工确认后生成专属学习单元，串联快速回忆、造句批改、场景语音对练与复盘的完整闭环。",
    visual: "mobile",
    tone: "terracotta",
    screens: [
      {
        src: "/cases/english-mate/home.jpg",
        alt: "拿来练英语小程序首页界面",
      },
      {
        src: "/cases/english-mate/session.jpg",
        alt: "拿来练英语小程序对练准备界面",
      },
    ],
    demo: {
      href: "/demos/english-mate",
      device: "phone",
      tour: [
        {
          title: "01 · 首页（个人语言手册）",
          description: "英文学习内容优先呈现，支持切换快速/完整学习模式与打卡海报分享。",
          route: "/pages/home/index",
        },
        {
          title: "02 · 添加资料与 AI 解析",
          description: "支持图片、PDF、文本三种导入方式，三步解析流自动提炼词句与场景。",
          route: "/packages/material/pages/add/index",
        },
        {
          title: "03 · 学习内容确认",
          description: "勾选、筛选或删除提取出的单词、表达、语法与场景，标记待核对原文。",
          route: "/packages/material/pages/confirm/index?draftId=draft-demo",
        },
        {
          title: "04 · 学习单元详情",
          description: "汇总单元学习进度，串联单词/表达/语法回忆、消消乐、造句与场景对练。",
          route: "/packages/study/pages/lesson-detail/index?id=lesson-smalltalk",
        },
        {
          title: "05 · 先回忆后揭示卡片",
          description: "正面只给英文提示，自主思考后揭晓释义与例句，按不熟/有印象/掌握调度复习。",
          route: "/packages/study/pages/review/index?lessonId=lesson-smalltalk&type=word&practice=1",
        },
        {
          title: "06 · 造句批改与三档润色",
          description: "针对引导、中文或情景题作答，提供逐处纠错与简单自然/地道口语/商务正式三档润色。",
          route: "/packages/study/pages/sentence/index?lessonId=lesson-smalltalk",
        },
        {
          title: "07 · AI 场景语音对练",
          description: "围绕明确对话目标与角色开口练习，支持三级提示、AI 表达建议与结束复盘。",
          route: "/packages/practice/pages/session/index?scenarioId=sc-networking&lessonId=lesson-smalltalk",
        },
        {
          title: "08 · 单词消消乐与学习统计",
          description: "六组中英配对巩固记忆，配合七日学习时长柱状图记录持续积累。",
          route: "/packages/study/pages/game/index?lessonId=lesson-smalltalk",
        },
      ],
    },
    story: {
      heading: ["从自有资料出发，", "走到真正开口表达"],
      paragraphs: [
        "传统背单词应用往往围绕通用词库打转，学习者手头的课程讲义、外刊段落和工作邮件很难直接变成可复习、可练习的内容。我们以「个人语言手册」为设计主轴，用纸白画布、墨色排版与陶橙状态点，让用户自己的英文内容成为界面焦点。",
        "从拍照/PDF/文本导入、AI 提炼与人工核对确认，到先回忆后揭示的卡片、三档风格润色的造句练习，再到不打断对话的 AI 场景语音对练与集中复盘，帮助用户围绕同一份资料走完「认识 → 主动输出 → 场景使用 → 间隔复习」的完整闭环。",
      ],
      results: [
        { value: "3", label: "资料导入方式（图片 / PDF / 文本）" },
        { value: "5", label: "从整理到复盘的完整学习闭环" },
        { value: "3", label: "AI 造句润色风格档位" },
      ],
    },
  },
  {
    slug: "smart-ops",
    title: "智慧物业管理系统",
    category: "管理系统",
    industry: "园区与物业",
    duration: "12 周",
    services: ["业务梳理", "产品设计", "全栈开发"],
    technology: ["React", "TypeScript", "Node.js"],
    outcome: "工单平均处理时间下降 38%。",
    summary: "把巡检、报修、派单与资产管理整合进一套清晰的协作流程。",
    visual: "system",
    tone: "cyan",
  },
  {
    slug: "fintech-mobile",
    title: "企业金融服务移动端",
    category: "小程序 / App",
    industry: "金融科技",
    duration: "10 周",
    services: ["用户研究", "交互设计", "移动端开发"],
    technology: ["Taro", "Vue", "Cloudflare"],
    outcome: "让复杂业务在移动端三步内完成。",
    summary: "重构企业客户的额度查询、材料提交与进度跟踪体验。",
    visual: "mobile",
    tone: "violet",
  },
  {
    slug: "ai-knowledge",
    title: "企业 AI 知识助手",
    category: "AI 服务",
    industry: "专业服务",
    duration: "6 周",
    services: ["场景咨询", "RAG 架构", "AI 交互设计"],
    technology: ["OpenAI", "Vector DB", "Workers AI"],
    outcome: "把经验沉淀为随时可用的团队能力。",
    summary: "连接内部文档与业务规则，提供带来源的问答和工作流建议。",
    visual: "ai",
    tone: "indigo",
  },
  {
    slug: "green-brand",
    title: "循环科技品牌官网",
    category: "品牌官网",
    industry: "循环科技",
    duration: "5 周",
    services: ["品牌策略", "网站设计", "动效开发"],
    technology: ["Astro", "Motion", "Cloudflare"],
    outcome: "用清晰叙事建立可信的科技品牌形象。",
    summary: "重塑内容结构与视觉语言，让技术价值更容易被客户理解。",
    visual: "brand",
    tone: "mint",
  },
  {
    slug: "global-commerce",
    title: "跨境品牌电商平台",
    category: "管理系统",
    industry: "消费零售",
    duration: "14 周",
    services: ["体验升级", "前端重构", "增长实验"],
    technology: ["Next.js", "Shopify", "TypeScript"],
    outcome: "核心购买路径转化率提升 21%。",
    summary: "从内容浏览到结算全链路优化，兼顾多语言与全球性能。",
    visual: "commerce",
    tone: "orange",
  },
];

export const timeline = [
  { phase: "需求对接", period: "第 1 周", summary: "理解现有业务、数据来源与使用场景，确认目标、边界和项目协作方式。", deliverables: ["需求清单", "数据接口清单", "页面信息架构"] },
  { phase: "原型验证", period: "第 2 周", summary: "把核心流程和关键指标转化为可交互原型，用低成本方式快速校准方向。", deliverables: ["高保真原型", "交互说明", "评审记录"] },
  { phase: "视觉设计", period: "第 3–4 周", summary: "建立统一视觉系统，完成重点页面设计并覆盖典型状态与大屏适配。", deliverables: ["UI 设计稿", "组件规范", "动效说明"] },
  { phase: "开发联调", period: "第 5–7 周", summary: "按模块完成前端开发、接口联调与性能优化，持续提供可验收版本。", deliverables: ["功能版本", "测试记录", "部署文档"] },
  { phase: "验收交付", period: "第 8 周", summary: "完成多端测试、上线部署与团队培训，进入稳定运行和后续支持阶段。", deliverables: ["正式版本", "培训手册", "维护清单"] },
];
