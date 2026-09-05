/**
 * Analyse（统计）API 模块
 */
import { http } from "../client";
import type {
  AnalyseOverview,
  QuestionStat,
  TrendPoint,
  PublicStats,
  DeviceStats,
  HourlyPoint,
} from "./analyse.types";

export const analyseApi = {
  /** 概览统计（需登录） */
  overview: (workId: number) =>
    http.get<AnalyseOverview>(`/analyse/overview/${workId}`),

  /** 题目级统计（需登录） */
  questions: (workId: number) =>
    http.get<QuestionStat[]>(`/analyse/questions/${workId}`),

  /** 答卷趋势（需登录） */
  trend: (workId: number, days: number = 7) =>
    http.get<TrendPoint[]>(`/analyse/trend/${workId}?days=${days}`),

  /** 设备/浏览器/OS 分布（需登录） */
  devices: (workId: number) =>
    http.get<DeviceStats>(`/analyse/devices/${workId}`),

  /** 24 小时作答分布（需登录） */
  hourly: (workId: number) =>
    http.get<HourlyPoint[]>(`/analyse/hourly/${workId}`),

  /** 公开统计（分享页用，无需登录） */
  publicStats: (workId: number) =>
    http.get<PublicStats>(`/analyse/public/${workId}`),
};
