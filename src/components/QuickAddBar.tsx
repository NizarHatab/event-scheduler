"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";

interface QuickAddBarProps {
  onParsed: (data: { title: string; startAt: string; endAt: string }) => void;
  onExpandFull: () => void;
  disabled?: boolean;
}

export function QuickAddBar({
  onParsed,
  onExpandFull,
  disabled,
}: QuickAddBarProps) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ai/parse-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed }),
      });
      const data = (await res.json()) as {
        title?: string;
        startAt?: string;
        endAt?: string;
      };
      if (data.title && data.startAt && data.endAt) {
        onParsed({
          title: data.title,
          startAt: data.startAt,
          endAt: data.endAt,
        });
        setText("");
      } else {
        onExpandFull();
      }
    } catch {
      onExpandFull();
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex gap-2 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-2 shadow-sm"
    >
      <span className="flex items-center pl-2 text-[var(--muted)]">
        <Sparkles className="h-4 w-4" />
      </span>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder='Quick add: "Team standup Monday 9am" or "Dinner tomorrow 7pm"'
        disabled={disabled}
        className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={disabled || loading || !text.trim()}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? "…" : "Add"}
      </button>
    </form>
  );
}
