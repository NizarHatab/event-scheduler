import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { events, eventParticipants } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  startAt: z.string().datetime().or(z.coerce.date()).optional(),
  endAt: z.string().datetime().or(z.coerce.date()).optional(),
});

async function canEdit(eventId: string, userId: string) {
  const db = getDb();
  const [e] = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
  return e?.createdById === userId;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const db = getDb();
  const [event] = await db.select().from(events).where(eq(events.id, id)).limit(1);
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }
  const [part] = await db
    .select()
    .from(eventParticipants)
    .where(
      and(
        eq(eventParticipants.eventId, id),
        eq(eventParticipants.userId, session.user.id)
      )
    )
    .limit(1);
  return NextResponse.json({
    ...event,
    myStatus: part?.status ?? "upcoming",
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  if (!(await canEdit(id, session.user.id))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const db = getDb();
    const updates: Record<string, unknown> = {
      updatedAt: new Date(),
    };
    if (parsed.data.title != null) updates.title = parsed.data.title;
    if (parsed.data.description != null) updates.description = parsed.data.description;
    if (parsed.data.location != null) updates.location = parsed.data.location;
    if (parsed.data.startAt != null) updates.startAt = new Date(parsed.data.startAt);
    if (parsed.data.endAt != null) updates.endAt = new Date(parsed.data.endAt);
    await db.update(events).set(updates as typeof events.$inferInsert).where(eq(events.id, id));
    const [updated] = await db.select().from(events).where(eq(events.id, id));
    return NextResponse.json(updated);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to update event." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  if (!(await canEdit(id, session.user.id))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const db = getDb();
  await db.delete(events).where(eq(events.id, id));
  return new NextResponse(null, { status: 204 });
}
