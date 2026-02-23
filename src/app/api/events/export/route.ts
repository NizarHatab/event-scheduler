import { format } from "date-fns";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { events, eventParticipants } from "@/lib/db/schema";
import { and, eq, or, desc } from "drizzle-orm";

function escapeIcal(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }
  const db = getDb();
  const all = await db
    .select({ event: events, status: eventParticipants.status })
    .from(events)
    .leftJoin(
      eventParticipants,
      and(
        eq(events.id, eventParticipants.eventId),
        eq(eventParticipants.userId, session.user.id)
      )
    )
    .where(or(eq(events.createdById, session.user.id), eq(eventParticipants.userId, session.user.id)))
    .orderBy(desc(events.startAt));

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Event Scheduler//EN",
    "CALSCALE:GREGORIAN",
  ];

  for (const { event } of all) {
    const start = new Date(event.startAt);
    const end = event.endAt ? new Date(event.endAt) : new Date(start.getTime() + 60 * 60 * 1000);
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${event.id}@event-scheduler`);
    lines.push(`DTSTAMP:${format(new Date(), "yyyyMMdd'T'HHmmss'Z'")}`);
    lines.push(`DTSTART:${format(start, "yyyyMMdd'T'HHmmss")}`);
    lines.push(`DTEND:${format(end, "yyyyMMdd'T'HHmmss")}`);
    lines.push(`SUMMARY:${escapeIcal(event.title)}`);
    if (event.description) lines.push(`DESCRIPTION:${escapeIcal(event.description)}`);
    if (event.location) lines.push(`LOCATION:${escapeIcal(event.location)}`);
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");
  const ical = lines.join("\r\n");

  return new Response(ical, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="events.ics"',
    },
  });
}
