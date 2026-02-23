"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { Calendar } from "lucide-react";

interface InviteInfo {
  invitationId: string;
  eventId: string;
  eventTitle: string;
  eventStartAt: string;
  email: string;
}

export default function InvitePage() {
  const params = useParams();
  const token = params.token as string;
  const [info, setInfo] = useState<InviteInfo | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    fetch(`/api/invite/${token}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Invalid or expired"))))
      .then((data: InviteInfo) => setInfo(data))
      .catch(() => setError("This invitation is invalid or has expired."))
      .finally(() => setLoading(false));
  }, [token]);

  const handleAccept = async (accept: boolean) => {
    setAccepting(true);
    try {
      const res = await fetch(`/api/invite/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: accept ? "attending" : "declined" }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        if (res.status === 401) {
          setError("Please sign in first to respond to this invitation.");
          return;
        }
        setError(data.error ?? "Something went wrong.");
        return;
      }
      window.location.href = "/dashboard";
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-500">Loading invitation…</p>
      </div>
    );
  }

  if (error && !info) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
        <p className="text-center text-slate-600 dark:text-slate-400">{error}</p>
        <Link
          href="/login"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Go to sign in
        </Link>
      </div>
    );
  }

  if (!info) return null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50 px-4 dark:from-slate-900 dark:to-indigo-950">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-6 flex justify-center">
          <div className="rounded-xl bg-indigo-100 p-3 dark:bg-indigo-900/40">
            <Calendar className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
          </div>
        </div>
        <h1 className="text-center text-xl font-bold text-slate-900 dark:text-slate-100">
          You&apos;re invited
        </h1>
        <div className="mt-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-700/50">
          <p className="font-semibold text-slate-900 dark:text-slate-100">
            {info.eventTitle}
          </p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {format(new Date(info.eventStartAt), "EEEE, MMM d, yyyy · h:mm a")}
          </p>
        </div>
        {error && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => handleAccept(true)}
            disabled={accepting}
            className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {accepting ? "…" : "Accept invitation"}
          </button>
          <button
            type="button"
            onClick={() => handleAccept(false)}
            disabled={accepting}
            className="w-full rounded-lg border border-slate-300 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 disabled:opacity-50"
          >
            Decline
          </button>
        </div>
        <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
          You must be signed in as <strong>{info.email}</strong> to respond.{" "}
          <Link href="/login" className="font-medium text-indigo-600 dark:text-indigo-400">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
