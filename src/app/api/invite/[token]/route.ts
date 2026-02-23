import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { events, eventParticipants, invitations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const db = getDb();
  const [inv] = await db
    .select()
    .from(invitations)
    .where(eq(invitations.token, token))
    .limit(1);
  if (!inv || inv.status !== "pending" || new Date() > inv.expiresAt) {
    return NextResponse.json({ error: "Invitation invalid or expired" }, { status: 404 });
  }
  const [event] = await db.select().from(events).where(eq(events.id, inv.eventId)).limit(1);
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }
  return NextResponse.json({
    invitationId: inv.id,
    eventId: inv.eventId,
    eventTitle: event.title,
    eventStartAt: event.startAt,
    email: inv.email,
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const body = await req.json().catch(() => ({}));
  const status = body.status === "declined" ? "declined" : "attending";
  const db = getDb();
  const [inv] = await db
    .select()
    .from(invitations)
    .where(eq(invitations.token, token))
    .limit(1);
  if (!inv || inv.status !== "pending" || new Date() > inv.expiresAt) {
    return NextResponse.json({ error: "Invitation invalid or expired" }, { status: 404 });
  }

  if (status === "declined") {
    await db
      .update(invitations)
      .set({ status: "declined" })
      .where(eq(invitations.id, inv.id));
    return NextResponse.json({ accepted: false });
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Please sign in to accept this invitation" }, { status: 401 });
  }
  if (inv.email.toLowerCase() !== (session.user.email ?? "").toLowerCase()) {
    return NextResponse.json({ error: "This invitation was sent to a different email" }, { status: 403 });
  }
  await db
    .update(invitations)
    .set({ status: "accepted" })
    .where(eq(invitations.id, inv.id));
  await db
    .insert(eventParticipants)
    .values({
      eventId: inv.eventId,
      userId: session.user.id,
      status: "attending",
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [eventParticipants.eventId, eventParticipants.userId],
      set: { status: "attending", updatedAt: new Date() },
    });
  return NextResponse.json({ accepted: true });
}
