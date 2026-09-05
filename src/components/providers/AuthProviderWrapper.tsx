"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/lib/auth/AuthContext";

export default function AuthProviderWrapper({
  children,
}: {
  children: ReactNode;
}) {
  return <AuthProvider>{children}</AuthProvider>;
}
