/**
 * POI 边界服务相关类型定义
 *
 * 对应后端 `apps/poi`：
 *   GET /poi/regions            数据集目录（35 条，不含 GeoJSON）
 *   GET /poi/features           要素查询（fields=meta 轻量 / fields=full 含几何）
 *
 * 网关前缀 /poi → poi 服务（8009），前端走 /api/poi/...
 */

/** 外接矩形：[minLng, minLat, maxLng, maxLat] */
export type PoiBbox = [number, number, number, number];

/** 层级：world 世界国界 / province 省级 / city 地级 / county 县级 / town 乡镇街道 */
export type PoiLevel = "world" | "province" | "city" | "county" | "town";

/**
 * 数据集目录项
 *
 * featureCount 是导入时写入的要素数，可用来预估拉全量的代价：
 * 但它和体积不成正比 —— province 只有 34 个要素却是 26MB（坐标精度高），
 * world 有 240 个要素才 0.3MB。
 */
export interface PoiDataset {
  id: number;
  /** 数据集唯一名，如 world / province / china-guangdong */
  name: string;
  /** 中文展示名 */
  displayName: string;
  level: PoiLevel | string;
  featureCount: number | null;
  bbox: PoiBbox | null;
  center: { lng: number; lat: number } | null;
}

/** GeoJSON 几何（本项目只会出现 Polygon / MultiPolygon） */
export interface PoiGeometry {
  type: string;
  coordinates: unknown;
}

/** GeoJSON 要素：properties.name 是 ECharts 地图取名的依据 */
export interface PoiGeoFeature {
  type: "Feature";
  properties: Record<string, unknown> | null;
  geometry: PoiGeometry;
}

export interface PoiFeatureCollection {
  type: "FeatureCollection";
  features: PoiGeoFeature[];
}

/** GET /poi/regions?name=xxx 的返回：目录信息 + 拼装好的完整边界 */
export interface PoiRegionDetail extends PoiDataset {
  schema: PoiFeatureCollection;
}

/**
 * fields=meta 的要素摘要（不含 geometry，体积小 1000 倍）
 * 中心点可直接画散点图，用来在真实边界加载完成前先给个概览。
 */
export interface PoiFeatureMeta {
  /** 行政区划码；乡镇与部分世界地区为 null */
  code: string | null;
  name: string;
  level: string;
  provinceName: string | null;
  cityName: string | null;
  countyName: string | null;
  centerLng: number;
  centerLat: number;
  area: number | null;
}

/** GET /poi/features 的轻量返回（fields=meta） */
export interface PoiFeaturesMetaResult {
  dataset: string;
  /** 过滤后的总数，不是当页条数 */
  total: number;
  limit: number;
  offset: number;
  fields: "meta";
  items: PoiFeatureMeta[];
}

/** GET /poi/features 的完整返回（fields=full） */
export interface PoiFeaturesFullResult {
  dataset: string;
  total: number;
  limit: number;
  offset: number;
  fields: "full";
  type: "FeatureCollection";
  features: PoiGeoFeature[];
}

/**
 * GET /poi/features 查询参数
 *
 * 三个削减体积的手段可以叠加：
 *   fields=meta           丢掉几何，只剩中心点
 *   provinceCode / bbox   只取范围内的要素
 *   simplify / precision  服务端把坐标抽稀（province 26MB → 0.5MB）
 */
export interface PoiFeatureQuery {
  /** 必填：数据集名 */
  dataset: string;
  code?: string;
  level?: string;
  provinceCode?: string;
  cityCode?: string;
  countyCode?: string;
  keyword?: string;
  /** "minLng,minLat,maxLng,maxLat" */
  bbox?: string;
  fields?: "full" | "meta";
  /** 1–2000，默认 100 */
  limit?: number;
  offset?: number;
  /** 抽稀容差（度）：0.01 ≈ 1.1km */
  simplify?: number;
  /** 坐标小数位：4 ≈ 11m */
  precision?: number;
}
