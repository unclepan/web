"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authApi, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth/AuthContext";
import { useLocale } from "@/i18n/useLocale";
import { useCaptcha, CaptchaCancelledError } from "@/components/AliyunCaptcha";

export default function SignInPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const { t } = useLocale();
  const { triggerCaptcha, loading: captchaLoading } = useCaptcha();

  const [form, setForm] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.username) e.username = t((m) => m.authPages.usernameRequired);
    if (!form.password) e.password = t((m) => m.authPages.passwordRequired);
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setErrors({});

    try {
      // 1. 滑块验证码（与提交按钮合一，无需单独的"点击验证"按钮）
      const { captchaVerifyParam } = await triggerCaptcha();

      // 2. 登录（Route Handler 自动通过 Set-Cookie 写入双 Token cookie）
      const result = await authApi.login({
        ...form,
        captchaVerifyParam,
      });
      // token 已由 Route Handler 设置到 cookie，无需手动 setToken
      setUser(result.user);
      // 注意：不要在这里再调 fire-and-forget 的 refreshUser()。
      // refreshUser 内部 `if (!isLoggedIn()) setUser(null)` 会在
      // 登录路由的 Set-Cookie 尚未落地 / 刷新接口抖动时，把刚登录成功的
      // user 直接置空，导致「登录后工作台链接不显示、头像变回登录按钮」。
      // 登录响应已含权威 user，刷新用户交给 AuthProvider 挂载时的 effect（仅 reload 时）。
      const callbackUrl = new URLSearchParams(window.location.search).get("callbackUrl");
      router.push(callbackUrl || "/");
    } catch (err) {
      if (err instanceof CaptchaCancelledError) return;
      const msg = err instanceof ApiError ? err.message : t((m) => m.authPages.loginFailed);
      setErrors({ submit: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-gradient-to-b from-muted to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="pt-32 pb-12 md:pt-40 md:pb-20">
          <div className="max-w-3xl mx-auto text-center pb-12 md:pb-20">
            <h1 className="h1 mb-4">{t((m) => m.authPages.welcomeBack)}</h1>
            <p className="text-muted-foreground">{t((m) => m.authPages.signinSubtitle)}</p>
          </div>

          <div className="max-w-sm mx-auto">
            <div className="flex flex-wrap -mx-3 mb-4">
              <div className="w-full px-3">
                <label className="block text-foreground text-sm font-medium mb-1" htmlFor="username">{t((m) => m.authPages.usernameLabel)}</label>
                <input
                  id="username"
                  type="text"
                  className="form-input w-full text-foreground"
                  placeholder={t((m) => m.authPages.usernamePlaceholder)}
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                />
                {errors.username && <p className="text-red-600 dark:text-red-300 text-sm mt-1">{errors.username}</p>}
              </div>
            </div>

            <div className="flex flex-wrap -mx-3 mb-4">
              <div className="w-full px-3">
                <div className="flex justify-between">
                  <label className="block text-foreground text-sm font-medium mb-1" htmlFor="password">{t((m) => m.authPages.passwordLabel)}</label>
                  <Link className="text-sm font-medium text-blue-600 dark:text-blue-300 hover:underline" href="/forgot-password">{t((m) => m.authPages.forgotPasswordLink)}</Link>
                </div>
                <input
                  id="password"
                  type="password"
                  className="form-input w-full text-foreground"
                  placeholder={t((m) => m.authPages.passwordPlaceholder)}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                />
                {errors.password && <p className="text-red-600 dark:text-red-300 text-sm mt-1">{errors.password}</p>}
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
                  {captchaLoading ? t((m) => m.authPages.loadingBtn) : submitting ? t((m) => m.authPages.signingInBtn) : t((m) => m.authPages.signInBtn)}
                </button>
              </div>
            </div>

            <div className="mt-2 text-center text-xs text-muted-foreground">
              {t((m) => m.authPages.captchaHint)}
            </div>

            <div className="text-muted-foreground text-center mt-6">
              {t((m) => m.authPages.noAccountPrefix)}{" "}
              <Link className="text-blue-600 dark:text-blue-300 hover:underline transition duration-150 ease-in-out" href="/signup">{t((m) => m.authPages.signUpLink)}</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
