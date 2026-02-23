"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";

interface EventFormProps {
  defaultValues?: {
    title: string;
    description: string;
    location: string;
    startAt: string;
    endAt: string;
  };
  onSubmit: (data: {
    title: string;
    description: string;
    location: string;
    startAt: string;
    endAt: string;
  }) => Promise<void>;
  onCancel: () => void;
  isEdit?: boolean;
  conflictWarning?: string | null;
}

export function EventForm({
  defaultValues,
  onSubmit,
  onCancel,
  isEdit,
  conflictWarning,
}: EventFormProps) {
  const [title, setTitle] = useState(defaultValues?.title ?? "");
  const [description, setDescription] = useState(defaultValues?.description ?? "");
  const [location, setLocation] = useState(defaultValues?.location ?? "");
  const [startAt, setStartAt] = useState(
    defaultValues?.startAt ?? new Date().toISOString().slice(0, 16)
  );
  const [endAt, setEndAt] = useState(defaultValues?.endAt ?? "");
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const handleAiSuggest = async () => {
    if (!title.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: title, type: undefined }),
      });
      const data = (await res.json()) as { suggestion?: string | { title?: string; description?: string; location?: string } };
      const s = data.suggestion;
      if (typeof s === "object" && s !== null) {
        if (s.title) setTitle(s.title);
        if (s.description) setDescription(s.description);
        if (s.location) setLocation(s.location);
      }
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({ title, description, location, startAt, endAt });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {conflictWarning && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
          ⚠️ {conflictWarning}
        </div>
      )}
      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Title
        </label>
        <div className="flex gap-2">
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            placeholder="Event title"
          />
          <button
            type="button"
            onClick={handleAiSuggest}
            disabled={aiLoading || !title.trim()}
            className="flex items-center gap-1 rounded-lg bg-indigo-100 px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-200 disabled:opacity-50 dark:bg-indigo-900/40 dark:text-indigo-300 dark:hover:bg-indigo-900/60"
          >
            <Sparkles className="h-4 w-4" />
            {aiLoading ? "…" : "AI"}
          </button>
        </div>
      </div>
      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          placeholder="Optional description"
        />
      </div>
      <div>
        <label htmlFor="location" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Location
        </label>
        <input
          id="location"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          placeholder="Address or place"
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="startAt" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Start
          </label>
          <input
            id="startAt"
            type="datetime-local"
            value={startAt}
            onChange={(e) => setStartAt(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>
        <div>
          <label htmlFor="endAt" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            End (optional)
          </label>
          <input
            id="endAt"
            type="datetime-local"
            value={endAt}
            onChange={(e) => setEndAt(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Saving…" : isEdit ? "Update" : "Create"}
        </button>
      </div>
    </form>
  );
}
