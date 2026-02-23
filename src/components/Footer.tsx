"use client";

import Link from "next/link";
import { Calendar } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto border-t border-[var(--card-border)] bg-[var(--card)]">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row">
        <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
          <Calendar className="h-4 w-4" />
          <span>Event Scheduler</span>
        </div>
        <nav className="flex flex-wrap items-center justify-center gap-6 text-sm">
          <Link
            href="/dashboard"
            className="text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            Dashboard
          </Link>
          <Link
            href="/calendar"
            className="text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            Calendar
          </Link>
        </nav>
        <p className="text-sm text-[var(--muted)]">
          © {year} Event Scheduler
        </p>
      </div>
    </footer>
  );
}
