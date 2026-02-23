import { NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { events, invitations, users } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

const inviteSchema = z.object({
  eventId: z.string(),
  email: z.string().email(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const parsed = inviteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { eventId, email } = parsed.data;
    const db = getDb();
    const [event] = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
    if (!event || event.createdById !== session.user.id) {
      return NextResponse.json({ error: "Event not found or access denied" }, { status: 404 });
    }
    const token = nanoid(32);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await db.insert(invitations).values({
      id: nanoid(),
      eventId,
      email: email.toLowerCase(),
      invitedById: session.user.id,
      token,
      expiresAt,
    });
    const inviteLink = `${process.env.NEXTAUTH_URL ?? ""}/invite/${token}`;
    return NextResponse.json({ token, inviteLink, expiresAt });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to create invitation." },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get("eventId");
  const db = getDb();
  if (eventId) {
    const [event] = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
    if (!event || event.createdById !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const list = await db
      .select()
      .from(invitations)
      .where(eq(invitations.eventId, eventId));
    return NextResponse.json(list);
  }
  const received = await db
    .select()
    .from(invitations)
    .where(eq(invitations.email, session.user.email ?? ""));
  return NextResponse.json(received);
}
