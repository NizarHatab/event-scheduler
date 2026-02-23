import { Suspense } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function CalendarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <Suspense fallback={<div className="animate-pulse rounded-xl bg-[var(--card)] h-64" />}>
          {children}
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
