import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "User Management",
  robots: { index: false },
};

export default function UserManagementLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
