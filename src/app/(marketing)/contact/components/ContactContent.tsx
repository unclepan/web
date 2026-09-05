"use client";

/**
 * Contact 页面主体 — 渲染在 marketing layout 内
 * （Header / main / Footer 由 layout 提供）。
 *
 * 表单沿用 docs 的原始样式（slate / blue 硬编码色），不走 shadcn。
 *
 * 反滥用靠蜜罐字段 `companyWebsite`：视觉隐藏 + tab 不可达，
 * 自动填表脚本通常会无脑填入。命中时后端返回同形状的假成功，
 * 前端按正常成功处理，机器人无法从响应体分辨。
 */

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { format, useLocale } from "@/i18n/useLocale";
import { contactApi, ApiError } from "@/lib/api";

/** 与后端 CreateContactDto 的长度上限保持一致 */
const FIELD_LIMITS = {
  firstName: 50,
  lastName: 50,
  email: 254,
  subject: 200,
  message: 5000,
} as const;

/** 蜜罐字段名，需与后端 CreateContactDto.companyWebsite 保持一致 */
const HONEYPOT_FIELD = "companyWebsite";

/** 表单控件统一外观（与 docs 保持一致） */
const INPUT_CLASS =
  "w-full text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

export default function ContactContent() {
  const { t } = useLocale();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [country, setCountry] = useState("");
  const [message, setMessage] = useState("");
  // 蜜罐 state（只为 controlled input 存在；真实用户应保持空值）
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  /**
   * 国家选项：value 用统一英文 token（保持服务端兼容、不随语言变），
   * label 走 i18n 翻译。
   */
  const countryOptions = useMemo(
    () => [
      { value: "United States", label: t((m) => m.contactPage.countryUS) },
      { value: "United Kingdom", label: t((m) => m.contactPage.countryUK) },
      { value: "Germany", label: t((m) => m.contactPage.countryDE) },
      { value: "France", label: t((m) => m.contactPage.countryFR) },
      { value: "Japan", label: t((m) => m.contactPage.countryJP) },
      { value: "China", label: t((m) => m.contactPage.countryCN) },
      { value: "Other", label: t((m) => m.contactPage.countryOther) },
    ],
    [t],
  );

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    setErrorMessage(null);

    // 客户端最小校验
    if (!firstName.trim() || !lastName.trim()) {
      setErrorMessage(t((m) => m.contactPage.errorEnterName));
      return;
    }
    if (!email.trim()) {
      setErrorMessage(t((m) => m.contactPage.errorEnterEmail));
      return;
    }
    if (!subject.trim()) {
      setErrorMessage(t((m) => m.contactPage.errorEnterSubject));
      return;
    }
    if (message.length > FIELD_LIMITS.message) {
      setErrorMessage(
        format(t((m) => m.contactPage.errorMessageTooLong), {
          n: FIELD_LIMITS.message,
        }),
      );
      return;
    }

    setSubmitting(true);
    try {
      await contactApi.submit({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        subject: subject.trim(),
        country: country.trim() || null,
        message: message.trim() || null,
        companyWebsite, // 蜜罐字段透传；正常情况下为空字符串
      });

      // 成功（含蜜罐静默成功）：清空表单 + 显示成功态
      setFirstName("");
      setLastName("");
      setEmail("");
      setSubject("");
      setCountry("");
      setMessage("");
      setCompanyWebsite("");
      setSuccess(true);
    } catch (err) {
      if (err instanceof ApiError && err.code === 429) {
        setErrorMessage(t((m) => m.contactPage.errorTooFrequent));
      } else if (err instanceof ApiError && err.message) {
        // 服务端字段级文案：原样透传（多为开发期场景）
        setErrorMessage(err.message);
      } else {
        setErrorMessage(t((m) => m.contactPage.errorNetwork));
      }
    } finally {
      setSubmitting(false);
    }
  };

  // 成功态：替换整个表单
  if (success) {
    return (
      <section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="pt-32 pb-12 md:pt-40 md:pb-20">
            <div className="max-w-xl mx-auto">
              <div role="status" className="py-12 text-center">
                <svg
                  className="w-10 h-10 mx-auto mb-3 text-blue-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <path d="m9 11 3 3L22 4" />
                </svg>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  {t((m) => m.contactPage.successTitle)}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {t((m) => m.contactPage.successDesc)}{" "}
                  <button
                    type="button"
                    onClick={() => setSuccess(false)}
                    className="text-blue-600 hover:underline"
                  >
                    {t((m) => m.contactPage.sendAnother)}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="pt-32 pb-12 md:pt-40 md:pb-20">
          <div className="max-w-3xl mx-auto text-center pb-12 md:pb-16">
            <h1 className="h1">{t((m) => m.contactPage.pageTitle)}</h1>
          </div>

          <div className="max-w-xl mx-auto">
            {errorMessage ? (
              <div
                role="alert"
                className="mb-4 px-4 py-3 rounded bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-900 text-sm text-rose-700 dark:text-rose-300"
              >
                {errorMessage}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} noValidate>
              {/* 蜜罐：视觉隐藏 + 键盘 tab 跳不到；自动填表脚本通常会填 */}
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
                <label htmlFor={HONEYPOT_FIELD}>
                  {t((m) => m.contactPage.honeypotLabel)}
                </label>
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

              {/* 第一行：First Name + Last Name 同行 */}
              <div className="flex flex-wrap -mx-3 mb-4">
                <div className="w-full md:w-1/2 px-3 mb-4 md:mb-0">
                  <label
                    htmlFor="firstName"
                    className="block text-slate-800 dark:text-slate-200 text-sm font-medium mb-1"
                  >
                    {t((m) => m.contactPage.firstNameLabel)}{" "}
                    <span className="text-rose-600">*</span>
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    autoComplete="given-name"
                    required
                    maxLength={FIELD_LIMITS.firstName}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={INPUT_CLASS}
                    placeholder={t((m) => m.contactPage.firstNamePlaceholder)}
                  />
                </div>
                <div className="w-full md:w-1/2 px-3">
                  <label
                    htmlFor="lastName"
                    className="block text-slate-800 dark:text-slate-200 text-sm font-medium mb-1"
                  >
                    {t((m) => m.contactPage.lastNameLabel)}{" "}
                    <span className="text-rose-600">*</span>
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    autoComplete="family-name"
                    required
                    maxLength={FIELD_LIMITS.lastName}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={INPUT_CLASS}
                    placeholder={t((m) => m.contactPage.lastNamePlaceholder)}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-slate-800 dark:text-slate-200 text-sm font-medium mb-1"
                >
                  {t((m) => m.contactPage.emailLabel)}{" "}
                  <span className="text-rose-600">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={FIELD_LIMITS.email}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={INPUT_CLASS}
                  placeholder={t((m) => m.contactPage.emailPlaceholder)}
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="subject"
                  className="block text-slate-800 dark:text-slate-200 text-sm font-medium mb-1"
                >
                  {t((m) => m.contactPage.subjectLabel)}{" "}
                  <span className="text-rose-600">*</span>
                </label>
                <input
                  id="subject"
                  type="text"
                  required
                  maxLength={FIELD_LIMITS.subject}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className={INPUT_CLASS}
                  placeholder={t((m) => m.contactPage.subjectPlaceholder)}
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="country"
                  className="block text-slate-800 dark:text-slate-200 text-sm font-medium mb-1"
                >
                  {t((m) => m.contactPage.countryLabel)}
                </label>
                <select
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className={INPUT_CLASS}
                >
                  <option value="">
                    {t((m) => m.contactPage.countrySelectPlaceholder)}
                  </option>
                  {countryOptions.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="message"
                  className="block text-slate-800 dark:text-slate-200 text-sm font-medium mb-1"
                >
                  {t((m) => m.contactPage.messageLabel)}
                </label>
                <textarea
                  id="message"
                  rows={4}
                  maxLength={FIELD_LIMITS.message}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className={INPUT_CLASS}
                  placeholder={t((m) => m.contactPage.messagePlaceholder)}
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 text-right">
                  {message.length} / {FIELD_LIMITS.message}
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center font-medium text-sm px-4 py-2 rounded text-white bg-blue-600 hover:bg-blue-700 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {submitting
                  ? t((m) => m.contactPage.submitting)
                  : t((m) => m.contactPage.submitButton)}
              </button>

              <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">
                {t((m) => m.contactPage.consentBefore)}{" "}
                <Link
                  href="/terms"
                  className="underline hover:text-slate-700 dark:hover:text-slate-300"
                >
                  {t((m) => m.contactPage.consentTerms)}
                </Link>{" "}
                {t((m) => m.contactPage.consentMiddle)}{" "}
                <Link
                  href="/privacy"
                  className="underline hover:text-slate-700 dark:hover:text-slate-300"
                >
                  {t((m) => m.contactPage.consentPrivacy)}
                </Link>
                {t((m) => m.contactPage.consentAfter)}
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
