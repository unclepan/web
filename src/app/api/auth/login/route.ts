import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL, setAuthCookies } from '@/lib/auth/server-cookies';

/**
 * 登录 Route Handler
 *
 * 浏览器 → POST /api/auth/login（此文件）
 *   → 服务端 fetch 后端 /user/login（获取 accessToken + refreshToken）
 *   → 通过 Set-Cookie 写入 httpOnly refresh_token + JS-readable access_token
 *   → 返回 { user } 给浏览器（token 不出现在响应体，只走 cookie）
 *
 * httpOnly cookie 由 Next.js 同源直接设置，不依赖反向代理穿透 Set-Cookie。
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const resp = await fetch(`${BACKEND_URL}/user/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const result = await resp.json();

    // 后端返回错误 → 原样透传
    if (!resp.ok) {
      return NextResponse.json(result, { status: resp.status });
    }

    // FormatResponseInterceptor 包装后：{ code:200, message:"success", data:{ user, accessToken, refreshToken } }
    const { user, accessToken, refreshToken } = result.data ?? {};

    if (!accessToken || !refreshToken) {
      return NextResponse.json(
        { code: 500, message: 'fail', data: '后端未返回 token' },
        { status: 500 },
      );
    }

    // 写入 cookie，响应体只返回 user（token 不暴露给 JS）
    const response = NextResponse.json({
      code: 200,
      message: 'success',
      data: { user },
    });
    setAuthCookies(response, accessToken, refreshToken);
    return response;
  } catch {
    return NextResponse.json(
      { code: 500, message: 'fail', data: '登录服务异常' },
      { status: 500 },
    );
  }
}
