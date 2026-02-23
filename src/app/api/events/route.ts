import { NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { events, eventParticipants } from "@/lib/db/schema";
import { and, eq, gte, lte, or, sql, desc } from "drizzle-orm";

const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  location: z.string().optional(),
  startAt: z.string().datetime().or(z.coerce.date()),
  endAt: z.string().datetime().or(z.coerce.date()).optional(),
});

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? undefined;
  const from = searchParams.get("from") ?? undefined;
  const to = searchParams.get("to") ?? undefined;
  const location = searchParams.get("location") ?? undefined;
  const status = searchParams.get("status") ?? undefined;

  const db = getDb();
  const conditions = [
    eq(events.createdById, session.user.id),
    sql`EXISTS (SELECT 1 FROM event_participants WHERE event_participants.event_id = events.id AND event_participants.user_id = ${session.user.id})`,
  ];

  const all = await db
    .select({
      event: events,
      status: eventParticipants.status,
    })
    .from(events)
    .leftJoin(
      eventParticipants,
      and(
        eq(events.id, eventParticipants.eventId),
        eq(eventParticipants.userId, session.user.id)
      )
    )
    .where(or(...conditions))
    .orderBy(desc(events.startAt));

  let filtered = all.map((r) => ({ ...r.event, myStatus: r.status ?? "upcoming" as const }));

  if (q) {
    const lower = q.toLowerCase();
    filtered = filtered.filter(
      (e) =>
        e.title.toLowerCase().includes(lower) ||
        (e.description?.toLowerCase().includes(lower)) ||
        (e.location?.toLowerCase().includes(lower))
    );
  }
  if (from) {
    const fromDate = new Date(from).getTime();
    filtered = filtered.filter((e) => e.startAt && new Date(e.startAt).getTime() >= fromDate);
  }
  if (to) {
    const toDate = new Date(to).getTime();
    filtered = filtered.filter((e) => e.startAt && new Date(e.startAt).getTime() <= toDate);
  }
  if (location) {
    const loc = location.toLowerCase();
    filtered = filtered.filter((e) => e.location?.toLowerCase().includes(loc));
  }
  if (status) {
    filtered = filtered.filter((e) => e.myStatus === status);
  }

  return NextResponse.json(filtered);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { title, description, location, startAt, endAt } = parsed.data;
    const db = getDb();
    const id = nanoid();
    const start = new Date(startAt);
    const end = endAt ? new Date(endAt) : null;
    await db.insert(events).values({
      id,
      title,
      description: description ?? null,
      location: location ?? null,
      startAt: start,
      endAt: end,
      createdById: session.user.id,
    });
    await db.insert(eventParticipants).values({
      eventId: id,
      userId: session.user.id,
      status: "attending",
    });
    const [created] = await db.select().from(events).where(eq(events.id, id));
    return NextResponse.json({
      ...created,
      myStatus: "attending" as const,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to create event." },
      { status: 500 }
    );
  }
}
