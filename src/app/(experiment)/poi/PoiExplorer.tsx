"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, TriangleAlert } from "lucide-react";
import { poiApi } from "@/lib/api";
import type {
  PoiDataset,
  PoiFeatureCollection,
  PoiFeatureMeta,
} from "@/lib/api/modules/poi.types";
import PoiMap from "./PoiMap";
import PoiDatasetChart from "./PoiDatasetChart";

/** 简化档位：容差（度）与坐标小数位的组合 */
const SIMPLIFY_PRESETS = [
  { key: "raw", label: "原始（不简化）", simplify: undefined, precision: undefined },
  { key: "fine", label: "精细 0.001° / 5 位", simplify: 0.001, precision: 5 },
  { key: "normal", label: "标准 0.01° / 4 位", simplify: 0.01, precision: 4 },
  { key: "coarse", label: "粗略 0.05° / 3 位", simplify: 0.05, precision: 3 },
] as const;

type PresetKey = (typeof SIMPLIFY_PRESETS)[number]["key"];

/**
 * 实测的载荷参考（fields=full，标准档 simplify=0.01&precision=4，命中缓存后的耗时）
 *
 * 「原始」是未简化时的体积 —— 那才是浏览器真正吃不下的东西。
 */
const SIZE_HINT: Record<string, string> = {
  world: "0.3MB，直接可拉",
  province: "原始 26MB → 标准档 0.5MB",
  city: "原始 67MB → 标准档 1.5MB",
  county: "原始 141MB → 标准档 约 4.5MB（按省筛只要 0.2MB）",
};

/** 单次最多取多少条要素（后端 limit 上限 2000） */
const MAX_LIMIT = 2000;

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

export default function PoiExplorer() {
  const [datasets, setDatasets] = useState<PoiDataset[]>([]);
  const [selectedName, setSelectedName] = useState("world");

  /** 底图：world 的边界，给中国范围的散点做地理参照 */
  const [baseGeoJson, setBaseGeoJson] = useState<PoiFeatureCollection | null>(null);
  /** 中心点散点（fields=meta，秒出） */
  const [points, setPoints] = useState<PoiFeatureMeta[]>([]);
  /** 真实边界（fields=full） */
  const [geoJson, setGeoJson] = useState<PoiFeatureCollection | null>(null);

  const [provinceCode, setProvinceCode] = useState("");
  const [provinces, setProvinces] = useState<PoiFeatureMeta[]>([]);

  const [preset, setPreset] = useState<PresetKey>("normal");
  const [loadingMeta, setLoadingMeta] = useState(false);
  const [loadingFull, setLoadingFull] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** 最近一次请求的可观测量：URL、耗时、载荷 */
  const [probe, setProbe] = useState<{
    url: string;
    ms: number;
    bytes: number;
    note: string;
  } | null>(null);

  const dataset = useMemo(
    () => datasets.find((d) => d.name === selectedName) ?? null,
    [datasets, selectedName],
  );

  const activePreset = SIMPLIFY_PRESETS.find((p) => p.key === preset)!;
  /** 只有这三个数据集带省代码，乡镇数据集本身已经是分省的 */
  const supportsProvince = ["city", "county"].includes(dataset?.level ?? "");

  // ── 启动：拉目录 + world 底图 + 省列表 ──
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const list = await poiApi.listRegions();
        if (!cancelled) setDatasets(list);

        // world 只有 0.3MB，直接拿来当底图兼默认展示数据
        const world = await poiApi.getRegion("world");
        if (!cancelled) setBaseGeoJson(world.schema);

        // 省列表只有 34 条，用于 city / county 的按省筛选
        const prov = await poiApi.featuresMeta({
          dataset: "province",
          fields: "meta",
          limit: 100,
        });
        if (!cancelled) setProvinces(prov.items);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // ── 切数据集 / 切省：重新拉中心点散点，并清掉已有边界 ──
  useEffect(() => {
    if (!selectedName) return;
    let cancelled = false;

    (async () => {
      setLoadingMeta(true);
      setError(null);
      setGeoJson(null);
      const t0 = performance.now();
      try {
        const res = await poiApi.featuresMeta({
          dataset: selectedName,
          ...(supportsProvince && provinceCode ? { provinceCode } : {}),
          limit: MAX_LIMIT,
        });
        if (cancelled) return;
        setPoints(res.items);
        setProbe({
          url: `/poi/features?dataset=${selectedName}&fields=meta&limit=${MAX_LIMIT}`,
          ms: Math.round(performance.now() - t0),
          bytes: JSON.stringify(res).length,
          note: `中心点 ${res.items.length} / 共 ${res.total} 条`,
        });
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoadingMeta(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedName, provinceCode, supportsProvince]);

  /** 手动加载真实边界 */
  async function loadBoundary() {
    setLoadingFull(true);
    setError(null);
    const t0 = performance.now();
    try {
      const res = await poiApi.featuresFull({
        dataset: selectedName,
        ...(supportsProvince && provinceCode ? { provinceCode } : {}),
        simplify: activePreset.simplify,
        precision: activePreset.precision,
        limit: MAX_LIMIT,
      });
      const fc: PoiFeatureCollection = {
        type: "FeatureCollection",
        features: res.features,
      };
      setGeoJson(fc);
      setProbe({
        url: `/poi/features?dataset=${selectedName}&fields=full&limit=${MAX_LIMIT}&simplify=${activePreset.simplify ?? ""}&precision=${activePreset.precision ?? ""}`,
        ms: Math.round(performance.now() - t0),
        bytes: JSON.stringify(res).length,
        note: `边界 ${res.features.length} 条（过滤后共 ${res.total} 条，简化会剔除过小要素）`,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoadingFull(false);
    }
  }

  const mapKey = `poi-${selectedName}${provinceCode ? `-${provinceCode}` : ""}`;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-foreground">POI 边界数据浏览</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          35 个数据集 / 47,154 条行政边界要素。切换数据集先看中心点分布，确认后再按需加载真实边界。
        </p>
      </header>

      {/* ── 控制区 ── */}
      <section className="rounded-xl border border-border bg-card p-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">数据集</span>
            <select
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/30"
              value={selectedName}
              onChange={(e) => {
                setSelectedName(e.target.value);
                setProvinceCode("");
              }}
            >
              {datasets.length === 0 && <option value="world">加载中…</option>}
              {datasets.map((d) => (
                <option key={d.name} value={d.name}>
                  {d.displayName}（{d.featureCount ?? 0}）
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              按省筛选 {!supportsProvince && <span className="opacity-50">（本数据集不支持）</span>}
            </span>
            <select
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/30 disabled:opacity-50"
              value={provinceCode}
              disabled={!supportsProvince}
              onChange={(e) => setProvinceCode(e.target.value)}
            >
              <option value="">全部</option>
              {provinces.map((p) => (
                <option key={p.code ?? p.name} value={p.code ?? ""}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">简化档位</span>
            <select
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/30"
              value={preset}
              onChange={(e) => setPreset(e.target.value as PresetKey)}
            >
              {SIMPLIFY_PRESETS.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>

          <div className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">真实边界</span>
            <button
              type="button"
              onClick={loadBoundary}
              disabled={loadingFull || loadingMeta}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50"
            >
              {loadingFull ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  加载中…
                </span>
              ) : (
                "加载边界"
              )}
            </button>
          </div>
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          {dataset ? (
            <>
              {dataset.displayName} · {dataset.featureCount ?? 0} 条要素 · 载荷参考：
              {SIZE_HINT[dataset.name] ?? "按数据集而定"}
            </>
          ) : (
            "加载中…"
          )}
        </p>

        {error && (
          <p className="mt-3 inline-flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
            <TriangleAlert className="size-4 shrink-0" />
            {error}
          </p>
        )}
      </section>

      {/* ── 请求观测条 ── */}
      {probe && (
        <section className="rounded-xl border border-border bg-muted/40 px-4 py-3 font-mono text-xs text-muted-foreground">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
            <span className="text-foreground">{probe.url}</span>
            <span>
              耗时 <b className="text-foreground">{probe.ms}ms</b>
            </span>
            <span>
              载荷 <b className="text-foreground">{formatBytes(probe.bytes)}</b>
            </span>
            <span>{probe.note}</span>
          </div>
        </section>
      )}

      {/* ── 地图 ── */}
      <section className="rounded-xl border border-border bg-card p-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">
            {geoJson ? "真实边界" : "中心点分布"}
            <span className="ml-2 font-normal text-muted-foreground">
              {geoJson
                ? `${geoJson.features.length} 个面`
                : `${points.length} 个点`}
            </span>
          </h2>
          {loadingMeta && (
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" />
              取中心点…
            </span>
          )}
        </div>
        <PoiMap
          mapKey={mapKey}
          geoJson={geoJson}
          points={points}
          baseKey="poi-world"
          baseGeoJson={baseGeoJson}
        />
      </section>

      {/* ── 数据集总览 ── */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-3 text-sm font-semibold text-foreground">
            各层级要素数
          </h2>
          <PoiDatasetChart datasets={datasets} />
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-3 text-sm font-semibold text-foreground">
            数据集清单（{datasets.length}）
          </h2>
          <div className="max-h-72 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-card text-muted-foreground">
                <tr>
                  <th className="pb-2 font-medium">名称</th>
                  <th className="pb-2 font-medium">层级</th>
                  <th className="pb-2 text-right font-medium">要素</th>
                  <th className="pb-2 text-right font-medium">外接矩形</th>
                </tr>
              </thead>
              <tbody className="text-foreground">
                {datasets.map((d) => (
                  <tr key={d.name} className="border-t border-border/60">
                    <td className="py-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedName(d.name);
                          setProvinceCode("");
                        }}
                        className="text-left hover:underline"
                      >
                        {d.displayName}
                      </button>
                    </td>
                    <td className="py-1.5 text-muted-foreground">{d.level}</td>
                    <td className="py-1.5 text-right tabular-nums">
                      {(d.featureCount ?? 0).toLocaleString()}
                    </td>
                    <td className="py-1.5 text-right font-mono text-[10px] text-muted-foreground">
                      {d.bbox
                        ? d.bbox.map((v) => v.toFixed(0)).join(",")
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
