"use client";

/**
 * Footer 末列订阅区（四态）
 *
 * 加载中 → 骨架占位；未登录 → 登录引导；已订阅 → 邮箱快照；未订阅 → 表单。
 *
 * 邮箱取自登录用户（后端 SubscribeDto 只收 email，不从 session 反查）。
 */

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";
import { isLoggedIn } from "@/lib/auth/token";
import { newsletterApi, ApiError } from "@/lib/api";
import { useLocale } from "@/i18n/useLocale";
import type { SubscriptionStatus } from "@/lib/api/modules/newsletter.types";

/** 蜜罐字段名，需与后端 SubscribeDto.companyWebsite 保持一致 */
const HONEYPOT_FIELD = "companyWebsite";

export default function SubscribeBox() {
  const { user, loading: userLoading } = useAuth();
  const [subscription, setSubscription] =
    useState<SubscriptionStatus | null>(null);
  const [subLoading, setSubLoading] = useState(true);
  const { t } = useLocale();

  /** 重新拉取订阅状态：订阅成功后调用，UI 自动切到「已订阅」分支 */
  const refresh = useCallback(async () => {
    try {
      setSubscription(await newsletterApi.status());
    } catch {
      setSubscription(null);
    }
  }, []);

  useEffect(() => {
    // 未登录直接跳过：status 接口要求登录，避免匿名访客每页多打一个 401
    if (!isLoggedIn()) {
      setSubLoading(false);
      return;
    }

    let cancelled = false;
    newsletterApi
      .status()
      .then((data) => {
        if (!cancelled) setSubscription(data);
      })
      .catch(() => {
        if (!cancelled) setSubscription(null);
      })
      .finally(() => {
        if (!cancelled) setSubLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // ── 1. 加载中：骨架占位 ──────────────────────────────────────
  if (userLoading || subLoading) {
    return (
      <div className="h-10 rounded bg-muted animate-pulse" aria-hidden="true" />
    );
  }

  // ── 2. 未登录：登录引导 ───────────────────────────────────────
  if (!user) {
    return (
      <p className="text-sm text-muted-foreground">
        <Link
          href="/signin"
          className="text-primary underline-offset-2 hover:underline transition duration-150 ease-in-out"
        >
          {t((m) => m.subscribe.signInToSubscribe)}
        </Link>
      </p>
    );
  }

  // ── 3. 已登录已订阅：仅展示邮箱快照 ────────────────────────────
  if (subscription?.subscribed) {
    return (
      <p className="text-sm text-muted-foreground">
        <span className="text-foreground font-medium">
          {subscription.email}
        </span>
        {" · "}
        {t((m) => m.subscribe.subscribedHint)}
      </p>
    );
  }

  // ── 4. 已登录未订阅：表单 ─────────────────────────────────────
  return <SubscribeForm email={user.email} onSubscribed={refresh} />;
}

// ─────────────────────────────────────────────────────────────
// 订阅表单（已登录未订阅态）
// ─────────────────────────────────────────────────────────────

interface SubscribeFormProps {
  email: string;
  onSubscribed: () => void | Promise<unknown>;
}

function SubscribeForm({ email, onSubscribed }: SubscribeFormProps) {
  // 蜜罐 state（受控字段；正常用户应保持空字符串）
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { t } = useLocale();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    setErrorMessage(null);
    setSubmitting(true);
    try {
      await newsletterApi.subscribe({ email, companyWebsite });
      // 触发状态重拉；成功后组件切到「已订阅」分支，此处不再复位 submitting
      await onSubscribed();
    } catch (err) {
      setErrorMessage(
        err instanceof ApiError
          ? err.message
          : t((m) => m.subscribe.networkError),
      );
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {errorMessage ? (
        <p role="alert" className="mb-2 text-xs text-destructive">
          {errorMessage}
        </p>
      ) : null}

      <label htmlFor="newsletter" className="sr-only">
        {t((m) => m.subscribe.emailLabel)}
      </label>
      <div className="relative flex items-center max-w-xs">
        <input
          id="newsletter"
          type="email"
          value={email}
          disabled
          readOnly
          aria-label={t((m) => m.subscribe.emailLabel)}
          className="form-input w-full text-foreground px-3 py-2 pr-12 text-sm cursor-not-allowed disabled:opacity-100"
        />
        <button
          type="submit"
          disabled={submitting}
          className="absolute inset-0 left-auto flex items-center justify-center px-3 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={t((m) => m.subscribe.submitAria)}
        >
          <span
            className="absolute inset-0 right-auto w-px -ml-px my-2 bg-border"
            aria-hidden="true"
          />
          {submitting ? (
            <span className="text-xs text-muted-foreground">…</span>
          ) : (
            <svg
              className="w-3 h-3 fill-current text-blue-600 dark:text-blue-300 mx-3 shrink-0"
              viewBox="0 0 12 12"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M11.707 5.293L7 .586 5.586 2l3 3H0v2h8.586l-3 3L7 11.414l4.707-4.707a1 1 0 000-1.414z"
                fillRule="nonzero"
              />
            </svg>
          )}
        </button>
      </div>

      {submitting ? (
        <p className="mt-2 text-xs text-muted-foreground">
          {t((m) => m.subscribe.submitting)}
        </p>
      ) : null}

      {/* 蜜罐字段：视觉隐藏 + tab 跳不到；自动填表脚本通常会无脑填入 */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "-10000px",
          top: "auto",
          width: 1,
          height: 1,
          overflow: "hidden",
        }}
      >
        <label htmlFor={HONEYPOT_FIELD}>Company website (do not fill)</label>
        <input
          id={HONEYPOT_FIELD}
          name={HONEYPOT_FIELD}
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={companyWebsite}
          onChange={(e) => setCompanyWebsite(e.target.value)}
        />
      </div>
    </form>
  );
}
