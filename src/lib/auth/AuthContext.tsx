"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { userApi, authApi, ApiError } from "@/lib/api";
import { isLoggedIn, clearAccessToken } from "@/lib/auth/token";
import type { UserProfile } from "@/lib/api/modules/user.types";

interface AuthContextValue {
  user: UserProfile | null;
  loading: boolean;
  /** 登录后调用，更新全局 user state */
  setUser: (user: UserProfile | null) => void;
  /** 主动刷新用户信息（调用 userApi.getMe） */
  refreshUser: () => Promise<void>;
  /** 退出登录（清除 cookie + 跳转） */
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  /**
   * 拉取当前用户信息。
   *
   * 关键：只在**确认鉴权失效**时才清空登录态。
   * 早期这里 catch 里无差别 `setUser(null) + clearAccessToken()`，
   * 导致一次 getMe 的 5xx / 网络抖动就把 access_token cookie 删掉；
   * 而 cookie 一旦没了，`isLoggedIn()` 恒为 false，连 refresh 都不会触发，
   * 即使 refresh_token 仍有效也只能重新登录 —— 「刷新几次就掉登录」的根因。
   */
  const refreshUser = useCallback(async () => {
    if (!isLoggedIn()) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const data = await userApi.getMe();
      setUser(data);
    } catch (err) {
      const isAuthFailure = err instanceof ApiError && err.code === 401;
      if (isAuthFailure) {
        // 确认登录已失效（refresh 也失败）→ 清干净
        setUser(null);
        clearAccessToken();
      } else {
        // 瞬时错误（5xx / 网络 / 续期接口抖动）：保留 cookie，重试一次再放弃，
        // 这样单次抖动不会毁掉整个会话，下次刷新也能自愈。
        try {
          await new Promise((r) => setTimeout(r, 600));
          const data = await userApi.getMe();
          setUser(data);
        } catch {
          // 仍然失败：保留 cookie 与登录态，等下次刷新/请求恢复
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // 初始加载：有 access_token cookie 则后台拉取用户信息，无则直接结束
  useEffect(() => {
    if (!isLoggedIn()) {
      setLoading(false);
      return;
    }
    refreshUser();
  }, [refreshUser]);

  // 退出登录：调用后端登出接口（Route Handler 清除 httpOnly refresh_token）
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // 即使 API 调用失败，也强制清除本地 access_token
    }
    clearAccessToken();
    setUser(null);
    router.push("/");
  }, [router]);

  return (
    <AuthContext.Provider
      value={{ user, loading, setUser, refreshUser, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an <AuthProvider>");
  }
  return ctx;
}
