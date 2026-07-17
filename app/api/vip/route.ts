import { NextRequest, NextResponse } from "next/server";

const required = ["journey", "outcome", "firstName", "lastName", "email", "phone", "businessType", "city", "country"] as const;

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Please check your details." }, { status: 400 });
  }

  if (body.companyWebsite) {
    return NextResponse.json({ ok: true });
  }

  for (const field of required) {
    if (typeof body[field] !== "string" || !body[field].trim()) {
      return NextResponse.json({ error: `Please complete ${field}.` }, { status: 400 });
    }
  }

  if (!/^\S+@\S+\.\S+$/.test(body.email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const webhook = process.env.GHL_VIP_WEBHOOK_URL;
  if (!webhook) {
    return NextResponse.json(
      { error: "The VIP form is in preview mode while the CRM connection is completed." },
      { status: 503 },
    );
  }

  const response = await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...body,
      source: "awaretrepreneur-native-vip-page",
      submittedAt: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    return NextResponse.json({ error: "We couldn't reserve your place just now. Please try again." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
