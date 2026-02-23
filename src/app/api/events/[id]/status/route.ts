import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { events, eventParticipants } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

const statusSchema = z.enum(["upcoming", "attending", "maybe", "declined"]);

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: eventId } = await params;
  const body = await req.json();
  const parsed = statusSchema.safeParse(body.status ?? body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid status. Use: upcoming, attending, maybe, declined" },
      { status: 400 }
    );
  }
  const status = parsed.data;
  const db = getDb();
  const [event] = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }
  await db
    .insert(eventParticipants)
    .values({
      eventId,
      userId: session.user.id,
      status,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [eventParticipants.eventId, eventParticipants.userId],
      set: { status, updatedAt: new Date() },
    });
  return NextResponse.json({ status });
}
