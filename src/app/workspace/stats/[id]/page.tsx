"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Users,
  TrendingUp,
  Clock,
  CheckCircle2,
  Download,
  Loader2,
  ArrowLeft,
  CalendarDays,
  Timer,
  Zap,
  Hourglass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { workApi, analyseApi } from "@/lib/api";
import type {
  AnalyseOverview,
  QuestionStat,
  TrendPoint,
  WorkListItem,
  DeviceStats,
  HourlyPoint,
  LabelCount,
} from "@/lib/api";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { useLocale, format } from "@/i18n/useLocale";
import EChart from "@/components/EChart";
import type { EChartsCoreOption } from "@/components/EChart";

/** 图表统一配色（与页面蓝色系一致） */
const CHART_COLORS = [
  "#3b82f6", "#14b8a6", "#f59e0b", "#8b5cf6", "#ec4899",
  "#22c55e", "#f97316", "#06b6d4", "#6366f1", "#84cc16",
];

/** 饼图紧凑布局阈值：容器宽度 < 该值用“图例置底”紧凑布局，否则“图例右侧”宽松布局 */
const COMPACT_MAX_WIDTH = 460;

/**
 * 图表在亮 / 暗两套主题下的中性色。
 * ECharts 绘制在 canvas 上，读不到 CSS 变量，只能由调用方按当前主题显式注入。
 * 暗色取值对齐 globals.css 的 neutral 令牌：card ≈ #171717、muted ≈ #262626。
 */
interface ChartTheme {
  /** 轴标签 / 类目标签 */
  text: string;
  /** 数值轴标签（比 text 更弱） */
  axis: string;
  /** 坐标轴线 */
  line: string;
  /** 分割线 */
  split: string;
  /** 数据标签 */
  label: string;
  /** 高亮文字 */
  emphasis: string;
  /** 图例文字 */
  legend: string;
  /** 扇区描边（取卡片底色，用作扇区之间的间隔） */
  sliceBorder: string;
  tooltipBg: string;
  tooltipBorder: string;
  tooltipText: string;
}

const CHART_THEME: Record<"light" | "dark", ChartTheme> = {
  light: {
    text: "#374151",
    axis: "#9ca3af",
    line: "#e5e7eb",
    split: "#f3f4f6",
    label: "#6b7280",
    emphasis: "#111827",
    legend: "#4b5563",
    sliceBorder: "#ffffff",
    tooltipBg: "rgba(255,255,255,0.96)",
    tooltipBorder: "#e5e7eb",
    tooltipText: "#374151",
  },
  dark: {
    text: "#e5e7eb",
    axis: "#9ca3af",
    line: "#3f3f46",
    split: "#27272a",
    label: "#9ca3af",
    emphasis: "#f9fafb",
    legend: "#d1d5db",
    sliceBorder: "#171717",
    tooltipBg: "rgba(23,23,23,0.96)",
    tooltipBorder: "#3f3f46",
    tooltipText: "#e5e7eb",
  },
};

const buildTooltip = (c: ChartTheme) =>
  ({
    trigger: "item",
    backgroundColor: c.tooltipBg,
    borderColor: c.tooltipBorder,
    textStyle: { color: c.tooltipText, fontSize: 12 },
    extraCssText: "box-shadow:0 4px 12px rgba(0,0,0,0.08);border-radius:8px;",
  }) as const;

/** 近 7 天趋势：面积折线图 */
function buildTrendOption(
  trend: TrendPoint[],
  c: ChartTheme,
): EChartsCoreOption {
  return {
    color: ["#3b82f6"],
    tooltip: { ...buildTooltip(c), trigger: "axis" },
    grid: { left: 8, right: 16, top: 20, bottom: 8, containLabel: true },
    xAxis: {
      type: "category",
      data: trend.map((d) => d.date.slice(5)),
      boundaryGap: false,
      axisLine: { lineStyle: { color: c.line } },
      axisTick: { show: false },
      axisLabel: { color: c.text, fontSize: 12 },
    },
    yAxis: {
      type: "value",
      minInterval: 1,
      splitLine: { lineStyle: { color: c.split } },
      axisLabel: { color: c.axis, fontSize: 12 },
    },
    series: [
      {
        type: "line",
        data: trend.map((d) => d.count),
        smooth: true,
        symbol: "circle",
        symbolSize: 7,
        lineStyle: { width: 2.5 },
        areaStyle: {
          color: {
            type: "linear", x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(59,130,246,0.25)" },
              { offset: 1, color: "rgba(59,130,246,0.02)" },
            ],
          },
        },
      },
    ],
  };
}

/** 单选/下拉：环形饼图（占比构成） */
function buildPieOption(
  q: QuestionStat,
  compact: boolean,
  c: ChartTheme,
): EChartsCoreOption {
  const legendFormatter = (name: string) =>
    name.length > 12 ? `${name.slice(0, 12)}…` : name;
  return {
    color: CHART_COLORS,
    tooltip: {
      ...buildTooltip(c),
      formatter: (p: { name: string; value: number; percent: number }) =>
        `${p.name}<br/>${p.value} 份 · ${p.percent}%`,
    },
    legend: {
      type: "scroll",
      icon: "circle",
      itemWidth: 8,
      itemHeight: 8,
      textStyle: { color: c.legend, fontSize: compact ? 11 : 12 },
      formatter: legendFormatter,
      ...(compact
        ? { orient: "horizontal" as const, bottom: 0, left: "center", itemGap: 10 }
        : { orient: "vertical" as const, right: 4, top: "middle", itemGap: 8 }),
    },
    series: [
      {
        type: "pie",
        avoidLabelOverlap: true,
        radius: compact ? ["42%", "66%"] : ["52%", "74%"],
        center: compact ? ["50%", "44%"] : ["36%", "50%"],
        itemStyle: {
          borderColor: c.sliceBorder,
          borderWidth: 2,
          borderRadius: 4,
        },
        label: { formatter: "{d}%", fontSize: 11, color: c.label },
        emphasis: {
          scaleSize: 6,
          label: { fontWeight: "bold", color: c.emphasis },
        },
        data: (q.options ?? []).map((o) => ({ name: o.label, value: o.count })),
      },
    ],
  };
}

/** 评分题：柱状图（分值天然有序） */
function buildRateOption(q: QuestionStat, c: ChartTheme): EChartsCoreOption {
  const opts = q.options ?? [];
  return {
    color: ["#3b82f6"],
    tooltip: {
      ...buildTooltip(c),
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (ps: { name: string; value: number }[]) =>
        `${ps[0].name}<br/>${ps[0].value} 份`,
    },
    grid: { left: 8, right: 16, top: 20, bottom: 8, containLabel: true },
    xAxis: {
      type: "category",
      data: opts.map((o) => o.label),
      axisLine: { lineStyle: { color: c.line } },
      axisTick: { show: false },
      axisLabel: { color: c.text, fontSize: 12 },
    },
    yAxis: {
      type: "value",
      minInterval: 1,
      splitLine: { lineStyle: { color: c.split } },
      axisLabel: { color: c.axis, fontSize: 12 },
    },
    series: [
      {
        type: "bar",
        data: opts.map((o) => o.count),
        barMaxWidth: 36,
        itemStyle: { borderRadius: [4, 4, 0, 0] },
        label: { show: true, position: "top", color: c.label, fontSize: 11 },
      },
    ],
  };
}

/** 多选：横向条形图（各项独立占比，总和可超 100%） */
const CHECKBOX_BAR_HEIGHT = 26;
const CHECKBOX_BAR_GAP = 12;

function buildCheckboxOption(
  q: QuestionStat,
  c: ChartTheme,
): EChartsCoreOption {
  const opts = q.options ?? [];
  // 横向条形图默认从底部开始渲染，反转使第一项显示在顶部
  const reversed = [...opts].reverse();
  return {
    color: ["#14b8a6"],
    tooltip: {
      ...buildTooltip(c),
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (ps: { dataIndex: number }[]) => {
        const o = reversed[ps[0].dataIndex];
        return `${o.label}<br/>${o.count} 份 · ${o.percentage}%`;
      },
    },
    grid: { left: 8, right: 44, top: 8, bottom: 8, containLabel: true },
    xAxis: {
      type: "value",
      minInterval: 1,
      splitLine: { lineStyle: { color: c.split } },
      axisLabel: { color: c.axis, fontSize: 12 },
    },
    yAxis: {
      type: "category",
      data: reversed.map((o) => o.label),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: c.text,
        fontSize: 12,
        formatter: (v: string) => (v.length > 10 ? `${v.slice(0, 10)}…` : v),
      },
    },
    series: [
      {
        type: "bar",
        data: reversed.map((o) => o.count),
        barWidth: CHECKBOX_BAR_HEIGHT,
        itemStyle: { borderRadius: [0, 4, 4, 0] },
        label: {
          show: true,
          position: "right",
          color: c.label,
          fontSize: 11,
          formatter: (p: { dataIndex: number }) =>
            `${reversed[p.dataIndex].percentage}%`,
        },
      },
    ],
  };
}

/** 按题型渲染对应图表；文本题返回 null 由调用方走文本列表 */
function QuestionChart({ q, c }: { q: QuestionStat; c: ChartTheme }) {
  if (!q.options || q.options.length === 0) return null;

  // 多选（含图片多选）：横向条形图，各项百分比之和可超 100%
  if (q.type === "workCheckbox" || q.type === "workImageCheckbox") {
    const height = Math.max(
      160,
      q.options.length * (CHECKBOX_BAR_HEIGHT + CHECKBOX_BAR_GAP) + 32,
    );
    return <EChart option={buildCheckboxOption(q, c)} height={height} />;
  }
  // 评分类：柱状图（分值天然有序）
  if (
    q.type === "workScale" ||
    q.type === "workRating" ||
    q.type === "workNps" ||
    q.type === "workSatisfaction" ||
    q.type === "workEffort"
  ) {
    return <EChart option={buildRateOption(q, c)} height={220} />;
  }
  // 单选/下拉/图片单选：环形饼图（按容器真实宽度响应式切换图例位置）
  return (
    <EChart
      buildOption={(w) => buildPieOption(q, w < COMPACT_MAX_WIDTH, c)}
      height={220}
    />
  );
}

/** 通用命名计数环形饼图（设备/浏览器/OS 分布用）
 * compact=true（多栏窄容器，如桌面三栏/平板）：图例置底水平排布，饼图居中偏上；
 * compact=false（单栏宽容器，如移动端/横屏）：图例置于右侧，饼图偏左。
 * 布局由 React 依据视口断点决定，随浏览器缩放/旋转实时切换。 */
function buildLabelPieOption(
  data: LabelCount[],
  compact: boolean,
  c: ChartTheme,
): EChartsCoreOption {
  return {
    color: CHART_COLORS,
    tooltip: {
      ...buildTooltip(c),
      formatter: (p: { name: string; value: number; percent: number }) =>
        `${p.name}<br/>${p.value} · ${p.percent}%`,
    },
    legend: {
      type: "scroll",
      icon: "circle",
      itemWidth: 8,
      itemHeight: 8,
      textStyle: { color: c.legend, fontSize: compact ? 11 : 12 },
      ...(compact
        ? { orient: "horizontal" as const, bottom: 0, left: "center", itemGap: 10 }
        : { orient: "vertical" as const, right: 4, top: "middle", itemGap: 8 }),
    },
    series: [
      {
        type: "pie",
        radius: compact ? ["42%", "66%"] : ["48%", "72%"],
        center: compact ? ["50%", "44%"] : ["36%", "50%"],
        itemStyle: {
          borderColor: c.sliceBorder,
          borderWidth: 2,
          borderRadius: 4,
        },
        label: { formatter: "{d}%", fontSize: 11, color: c.label },
        emphasis: {
          scaleSize: 6,
          label: { fontWeight: "bold", color: c.emphasis },
        },
        data: data.map((d) => ({ name: d.label, value: d.count })),
      },
    ],
  };
}

/** 24 小时作答分布：柱状图 */
function buildHourlyOption(
  hourly: HourlyPoint[],
  c: ChartTheme,
): EChartsCoreOption {
  return {
    color: ["#3b82f6"],
    tooltip: {
      ...buildTooltip(c),
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (ps: { name: string; value: number }[]) =>
        `${ps[0].name}<br/>${ps[0].value}`,
    },
    grid: { left: 8, right: 16, top: 20, bottom: 8, containLabel: true },
    xAxis: {
      type: "category",
      data: hourly.map((h) => `${String(h.hour).padStart(2, "0")}:00`),
      axisLine: { lineStyle: { color: c.line } },
      axisTick: { show: false },
      axisLabel: { color: c.axis, fontSize: 11, interval: 2 },
    },
    yAxis: {
      type: "value",
      minInterval: 1,
      splitLine: { lineStyle: { color: c.split } },
      axisLabel: { color: c.axis, fontSize: 12 },
    },
    series: [
      {
        type: "bar",
        data: hourly.map((h) => h.count),
        barMaxWidth: 18,
        itemStyle: { borderRadius: [3, 3, 0, 0] },
      },
    ],
  };
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-card rounded-lg border border-border p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className="size-8 rounded-lg bg-blue-500/15 flex items-center justify-center">
          <Icon className="size-4 text-blue-600 dark:text-blue-300" />
        </div>
      </div>
      <div className="mt-3">
        <span className="text-2xl font-bold text-foreground">{value}</span>
      </div>
    </div>
  );
}

export default function StatsDetailPage() {
  const { t } = useLocale();
  const tRef = useRef(t);
  useEffect(() => {
    tRef.current = t;
  });
  const params = useParams();
  const router = useRouter();
  const workId = Number(params?.id);

  // 图表配色随主题切换；SSR 阶段 resolvedTheme 为 undefined，兜底用亮色
  const { resolvedTheme } = useTheme();
  const chartTheme = CHART_THEME[resolvedTheme === "dark" ? "dark" : "light"];

  const [works, setWorks] = useState<WorkListItem[]>([]);
  const [overview, setOverview] = useState<AnalyseOverview | null>(null);
  const [questions, setQuestions] = useState<QuestionStat[]>([]);
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [trendDays, setTrendDays] = useState<7 | 30>(7);
  const [devices, setDevices] = useState<DeviceStats | null>(null);
  const [hourly, setHourly] = useState<HourlyPoint[]>([]);
  const [loading, setLoading] = useState(true);

  function formatDuration(seconds: number): string {
    if (seconds < 60) return format(t((m) => m.survey.secondUnit), { seconds });
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return format(t((m) => m.survey.minuteSecondUnit), { m, s });
  }

  // 概览 / 题目 / 设备 / 24小时：仅随问卷变化加载一次
  useEffect(() => {
    async function loadData() {
      if (!workId || Number.isNaN(workId)) return;
      setLoading(true);
      try {
        const [workList, ov, qs, dev, hr] = await Promise.all([
          workApi.list(),
          analyseApi.overview(workId),
          analyseApi.questions(workId),
          analyseApi.devices(workId),
          analyseApi.hourly(workId),
        ]);
        setWorks(workList);
        setOverview(ov);
        setQuestions(qs);
        setDevices(dev);
        setHourly(hr);
      } catch {
        toast.error(tRef.current((m) => m.workspace.loadStatsFailedToast));
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [workId]);

  // 趋势：随天数切换单独刷新，避免整页 loading
  useEffect(() => {
    async function loadTrend() {
      if (!workId || Number.isNaN(workId)) return;
      try {
        const tr = await analyseApi.trend(workId, trendDays);
        setTrend(tr);
      } catch {
        // 趋势刷新失败不打断页面，保留旧数据
      }
    }
    loadTrend();
  }, [workId, trendDays]);

  const publishedWorks = works.filter((w) => w.isPublish);

  // 设备类型英文标识 → 本地化文案
  function localizeDevices(list: LabelCount[]): LabelCount[] {
    const map: Record<string, string> = {
      PC: t((m) => m.workspace.devicePC),
      Mobile: t((m) => m.workspace.deviceMobile),
      Tablet: t((m) => m.workspace.deviceTablet),
      Unknown: t((m) => m.workspace.unknownLabel),
    };
    return list.map((d) => ({ ...d, label: map[d.label] ?? d.label }));
  }

  // 浏览器 / OS 中的 Unknown → 本地化，其余原样
  function localizeUnknown(list: LabelCount[]): LabelCount[] {
    return list.map((d) =>
      d.label === "Unknown"
        ? { ...d, label: t((m) => m.workspace.unknownLabel) }
        : d,
    );
  }

  // 题型标识 → 中文标签
  function questionTypeLabel(type: string): string {
    const e = t((m) => m.editor);
    const map: Record<string, string> = {
      workRadio: e.ctWorkRadio,
      workSelect: e.ctWorkSelect,
      workImageRadio: e.ctWorkImageRadio,
      workCheckbox: e.ctWorkCheckbox,
      workImageCheckbox: e.ctWorkImageCheckbox,
      workInput: e.ctWorkInput,
      workTextarea: e.ctWorkTextarea,
      workScale: e.ctWorkScale,
      workRating: e.ctWorkRating,
      workNps: e.ctWorkNps,
      workSatisfaction: e.ctWorkSatisfaction,
      workEffort: e.ctWorkEffort,
    };
    return map[type] ?? type;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between" data-aos="fade-up">
        {/* 返回做成标题上方的一行面包屑文字链接，轻量不抢视觉 */}
        <div className="min-w-0">
          <button
            type="button"
            onClick={() => router.push("/workspace/stats")}
            className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-blue-600 dark:hover:text-blue-300"
          >
            <ArrowLeft className="size-4" />
            {t((m) => m.survey.backToWorkspace)}
          </button>
          <h1 className="text-2xl font-bold text-foreground">{t((m) => m.workspace.statsDetailTitle)}</h1>
          <p className="mt-1 truncate text-sm text-muted-foreground">{overview?.workName ?? t((m) => m.workspace.surveyStatsDefault)}</p>
        </div>
        <Select value={String(workId)} onValueChange={(v) => router.push(`/workspace/stats/${v}`)}>
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue placeholder={t((m) => m.workspace.selectSurveyPlaceholder)} />
          </SelectTrigger>
          <SelectContent>
            {publishedWorks.map((s) => (
              <SelectItem key={s.id} value={String(s.id)}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 概览卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div data-aos="fade-up" data-aos-delay="100">
          <StatCard icon={Users} label={t((m) => m.workspace.totalResponsesCard)} value={String(overview?.total ?? 0)} />
        </div>
        <div data-aos="fade-up" data-aos-delay="130">
          <StatCard icon={CheckCircle2} label={t((m) => m.workspace.todayNewCard)} value={String(overview?.todayCount ?? 0)} />
        </div>
        <div data-aos="fade-up" data-aos-delay="160">
          <StatCard icon={CalendarDays} label={t((m) => m.workspace.weekNewCard)} value={String(overview?.weekCount ?? 0)} />
        </div>
        <div data-aos="fade-up" data-aos-delay="190">
          <StatCard
            icon={TrendingUp}
            label={t((m) => m.workspace.statusCard)}
            value={overview?.isStopped ? t((m) => m.workspace.statusStopped) : overview?.isPublish ? t((m) => m.workspace.statusCollecting) : t((m) => m.workspace.statusUnpublished)}
          />
        </div>
        <div data-aos="fade-up" data-aos-delay="220">
          <StatCard icon={Clock} label={t((m) => m.workspace.avgDurationCard)} value={formatDuration(overview?.avgDuration ?? 0)} />
        </div>
        <div data-aos="fade-up" data-aos-delay="250">
          <StatCard icon={Timer} label={t((m) => m.workspace.medianDurationCard)} value={formatDuration(overview?.medianDuration ?? 0)} />
        </div>
        <div data-aos="fade-up" data-aos-delay="280">
          <StatCard icon={Zap} label={t((m) => m.workspace.fastestDurationCard)} value={formatDuration(overview?.minDuration ?? 0)} />
        </div>
        <div data-aos="fade-up" data-aos-delay="310">
          <StatCard icon={Hourglass} label={t((m) => m.workspace.slowestDurationCard)} value={formatDuration(overview?.maxDuration ?? 0)} />
        </div>
      </div>

      {/* 趋势图 */}
      <div className="mb-6" data-aos="fade-up" data-aos-delay="340">
        <div className="bg-card rounded-lg border border-border p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
            <div>
              <h3 className="text-base font-medium text-foreground">{t((m) => m.workspace.weeklyTrendTitle)}</h3>
              <p className="text-sm text-muted-foreground mt-0.5">{t((m) => m.workspace.weeklyTrendDesc)}</p>
            </div>
            <div className="flex items-center gap-2">
              {/* 7/30 天切换 */}
              <div className="flex rounded-md border border-border overflow-hidden">
                {([7, 30] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setTrendDays(d)}
                    className={`px-3 py-1.5 text-xs transition-colors ${
                      trendDays === d
                        ? "bg-blue-600 text-white"
                        : "bg-card text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {d === 7 ? t((m) => m.workspace.trend7Days) : t((m) => m.workspace.trend30Days)}
                  </button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`/api/answer/export?workId=${workId}`, "_blank")}
              >
                <Download className="size-4" />
                {t((m) => m.workspace.exportBtn)}
              </Button>
            </div>
          </div>
          <EChart option={buildTrendOption(trend, chartTheme)} height={260} />
        </div>
      </div>

      {/* 24 小时作答分布 */}
      {hourly.some((h) => h.count > 0) && (
        <div className="mb-6" data-aos="fade-up" data-aos-delay="360">
          <div className="bg-card rounded-lg border border-border p-5">
            <div className="mb-4">
              <h3 className="text-base font-medium text-foreground">{t((m) => m.workspace.hourlyTitle)}</h3>
              <p className="text-sm text-muted-foreground mt-0.5">{t((m) => m.workspace.hourlyDesc)}</p>
            </div>
            <EChart option={buildHourlyOption(hourly, chartTheme)} height={220} />
          </div>
        </div>
      )}

      {/* 设备与来源分布 */}
      {devices && devices.total > 0 && (
        <div className="mb-6" data-aos="fade-up" data-aos-delay="380">
          <div className="bg-card rounded-lg border border-border p-5">
            <div className="mb-4">
              <h3 className="text-base font-medium text-foreground">{t((m) => m.workspace.deviceTitle)}</h3>
            </div>
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground mb-1 text-center">{t((m) => m.workspace.deviceTypeLegend)}</p>
                <EChart buildOption={(w) => buildLabelPieOption(localizeDevices(devices.devices), w < COMPACT_MAX_WIDTH, chartTheme)} height={240} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground mb-1 text-center">{t((m) => m.workspace.browserLegend)}</p>
                <EChart buildOption={(w) => buildLabelPieOption(localizeUnknown(devices.browsers), w < COMPACT_MAX_WIDTH, chartTheme)} height={240} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground mb-1 text-center">{t((m) => m.workspace.osLegend)}</p>
                <EChart buildOption={(w) => buildLabelPieOption(localizeUnknown(devices.os), w < COMPACT_MAX_WIDTH, chartTheme)} height={240} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 题目作答分布 */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4" data-aos="fade-up" data-aos-delay="350">
          {t((m) => m.workspace.questionDistributionTitle)}
        </h2>
        {questions.length > 0 ? (
          <div className="grid lg:grid-cols-2 gap-4">
            {questions.map((q, i) => (
              <div
                key={q.questionId}
                className="bg-card rounded-lg border border-border p-5 min-w-0"
                data-aos="fade-up"
                data-aos-delay={String(400 + i * 50)}
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="size-6 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-300 text-xs font-medium flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <h4 className="text-sm font-medium text-foreground">{q.title}</h4>
                  <span className="ml-auto text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded">
                    {questionTypeLabel(q.type)}
                  </span>
                </div>

                {q.options && q.options.length > 0 ? (
                  <QuestionChart q={q} c={chartTheme} />
                ) : q.texts && q.texts.length > 0 ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {q.texts.map((t, idx) => (
                      <div key={idx} className="text-sm text-muted-foreground bg-muted rounded px-3 py-2">
                        {t}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">{t((m) => m.workspace.noData)}</div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-card rounded-lg border border-border p-10 text-center text-muted-foreground">
            {t((m) => m.workspace.noAnswerData)}
          </div>
        )}
      </div>
    </div>
  );
}
