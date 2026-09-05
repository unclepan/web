"use client";

/**
 * Avatar —— 圆形头像基础组件
 *
 * 渲染规则：
 *   - `src` 非空 → `next/image` 圆形封面。头像/封面来自 COS CDN，web 侧
 *     没有配 `images.remotePatterns`，因此固定 `unoptimized`（与
 *     `survey/.../choice.tsx` 里处理远端图片的既有做法一致）。
 *   - `src` 为空 → 主色底白字圆形，文本取 `name` 的首个 Unicode code point
 *     （用 Array.from 取值，避免切坏 emoji / 中文代理对）。
 */
import Image from "next/image";

export type AvatarSize = "sm" | "md" | "lg";

interface AvatarProps {
  /** 头像 URL；null / 空串 → 渲染首字母 fallback */
  src: string | null | undefined;
  /** 用于 alt 与首字母 fallback */
  name: string;
  /** sm = 28px / md = 40px / lg = 96px */
  size?: AvatarSize;
  /** 透传额外样式（如 ring、shadow） */
  className?: string;
}

const SIZE_PX: Record<AvatarSize, number> = {
  sm: 28,
  md: 40,
  lg: 96,
};

const SIZE_TEXT: Record<AvatarSize, string> = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-3xl",
};

export default function Avatar({
  src,
  name,
  size = "sm",
  className = "",
}: AvatarProps) {
  const px = SIZE_PX[size];
  const trimmedSrc = src?.trim() ?? "";
  const safeName = name.trim() || "?";
  const initial = Array.from(safeName)[0]?.toUpperCase() ?? "?";

  if (trimmedSrc) {
    return (
      <Image
        src={trimmedSrc}
        alt={safeName}
        width={px}
        height={px}
        unoptimized
        className={`rounded-full object-cover shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={safeName}
      style={{ width: px, height: px }}
      className={`rounded-full shrink-0 inline-flex items-center justify-center bg-blue-600 text-white font-medium select-none ${SIZE_TEXT[size]} ${className}`}
    >
      {initial}
    </div>
  );
}
