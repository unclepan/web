"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { authApi, ApiError } from "@/lib/api";
import { useLocale } from "@/i18n/useLocale";

function ActivateContent() {
  const { t } = useLocale();
  const tRef = useRef(t);
  useEffect(() => {
    tRef.current = t;
  });
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    () => (!token || !email ? "error" : "loading"),
  );
  const [message, setMessage] = useState(() =>
    !token || !email ? t((m) => m.authPages.invalidLinkMissingParams) : "",
  );

  useEffect(() => {
    if (!token || !email) return;

    authApi
      .activate(token, email)
      .then(() => {
        setStatus("success");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err instanceof ApiError ? err.message : tRef.current((m) => m.authPages.activateFailed));
      });
  }, [token, email]);

  return (
    <section className="bg-gradient-to-b from-muted to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="pt-32 pb-12 md:pt-40 md:pb-20">
          <div className="max-w-sm mx-auto text-center">
            {status === "loading" && (
              <>
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-600 dark:text-blue-300 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </div>
                <h1 className="h2 mb-4 text-foreground">{t((m) => m.authPages.activatingTitle)}</h1>
                <p className="text-muted-foreground">{t((m) => m.authPages.activatingDesc)}</p>
              </>
            )}

            {status === "success" && (
              <>
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h1 className="h2 mb-4 text-foreground">{t((m) => m.authPages.activateSuccessTitle)}</h1>
                <p className="text-muted-foreground mb-8">{t((m) => m.authPages.activateSuccessDesc)}</p>
                <Link
                  href="/signin"
                  className="btn text-white bg-blue-600 hover:bg-blue-700 w-full inline-block text-center"
                >
                  {t((m) => m.authPages.goSignInBtn)}
                </Link>
              </>
            )}

            {status === "error" && (
              <>
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-600 dark:text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h1 className="h2 mb-4 text-foreground">{t((m) => m.authPages.activateFailedTitle)}</h1>
                <p className="text-muted-foreground mb-8">{message || t((m) => m.authPages.invalidLinkExpired)}</p>
                <Link
                  href="/signup"
                  className="btn text-white bg-blue-600 hover:bg-blue-700 w-full inline-block text-center"
                >
                  {t((m) => m.authPages.reregisterBtn)}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ActivatePage() {
  return (
    <Suspense>
      <ActivateContent />
    </Suspense>
  );
}
