import { NextResponse } from "next/server";

export async function GET() {
  const feed = process.env.VIP_CAPACITY_FEED_URL;
  if (feed) {
    try {
      const response = await fetch(feed, { cache: "no-store" });
      const data = response.ok ? await response.json() : null;
      const remaining = Number(data?.remaining);
      if (Number.isFinite(remaining)) {
        return NextResponse.json({ remaining: Math.max(0, Math.min(500, remaining)) });
      }
    } catch {
      // Fall through to the configured count.
    }
  }

  const configured = Number(process.env.VIP_REMAINING_COUNT);
  return NextResponse.json({
    remaining: Number.isFinite(configured) ? Math.max(0, Math.min(500, configured)) : null,
  });
}
