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

    // Apps Script는 text/plain으로 보내야 리다이렉트 시 body가 유지됨
    const res = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify(payload),
      redirect: "follow",
    });

    const text = await res.text();
    console.log("Sheet response status:", res.status, "body:", text.slice(0, 200));

    try {
      return NextResponse.json(JSON.parse(text));
    } catch {
      return NextResponse.json({ result: "sent" });
    }
  } catch (err) {
    console.error("Sheet API error:", err);
    return NextResponse.json({ error: "Failed to save to sheet" }, { status: 500 });
  }
}
