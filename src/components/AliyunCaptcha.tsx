"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useLocale } from "@/i18n/useLocale";

/**
 * 阿里云验证码 2.0（V3 架构）
 *
 * 通过 `useCaptcha` hook 在提交按钮流程中程序化触发，无需独立验证按钮。
 */

declare global {
  interface Window {
    AliyunCaptchaConfig?: {
      region: string;
      prefix: string;
    };
    initAliyunCaptcha?: (options: {
      SceneId: string;
      mode: string;
      element: string;
      button: string;
      success: (captchaVerifyParam: string) => void;
      fail?: (result: { code: string; msg: string }) => void;
      getInstance?: (instance: AliyunCaptchaInstance) => void;
      slideStyle?: { width: number; height: number };
      language?: string;
      onError?: (errorInfo: { code: string; msg: string }) => void;
      onClose?: () => void;
    }) => void;
  }
}

interface AliyunCaptchaInstance {
  show: () => void;
  hide: () => void;
}

// ---------- SDK 加载 ----------

let scriptLoaded = false;
let scriptLoading: Promise<void> | null = null;

function loadCaptchaScript(): Promise<void> {
  if (scriptLoaded) return Promise.resolve();
  if (scriptLoading) return scriptLoading;

  scriptLoading = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://o.alicdn.com/captcha-frontend/aliyunCaptcha/AliyunCaptcha.js";
    script.async = true;
    script.onload = () => {
      scriptLoaded = true;
      resolve();
    };
    script.onerror = () => reject(new Error("验证码 SDK 加载失败"));
    document.head.appendChild(script);
  });

  return scriptLoading;
}

// ---------- useCaptcha hook ----------

export interface CaptchaResult {
  captchaVerifyParam: string;
}

/** 用户主动关闭验证码弹窗时抛出，调用方应静默处理 */
export class CaptchaCancelledError extends Error {
  constructor() {
    super("CAPTCHA_CANCELLED");
    this.name = "CaptchaCancelledError";
  }
}

export function useCaptcha() {
  const { t, locale } = useLocale();
  const [loading, setLoading] = useState(false);
  const captchaInstanceRef = useRef<AliyunCaptchaInstance | null>(null);
  const resolveRef = useRef<((result: CaptchaResult) => void) | null>(null);
  const rejectRef = useRef<((error: Error) => void) | null>(null);
  const containerId = "ali-captcha-element";
  const triggerBtnId = "ali-captcha-trigger-btn";

  // 预加载 SDK 脚本 & 设置全局配置
  useEffect(() => {
    const prefix = process.env.NEXT_PUBLIC_ALI_CAPTCHA_PREFIX;
    const region = process.env.NEXT_PUBLIC_ALI_CAPTCHA_REGION || "cn";

    if (prefix) {
      window.AliyunCaptchaConfig = { region, prefix };
    }

    loadCaptchaScript().catch(() => {});

    return () => {
      const container = document.getElementById(containerId);
      const btn = document.getElementById(triggerBtnId);
      if (container) container.remove();
      if (btn) btn.remove();
      captchaInstanceRef.current = null;
    };
  }, []);

  /** 程序化唤起验证码，返回 Promise<{ captchaVerifyParam }> */
  const triggerCaptcha = useCallback((): Promise<CaptchaResult> => {
    return new Promise((resolve, reject) => {
      const prefix = process.env.NEXT_PUBLIC_ALI_CAPTCHA_PREFIX;
      const sceneId = process.env.NEXT_PUBLIC_ALI_CAPTCHA_SCENE_ID;
      const region = process.env.NEXT_PUBLIC_ALI_CAPTCHA_REGION || "cn";

      if (!prefix || !sceneId) {
        reject(new Error(t((m) => m.authPages.captchaAppIdMissing)));
        return;
      }

      setLoading(true);
      resolveRef.current = resolve;
      rejectRef.current = reject;

      const doInit = () => {
        if (!window.initAliyunCaptcha) {
          setLoading(false);
          reject(new Error(t((m) => m.authPages.captchaSdkLoadFailed)));
          return;
        }

        // 设置全局配置
        window.AliyunCaptchaConfig = { region, prefix };

        // 每次触发都重新创建 DOM 元素并初始化，确保验证码是全新的
        const oldContainer = document.getElementById(containerId);
        const oldBtn = document.getElementById(triggerBtnId);
        if (oldContainer) oldContainer.remove();
        if (oldBtn) oldBtn.remove();

        const container = document.createElement("div");
        container.id = containerId;
        container.style.display = "none";
        document.body.appendChild(container);

        const btn = document.createElement("button");
        btn.id = triggerBtnId;
        btn.style.display = "none";
        document.body.appendChild(btn);

        window.initAliyunCaptcha({
          SceneId: sceneId,
          mode: "popup",
          element: `#${containerId}`,
          button: `#${triggerBtnId}`,
          slideStyle: { width: 360, height: 40 },
          language: locale === "zh-CN" ? "cn" : "en",
          success: (captchaVerifyParam: string) => {
            setLoading(false);
            if (resolveRef.current) {
              resolveRef.current({ captchaVerifyParam });
              resolveRef.current = null;
              rejectRef.current = null;
            }
          },
          fail: (result: { code: string; msg: string }) => {
            setLoading(false);
            captchaInstanceRef.current?.hide();
            if (rejectRef.current) {
              rejectRef.current(new Error(result.msg || t((m) => m.authPages.captchaVerifyFailed)));
              resolveRef.current = null;
              rejectRef.current = null;
            }
          },
          getInstance: (instance: AliyunCaptchaInstance) => {
            captchaInstanceRef.current = instance;
            // 实例就绪后立即弹出
            instance.show();
          },
          onError: (errorInfo: { code: string; msg: string }) => {
            setLoading(false);
            captchaInstanceRef.current?.hide();
            if (rejectRef.current) {
              rejectRef.current(new Error(errorInfo.msg || t((m) => m.authPages.captchaSdkLoadFailed)));
              resolveRef.current = null;
              rejectRef.current = null;
            }
          },
          onClose: () => {
            setLoading(false);
            if (rejectRef.current) {
              rejectRef.current(new CaptchaCancelledError());
              resolveRef.current = null;
              rejectRef.current = null;
            }
          },
        });
      };

      loadCaptchaScript().then(doInit).catch(() => {
        setLoading(false);
        reject(new Error(t((m) => m.authPages.captchaSdkLoadFailed)));
      });
    });
  }, [t, locale]);

  return { triggerCaptcha, loading };
}
