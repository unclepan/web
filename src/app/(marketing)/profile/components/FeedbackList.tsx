"use client";

/**
 * FeedbackList —— 个人中心「我的动态」右列
 *
 * 数据来自 `docsApi.myFeedbacks`（`GET /docs/feedback/mine`）：当前用户对
 * DOCUMENTATION / DESIGN 两类文章的**全部**表态，按表态时间倒序。
 *
 * 两个约定：
 *   1. `locale` 参与请求 —— 后端按站点语言过滤文章，列表里就不会出现
 *      点进去会因语言不匹配而 404 的条目；`ready` 落定前不发请求
 *      （同 `BlogDetailContent`），免得中文站先用默认 en 白拉一轮。
 *   2. 情绪图标 / 文案的映射复用 `Feedback` 导出的 `FEEDBACK_META`，
 *      不在这里另写一份。
 */
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { RotateCw, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { FEEDBACK_META } from "@/components/Feedback";
import { docsApi } from "@/lib/api";
import type { DocsMyFeedbackItem, FeedbackKind } from "@/lib/api";
import { blogDetailPath, docsDetailPath } from "@/lib/routes";
import { formatDateTime } from "@/lib/format-date";
import { useLocale, format } from "@/i18n/useLocale";

/** 单页条数（后端 DTO 上限 50） */
const PAGE_SIZE = 20;

/** 无封面时的兜底渐变，按下标循环 */
const FALLBACK_OVERLAYS = [
  "bg-teal-500",
  "bg-purple-500",
  "bg-amber-500",
  "bg-rose-500",
] as const;

/** kind → 图标 / 文案；后端若新增档位，回落到第一档而不是渲染不出来 */
function metaOf(kind: FeedbackKind) {
  return FEEDBACK_META.find((m) => m.kind === kind) ?? FEEDBACK_META[0];
}

export default function FeedbackList() {
  const { t, locale, ready } = useLocale();

  const [items, setItems] = useState<DocsMyFeedbackItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  /** 自增触发重试 */
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    setLoading(true);
    setFailed(false);
    docsApi
      .myFeedbacks(locale, PAGE_SIZE, 0)
      .then((res) => {
        if (cancelled) return;
        setItems(res.items ?? []);
        setTotal(res.total ?? 0);
      })
      .catch((err) => {
        console.error("[FeedbackList] 加载失败:", err);
        if (!cancelled) setFailed(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [locale, ready, reloadKey]);

  return (
    // h-full + flex-col：卡片撑满栅格行高（= 左列 ProfileUserCard 的高度），
    // 空态/失败态再用 flex-1 居中，避免没数据时右列比左列矮一截
    <div className="bg-card rounded-lg border border-border p-6 flex flex-col h-full">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-foreground">
          {t((m) => m.profile.activityTitle)}
        </h2>
        {!loading && !failed && total > 0 && (
          <span className="text-xs text-muted-foreground">
            {format(t((m) => m.profile.feedbacksCount), { count: total })}
          </span>
        )}
      </div>

      {loading && (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="size-14 shrink-0 rounded-md" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && failed && (
        <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
          <p className="text-sm text-muted-foreground">
            {t((m) => m.profile.feedbacksLoadFailed)}
          </p>
          <button
            type="button"
            onClick={() => setReloadKey((k) => k + 1)}
            className="mt-4 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <RotateCw className="size-3.5" />
            {t((m) => m.profile.retry)}
          </button>
        </div>
      )}

      {!loading && !failed && items.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
          <div className="size-14 rounded-full bg-muted flex items-center justify-center mb-4">
            <Sparkles className="size-7 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">
            {t((m) => m.profile.activityTodoTitle)}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {t((m) => m.profile.activityTodoDesc)}
          </p>
        </div>
      )}

      {!loading && !failed && items.length > 0 && (
        <ul className="divide-y divide-border">
          {items.map((item, idx) => {
            const meta = metaOf(item.kind);
            const kindLabel = t((m) => m.blog[meta.labelKey]);
            // DESIGN 走博客详情，DOCUMENTATION 走文档详情
            const href =
              item.type === "DESIGN"
                ? blogDetailPath(item.articleUuid)
                : docsDetailPath(item.articleUuid);
            // 中英双名：中文站 name 优先，英文站 englishName 优先
            const category =
              locale === "zh-CN"
                ? item.categoryName || item.categoryEnglishName
                : item.categoryEnglishName || item.categoryName;

            return (
              <li
                key={item.articleUuid}
                className="flex items-center gap-4 py-3 first:pt-0 last:pb-0"
              >
                <div
                  className={`relative size-14 shrink-0 overflow-hidden rounded-md ${
                    item.coverImage
                      ? "bg-muted"
                      : FALLBACK_OVERLAYS[idx % FALLBACK_OVERLAYS.length]
                  }`}
                >
                  {item.coverImage ? (
                    <Image
                      src={item.coverImage}
                      alt=""
                      fill
                      sizes="56px"
                      className="object-cover"
                      unoptimized
                    />
                  ) : null}
                </div>

                <div className="min-w-0 flex-1">
                  <Link
                    href={href}
                    className="block truncate text-sm font-medium text-foreground hover:text-primary"
                  >
                    {item.title}
                  </Link>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                    <span className="rounded bg-muted px-1.5 py-0.5">
                      {item.type === "DESIGN"
                        ? t((m) => m.profile.typeBlog)
                        : t((m) => m.profile.typeDocs)}
                    </span>
                    {category ? (
                      <span className="max-w-[12rem] truncate">{category}</span>
                    ) : null}
                    <span>{formatDateTime(item.updatedAt, locale)}</span>
                  </div>
                </div>

                <div
                  className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground"
                  title={kindLabel}
                >
                  <Image
                    src={meta.src}
                    width={18}
                    height={18}
                    alt={kindLabel}
                    unoptimized
                  />
                  <span className="hidden sm:inline">{kindLabel}</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
