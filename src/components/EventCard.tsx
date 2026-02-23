"use client";

import { format } from "date-fns";
import { MapPin, Pencil, Trash2, UserPlus, ChevronRight } from "lucide-react";
import type { EventStatus } from "@/types/event";

const statusColors: Record<EventStatus, string> = {
  upcoming: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
  attending: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300",
  maybe: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300",
  declined: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
};

interface EventCardProps {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  startAt: Date;
  endAt: Date | null;
  myStatus: EventStatus;
  onSelect?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onInvite?: (id: string) => void;
  onStatusChange?: (id: string, status: EventStatus) => void;
  isOwner?: boolean;
}

export function EventCard({
  id,
  title,
  description,
  location,
  startAt,
  endAt,
  myStatus,
  onSelect,
  onEdit,
  onDelete,
  onInvite,
  onStatusChange,
  isOwner,
}: EventCardProps) {
  return (
    <article
      className={`rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 shadow-sm transition-all hover:shadow-md ${
        onSelect ? "cursor-pointer" : ""
      }`}
      onClick={onSelect ? () => onSelect(id) : undefined}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-[var(--foreground)]">{title}</h3>
            {onSelect && (
              <ChevronRight className="h-4 w-4 shrink-0 text-[var(--muted)]" />
            )}
          </div>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {format(new Date(startAt), "EEEE, MMM d · h:mm a")}
            {endAt && ` – ${format(new Date(endAt), "h:mm a")}`}
          </p>
          {location && (
            <p className="mt-1 flex items-center gap-1 text-sm text-[var(--muted)]">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              {location}
            </p>
          )}
          {description && (
            <p className="mt-2 line-clamp-2 text-sm text-[var(--muted)]">
              {description}
            </p>
          )}
        </div>
        <div
          className="flex flex-wrap items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[myStatus]}`}
          >
            {myStatus}
          </span>
          {isOwner && (
            <>
              {onInvite && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onInvite(id); }}
                  className="rounded-lg p-2 text-[var(--muted)] hover:bg-slate-100 hover:text-[var(--foreground)] dark:hover:bg-slate-700"
                  title="Invite"
                >
                  <UserPlus className="h-4 w-4" />
                </button>
              )}
              {onEdit && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onEdit(id); }}
                  className="rounded-lg p-2 text-[var(--muted)] hover:bg-slate-100 hover:text-[var(--foreground)] dark:hover:bg-slate-700"
                  title="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onDelete(id); }}
                  className="rounded-lg p-2 text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
      {onStatusChange && (
        <div
          className="mt-3 flex flex-wrap gap-1 border-t border-[var(--card-border)] pt-3"
          onClick={(e) => e.stopPropagation()}
        >
          {(["attending", "maybe", "declined", "upcoming"] as const).map(
            (s) => (
              <button
                key={s}
                type="button"
                onClick={() => onStatusChange(id, s)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                  myStatus === s
                    ? statusColors[s]
                    : "bg-slate-100 text-[var(--muted)] hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600"
                }`}
              >
                {s}
              </button>
            )
          )}
        </div>
      )}
    </article>
  );
}
