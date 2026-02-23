import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";

const bodySchema = z.object({
  prompt: z.string().min(1).max(500),
  type: z.enum(["title", "description", "location"]).optional(),
});

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
  const { prompt, type } = parsed.data;
  const apiKey = process.env.OPENAI_API_KEY;

  if (apiKey) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You are a helpful event planning assistant. Respond with only the suggested text, no quotes or explanation. Keep it concise.",
            },
            {
              role: "user",
              content:
                type === "title"
                  ? `Suggest a short event title for: ${prompt}`
                  : type === "description"
                    ? `Suggest a brief event description for: ${prompt}`
                    : type === "location"
                      ? `Suggest a location (place name or address) for: ${prompt}`
                      : `Suggest event details (title, one-line description, and location) for: ${prompt}. Format as JSON: {"title":"...","description":"...","location":"..."}`,
            },
          ],
          max_tokens: 150,
        }),
      });
      const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
      const text = data.choices?.[0]?.message?.content?.trim();
      if (text) {
        if (!type && text.startsWith("{")) {
          try {
            const json = JSON.parse(text) as { title?: string; description?: string; location?: string };
            return NextResponse.json({ suggestion: json });
          } catch {
            return NextResponse.json({ suggestion: { title: text, description: "", location: "" } });
          }
        }
        return NextResponse.json({ suggestion: text });
      }
    } catch (e) {
      console.error("OpenAI error:", e);
    }
  }

  const lower = prompt.toLowerCase();
  const fallbackTitle =
    type === "title"
      ? prompt.slice(0, 60) || "New Event"
      : type === "description"
        ? `Join us for ${prompt}.`
        : type === "location"
          ? prompt
          : null;
  const fallbackDescription =
    type === "description" ? prompt : type !== "location" ? `Event: ${prompt}` : "";
  const fallbackLocation =
    type === "location"
      ? prompt
      : /meeting|office|room|conference|zoom|call/.test(lower)
        ? "Conference Room / Video Call"
        : /party|dinner|restaurant|bar/.test(lower)
          ? "TBD - Venue"
          : "";
  if (type) {
    return NextResponse.json({
      suggestion:
        type === "title"
          ? fallbackTitle
          : type === "description"
            ? fallbackDescription
            : fallbackLocation,
    });
  }
  return NextResponse.json({
    suggestion: {
      title: fallbackTitle ?? prompt.slice(0, 60) ?? "New Event",
      description: fallbackDescription || `Event: ${prompt}`,
      location: fallbackLocation || "",
    },
  });
}
