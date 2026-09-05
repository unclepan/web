import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL, setAuthCookies, clearAuthCookies } from '@/lib/auth/server-cookies';
import { REFRESH_TOKEN_COOKIE } from '@/lib/auth/cookies';

/**
 * 刷新 Token Route Handler
 *
 * 浏览器（401 拦截器）→ POST /api/auth/refresh（此文件）
 *   → 从 httpOnly cookie 读取 refresh_token
 *   → 服务端 fetch 后端 /user/refresh
 *   → 获取新 accessToken + refreshToken → Set-Cookie 更新
 *   → 返回成功，拦截器重试原请求
 */
export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  if (!refreshToken) {
    return NextResponse.json(
      { code: 401, message: 'fail', data: '无 refresh token，请重新登录' },
      { status: 401 },
    );
  }

  try {
    const resp = await fetch(`${BACKEND_URL}/user/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    const result = await resp.json();

    if (!resp.ok) {
      // refresh token 无效 / 过期 → 清除 cookie，告知前端需重新登录
      const errResponse = NextResponse.json(result, { status: resp.status });
      clearAuthCookies(errResponse);
      return errResponse;
    }

    const { accessToken, refreshToken: newRefreshToken } = result.data ?? {};

    if (!accessToken || !newRefreshToken) {
      return NextResponse.json(
        { code: 500, message: 'fail', data: '后端未返回 token' },
        { status: 500 },
      );
    }

    const response = NextResponse.json({
      code: 200,
      message: 'success',
      data: { success: true },
    });
    setAuthCookies(response, accessToken, newRefreshToken);
    return response;
  } catch {
    return NextResponse.json(
      { code: 500, message: 'fail', data: '刷新服务异常' },
      { status: 500 },
    );
  }
}
