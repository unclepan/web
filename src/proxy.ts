import { NextRequest, NextResponse } from "next/server";

/**
 * Next.js 16 将传统 `middleware.ts` 重命名为 `proxy.ts`，功能完全一致。
 *
 * 本 proxy 负责：
 * 1. 拦截需要登录才可访问的页面，未登录跳转到 /signin
 * 2. 已登录用户访问 /signin、/signup 等鉴权页时，自动跳转到 /workspace
 *
 * 登录 access_token 存放在非 httpOnly 的 cookie（key: `access_token`）中，
 * proxy 在 Edge 层可直接读取，实现服务端级别的路由守卫。
 */

/** 需要登录才能访问的页面前缀 */
const PROTECTED_PREFIXES = [
  "/workspace", // 工作台（我的问卷、数据统计、模板中心、回收站、个人资料、用户管理…）
  "/editor",    // 问卷编辑器
];

/** 已登录用户不应再访问的鉴权页（登录/注册/找回密码…） */
const AUTH_PAGES = [
  "/signin",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/activate",
];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function isAuthPath(pathname: string): boolean {
  return AUTH_PAGES.some(
    (page) => pathname === page || pathname.startsWith(`${page}/`),
  );
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get("access_token")?.value;
  
  // 1. 需要登录的页面：未携带 token → 跳到 /signin
  if (isProtectedPath(pathname) && !token) {
    const url = request.nextUrl.clone();
    url.pathname = "/signin";
    // 保留原始路径，登录成功后可跳回
    url.searchParams.set("callbackUrl", pathname + search);
    return NextResponse.redirect(url);
  }

  // 2. 已登录用户访问登录/注册页 → 跳到 /workspace
  if (isAuthPath(pathname) && token) {
    const url = request.nextUrl.clone();
    url.pathname = "/workspace";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

/**
 * matcher 精确指定命中路径，避免对静态资源、API 代理等做无谓拦截
 * - /workspace、/editor 及其子路径
 * - /signin、/signup、/forgot-password、/reset-password、/activate 及其子路径
 */
export const config = {
  matcher: [
    "/workspace/:path*",
    "/editor/:path*",
    "/signin/:path*",
    "/signup/:path*",
    "/forgot-password/:path*",
    "/reset-password/:path*",
    "/activate/:path*",
  ],
};