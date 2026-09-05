/**
 * POI 边界服务 API 模块
 *
 * 全部为公开只读接口（网关前缀 /poi → poi 服务 8009）。
 * 统一带 `silentAuth`：这些接口不需要登录，而 /poi 页面是公开页面，
 * 一旦后端因任何原因回了 401，绝不能让 `request()` 走默认的
 * refresh → 失败 → 跳 /signin，把访客弹到登录页。
 *
 * 体积是这里的第一约束，用接口时务必先想清楚要拉多少数据：
 *   GET /poi/regions                        6.7KB   目录，放心调
 *   /poi/features?fields=meta               几十 KB 只有中心点，秒出
 *   /poi/features?fields=full&simplify=0.01 0.5MB   简化后的真实边界
 *   /poi/features?fields=full（不简化）      26MB+   千万别在浏览器里拉
 */
import { http } from "../client";
import type {
  PoiDataset,
  PoiFeaturesFullResult,
  PoiFeaturesMetaResult,
  PoiFeatureQuery,
  PoiRegionDetail,
} from "./poi.types";

/** 公开接口统一走静默鉴权 */
const PUBLIC = { silentAuth: true } as const;

/** 拼查询串（跳过 undefined / 空串，避免把 "undefined" 发给后端触发 400） */
function buildQuery(
  params: Record<string, string | number | undefined>,
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export const poiApi = {
  /** 数据集目录（35 条，不含 GeoJSON，约 6.7KB） */
  listRegions: () => http.get<PoiDataset[]>("/poi/regions", PUBLIC),

  /**
   * 数据集详情 + 完整边界。
   * 只有 world（0.3MB）适合直接调；其余数据集请改用 features() 并带简化参数。
   */
  getRegion: (name: string, simplify?: number, precision?: number) =>
    http.get<PoiRegionDetail>(
      `/poi/regions${buildQuery({ name, simplify, precision })}`,
      PUBLIC,
    ),

  /** 要素摘要（只有中心点，用于先出散点概览） */
  featuresMeta: (query: PoiFeatureQuery) =>
    http.get<PoiFeaturesMetaResult>(
      `/poi/features${buildQuery({ ...query, fields: "meta" })}`,
      PUBLIC,
    ),

  /** 完整边界（务必带 simplify / precision，否则浏览器会拉到几十 MB） */
  featuresFull: (query: PoiFeatureQuery) =>
    http.get<PoiFeaturesFullResult>(
      `/poi/features${buildQuery({ ...query, fields: "full" })}`,
      PUBLIC,
    ),
};
