import { NextResponse } from "next/server";

export async function GET() {
  const feed = process.env.VIP_ACTIVITY_FEED_URL;
  if (!feed) return NextResponse.json({ joiners: [] });

  try {
    const response = await fetch(feed, {
      headers: process.env.VIP_ACTIVITY_FEED_TOKEN
        ? { Authorization: `Bearer ${process.env.VIP_ACTIVITY_FEED_TOKEN}` }
        : undefined,
      cache: "no-store",
    });
    if (!response.ok) return NextResponse.json({ joiners: [] });
    const data = await response.json();
    const joiners = Array.isArray(data.joiners)
      ? data.joiners
          .filter((item: { consent?: boolean }) => item.consent === true)
          .slice(0, 20)
      : [];
    return NextResponse.json({ joiners });
  } catch {
    return NextResponse.json({ joiners: [] });
  }
}
