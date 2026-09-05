import type { Metadata } from "next";
import WorkspaceHomePage from "./WorkspaceHomePage";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false },
};

export default function Page() {
  return <WorkspaceHomePage />;
}
