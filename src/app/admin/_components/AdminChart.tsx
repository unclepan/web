'use client';

import { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import {
  GridComponent,
  LegendComponent,
  TooltipComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { EChartsCoreOption } from 'echarts/core';

// 按需注册，避免把整个 echarts 打进 bundle
echarts.use([
  LineChart,
  BarChart,
  PieChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  CanvasRenderer,
]);

/**
 * 后台图表容器
 *
 * 单独在 admin 目录内实现一份，不复用 @/components/EChart —— 那份注册的图表类型
 * 不满足后台需要，改它会侵入公共目录。
 */
export function AdminChart({
  option,
  height = 280,
  className = '',
}: {
  option: EChartsCoreOption;
  height?: number;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = echarts.init(containerRef.current);
    chartRef.current = chart;

    const observer = new ResizeObserver(() => chart.resize());
    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      chart.dispose();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    chartRef.current?.setOption(option, true);
  }, [option]);

  return (
    <div
      ref={containerRef}
      style={{ height }}
      className={`w-full ${className}`}
    />
  );
}
