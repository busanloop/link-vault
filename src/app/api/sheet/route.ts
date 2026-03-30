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

    const jsonBody = JSON.stringify(payload);

    // Apps Script는 302 리다이렉트를 하므로 수동으로 처리
    let res = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(jsonBody).toString(),
      },
      body: jsonBody,
      redirect: "manual",
    });

    // 리다이렉트 응답이면 새 URL로 다시 POST
    if (res.status === 302 || res.status === 301 || res.status === 307) {
      const redirectUrl = res.headers.get("location");
      if (redirectUrl) {
        res = await fetch(redirectUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(jsonBody).toString(),
          },
          body: jsonBody,
          redirect: "follow",
        });
      }
    }

    const text = await res.text();
    try {
      const result = JSON.parse(text);
      return NextResponse.json(result);
    } catch {
      // JSON 파싱 실패해도 시트에 저장은 됐을 수 있음
      return NextResponse.json({ result: "ok", raw: text });
    }
  } catch (err) {
    console.error("Sheet API error:", err);
    return NextResponse.json({ error: "Failed to save to sheet" }, { status: 500 });
  }
}
