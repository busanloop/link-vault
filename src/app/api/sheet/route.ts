import { NextRequest, NextResponse } from "next/server";

const APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL;

export async function POST(request: NextRequest) {
  if (!APPS_SCRIPT_URL) {
    return NextResponse.json({ error: "Google Apps Script URL not configured" }, { status: 500 });
  }

  try {
    const body = await request.json();

    const payload = {
      url: body.url || "",
      title: body.title || "",
      description: body.description || "",
      category: body.category || "",
      tags: Array.isArray(body.tags) ? body.tags.join(", ") : "",
      memo: body.memo || "",
      createdAt: body.createdAt || new Date().toISOString(),
    };

    const res = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      redirect: "follow",
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Apps Script error:", text);
      return NextResponse.json({ error: "Failed to save to sheet" }, { status: 502 });
    }

    const result = await res.json();
    return NextResponse.json(result);
  } catch (err) {
    console.error("Sheet API error:", err);
    return NextResponse.json({ error: "Failed to save to sheet" }, { status: 500 });
  }
}
