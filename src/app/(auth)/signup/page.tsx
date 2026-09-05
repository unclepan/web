"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authApi, ApiError } from "@/lib/api";
import { useLocale, format } from "@/i18n/useLocale";
import { useCaptcha, CaptchaCancelledError } from "@/components/AliyunCaptcha";

export default function SignUpPage() {
  const router = useRouter();
  const { t } = useLocale();
  const { triggerCaptcha, loading: captchaLoading } = useCaptcha();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.username) e.username = t((m) => m.authPages.usernameRequired);
    else if (form.username.length < 3 || form.username.length > 20) e.username = t((m) => m.authPages.usernameLength);
    else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) e.username = t((m) => m.authPages.usernameFormat);

    if (!form.email) e.email = t((m) => m.authPages.emailRequired);
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = t((m) => m.authPages.emailFormat);

    if (!form.password) e.password = t((m) => m.authPages.passwordRequired);
    else if (form.password.length < 6 || form.password.length > 30) e.password = t((m) => m.authPages.passwordLength);
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) e.password = t((m) => m.authPages.passwordFormat);

    if (form.confirmPassword !== form.password) e.confirmPassword = t((m) => m.authPages.passwordMismatch);
    if (!form.agree) e.agree = t((m) => m.authPages.mustAgree);

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

      // 2. 注册
      await authApi.register({
        username: form.username,
        email: form.email,
        password: form.password,
        agree: form.agree,
        captchaVerifyParam,
      });
      setSuccess(true);
    } catch (err) {
      if (err instanceof CaptchaCancelledError) return;
      const msg = err instanceof ApiError ? err.message : t((m) => m.authPages.signupFailed);
      setErrors({ submit: msg });
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
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
              <h1 className="h2 mb-4 text-foreground">{t((m) => m.authPages.signupSuccess)}</h1>
              <p className="text-muted-foreground mb-8">
                {format(t((m) => m.authPages.activationEmailSent), { email: form.email })}
              </p>
              <button
                onClick={() => router.push("/signin")}
                className="btn text-white bg-blue-600 hover:bg-blue-700 w-full"
              >
                {t((m) => m.authPages.goSignInBtn)}
              </button>
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
            <h1 className="h1 mb-4">{t((m) => m.authPages.createAccountTitle)}</h1>
            <p className="text-muted-foreground">{t((m) => m.authPages.signupSubtitle)}</p>
          </div>

          <div className="max-w-sm mx-auto">
            <div className="flex flex-wrap -mx-3 mb-4">
              <div className="w-full px-3">
                <label className="block text-foreground text-sm font-medium mb-1" htmlFor="username">{t((m) => m.authPages.usernameLabel)} <span className="text-red-600 dark:text-red-300">*</span></label>
                <input
                  id="username"
                  type="text"
                  className="form-input w-full text-foreground"
                  placeholder={t((m) => m.authPages.usernamePlaceholderSignup)}
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                />
                {errors.username && <p className="text-red-600 dark:text-red-300 text-sm mt-1">{errors.username}</p>}
              </div>
            </div>

            <div className="flex flex-wrap -mx-3 mb-4">
              <div className="w-full px-3">
                <label className="block text-foreground text-sm font-medium mb-1" htmlFor="email">{t((m) => m.authPages.emailLabel)} <span className="text-red-600 dark:text-red-300">*</span></label>
                <input
                  id="email"
                  type="email"
                  className="form-input w-full text-foreground"
                  placeholder="Enter your email address"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                {errors.email && <p className="text-red-600 dark:text-red-300 text-sm mt-1">{errors.email}</p>}
              </div>
            </div>

            <div className="flex flex-wrap -mx-3 mb-4">
              <div className="w-full px-3">
                <label className="block text-foreground text-sm font-medium mb-1" htmlFor="password">{t((m) => m.authPages.passwordLabel)} <span className="text-red-600 dark:text-red-300">*</span></label>
                <input
                  id="password"
                  type="password"
                  className="form-input w-full text-foreground"
                  placeholder={t((m) => m.authPages.passwordPlaceholderSignup)}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                {errors.password && <p className="text-red-600 dark:text-red-300 text-sm mt-1">{errors.password}</p>}
              </div>
            </div>

            <div className="flex flex-wrap -mx-3 mb-4">
              <div className="w-full px-3">
                <label className="block text-foreground text-sm font-medium mb-1" htmlFor="confirmPassword">{t((m) => m.authPages.confirmPasswordLabel)} <span className="text-red-600 dark:text-red-300">*</span></label>
                <input
                  id="confirmPassword"
                  type="password"
                  className="form-input w-full text-foreground"
                  placeholder={t((m) => m.authPages.confirmPasswordPlaceholder)}
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                />
                {errors.confirmPassword && <p className="text-red-600 dark:text-red-300 text-sm mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>

            <div className="text-sm text-muted-foreground mb-4">
              <label className="flex items-start mb-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="form-checkbox mt-0.5"
                  checked={form.agree}
                  onChange={(e) => setForm({ ...form, agree: e.target.checked })}
                />
                <span className="ml-2">
                  {t((m) => m.authPages.agreePrefix)} <a className="underline text-blue-600 dark:text-blue-300" href="#0">{t((m) => m.authPages.termsLink)}</a> {t((m) => m.authPages.and)}{" "}
                  <a className="underline text-blue-600 dark:text-blue-300" href="#0">{t((m) => m.authPages.privacyLink)}</a>
                </span>
              </label>
              {errors.agree && <p className="text-red-600 dark:text-red-300 text-sm">{errors.agree}</p>}
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
                  {captchaLoading ? t((m) => m.authPages.loadingBtn) : submitting ? t((m) => m.authPages.submittingBtn) : t((m) => m.authPages.signUpBtn)}
                </button>
              </div>
            </div>

            <div className="mt-2 text-center text-xs text-muted-foreground">
              {t((m) => m.authPages.captchaHint)}
            </div>

            <div className="text-muted-foreground text-center mt-6">
              {t((m) => m.authPages.haveAccountPrefix)}{" "}
              <Link className="text-blue-600 dark:text-blue-300 hover:underline transition duration-150 ease-in-out" href="/signin">{t((m) => m.authPages.signInLink)}</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
