"use client";

import { useCallback, useEffect, useRef } from "react";
import * as echarts from "echarts/core";
import { MapChart, ScatterChart } from "echarts/charts";
import { GeoComponent, TooltipComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import type {
  PoiFeatureCollection,
  PoiFeatureMeta,
} from "@/lib/api/modules/poi.types";

/**
 * 只注册地图需要的模块。
 *
 * 没有复用 src/components/EChart.tsx 的原因：那个组件给统计页用，只注册了
 * 折线/柱状/饼图。把 MapChart 加进去会让所有用到它的页面都多打几百 KB。
 * 地图是这里独有的场景，单独封装更划算。
 */
echarts.use([
  MapChart,
  ScatterChart,
  GeoComponent,
  TooltipComponent,
  CanvasRenderer,
]);

export type PoiMapPoint = Pick<
  PoiFeatureMeta,
  "name" | "centerLng" | "centerLat"
>;

type PoiMapProps = {
  /** 当前边界在 ECharts 里的注册名，如 poi-world / poi-province */
  mapKey: string;
  /** 真实边界；null → 降级成中心点散点图 */
  geoJson: PoiFeatureCollection | null;
  /** 散点模式的中心点（来自 fields=meta） */
  points: PoiMapPoint[];
  /**
   * 底图注册名与数据。给中国范围的散点提供地理参照 ——
   * 否则一堆点飘在白底上完全看不出是哪。用 world（0.3MB）当底，够轻。
   */
  baseKey: string;
  baseGeoJson: PoiFeatureCollection | null;
  height?: number;
};

/** tooltip 回调参数（只用到 name / data，不必引 echarts 的完整类型） */
type TooltipParam = {
  name?: string;
  data?: { name?: string; value?: unknown };
};

export default function PoiMap({
  mapKey,
  geoJson,
  points,
  baseKey,
  baseGeoJson,
  height = 520,
}: PoiMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);
  /** 记录上次注册的 geoJson 对象，避免同一份数据反复注册 */
  const registeredRef = useRef<{ key: string; json: unknown } | null>(null);

  // 建实例 / 销毁：只跑一次，后面靠 setOption 更新
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const chart = echarts.init(el);
    chartRef.current = chart;
    const ro = new ResizeObserver(() => chart.resize());
    ro.observe(el);
    return () => {
      ro.disconnect();
      chart.dispose();
      chartRef.current = null;
    };
  }, []);

  const buildOption = useCallback(() => {
    const tooltip = {
      trigger: "item" as const,
      formatter: (p: TooltipParam) => p?.name || p?.data?.name || "-",
    };

    // 有边界 → 画真实面；没有 → 降级成中心点散点
    if (geoJson && geoJson.features.length > 0) {
      return {
        tooltip,
        series: [
          {
            type: "map",
            map: mapKey,
            roam: true, // 滚轮缩放 + 拖拽
            selectedMode: false,
            label: { show: false },
            itemStyle: {
              areaColor: "#b5d4f4",
              borderColor: "#ffffff",
              borderWidth: 0.5,
            },
            emphasis: {
              label: { show: true, fontSize: 12, color: "#2c2c2a" },
              itemStyle: { areaColor: "#ef9f27" },
            },
            data: [], // 名字取自 properties.name，不需要额外塞 data
          },
        ],
      };
    }

    const scatterData = points.map((p) => ({
      name: p.name,
      value: [p.centerLng, p.centerLat],
    }));
    const scatterStyle = {
      symbolSize: 6,
      itemStyle: { color: "#d85a30" },
      emphasis: { itemStyle: { color: "#993c1d" }, scale: 1.6 },
    };

    // 底图还没到位（world 仍在加载）时不能引用它：geo.map 指向未注册的地图会报错。
    // 退化成普通直角坐标系散点，至少立刻有东西看，等底图到了再切成地理坐标系。
    //
    // 判断只看 baseGeoJson，不查 echarts.getMap()：注册发生在下面的 effect 里，
    // 而 useCallback 在渲染期就算好了，此时查注册表必然是"未注册"，会永远卡在降级态。
    if (!baseGeoJson) {
      return {
        tooltip,
        grid: { left: 8, right: 16, top: 16, bottom: 8, containLabel: true },
        xAxis: {
          type: "value",
          name: "经度",
          scale: true,
          nameTextStyle: { fontSize: 11, color: "#888780" },
          axisLabel: { fontSize: 11, color: "#5F5E5A" },
          splitLine: { lineStyle: { color: "#D3D1C7", type: "dashed" } },
        },
        yAxis: {
          type: "value",
          name: "纬度",
          scale: true,
          nameTextStyle: { fontSize: 11, color: "#888780" },
          axisLabel: { fontSize: 11, color: "#5F5E5A" },
          splitLine: { lineStyle: { color: "#D3D1C7", type: "dashed" } },
        },
        series: [{ type: "scatter", data: scatterData, ...scatterStyle }],
      };
    }

    return {
      tooltip,
      geo: {
        map: baseKey,
        roam: true,
        silent: true, // 底图不参与交互，只作参照
        itemStyle: {
          areaColor: "#f1efe8",
          borderColor: "#d3d1c7",
          borderWidth: 0.4,
        },
        emphasis: { disabled: true },
      },
      series: [
        {
          type: "scatter",
          coordinateSystem: "geo",
          data: scatterData,
          ...scatterStyle,
        },
      ],
    };
  }, [mapKey, geoJson, points, baseKey, baseGeoJson]);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    // 注册底图（world 只注册一次，getMap 有值说明已注册过）
    if (baseGeoJson && !echarts.getMap(baseKey)) {
      echarts.registerMap(baseKey, baseGeoJson as never);
    }

    // 注册当前边界：同一份对象不重复注册，换了（比如切了省筛选）才重新注册
    if (geoJson) {
      const last = registeredRef.current;
      if (last?.key !== mapKey || last.json !== geoJson) {
        echarts.registerMap(mapKey, geoJson as never);
        registeredRef.current = { key: mapKey, json: geoJson };
      }
    }

    chart.setOption(buildOption(), { notMerge: true });
  }, [
    buildOption,
    mapKey,
    geoJson,
    points,
    baseKey,
    baseGeoJson,
  ]);

  const hasContent =
    (geoJson !== null && geoJson.features.length > 0) || points.length > 0;

  return (
    <div className="relative">
      <div ref={containerRef} style={{ width: "100%", height }} />
      {!hasContent && (
        <div
          className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground"
          style={{ height }}
        >
          暂无数据
        </div>
      )}
    </div>
  );
}
