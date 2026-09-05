import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Survey",
  description: "Take this online survey and submit your responses securely.",
};

export default function SurveyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {children}
    </div>
  );
}