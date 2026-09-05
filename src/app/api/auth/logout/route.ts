import { NextResponse } from 'next/server';
import { BACKEND_URL, clearAuthCookies } from '@/lib/auth/server-cookies';

/**
 * 登出 Route Handler
 *
 * 浏览器 → POST /api/auth/logout（此文件）
 *   → 清除 access_token + refresh_token cookie
 *   → 通知后端（best-effort，失败不阻塞）
 *   → 返回成功
 */
export async function POST() {
  const response = NextResponse.json({
    code: 200,
    message: 'success',
    data: '已登出',
  });

  // 清除本地 cookie（httpOnly cookie 只能服务端清除）
  clearAuthCookies(response);

  // 通知后端（best-effort：即使后端挂了也不影响前端登出）
  try {
    await fetch(`${BACKEND_URL}/user/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    // 后端不可达时静默忽略，前端 cookie 已清除
  }

  return response;
}

/** 也支持 GET 触发登出（方便 <a> 标签直接跳转） */
export async function GET() {
  return POST();
}

// 防止 Next.js 静态预渲染此路由
export const dynamic = 'force-dynamic';
