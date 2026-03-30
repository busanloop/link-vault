import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      signal: controller.signal,
      redirect: "follow",
    });

    clearTimeout(timeout);

    const html = await res.text();

    const title = extractMeta(html, "og:title") || extractTitle(html) || "";
    const description = extractMeta(html, "og:description") || extractMetaName(html, "description") || "";
    const image = extractMeta(html, "og:image") || "";

    const parsedUrl = new URL(url);
    const favicon =
      extractFavicon(html, parsedUrl.origin) ||
      `${parsedUrl.origin}/favicon.ico`;

    return NextResponse.json({
      title,
      description,
      image: image.startsWith("//") ? `https:${image}` : image,
      favicon,
    });
  } catch {
    return NextResponse.json(
      { title: "", description: "", image: "", favicon: "" },
      { status: 200 }
    );
  }
}

function extractMeta(html: string, property: string): string {
  const regex = new RegExp(
    `<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']*)["']`,
    "i"
  );
  const match = html.match(regex);
  if (match) return match[1];

  const regex2 = new RegExp(
    `<meta[^>]*content=["']([^"']*)["'][^>]*property=["']${property}["']`,
    "i"
  );
  const match2 = html.match(regex2);
  return match2 ? match2[1] : "";
}

function extractMetaName(html: string, name: string): string {
  const regex = new RegExp(
    `<meta[^>]*name=["']${name}["'][^>]*content=["']([^"']*)["']`,
    "i"
  );
  const match = html.match(regex);
  if (match) return match[1];

  const regex2 = new RegExp(
    `<meta[^>]*content=["']([^"']*)["'][^>]*name=["']${name}["']`,
    "i"
  );
  const match2 = html.match(regex2);
  return match2 ? match2[1] : "";
}

function extractTitle(html: string): string {
  const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return match ? match[1].trim() : "";
}

function extractFavicon(html: string, origin: string): string {
  const match = html.match(
    /<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']*)["']/i
  );
  if (!match) return "";
  const href = match[1];
  if (href.startsWith("http")) return href;
  if (href.startsWith("//")) return `https:${href}`;
  return `${origin}${href.startsWith("/") ? "" : "/"}${href}`;
}
