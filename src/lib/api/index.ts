/**
 * API 统一入口
 *
 * 用法：
 *   import { authApi, workApi, ApiError } from "@/lib/api";
 *   import { http } from "@/lib/api";           // 通用请求
 *
 * 新增模块示例：
 *   1. 在 modules/ 下新建 survey.types.ts + survey.ts
 *   2. 在 modules/survey.ts 中用 http 封装接口
 *   3. 在本文件 re-export
 */

// 核心客户端
export { http, ApiError } from "./client";
export type { ApiResponse } from "./client";

// 业务模块
export { authApi } from "./modules/auth";
export type {
  LoginResult,
  RegisterPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  LoginPayload,
} from "./modules/auth.types";

export { workApi } from "./modules/work";
export type {
  PublishSettings,
  WorkListItem,
  WorkDetail,
  PublishedWork,
  WorkHistoryItem,
  WorkHistoryDetail,
  WorkSavePayload,
  WorkPublishPayload,
  WorkRollbackPayload,
  WorkTemplateListItem,
  WorkTemplateDetail,
} from "./modules/work.types";

export { answerApi } from "./modules/answer";
export type {
  AnswerAddPayload,
  AnswerListResult,
  AnswerItem,
  MyAnsweredItem,
  MyAnsweredResult,
  MyLatestAnswer,
} from "./modules/answer.types";

export { userApi } from "./modules/user";
export type {
  UserProfile,
  UserListItem,
  UserListResult,
  ApplyAdminResult,
} from "./modules/user.types";

export { analyseApi } from "./modules/analyse";
export type {
  AnalyseOverview,
  QuestionStat,
  OptionStat,
  TrendPoint,
  PublicStats,
  DeviceStats,
  HourlyPoint,
  LabelCount,
} from "./modules/analyse.types";

export { newsletterApi } from "./modules/newsletter";
export type {
  SubscribePayload,
  SubscribeResult,
  SubscriptionStatus,
} from "./modules/newsletter.types";

export { contactApi } from "./modules/contact";
export type {
  ContactSubmitPayload,
  ContactSubmitResult,
} from "./modules/contact.types";

export { docsApi } from "./modules/docs";
export type {
  DocsArticleType,
  DocsLocale,
  DocsAuthor,
  DocsCategoryRef,
  DocsContentBlock,
  DocsSection,
  DocsArticle,
  DocsArticleDetail,
  DocsBreadcrumb,
  DocsSiblings,
  DocsLatestResult,
  DocsNavArticle,
  DocsNavNode,
  DocsCategoryNode,
  FeedbackKind,
  DocsFeedbackState,
  DocsMyFeedbackItem,
  DocsMyFeedbackResult,
} from "./modules/docs.types";

export { poiApi } from "./modules/poi";
export type {
  PoiBbox,
  PoiLevel,
  PoiDataset,
  PoiGeometry,
  PoiGeoFeature,
  PoiFeatureCollection,
  PoiRegionDetail,
  PoiFeatureMeta,
  PoiFeaturesMetaResult,
  PoiFeaturesFullResult,
  PoiFeatureQuery,
} from "./modules/poi.types";
