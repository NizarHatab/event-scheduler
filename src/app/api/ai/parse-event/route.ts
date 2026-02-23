import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import {
  addDays,
  addHours,
  setHours,
  setMinutes,
  nextMonday,
  nextTuesday,
  nextWednesday,
  nextThursday,
  nextFriday,
  nextSaturday,
  nextSunday,
  isToday,
} from "date-fns";

const bodySchema = z.object({
  text: z.string().min(1).max(500),
});

const DAY_NAMES =
  /(?:next\s+)?(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)/i;
const TIME = /(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i;
const TOMORROW = /tomorrow/i;
const TODAY = /today/i;

function parseTime(str: string, ref: Date): Date {
  const m = str.match(TIME);
  if (!m) return ref;
  let h = parseInt(m[1], 10);
  const min = m[2] ? parseInt(m[2], 10) : 0;
  const period = (m[3] || "").toLowerCase();
  if (period === "pm" && h < 12) h += 12;
  if (period === "am" && h === 12) h = 0;
  if (!period && h <= 7) h += 12;
  return setMinutes(setHours(ref, h), min);
}

function parseDateFromText(text: string, ref: Date): Date {
  const lower = text.toLowerCase();
  if (TOMORROW.test(lower)) return addDays(ref, 1);
  if (TODAY.test(lower)) return ref;
  const dayMatch = lower.match(DAY_NAMES);
  if (dayMatch) {
    const day = dayMatch[1].toLowerCase();
    const next = ref;
    const map: Record<string, () => Date> = {
      monday: () => nextMonday(next),
      mon: () => nextMonday(next),
      tuesday: () => nextTuesday(next),
      tue: () => nextTuesday(next),
      wednesday: () => nextWednesday(next),
      wed: () => nextWednesday(next),
      thursday: () => nextThursday(next),
      thu: () => nextThursday(next),
      friday: () => nextFriday(next),
      fri: () => nextFriday(next),
      saturday: () => nextSaturday(next),
      sat: () => nextSaturday(next),
      sunday: () => nextSunday(next),
      sun: () => nextSunday(next),
    };
    const fn = map[day];
    if (fn) return fn();
  }
  return ref;
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { text } = parsed.data;
  const now = new Date();
  const date = parseDateFromText(text, now);
  const time = parseTime(text, date);
  const title = text
    .replace(DAY_NAMES, "")
    .replace(TIME, "")
    .replace(TOMORROW, "")
    .replace(TODAY, "")
    .replace(/\s+/g, " ")
    .trim();
  const finalTitle = title.length > 0 ? title : "New Event";
  const startAt = time.getTime() <= now.getTime() && isToday(time)
    ? addHours(time, 24)
    : time;
  const endAt = addHours(startAt, 1);

  return NextResponse.json({
    title: finalTitle,
    startAt: startAt.toISOString(),
    endAt: endAt.toISOString(),
  });
}
