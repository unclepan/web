"use client";

import { useEffect, useRef, useState } from "react";
import * as echarts from "echarts/core";
import { LineChart, BarChart, PieChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import type { EChartsCoreOption } from "echarts/core";

// 按需注册，避免全量打包
echarts.use([
  LineChart,
  BarChart,
  PieChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  CanvasRenderer,
]);

export type { EChartsCoreOption };

type EChartProps = {
  /** 静态 option（不随容器宽度变化的图表，如折线/柱状图） */
  option?: EChartsCoreOption;
  /**
   * 响应式构建：容器宽度变化（缩放/旋转/栅格栏数切换）时自动重算 option。
   * 用此能力可让饼图布局随“图表自身宽度”而非视口宽度切换，避免错位。
   */
  buildOption?: (width: number, height: number) => EChartsCoreOption;
  height?: number;
  className?: string;
};

export default function EChart({
  option,
  buildOption,
  height = 260,
  className,
}: EChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);
  const [width, setWidth] = useState(0);

  // 最新 props 存到 ref（在 effect 中更新，避免渲染期写 ref 的 lint 报错），
  // 供 init effect 的 ResizeObserver 回调读取，避免 inline 函数变化导致图表反复重建。
  const buildRef = useRef(buildOption);
  const optionRef = useRef(option);
  useEffect(() => {
    buildRef.current = buildOption;
    optionRef.current = option;
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const chart = echarts.init(el);
    chartRef.current = chart;

    // 初次及每次容器尺寸变化时，用真实宽度重算（饼图布局随容器宽度切换）
    const apply = () => {
      const w = el.clientWidth;
      chart.resize();
      const opt = buildRef.current
        ? buildRef.current(w || 320, height)
        : optionRef.current;
      if (opt) chart.setOption(opt, { notMerge: true });
      setWidth(w);
    };

    const ro = new ResizeObserver(apply);
    ro.observe(el);
    apply(); // 初次用真实宽度渲染，避免首帧用 0 宽度导致布局闪动

    return () => {
      ro.disconnect();
      chart.dispose();
      chartRef.current = null;
    };
  }, [height]);

  // 数据变化（buildOption/option 引用改变）或容器宽度变化 → 重绘
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    const w = containerRef.current?.clientWidth || width || 320;
    const opt = buildOption ? buildOption(w, height) : option;
    if (opt) chart.setOption(opt, { notMerge: true });
  }, [buildOption, option, width, height]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: "100%", minWidth: 0, height }}
    />
  );
}
