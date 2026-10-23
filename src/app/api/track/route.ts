import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Fire-and-forget open notification. The client POSTs `{ store }` when a shared
 * demo link is opened; we ping a Slack/Discord webhook (if configured) so a
 * salesperson knows a prospect just opened the demo. Never blocks or throws to
 * the client — a tracking failure must not affect the demo.
 */
export async function POST(req: Request) {
  try {
    const webhook = process.env.ALERT_WEBHOOK_URL;
    // Read the store even when unconfigured so the client contract stays stable.
    let store = "";
    try {
      store = String(((await req.json()) as { store?: string })?.store || "").slice(0, 120);
    } catch {
      /* empty / invalid body — still no-op safely */
    }
    if (!webhook || !store) return NextResponse.json({ ok: true });

    const h = req.headers;
    const city = h.get("x-vercel-ip-city");
    const country = h.get("x-vercel-ip-country");
    const loc = [city ? decodeURIComponent(city) : null, country].filter(Boolean).join(", ");
    let referrerHost = "";
    const ref = h.get("referer");
    if (ref) {
      try {
        referrerHost = new URL(ref).host;
      } catch {
        /* ignore malformed referrer */
      }
    }
    // Show the time in the VISITOR's own timezone (from their IP), falling back to
    // IST when Vercel can't resolve it (e.g. local dev).
    const tz = h.get("x-vercel-ip-timezone") || "Asia/Kolkata";
    let when: string;
    try {
      when = new Date().toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: tz,
      }) + ` (${tz})`;
    } catch {
      when = new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
    }

    const parts = [
      `📬 Demo opened — *${store}*`,
      loc ? `📍 ${loc}` : null,
      `🕒 ${when}`,
      referrerHost ? `🔗 ${referrerHost}` : null,
    ].filter(Boolean);
    const message = parts.join("  ·  ");

    // Send BOTH keys so the same URL works for Slack (`text`) and Discord (`content`).
    await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: message, content: message }),
    }).catch(() => {});

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
