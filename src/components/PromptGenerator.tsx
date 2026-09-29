"use client";

import { useState } from "react";

interface PromptResult {
  prompts: Array<{
    generator: string;
    prompt: string;
    negativePrompt?: string;
    parameters?: string;
  }>;
  compositionTips: string[];
  textOverlay: {
    suggested: string;
    font: string;
    placement: string;
    color: string;
  };
}

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  styleAnalysis: Record<string, any>;
  apiKey: string;
}

export default function PromptGenerator({ styleAnalysis, apiKey }: Props) {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PromptResult | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({
          action: "generate",
          styleAnalysis,
          topic: topic.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-3">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && generate()}
          placeholder="Тема видео, например: 'Топ 10 ошибок новичков в Python'"
          className="flex-1 bg-card border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted focus:outline-none focus:border-accent"
        />
        <button
          onClick={generate}
          disabled={loading || !topic.trim()}
          className="px-6 py-3 bg-accent hover:bg-accent/80 disabled:opacity-50 rounded-lg font-medium transition-colors whitespace-nowrap"
        >
          {loading ? "Генерирую..." : "Создать промпт"}
        </button>
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/30 rounded-lg p-4 text-danger">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          {result.prompts.map((p, i) => (
            <div
              key={i}
              className="bg-card rounded-xl border border-border p-6 space-y-3"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-accent-light">
                  {p.generator}
                </h4>
                <button
                  onClick={() =>
                    copyToClipboard(
                      p.prompt + (p.parameters ? " " + p.parameters : ""),
                      `prompt-${i}`
                    )
                  }
                  className="text-sm text-muted hover:text-foreground transition-colors"
                >
                  {copied === `prompt-${i}` ? "Скопировано!" : "Копировать"}
                </button>
              </div>
              <pre className="text-sm whitespace-pre-wrap bg-background rounded-lg p-4 border border-border">
                {p.prompt}
                {p.parameters && (
                  <span className="text-accent-light">
                    {"\n\n"}
                    {p.parameters}
                  </span>
                )}
              </pre>
              {p.negativePrompt && (
                <div>
                  <span className="text-xs text-muted">Negative prompt:</span>
                  <pre className="text-xs whitespace-pre-wrap text-muted mt-1">
                    {p.negativePrompt}
                  </pre>
                </div>
              )}
            </div>
          ))}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card rounded-xl border border-border p-6">
              <h4 className="font-semibold mb-3">Советы по композиции</h4>
              <ul className="space-y-1.5 text-sm">
                {result.compositionTips.map((tip, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-accent-light shrink-0">-</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-card rounded-xl border border-border p-6">
              <h4 className="font-semibold mb-3">Текст на превью</h4>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-muted">Текст</dt>
                  <dd className="font-medium">{result.textOverlay.suggested}</dd>
                </div>
                <div>
                  <dt className="text-muted">Шрифт</dt>
                  <dd>{result.textOverlay.font}</dd>
                </div>
                <div>
                  <dt className="text-muted">Расположение</dt>
                  <dd>{result.textOverlay.placement}</dd>
                </div>
                <div className="flex items-center gap-2">
                  <dt className="text-muted">Цвет</dt>
                  <dd className="flex items-center gap-2">
                    <div
                      className="w-5 h-5 rounded border border-border"
                      style={{ backgroundColor: result.textOverlay.color }}
                    />
                    {result.textOverlay.color}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
