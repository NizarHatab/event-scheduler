"use client";

import { format } from "date-fns";
import { MapPin, X, Pencil, Trash2, UserPlus } from "lucide-react";
import type { EventStatus } from "@/types/event";

const statusColors: Record<EventStatus, string> = {
  upcoming: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
  attending: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300",
  maybe: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300",
  declined: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
};

interface EventDetailSlideOverProps {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  startAt: Date;
  endAt: Date | null;
  myStatus: EventStatus;
  isOwner: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onInvite: () => void;
  onStatusChange: (status: EventStatus) => void;
}

export function EventDetailSlideOver({
  id,
  title,
  description,
  location,
  startAt,
  endAt,
  myStatus,
  isOwner,
  onClose,
  onEdit,
  onDelete,
  onInvite,
  onStatusChange,
}: EventDetailSlideOverProps) {
  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <aside
        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-[var(--card-border)] bg-[var(--card)] shadow-2xl"
        role="dialog"
        aria-label="Event details"
      >
        <div className="flex items-center justify-between border-b border-[var(--card-border)] px-6 py-4">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Event details
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-[var(--muted)] hover:bg-slate-100 hover:text-[var(--foreground)] dark:hover:bg-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-auto px-6 py-5">
          <h3 className="text-xl font-bold text-[var(--foreground)]">{title}</h3>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {format(startAt, "EEEE, MMMM d, yyyy")}
          </p>
          <p className="text-sm text-[var(--muted)]">
            {format(startAt, "h:mm a")}
            {endAt && ` – ${format(endAt, "h:mm a")}`}
          </p>
          {location && (
            <p className="mt-3 flex items-center gap-2 text-sm text-[var(--foreground)]">
              <MapPin className="h-4 w-4 shrink-0 text-[var(--muted)]" />
              {location}
            </p>
          )}
          {description && (
            <p className="mt-4 whitespace-pre-wrap text-sm text-[var(--muted)]">
              {description}
            </p>
          )}
          <div className="mt-6">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
              Your response
            </p>
            <div className="flex flex-wrap gap-2">
              {(["attending", "maybe", "declined", "upcoming"] as const).map(
                (s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => onStatusChange(s)}
                    className={`rounded-xl px-3 py-1.5 text-sm font-medium transition-colors ${
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
          </div>
          {isOwner && (
            <div className="mt-8 flex flex-wrap gap-2 border-t border-[var(--card-border)] pt-6">
              <button
                type="button"
                onClick={onInvite}
                className="flex items-center gap-2 rounded-xl border border-[var(--card-border)] bg-transparent px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <UserPlus className="h-4 w-4" />
                Invite
              </button>
              <button
                type="button"
                onClick={onEdit}
                className="flex items-center gap-2 rounded-xl border border-[var(--card-border)] bg-transparent px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </button>
              <button
                type="button"
                onClick={onDelete}
                className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 dark:border-red-900 dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-900/40"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
