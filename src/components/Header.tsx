"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Calendar,
  LayoutDashboard,
  LogOut,
  Download,
  Menu,
  X,
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/calendar", label: "Calendar", icon: Calendar },
];

function NavLinks({
  pathname,
  onExport,
  onSignOut,
  variant = "desktop",
}: {
  pathname: string;
  onExport: () => void;
  onSignOut: () => void;
  variant?: "desktop" | "mobile";
}) {
  const base =
    variant === "mobile"
      ? "flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium"
      : "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors";
  const active =
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300";
  const inactive =
    "text-[var(--muted)] hover:bg-slate-100 hover:text-[var(--foreground)] dark:hover:bg-slate-800";

  return (
    <>
      {nav.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={`${base} ${pathname === href ? active : inactive}`}
        >
          <Icon className="h-5 w-5 shrink-0" />
          {label}
        </Link>
      ))}
      <button
        type="button"
        onClick={onExport}
        className={`${base} ${inactive} w-full ${variant === "desktop" ? "w-auto" : ""}`}
      >
        <Download className="h-5 w-5 shrink-0" />
        Export iCal
      </button>
      <ThemeToggle />
      <button
        type="button"
        onClick={onSignOut}
        className={`${base} ${inactive} w-full ${variant === "desktop" ? "w-auto" : ""}`}
      >
        <LogOut className="h-5 w-5 shrink-0" />
        Sign out
      </button>
    </>
  );
}

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/events/export");
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "events.ics";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // silent fail or toast
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    if (!mobileOpen) return;
    const close = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--card-border)] bg-[var(--card)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--card)]/80">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
        <Link
          href="/dashboard"
          className="flex shrink-0 items-center gap-2.5 font-semibold text-[var(--foreground)]"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/25">
            <Calendar className="h-5 w-5" />
          </span>
          <span className="hidden sm:inline">Event Scheduler</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          <NavLinks
            pathname={pathname}
            onExport={handleExport}
            onSignOut={() => signOut({ callbackUrl: "/login" })}
            variant="desktop"
          />
        </nav>

        {/* Mobile: hamburger + dropdown */}
        <div className="relative flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-[var(--muted)] hover:bg-slate-100 hover:text-[var(--foreground)] dark:hover:bg-slate-800"
            aria-expanded={mobileOpen}
            aria-label="Open menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          {mobileOpen && (
            <div
              ref={navRef}
              className="absolute right-0 top-full mt-1 flex w-64 flex-col gap-1 rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-2 shadow-xl"
            >
              <NavLinks
                pathname={pathname}
                onExport={handleExport}
                onSignOut={() => {
                  setMobileOpen(false);
                  signOut({ callbackUrl: "/login" });
                }}
                variant="mobile"
              />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
