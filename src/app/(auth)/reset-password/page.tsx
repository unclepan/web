"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { authApi, ApiError } from "@/lib/api";
import { useLocale } from "@/i18n/useLocale";

function ResetPasswordContent() {
  const { t } = useLocale();
  const tRef = useRef(t);
  useEffect(() => {
    tRef.current = t;
  });
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [verifyStatus, setVerifyStatus] = useState<"loading" | "success" | "error">(
    () => (!token || !email ? "error" : "loading"),
  );
  const [errorMsg, setErrorMsg] = useState(() =>
    !token || !email ? t((m) => m.authPages.invalidLinkMissingParams) : "",
  );
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  // 如果有 token+email，说明是从邮件链接跳转来的，需要先校验 token
  useEffect(() => {
    if (!token || !email) return;

    authApi
      .verifyResetToken(token, email)
      .then(() => setVerifyStatus("success"))
      .catch((err) => {
        setVerifyStatus("error");
        setErrorMsg(err instanceof ApiError ? err.message : tRef.current((m) => m.authPages.invalidLinkExpired));
      });
  }, [token, email]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!newPassword) e.newPassword = t((m) => m.authPages.passwordRequired);
    else if (newPassword.length < 6 || newPassword.length > 30) e.newPassword = t((m) => m.authPages.passwordLength);
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) e.newPassword = t((m) => m.authPages.passwordFormat);
    if (confirmPassword !== newPassword) e.confirmPassword = t((m) => m.authPages.passwordMismatch);
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !token || !email) return;
    setSubmitting(true);
    try {
      await authApi.resetPassword({ token, email, newPassword });
      setDone(true);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : t((m) => m.authPages.resetFailed);
      setErrors({ submit: msg });
    } finally {
      setSubmitting(false);
    }
  };

  // 无 token 参数：引导到忘记密码页
  if (!token || !email) {
    return (
      <section className="bg-gradient-to-b from-muted to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="pt-32 pb-12 md:pt-40 md:pb-20">
            <div className="max-w-sm mx-auto text-center">
              <h1 className="h2 mb-4 text-foreground">{t((m) => m.authPages.resetPasswordTitle)}</h1>
              <p className="text-muted-foreground mb-8">{t((m) => m.authPages.resetPasswordNoLinkDesc)}</p>
              <Link
                href="/forgot-password"
                className="btn text-white bg-blue-600 hover:bg-blue-700 w-full inline-block text-center"
              >
                {t((m) => m.authPages.goForgotPasswordBtn)}
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (done) {
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
              <h1 className="h2 mb-4 text-foreground">{t((m) => m.authPages.resetSuccessTitle)}</h1>
              <p className="text-muted-foreground mb-8">{t((m) => m.authPages.resetSuccessDesc)}</p>
              <Link
                href="/signin"
                className="btn text-white bg-blue-600 hover:bg-blue-700 w-full inline-block text-center"
              >
                {t((m) => m.authPages.goSignInBtn)}
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (verifyStatus === "loading") {
    return (
      <section className="bg-gradient-to-b from-muted to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="pt-32 pb-12 md:pt-40 md:pb-20">
            <div className="max-w-sm mx-auto text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-300 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
              <h1 className="h2 mb-4 text-foreground">{t((m) => m.authPages.verifyingTitle)}</h1>
              <p className="text-muted-foreground">{t((m) => m.authPages.verifyingDesc)}</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (verifyStatus === "error") {
    return (
      <section className="bg-gradient-to-b from-muted to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="pt-32 pb-12 md:pt-40 md:pb-20">
            <div className="max-w-sm mx-auto text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600 dark:text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="h2 mb-4 text-foreground">{t((m) => m.authPages.invalidLinkTitle)}</h1>
              <p className="text-muted-foreground mb-8">{errorMsg || t((m) => m.authPages.invalidLinkDesc)}</p>
              <Link
                href="/forgot-password"
                className="btn text-white bg-blue-600 hover:bg-blue-700 w-full inline-block text-center"
              >
                {t((m) => m.authPages.reapplyResetBtn)}
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // verifyStatus === "success": 展示新密码输入框
  return (
    <section className="bg-gradient-to-b from-muted to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="pt-32 pb-12 md:pt-40 md:pb-20">
          <div className="max-w-3xl mx-auto text-center pb-12 md:pb-20">
            <h1 className="h1 mb-4">{t((m) => m.authPages.setNewPasswordTitle)}</h1>
            <p className="text-muted-foreground">{t((m) => m.authPages.setNewPasswordDesc)}</p>
          </div>

          <div className="max-w-sm mx-auto">
            <div className="flex flex-wrap -mx-3 mb-4">
              <div className="w-full px-3">
                <label className="block text-foreground text-sm font-medium mb-1" htmlFor="newPassword">{t((m) => m.authPages.newPasswordLabel)} <span className="text-red-600 dark:text-red-300">*</span></label>
                <input
                  id="newPassword"
                  type="password"
                  className="form-input w-full text-foreground"
                  placeholder={t((m) => m.authPages.passwordPlaceholderSignup)}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                {errors.newPassword && <p className="text-red-600 dark:text-red-300 text-sm mt-1">{errors.newPassword}</p>}
              </div>
            </div>

            <div className="flex flex-wrap -mx-3 mb-4">
              <div className="w-full px-3">
                <label className="block text-foreground text-sm font-medium mb-1" htmlFor="confirmPassword">{t((m) => m.authPages.confirmNewPasswordLabel)} <span className="text-red-600 dark:text-red-300">*</span></label>
                <input
                  id="confirmPassword"
                  type="password"
                  className="form-input w-full text-foreground"
                  placeholder={t((m) => m.authPages.confirmNewPasswordPlaceholder)}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {errors.confirmPassword && <p className="text-red-600 dark:text-red-300 text-sm mt-1">{errors.confirmPassword}</p>}
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
                  disabled={submitting}
                >
                  {submitting ? t((m) => m.authPages.submittingBtn) : t((m) => m.authPages.resetPasswordBtn)}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}
