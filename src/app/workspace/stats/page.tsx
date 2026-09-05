"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, FileText, Loader2 } from "lucide-react";
import { workApi, analyseApi } from "@/lib/api";
import type { WorkListItem, AnalyseOverview } from "@/lib/api";
import { useLocale } from "@/i18n/useLocale";

export default function StatsPage() {
  const { t } = useLocale();
  const router = useRouter();
  const [works, setWorks] = useState<WorkListItem[]>([]);
  const [overviews, setOverviews] = useState<Record<number, AnalyseOverview>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const list = await workApi.list();
        setWorks(list);
        // 拉取每份已发布问卷的概览数据，让列表卡片带上“真实数据”
        const published = list.filter((w) => w.isPublish);
        const results = await Promise.all(
          published.map((w) =>
            analyseApi
              .overview(w.id)
              .then((o) => [w.id, o] as const)
              .catch(() => null),
          ),
        );
        const map: Record<number, AnalyseOverview> = {};
        for (const r of results) if (r) map[r[0]] = r[1];
        setOverviews(map);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // 状态 → 颜色与点位
  function statusMeta(w: WorkListItem) {
    if (!w.isPublish) {
      return {
        text: t((m) => m.workspace.statusDraft),
        cls: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
        dot: "bg-amber-500",
      };
    }
    if (w.isStopped) {
      return {
        text: t((m) => m.workspace.statusStopped),
        cls: "bg-muted text-muted-foreground",
        dot: "bg-muted-foreground",
      };
    }
    return {
      text: t((m) => m.workspace.statusPublished),
      cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
      dot: "bg-emerald-500",
    };
  }

  return (
    <div>
      <div className="mb-6" data-aos="fade-up">
        <h1 className="text-2xl font-bold text-foreground">{t((m) => m.workspace.statsTitle)}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t((m) => m.workspace.statsDesc)}</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {works.map((w) => {
          const s = statusMeta(w);
          const date = (w.publishedAt ?? w.createdAt)?.slice(0, 10);
          const ov = overviews[w.id];
          return (
            <button
              key={w.id}
              onClick={() => router.push(`/workspace/stats/${w.id}`)}
              className="group flex flex-col rounded-xl border border-border bg-card p-5 text-left transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/10 to-indigo-500/10 ring-1 ring-blue-500/20">
                  <BarChart3 className="size-5 text-blue-600 dark:text-blue-300" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-medium text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
                    {w.name || t((m) => m.workspace.untitledSurvey)}
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">{date}</p>
                </div>
                <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${s.cls}`}>
                  <span className={`size-1.5 rounded-full ${s.dot}`} />
                  {s.text}
                </span>
              </div>

              {/* 数据区：让卡片“有数据”，而非仅名称+状态 */}
              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-3">
                <div>
                  <p className="text-[11px] text-muted-foreground">{t((m) => m.workspace.totalResponsesCard)}</p>
                  <p className="mt-1 text-base font-semibold text-foreground tabular-nums">{(ov?.total ?? 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">{t((m) => m.workspace.todayNewCard)}</p>
                  <p className="mt-1 text-base font-semibold tabular-nums text-emerald-600 dark:text-emerald-300">+{ov?.todayCount ?? 0}</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">{t((m) => m.workspace.weekNewCard)}</p>
                  <p className="mt-1 text-base font-semibold tabular-nums text-violet-600">+{ov?.weekCount ?? 0}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {works.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="size-14 rounded-full bg-muted flex items-center justify-center mb-4">
            <FileText className="size-7 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">{t((m) => m.workspace.noSurveys)}</p>
        </div>
      )}
    </div>
  );
}
