"use client";

import { useState, useCallback } from "react";
import ThumbnailUploader from "@/components/ThumbnailUploader";
import YouTubeFetcher from "@/components/YouTubeFetcher";
import StyleAnalysis from "@/components/StyleAnalysis";
import PromptGenerator from "@/components/PromptGenerator";

interface ThumbnailImage {
  id: string;
  data: string;
  mediaType: string;
  preview: string;
  name: string;
}

type Step = "upload" | "analysis" | "generate";

export default function Home() {
  const [images, setImages] = useState<ThumbnailImage[]>([]);
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [step, setStep] = useState<Step>("upload");
  const [analyzing, setAnalyzing] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [styleAnalysis, setStyleAnalysis] = useState<Record<string, any> | null>(null);
  const [error, setError] = useState("");

  const handleYouTubeThumbnails = useCallback(
    async (thumbnails: { url: string; title: string; videoId: string }[]) => {
      const newImages: ThumbnailImage[] = [];

      for (const thumb of thumbnails) {
        if (!thumb.url) continue;
        try {
          const res = await fetch(thumb.url);
          const blob = await res.blob();
          const reader = new FileReader();
          const result = await new Promise<string>((resolve) => {
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
          const base64 = result.split(",")[1];
          newImages.push({
            id: crypto.randomUUID(),
            data: base64,
            mediaType: "image/jpeg",
            preview: result,
            name: thumb.title,
          });
        } catch {
          // skip failed downloads
        }
      }

      setImages((prev) => [...prev, ...newImages]);
    },
    []
  );

  const analyzeStyle = async () => {
    if (images.length === 0 || !apiKey) return;
    setAnalyzing(true);
    setError("");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({
          action: "analyze",
          images: images.slice(0, 10).map((img) => ({
            data: img.data,
            mediaType: img.mediaType,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStyleAnalysis(data.analysis);
      setStep("analysis");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <header className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">
          <span className="text-accent-light">Previu</span>
        </h1>
        <p className="text-muted text-lg">
          Анализируй стиль превью YouTube-канала и генерируй промпты для новых
        </p>
      </header>

      {/* Steps indicator */}
      <div className="flex items-center justify-center gap-2 text-sm">
        {[
          { key: "upload" as Step, label: "1. Загрузка" },
          { key: "analysis" as Step, label: "2. Анализ" },
          { key: "generate" as Step, label: "3. Генерация" },
        ].map((s, i) => (
          <div key={s.key} className="flex items-center gap-2">
            {i > 0 && <div className="w-8 h-px bg-border" />}
            <button
              onClick={() => {
                if (s.key === "upload") setStep("upload");
                if (s.key === "analysis" && styleAnalysis) setStep("analysis");
                if (s.key === "generate" && styleAnalysis) setStep("generate");
              }}
              className={`px-3 py-1 rounded-full transition-colors ${
                step === s.key
                  ? "bg-accent text-white"
                  : styleAnalysis || s.key === "upload"
                    ? "bg-card text-muted hover:text-foreground border border-border"
                    : "bg-card/50 text-muted/50 border border-border/50 cursor-not-allowed"
              }`}
            >
              {s.label}
            </button>
          </div>
        ))}
      </div>

      {/* API Key */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-center gap-3">
          <label className="text-sm text-muted whitespace-nowrap">
            OpenAI API Key:
          </label>
          <input
            type={showApiKey ? "text" : "password"}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent"
          />
          <button
            onClick={() => setShowApiKey(!showApiKey)}
            className="text-xs text-muted hover:text-foreground"
          >
            {showApiKey ? "Скрыть" : "Показать"}
          </button>
        </div>
        {!apiKey && (
          <p className="text-xs text-muted mt-2">
            Нужен для анализа превью и генерации промптов через GPT-4o
          </p>
        )}
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/30 rounded-lg p-4 text-danger">
          {error}
        </div>
      )}

      {/* Step: Upload */}
      {step === "upload" && (
        <div className="space-y-6">
          <YouTubeFetcher onThumbnailsFetched={handleYouTubeThumbnails} />

          <div className="flex items-center gap-4 text-muted text-sm">
            <div className="flex-1 h-px bg-border" />
            <span>или загрузи вручную</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <ThumbnailUploader images={images} onImagesChange={setImages} />

          {images.length > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-muted text-sm">
                {images.length} превью загружено (макс. 10 для анализа)
              </span>
              <button
                onClick={analyzeStyle}
                disabled={analyzing || !apiKey}
                className="px-6 py-3 bg-accent hover:bg-accent/80 disabled:opacity-50 rounded-lg font-medium transition-colors"
              >
                {analyzing
                  ? "Анализирую стиль..."
                  : `Анализировать стиль (${Math.min(images.length, 10)} шт.)`}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step: Analysis */}
      {step === "analysis" && styleAnalysis && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Анализ стиля канала</h2>
            <button
              onClick={() => setStep("generate")}
              className="px-6 py-3 bg-accent hover:bg-accent/80 rounded-lg font-medium transition-colors"
            >
              Генерировать промпт &rarr;
            </button>
          </div>
          <StyleAnalysis analysis={styleAnalysis as any} />
        </div>
      )}

      {/* Step: Generate */}
      {step === "generate" && styleAnalysis && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Генерация промпта</h2>
          <p className="text-muted">
            Введи тему нового видео — я создам промпт для AI-генератора в стиле
            канала.
          </p>
          <PromptGenerator styleAnalysis={styleAnalysis} apiKey={apiKey} />
        </div>
      )}

      <footer className="text-center text-muted text-xs py-8 border-t border-border">
        Previu — анализ стиля YouTube-превью. Ключи API хранятся только в
        браузере.
      </footer>
    </main>
  );
}
