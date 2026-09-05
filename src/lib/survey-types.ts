/**
 * 已发布问卷的数据结构
 * 由编辑器的 PageInfo + ComponentList 序列化而来
 */

/** 问卷设置：发布时配置的收集规则 */
export type SurveySettings = {
  /** 截止时间（ISO 字符串），为空表示无截止 */
  deadline?: string;
  /** 最大答卷数，0 表示不限制 */
  maxResponses?: number;
  /** 每台设备是否仅允许提交一次 */
  uniqueByDevice?: boolean;
  /** 收集到上限后是否自动停止 */
  autoStopOnLimit?: boolean;
  /** 是否显示进度条 */
  showProgressBar?: boolean;
  /** 是否允许查看结果统计 */
  showPublicResults?: boolean;
  /** 自定义结束文案 */
  thankYouText?: string;
  /** 是否打乱题目顺序 */
  shuffleQuestions?: boolean;
};

/** 已发布问卷文档 */
export type SurveyDocument = {
  id: string;
  title: string;
  desc: string;
  status: "published" | "stopped";
  /** 页面总数 */
  pageTotal: number;
  /** 组件列表（结构同编辑器 ComponentInfoType） */
  componentList: SurveyComponent[];
  /** 发布时间 */
  publishedAt: string;
  /** 最近更新时间 */
  updatedAt: string;
  /** 收集设置 */
  settings: SurveySettings;
  /** 答卷数 */
  responseCount: number;
};

/** 问卷组件（与编辑器 ComponentInfoType 对齐） */
export type SurveyComponent = {
  feUuid: string;
  type: string;
  title: string;
  page: number;
  isHidden?: boolean;
  props: Record<string, unknown>;
};

/** 答案值类型 */
export type AnswerValue =
  | { type: "text"; value: string }
  | { type: "single"; value: string }
  | { type: "multiple"; value: string[] }
  /** 量表类答案：null 表示未作答（NPS 的 0 是合法分值，不能当空值） */
  | { type: "scale"; value: number | null }
  | { type: "ranking"; value: string[] }
  | { type: "blanks"; value: string[] }
  | { type: "matrix"; value: Record<string, string | string[]> }
  | { type: "table"; value: Record<string, string>[] }
  | { type: "cascader"; value: string[] }
  | { type: "datetime"; value: string }
  | { type: "file"; value: string[] }
  | { type: "signature"; value: string }
  | { type: "location"; value: string }
  | { type: "maxdiff"; value: { best: string; worst: string } }
  | { type: "none" };

/** 校验结果 */
export type ValidationResult = {
  valid: boolean;
  errors: Record<string, string>;
};