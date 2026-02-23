import { Suspense } from "react";
import { Header } from "@/components/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Suspense fallback={<div className="animate-pulse rounded-xl bg-[var(--card)] h-64" />}>
          {children}
        </Suspense>
      </main>
    </>
  );
}
