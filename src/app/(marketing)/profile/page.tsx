import type { Metadata } from "next";
import ProfileContent from "./components/ProfileContent";

export const metadata: Metadata = {
  title: "Profile",
  robots: { index: false },
};

/** 站点个人中心 — 主体在 `ProfileContent`（client，负责登录态与 i18n）。 */
export default function ProfilePage() {
  return <ProfileContent />;
}
