"use client";

import { useEffect, useState } from "react";
import QRCodeLib from "qrcode";
import { useLocale } from "@/i18n/useLocale";

/**
 * 二维码组件
 * 使用 qrcode 包在本地生成二维码 DataURL，无需依赖在线 API
 */
export function QRCode({
  value,
  size = 160,
  className = "",
}: {
  value: string;
  size?: number;
  className?: string;
}) {
  const { t } = useLocale();
  const [src, setSrc] = useState<string>("");

  useEffect(() => {
    if (!value) return;
    QRCodeLib.toDataURL(value, {
      width: size,
      margin: 2,
      color: {
        dark: "#111827",
        light: "#ffffff",
      },
      errorCorrectionLevel: "M",
    })
      .then((url) => setSrc(url))
      .catch((err) => {
        console.error("二维码生成失败：", err);
        setSrc("");
      });
  }, [value, size]);

  if (!src) {
    return (
      <div
        className={`bg-muted rounded-lg animate-pulse ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={t((m) => m.common.qrCodeAlt)}
      width={size}
      height={size}
      className={`rounded-lg ${className}`}
    />
  );
}

export default QRCode;