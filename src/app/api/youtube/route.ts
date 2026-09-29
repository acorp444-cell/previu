import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { channelUrl, apiKey } = await request.json();

    if (!apiKey) {
      return NextResponse.json(
        { error: "YouTube Data API key is required" },
        { status: 400 }
      );
    }

    const channelId = await resolveChannelId(channelUrl, apiKey);
    if (!channelId) {
      return NextResponse.json(
        { error: "Could not find channel. Check the URL." },
        { status: 404 }
      );
    }

    const thumbnails = await fetchChannelThumbnails(channelId, apiKey);
    return NextResponse.json({ thumbnails, channelId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function resolveChannelId(
  url: string,
  apiKey: string
): Promise<string | null> {
  const patterns = [
    /youtube\.com\/channel\/(UC[\w-]+)/,
    /youtube\.com\/@([\w.-]+)/,
    /youtube\.com\/c\/([\w.-]+)/,
    /youtube\.com\/user\/([\w.-]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      const id = match[1];
      if (id.startsWith("UC")) return id;

      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(id)}&key=${apiKey}`
      );
      const data = await res.json();
      if (data.items?.[0]) {
        return data.items[0].snippet.channelId;
      }
    }
  }

  if (url.startsWith("UC")) return url;

  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(url)}&key=${apiKey}`
  );
  const data = await res.json();
  return data.items?.[0]?.snippet?.channelId || null;
}

async function fetchChannelThumbnails(channelId: string, apiKey: string) {
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&order=date&maxResults=20&key=${apiKey}`
  );
  const data = await res.json();

  if (!data.items) return [];

  return data.items.map(
    (item: {
      id: { videoId: string };
      snippet: {
        title: string;
        thumbnails: {
          maxres?: { url: string };
          high?: { url: string };
          medium?: { url: string };
        };
      };
    }) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      url:
        item.snippet.thumbnails.maxres?.url ||
        item.snippet.thumbnails.high?.url ||
        item.snippet.thumbnails.medium?.url ||
        "",
    })
  );
}
