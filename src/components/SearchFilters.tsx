"use client";

import { Search, X } from "lucide-react";
import type { EventStatus } from "@/types/event";

interface SearchFiltersProps {
  q: string;
  from: string;
  to: string;
  location: string;
  status: EventStatus | "";
  onQChange: (v: string) => void;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
  onLocationChange: (v: string) => void;
  onStatusChange: (v: EventStatus | "") => void;
  onClear: () => void;
}

const statuses: (EventStatus | "")[] = ["", "upcoming", "attending", "maybe", "declined"];

export function SearchFilters({
  q,
  from,
  to,
  location,
  status,
  onQChange,
  onFromChange,
  onToChange,
  onLocationChange,
  onStatusChange,
  onClear,
}: SearchFiltersProps) {
  return (
    <div className="space-y-3 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Search className="h-4 w-4 text-[var(--muted)]" />
        <span className="text-sm font-medium text-[var(--foreground)]">Search & filters</span>
        <button
          type="button"
          onClick={onClear}
          className="ml-auto flex items-center gap-1 text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
        >
          <X className="h-3 w-3" /> Clear
        </button>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <input
          type="search"
          value={q}
          onChange={(e) => onQChange(e.target.value)}
          placeholder="Title, description, location…"
          className="rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder-[var(--muted)] focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:col-span-2"
        />
        <input
          type="date"
          value={from}
          onChange={(e) => onFromChange(e.target.value)}
          placeholder="From"
          className="rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <input
          type="date"
          value={to}
          onChange={(e) => onToChange(e.target.value)}
          placeholder="To"
          className="rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <input
          type="text"
          value={location}
          onChange={(e) => onLocationChange(e.target.value)}
          placeholder="Location"
          className="rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder-[var(--muted)] focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value as EventStatus | "")}
          className="rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          {statuses.map((s) => (
            <option key={s || "all"} value={s}>
              {s ? `Status: ${s}` : "All statuses"}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
