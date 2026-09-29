"use client";

import { useState } from "react";

interface Thumbnail {
  videoId: string;
  title: string;
  url: string;
}

interface Props {
  onThumbnailsFetched: (thumbnails: Thumbnail[]) => void;
}

export default function YouTubeFetcher({ onThumbnailsFetched }: Props) {
  const [channelUrl, setChannelUrl] = useState("");
  const [ytApiKey, setYtApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showApiInput, setShowApiInput] = useState(false);

  const fetchThumbnails = async () => {
    if (!channelUrl.trim() || !ytApiKey.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelUrl: channelUrl.trim(), apiKey: ytApiKey.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onThumbnailsFetched(data.thumbnails);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Загрузить с YouTube</h3>
        <button
          onClick={() => setShowApiInput(!showApiInput)}
          className="text-sm text-accent-light hover:underline"
        >
          {showApiInput ? "Скрыть" : "Настроить API"}
        </button>
      </div>

      {showApiInput && (
        <div className="space-y-2">
          <input
            type="password"
            value={ytApiKey}
            onChange={(e) => setYtApiKey(e.target.value)}
            placeholder="YouTube Data API v3 ключ"
            className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent"
          />
          <p className="text-xs text-muted">
            Получить ключ:{" "}
            <span className="text-accent-light">
              Google Cloud Console &rarr; APIs &rarr; YouTube Data API v3 &rarr; Credentials
            </span>
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <input
          type="text"
          value={channelUrl}
          onChange={(e) => setChannelUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchThumbnails()}
          placeholder="Ссылка на YouTube-канал или @username"
          className="flex-1 bg-background border border-border rounded-lg px-4 py-2 text-foreground placeholder:text-muted focus:outline-none focus:border-accent"
        />
        <button
          onClick={fetchThumbnails}
          disabled={loading || !channelUrl.trim() || !ytApiKey.trim()}
          className="px-5 py-2 bg-accent hover:bg-accent/80 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
        >
          {loading ? "Загружаю..." : "Загрузить"}
        </button>
      </div>

      {!ytApiKey && (
        <p className="text-xs text-muted">
          Нажми &quot;Настроить API&quot; и вставь YouTube API ключ, чтобы автоматически загружать превью.
        </p>
      )}

      {error && (
        <div className="text-danger text-sm">{error}</div>
      )}
    </div>
  );
}
