/**
 * Analyse（统计）相关类型定义
 */

/** 概览统计 */
export interface AnalyseOverview {
  total: number;
  todayCount: number;
  /** 近 7 天新增（含今天） */
  weekCount: number;
  avgDuration: number;
  /** 用时中位数（秒） */
  medianDuration: number;
  /** 最快用时（秒，识别刷答） */
  minDuration: number;
  /** 最慢用时（秒） */
  maxDuration: number;
  workName: string;
  isPublish: boolean;
  isStopped: boolean;
  publishedAt: string | null;
}

/** 选项统计 */
export interface OptionStat {
  label: string;
  count: number;
  percentage: number;
}

/** 题目统计 */
export interface QuestionStat {
  questionId: string;
  title: string;
  type: string;
  total: number;
  options?: OptionStat[];
  texts?: string[];
}

/** 趋势数据点 */
export interface TrendPoint {
  date: string;
  count: number;
}

/** 命名计数（设备/浏览器/OS 分布用） */
export interface LabelCount {
  label: string;
  count: number;
}

/** 设备分布统计 */
export interface DeviceStats {
  total: number;
  devices: LabelCount[];
  browsers: LabelCount[];
  os: LabelCount[];
}

/** 24 小时分布数据点 */
export interface HourlyPoint {
  hour: number;
  count: number;
}

/** 公开统计结果 */
export interface PublicStats {
  allowed: boolean;
  message?: string;
  workName?: string;
  overview?: AnalyseOverview;
  questions?: QuestionStat[];
}
