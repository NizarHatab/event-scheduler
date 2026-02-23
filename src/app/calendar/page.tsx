"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  addDays,
  startOfDay,
} from "date-fns";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import type { EventStatus } from "@/types/event";

interface EventItem {
  id: string;
  title: string;
  startAt: string | Date;
  endAt: string | Date | null;
  myStatus: EventStatus;
}

export default function CalendarPage() {
  const [current, setCurrent] = useState(new Date());
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const from = startOfMonth(subMonths(current, 1));
    const to = endOfMonth(addMonths(current, 1));
    setLoading(true);
    fetch(`/api/events?from=${from.toISOString()}&to=${to.toISOString()}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: EventItem[]) => setEvents(data))
      .finally(() => setLoading(false));
  }, [current]);

  const monthStart = startOfMonth(current);
  const monthEnd = endOfMonth(current);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days: Date[] = useMemo(() => {
    const d: Date[] = [];
    let day = calStart;
    while (day <= calEnd) {
      d.push(day);
      day = addDays(day, 1);
    }
    return d;
  }, [calStart, calEnd]);

  const getEventsForDay = (day: Date) => {
    const dayStart = startOfDay(day);
    const dayEnd = addDays(dayStart, 1);
    return events.filter((e) => {
      const start = new Date(e.startAt);
      const end = e.endAt ? new Date(e.endAt) : start;
      return start < dayEnd && end >= dayStart;
    });
  };

  const goToToday = () => {
    const today = new Date();
    setCurrent(today);
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
          Calendar
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={goToToday}
            className="flex items-center gap-2 rounded-xl border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <CalendarDays className="h-4 w-4" />
            Today
          </button>
          <div className="flex items-center rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-1">
            <button
              type="button"
              onClick={() => setCurrent(subMonths(current, 1))}
              className="rounded-lg p-2 text-[var(--muted)] hover:bg-slate-100 hover:text-[var(--foreground)] dark:hover:bg-slate-700"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="min-w-[140px] text-center text-sm font-semibold text-[var(--foreground)]">
              {format(current, "MMMM yyyy")}
            </span>
            <button
              type="button"
              onClick={() => setCurrent(addMonths(current, 1))}
              className="rounded-lg p-2 text-[var(--muted)] hover:bg-slate-100 hover:text-[var(--foreground)] dark:hover:bg-slate-700"
              aria-label="Next month"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--card)]">
          <div className="grid grid-cols-7">
            {weekDays.map((w) => (
              <div
                key={w}
                className="border-b border-r border-[var(--card-border)] py-3 text-center text-xs font-medium text-[var(--muted)] last:border-r-0"
              >
                {w}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {Array.from({ length: 35 }).map((_, i) => (
              <div
                key={i}
                className="min-h-[88px] border-r border-b border-[var(--card-border)] p-2 last:border-r-0"
              >
                <div className="h-7 w-7 rounded-full bg-slate-200/50 dark:bg-slate-700/50" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--card)] shadow-sm">
          <div className="grid grid-cols-7 border-b border-[var(--card-border)]">
            {weekDays.map((w) => (
              <div
                key={w}
                className="border-r border-[var(--card-border)] py-3 text-center text-xs font-semibold uppercase tracking-wider text-[var(--muted)] last:border-r-0"
              >
                {w}
              </div>
            ))}
          </div>
          <div
            className="grid grid-cols-7"
            style={{ gridAutoRows: "minmax(100px, auto)" }}
          >
            {days.map((day, index) => {
              const dayEvents = getEventsForDay(day);
              const isCurrentMonth = isSameMonth(day, current);
              const isToday = isSameDay(day, new Date());
              const dateParam = format(day, "yyyy-MM-dd");
              const isLastInRow = (index + 1) % 7 === 0;
              return (
                <div
                  key={day.toISOString()}
                  className={`min-h-[100px] border-b border-r border-[var(--card-border)] p-2 ${
                    isLastInRow ? "border-r-0" : ""
                  } ${!isCurrentMonth ? "bg-slate-50/70 dark:bg-slate-900/20" : ""}`}
                >
                  <Link
                    href={`/dashboard?date=${dateParam}`}
                    className={`mb-1 flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition ${
                      isToday
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30 hover:bg-indigo-600 hover:text-white"
                        : isCurrentMonth
                          ? "text-[var(--foreground)] hover:bg-indigo-100 hover:text-indigo-700 dark:hover:bg-indigo-900/40"
                          : "text-[var(--muted)] hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    {format(day, "d")}
                  </Link>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((e) => (
                      <Link
                        key={e.id}
                        href={`/dashboard?eventId=${e.id}`}
                        className="block truncate rounded-lg bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-800 hover:bg-indigo-100 dark:bg-indigo-900/40 dark:text-indigo-200 dark:hover:bg-indigo-900/60"
                      >
                        {e.title}
                      </Link>
                    ))}
                    {dayEvents.length > 3 && (
                      <Link
                        href={`/dashboard?date=${dateParam}`}
                        className="block px-2 text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
                      >
                        +{dayEvents.length - 3} more
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
