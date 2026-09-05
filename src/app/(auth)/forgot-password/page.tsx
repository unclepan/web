"use client";

import { useState } from "react";
import Link from "next/link";
import { authApi, ApiError } from "@/lib/api";
import { useLocale, format } from "@/i18n/useLocale";
import { useCaptcha, CaptchaCancelledError } from "@/components/AliyunCaptcha";

export default function ForgotPasswordPage() {
  const { t } = useLocale();
  const { triggerCaptcha, loading: captchaLoading } = useCaptcha();

  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!email) e.email = t((m) => m.authPages.emailRequired);
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = t((m) => m.authPages.emailFormat);
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setErrors({});

    try {
      // 1. 滑块验证码
      const { captchaVerifyParam } = await triggerCaptcha();

      // 2. 发重置邮件
      await authApi.forgotPassword({
        email,
        captchaVerifyParam,
      });
      setSent(true);
    } catch (err) {
      if (err instanceof CaptchaCancelledError) return;
      const msg = err instanceof ApiError ? err.message : t((m) => m.authPages.sendFailed);
      setErrors({ submit: msg });
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <section className="bg-gradient-to-b from-muted to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="pt-32 pb-12 md:pt-40 md:pb-20">
            <div className="max-w-sm mx-auto text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="h2 mb-4 text-foreground">{t((m) => m.authPages.emailSentTitle)}</h1>
              <p className="text-muted-foreground mb-8">
                {format(t((m) => m.authPages.emailSentDesc), { email })}
              </p>
              <Link
                href="/signin"
                className="btn text-white bg-blue-600 hover:bg-blue-700 w-full inline-block text-center"
              >
                {t((m) => m.authPages.backToSignInBtn)}
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gradient-to-b from-muted to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="pt-32 pb-12 md:pt-40 md:pb-20">
          <div className="max-w-3xl mx-auto text-center pb-12 md:pb-20">
            <h1 className="h1 mb-4">{t((m) => m.authPages.forgotPasswordTitle)}</h1>
            <p className="text-xl text-muted-foreground">
              {t((m) => m.authPages.forgotPasswordDesc)}
            </p>
          </div>

          <div className="max-w-sm mx-auto">
            <div className="flex flex-wrap -mx-3 mb-4">
              <div className="w-full px-3">
                <label className="block text-foreground text-sm font-medium mb-1" htmlFor="email">
                  {t((m) => m.authPages.emailLabel)} <span className="text-red-600 dark:text-red-300">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  className="form-input w-full text-foreground"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {errors.email && <p className="text-red-600 dark:text-red-300 text-sm mt-1">{errors.email}</p>}
              </div>
            </div>

            {errors.submit && (
              <div className="mb-4 p-3 rounded bg-red-500/15 text-red-700 dark:text-red-300 text-sm">{errors.submit}</div>
            )}

            <div className="flex flex-wrap -mx-3 mt-6">
              <div className="w-full px-3">
                <button
                  className="btn text-white bg-blue-600 hover:bg-blue-700 w-full disabled:opacity-50"
                  onClick={handleSubmit}
                  disabled={submitting || captchaLoading}
                >
                  {captchaLoading ? t((m) => m.authPages.loadingBtn) : submitting ? t((m) => m.authPages.sendingBtn) : t((m) => m.authPages.sendResetLinkBtn)}
                </button>
              </div>
            </div>

            <div className="mt-2 text-center text-xs text-muted-foreground">
              {t((m) => m.authPages.captchaHint)}
            </div>

            <div className="text-muted-foreground text-center mt-6">
              {t((m) => m.authPages.rememberPasswordPrefix)}{" "}
              <Link className="text-blue-600 dark:text-blue-300 hover:underline transition duration-150 ease-in-out" href="/signin">{t((m) => m.authPages.backToSignInBtn)}</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
