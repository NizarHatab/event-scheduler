"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useToast } from "@/components/Toast";

interface EditProfileModalProps {
  onClose: () => void;
  initialName: string | null;
  initialEmail: string;
  onSuccess?: (name: string | null) => void;
}

export function EditProfileModal({
  onClose,
  initialName,
  initialEmail,
  onSuccess,
}: EditProfileModalProps) {
  const toast = useToast();
  const [name, setName] = useState(initialName ?? "");
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    setName(initialName ?? "");
    setEmail(initialEmail);
  }, [initialName, initialEmail]);

  useEffect(() => {
    let cancelled = false;
    setFetching(true);
    fetch("/api/user")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { name?: string | null; email?: string } | null) => {
        if (cancelled || !data) return;
        setName(data.name ?? "");
        setEmail(data.email ?? initialEmail);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setFetching(false);
      });
    return () => { cancelled = true; };
  }, [initialEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() || null }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        toast.error(data.error ?? "Failed to update profile");
        return;
      }
      toast.success("Profile updated");
      onSuccess?.(name.trim() || null);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <>
      <div
        className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <aside
        className="fixed right-0 top-0 z-[101] flex h-full w-full max-w-md flex-col border-l border-[var(--card-border)] bg-[var(--card)] shadow-2xl"
        role="dialog"
        aria-label="Edit profile"
      >
        <div className="flex items-center justify-between border-b border-[var(--card-border)] px-6 py-4">
          <h3 className="text-lg font-semibold text-[var(--foreground)]">
            Edit profile
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-[var(--muted)] hover:bg-slate-100 hover:text-[var(--foreground)] dark:hover:bg-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-auto px-6 py-6">
          {fetching ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="profile-name" className="mb-1 block text-sm font-medium text-[var(--foreground)]">
                  Name
                </label>
                <input
                  id="profile-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-3 py-2.5 text-[var(--foreground)] placeholder-[var(--muted)] focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--muted)]">
                  Email
                </label>
                <p className="text-sm text-[var(--foreground)]">{email}</p>
                <p className="mt-0.5 text-xs text-[var(--muted)]">Email cannot be changed.</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-xl border border-[var(--card-border)] py-2.5 text-sm font-medium text-[var(--foreground)] hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          )}
        </div>
      </aside>
    </>
  );

  if (typeof document === "undefined") return null;
  return createPortal(content, document.body);
}
