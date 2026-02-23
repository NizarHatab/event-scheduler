"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Plus, CalendarDays } from "lucide-react";
import { EventCard } from "@/components/EventCard";
import { EventForm } from "@/components/EventForm";
import { SearchFilters } from "@/components/SearchFilters";
import { InviteModal } from "@/components/InviteModal";
import { Modal } from "@/components/Modal";
import { ConfirmModal } from "@/components/ConfirmModal";
import { EventDetailSlideOver } from "@/components/EventDetailSlideOver";
import { EventListSkeleton } from "@/components/EventListSkeleton";
import { QuickAddBar } from "@/components/QuickAddBar";
import { InvitationsList } from "@/components/InvitationsList";
import { useToast } from "@/components/Toast";
import type { EventStatus } from "@/types/event";
import { areIntervalsOverlapping, format, startOfDay, endOfDay, startOfWeek, endOfWeek } from "date-fns";

interface EventItem {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  startAt: string | Date;
  endAt: string | Date | null;
  createdById: string;
  myStatus: EventStatus;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const toast = useToast();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalCreate, setModalCreate] = useState(false);
  const [modalEditId, setModalEditId] = useState<string | null>(null);
  const [inviteEvent, setInviteEvent] = useState<{ id: string; title: string } | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [eventFromUrl, setEventFromUrl] = useState<EventItem | null>(null);
  const [quickAddPrefill, setQuickAddPrefill] = useState<{
    title: string;
    startAt: string;
    endAt: string;
  } | null>(null);

  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState<EventStatus | "">("");
  const debouncedQ = useDebounce(q, 300);
  const debouncedFrom = useDebounce(from, 300);
  const debouncedTo = useDebounce(to, 300);
  const debouncedLocation = useDebounce(location, 300);
  const debouncedStatus = useDebounce(status, 200);

  const fetchEvents = useCallback(async () => {
    const params = new URLSearchParams();
    if (debouncedQ) params.set("q", debouncedQ);
    if (debouncedFrom) params.set("from", debouncedFrom);
    if (debouncedTo) params.set("to", debouncedTo);
    if (debouncedLocation) params.set("location", debouncedLocation);
    if (debouncedStatus) params.set("status", debouncedStatus);
    const res = await fetch(`/api/events?${params}`);
    if (res.ok) {
      const data = (await res.json()) as EventItem[];
      setEvents(data);
    }
    setLoading(false);
  }, [debouncedQ, debouncedFrom, debouncedTo, debouncedLocation, debouncedStatus]);

  useEffect(() => {
    setLoading(true);
    fetchEvents();
  }, [fetchEvents]);

  const dateParam = searchParams.get("date");
  const eventIdParam = searchParams.get("eventId");

  useEffect(() => {
    if (!dateParam) return;
    const d = new Date(dateParam + "T09:00:00");
    if (isNaN(d.getTime())) return;
    const end = new Date(d);
    end.setHours(end.getHours() + 1);
    setQuickAddPrefill({
      title: "",
      startAt: d.toISOString(),
      endAt: end.toISOString(),
    });
    setModalCreate(true);
    window.history.replaceState({}, "", "/dashboard");
  }, [dateParam]);

  useEffect(() => {
    if (!eventIdParam) return;
    setDetailId(eventIdParam);
    window.history.replaceState({}, "", "/dashboard");
  }, [eventIdParam]);

  useEffect(() => {
    if (!detailId || loading) return;
    const found = events.find((e) => e.id === detailId);
    if (found) {
      setEventFromUrl(null);
      return;
    }
    fetch(`/api/events/${detailId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: EventItem | null) => setEventFromUrl(data))
      .catch(() => setEventFromUrl(null));
  }, [detailId, loading, events]);

  const openCreateModal = useCallback((prefill?: { title: string; startAt: string; endAt: string }) => {
    setQuickAddPrefill(prefill ?? null);
    setModalEditId(null);
    setModalCreate(true);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "n" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        openCreateModal();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openCreateModal]);

  const handleCreate = async (data: {
    title: string;
    description: string;
    location: string;
    startAt: string;
    endAt: string;
  }) => {
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create");
      const created = (await res.json()) as { id?: string };
      setModalCreate(false);
      setQuickAddPrefill(null);
      toast.success("Event created");
      fetchEvents();
      if (created?.id) setInviteEvent({ id: created.id, title: data.title });
    } catch {
      toast.error("Could not create event");
    }
  };

  const handleUpdate = async (
    id: string,
    data: {
      title: string;
      description: string;
      location: string;
      startAt: string;
      endAt: string;
    }
  ) => {
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update");
      setModalEditId(null);
      setDetailId(null);
      toast.success("Event updated");
      fetchEvents();
    } catch {
      toast.error("Could not update event");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setDeleteConfirm(null);
      setDetailId(null);
      setModalEditId(null);
      toast.success("Event deleted");
      fetchEvents();
    } catch {
      toast.error("Could not delete event");
    }
  };

  const handleStatusChange = async (id: string, newStatus: EventStatus) => {
    const res = await fetch(`/api/events/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (!res.ok) return;
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, myStatus: newStatus } : e))
    );
    setEventFromUrl((prev) => (prev?.id === id ? { ...prev, myStatus: newStatus } : prev));
    toast.success(`Marked as ${newStatus}`);
  };

  const editingEvent = modalEditId ? events.find((e) => e.id === modalEditId) : null;
  const detailEvent = detailId
    ? events.find((e) => e.id === detailId) ?? eventFromUrl
    : null;

  function getConflictWarning(
    startAt: string,
    endAt: string,
    excludeId?: string
  ): string | null {
    const start = new Date(startAt).getTime();
    const end = endAt ? new Date(endAt).getTime() : start + 60 * 60 * 1000;
    const overlapping = events.filter((e) => {
      if (e.id === excludeId) return false;
      const eStart = new Date(e.startAt).getTime();
      const eEnd = e.endAt ? new Date(e.endAt).getTime() : eStart + 60 * 60 * 1000;
      return areIntervalsOverlapping(
        { start, end },
        { start: eStart, end: eEnd }
      );
    });
    if (overlapping.length === 0) return null;
    return `You have ${overlapping.length} other event(s) at the same time: ${overlapping.map((e) => e.title).join(", ")}`;
  }

  return (
    <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
          My Events
        </h1>
        <button
          type="button"
          onClick={() => openCreateModal()}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-700"
          title="New event (⌘N)"
        >
          <Plus className="h-4 w-4" />
          New event
          <kbd className="hidden rounded border border-white/30 px-1.5 py-0.5 text-xs font-medium opacity-80 sm:inline">⌘N</kbd>
        </button>
      </div>

      <QuickAddBar
        onParsed={(data) => openCreateModal(data)}
        onExpandFull={() => openCreateModal()}
        disabled={loading}
      />

      <InvitationsList />

      {/* Quick filters */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-[var(--muted)]">Show:</span>
        {[
          { label: "All", from: "", to: "" },
          {
            label: "Today",
            from: format(startOfDay(new Date()), "yyyy-MM-dd"),
            to: format(endOfDay(new Date()), "yyyy-MM-dd"),
          },
          {
            label: "This week",
            from: format(startOfWeek(new Date(), { weekStartsOn: 0 }), "yyyy-MM-dd"),
            to: format(endOfWeek(new Date(), { weekStartsOn: 0 }), "yyyy-MM-dd"),
          },
        ].map(({ label, from, to }) => {
          const active = from === debouncedFrom && to === debouncedTo;
          return (
            <button
              key={label}
              type="button"
              onClick={() => {
                setFrom(from);
                setTo(to);
              }}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                active
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
                  : "bg-[var(--card)] border border-[var(--card-border)] text-[var(--foreground)] hover:border-indigo-300 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <SearchFilters
        q={q}
        from={from}
        to={to}
        location={location}
        status={status}
        onQChange={setQ}
        onFromChange={setFrom}
        onToChange={setTo}
        onLocationChange={setLocation}
        onStatusChange={setStatus}
        onClear={() => {
          setQ("");
          setFrom("");
          setTo("");
          setLocation("");
          setStatus("");
        }}
      />

      {/* Next up card */}
      {!loading && events.length > 0 && (() => {
        const now = new Date();
        const upcoming = events
          .filter((e) => new Date(e.startAt) >= now && e.myStatus !== "declined")
          .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
        const next = upcoming[0];
        if (!next) return null;
        return (
          <div
            className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-4 dark:border-indigo-900/50 dark:from-indigo-950/40 dark:to-slate-800"
            role="region"
            aria-label="Next event"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Next up
            </p>
            <button
              type="button"
              onClick={() => setDetailId(next.id)}
              className="mt-1 flex w-full flex-col items-start gap-0.5 text-left hover:opacity-90"
            >
              <span className="font-semibold text-[var(--foreground)]">{next.title}</span>
              <span className="text-sm text-[var(--muted)]">
                {format(new Date(next.startAt), "EEEE, MMM d · h:mm a")}
                {next.location && ` · ${next.location}`}
              </span>
            </button>
          </div>
        );
      })()}

      {loading ? (
        <EventListSkeleton />
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--card-border)] bg-[var(--card)] py-16 text-center">
          <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40">
            <CalendarDays className="h-8 w-8" />
          </span>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            No events yet
          </h2>
          <p className="mt-2 max-w-sm text-sm text-[var(--muted)]">
            Create your first event or use Quick add above (e.g. &quot;Team standup Monday 9am&quot;).
          </p>
          <button
            type="button"
            onClick={() => openCreateModal()}
            className="mt-6 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Create event
          </button>
        </div>
      ) : (
        <ul className="space-y-4">
          {events.map((event) => (
            <li key={event.id}>
              <EventCard
                id={event.id}
                title={event.title}
                description={event.description}
                location={event.location}
                startAt={new Date(event.startAt)}
                endAt={event.endAt ? new Date(event.endAt) : null}
                myStatus={event.myStatus}
                isOwner={event.createdById === session?.user?.id}
                onSelect={setDetailId}
                onEdit={(id) => {
                  setModalEditId(id);
                  setModalCreate(false);
                  setDetailId(null);
                }}
                onDelete={(id) => setDeleteConfirm(id)}
                onInvite={(id) => {
                  const e = events.find((x) => x.id === id);
                  if (e) setInviteEvent({ id: e.id, title: e.title });
                }}
                onStatusChange={handleStatusChange}
              />
            </li>
          ))}
        </ul>
      )}

      {modalCreate && (
        <Modal title="New event" onClose={() => { setModalCreate(false); setQuickAddPrefill(null); }} size="lg">
          <EventForm
            defaultValues={
              quickAddPrefill
                ? {
                    title: quickAddPrefill.title,
                    startAt: format(new Date(quickAddPrefill.startAt), "yyyy-MM-dd'T'HH:mm"),
                    endAt: format(new Date(quickAddPrefill.endAt), "yyyy-MM-dd'T'HH:mm"),
                    description: "",
                    location: "",
                  }
                : undefined
            }
            onSubmit={handleCreate}
            onCancel={() => { setModalCreate(false); setQuickAddPrefill(null); }}
            conflictWarning={null}
          />
        </Modal>
      )}

      {editingEvent && (
        <Modal
          title="Edit event"
          onClose={() => setModalEditId(null)}
          size="lg"
        >
          <EventForm
            isEdit
            defaultValues={{
              title: editingEvent.title,
              description: editingEvent.description ?? "",
              location: editingEvent.location ?? "",
              startAt: format(new Date(editingEvent.startAt), "yyyy-MM-dd'T'HH:mm"),
              endAt: editingEvent.endAt
                ? format(new Date(editingEvent.endAt), "yyyy-MM-dd'T'HH:mm")
                : "",
            }}
            onSubmit={async (data) => {
              await handleUpdate(editingEvent.id, data);
            }}
            onCancel={() => setModalEditId(null)}
            conflictWarning={getConflictWarning(
              new Date(editingEvent.startAt).toISOString(),
              editingEvent.endAt ? new Date(editingEvent.endAt).toISOString() : new Date(editingEvent.startAt).toISOString(),
              editingEvent.id
            )}
          />
        </Modal>
      )}

      {detailEvent && (
        <EventDetailSlideOver
          id={detailEvent.id}
          title={detailEvent.title}
          description={detailEvent.description}
          location={detailEvent.location}
          startAt={new Date(detailEvent.startAt)}
          endAt={detailEvent.endAt ? new Date(detailEvent.endAt) : null}
          myStatus={detailEvent.myStatus}
          isOwner={detailEvent.createdById === session?.user?.id}
          onClose={() => { setDetailId(null); setEventFromUrl(null); }}
          onEdit={() => {
            setDetailId(null);
            setModalEditId(detailEvent.id);
          }}
          onDelete={() => setDeleteConfirm(detailEvent.id)}
          onInvite={() => {
            setDetailId(null);
            setInviteEvent({ id: detailEvent.id, title: detailEvent.title });
          }}
          onStatusChange={(s) => handleStatusChange(detailEvent.id, s)}
        />
      )}

      {deleteConfirm && (
        <ConfirmModal
          title="Delete event"
          message="This cannot be undone. Are you sure?"
          confirmLabel="Delete"
          variant="danger"
          onConfirm={() => handleDelete(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}

      {inviteEvent && inviteEvent.id && (
        <InviteModal
          eventId={inviteEvent.id}
          eventTitle={inviteEvent.title}
          onClose={() => setInviteEvent(null)}
        />
      )}
    </div>
  );
}
