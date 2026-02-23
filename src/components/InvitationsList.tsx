"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Mail, ChevronRight } from "lucide-react";

interface InvitationItem {
  id: string;
  eventId: string;
  eventTitle?: string;
  email: string;
  status: string;
  token?: string;
  createdAt: string;
}

export function InvitationsList() {
  const [received, setReceived] = useState<InvitationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/invitations")
      .then((res) => (res.ok ? res.json() : []))
      .then((list: InvitationItem[]) => setReceived(list))
      .finally(() => setLoading(false));
  }, []);

  const pending = received.filter((i) => i.status === "pending");
  if (loading || pending.length === 0) return null;

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-[var(--foreground)]">
        <Mail className="h-4 w-4 text-[var(--muted)]" />
        Pending invitations
      </div>
      <ul className="mt-2 space-y-2">
        {pending.slice(0, 5).map((inv) => (
          <li key={inv.id}>
            <Link
              href={inv.token ? `/invite/${inv.token}` : "/dashboard"}
              className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-[var(--muted)] hover:bg-slate-100 hover:text-[var(--foreground)] dark:hover:bg-slate-700"
            >
              <span>
                {inv.eventTitle ?? "Event"} — you&apos;re invited
              </span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </li>
        ))}
      </ul>
      {pending.length > 5 && (
        <p className="mt-2 text-xs text-[var(--muted)]">
          +{pending.length - 5} more
        </p>
      )}
    </div>
  );
}
