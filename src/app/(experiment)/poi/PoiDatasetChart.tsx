"use client";

import { useMemo } from "react";
import EChart from "@/components/EChart";
import type { EChartsCoreOption } from "@/components/EChart";
import type { PoiDataset, PoiLevel } from "@/lib/api/modules/poi.types";

/** 层级展示顺序与配色（浅色系，与站点主题一致） */
const LEVEL_META: Array<{ key: PoiLevel | string; label: string; color: string }> =
  [
    { key: "world", label: "世界国界", color: "#378ADD" },
    { key: "province", label: "省级", color: "#1D9E75" },
    { key: "city", label: "地级", color: "#EF9F27" },
    { key: "county", label: "县级", color: "#D85A30" },
    { key: "town", label: "乡镇街道", color: "#7F77DD" },
  ];

/**
 * 数据集柱状图：按层级聚合要素数。
 *
 * 数量级差距极大（province 34 vs town 43655），线性轴上小档会被压扁，
 * 所以每根柱子右侧直接标数值，不依赖柱子长度读数。
 */
export default function PoiDatasetChart({ datasets }: { datasets: PoiDataset[] }) {
  const option = useMemo<EChartsCoreOption>(() => {
    const totals = new Map<string, number>();
    const counts = new Map<string, number>();
    for (const d of datasets) {
      totals.set(d.level, (totals.get(d.level) ?? 0) + (d.featureCount ?? 0));
      counts.set(d.level, (counts.get(d.level) ?? 0) + 1);
    }
    const levels = LEVEL_META.filter((l) => counts.has(l.key));

    return {
      grid: { left: 8, right: 16, top: 24, bottom: 8, containLabel: true },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        formatter: (params: unknown) => {
          const arr = params as Array<{ dataIndex: number; value: number }>;
          const p = arr?.[0];
          if (!p) return "";
          const lv = levels[p.dataIndex];
          const n = counts.get(lv.key) ?? 0;
          return `${lv.label}<br/>要素合计 <b>${p.value.toLocaleString()}</b><br/>数据集 ${n} 个`;
        },
      },
      xAxis: {
        type: "value",
        name: "要素数",
        nameTextStyle: { fontSize: 11, color: "#888780" },
        axisLabel: { fontSize: 11, color: "#5F5E5A" },
        splitLine: { lineStyle: { color: "#D3D1C7", type: "dashed" } },
      },
      yAxis: {
        type: "category",
        data: levels.map((l) => l.label),
        axisLabel: { fontSize: 12, color: "#2C2C2A" },
        axisLine: { lineStyle: { color: "#D3D1C7" } },
        axisTick: { show: false },
      },
      series: [
        {
          type: "bar",
          data: levels.map((l) => ({
            value: totals.get(l.key) ?? 0,
            itemStyle: { color: l.color, borderRadius: [0, 4, 4, 0] },
          })),
          barMaxWidth: 22,
          label: {
            show: true,
            position: "right",
            fontSize: 11,
            color: "#5F5E5A",
            formatter: (p: { value: number }) => p.value.toLocaleString(),
          },
        },
      ],
    } as EChartsCoreOption;
  }, [datasets]);

  const totalFeatures = datasets.reduce((s, d) => s + (d.featureCount ?? 0), 0);
  const barHeight = Math.max(160, LEVEL_META.length * 44 + 40);

  return (
    <div>
      <EChart option={option} height={barHeight} />
      <p className="mt-1 text-xs text-muted-foreground">
        共 {datasets.length} 个数据集 / {totalFeatures.toLocaleString()} 条要素
      </p>
    </div>
  );
}
