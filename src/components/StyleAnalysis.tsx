"use client";

interface StyleData {
  channelStyle: {
    overallAesthetic: string;
    colorPalette: {
      primary: string[];
      accent: string[];
      background: string[];
      text: string[];
    };
    typography: {
      style: string;
      placement: string;
      effects: string;
      casing: string;
    };
    composition: {
      layout: string;
      focalPoint: string;
      backgroundStyle: string;
      facesUsed: boolean;
      faceExpression: string;
    };
    visualElements: {
      icons: string;
      overlays: string;
      borders: string;
      branding: string;
    };
    mood: string;
    clickbaitLevel: string;
  };
  patterns: string[];
  uniqueTraits: string[];
}

interface Props {
  analysis: StyleData;
}

function ColorSwatches({ colors, label }: { colors: string[]; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted text-sm w-24 shrink-0">{label}</span>
      <div className="flex gap-1.5 flex-wrap">
        {colors.map((color, i) => (
          <div key={i} className="group relative">
            <div className="color-swatch" style={{ backgroundColor: color }} />
            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs bg-card px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-border">
              {color}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function StyleAnalysis({ analysis }: Props) {
  const { channelStyle, patterns, uniqueTraits } = analysis;

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-lg font-semibold mb-3">Общий стиль</h3>
        <p className="text-muted">{channelStyle.overallAesthetic}</p>
        <div className="mt-3 flex gap-3">
          <span className="px-3 py-1 rounded-full bg-accent/20 text-accent-light text-sm">
            {channelStyle.mood}
          </span>
          <span className="px-3 py-1 rounded-full bg-accent/20 text-accent-light text-sm">
            Clickbait: {channelStyle.clickbaitLevel}
          </span>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-lg font-semibold mb-4">Цветовая палитра</h3>
        <div className="space-y-3">
          <ColorSwatches colors={channelStyle.colorPalette.primary} label="Основные" />
          <ColorSwatches colors={channelStyle.colorPalette.accent} label="Акценты" />
          <ColorSwatches colors={channelStyle.colorPalette.background} label="Фон" />
          <ColorSwatches colors={channelStyle.colorPalette.text} label="Текст" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-lg font-semibold mb-3">Типографика</h3>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-muted">Стиль</dt>
              <dd>{channelStyle.typography.style}</dd>
            </div>
            <div>
              <dt className="text-muted">Расположение</dt>
              <dd>{channelStyle.typography.placement}</dd>
            </div>
            <div>
              <dt className="text-muted">Эффекты</dt>
              <dd>{channelStyle.typography.effects}</dd>
            </div>
            <div>
              <dt className="text-muted">Регистр</dt>
              <dd>{channelStyle.typography.casing}</dd>
            </div>
          </dl>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-lg font-semibold mb-3">Композиция</h3>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-muted">Макет</dt>
              <dd>{channelStyle.composition.layout}</dd>
            </div>
            <div>
              <dt className="text-muted">Фокус</dt>
              <dd>{channelStyle.composition.focalPoint}</dd>
            </div>
            <div>
              <dt className="text-muted">Фон</dt>
              <dd>{channelStyle.composition.backgroundStyle}</dd>
            </div>
            <div>
              <dt className="text-muted">Лица</dt>
              <dd>
                {channelStyle.composition.facesUsed
                  ? channelStyle.composition.faceExpression
                  : "Не используются"}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-lg font-semibold mb-3">Визуальные элементы</h3>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-muted">Иконки / символы</dt>
            <dd>{channelStyle.visualElements.icons}</dd>
          </div>
          <div>
            <dt className="text-muted">Оверлеи</dt>
            <dd>{channelStyle.visualElements.overlays}</dd>
          </div>
          <div>
            <dt className="text-muted">Рамки</dt>
            <dd>{channelStyle.visualElements.borders}</dd>
          </div>
          <div>
            <dt className="text-muted">Брендинг</dt>
            <dd>{channelStyle.visualElements.branding}</dd>
          </div>
        </dl>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-lg font-semibold mb-3">Паттерны</h3>
          <ul className="space-y-1.5 text-sm">
            {patterns.map((p, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-accent-light shrink-0">-</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-lg font-semibold mb-3">Уникальные черты</h3>
          <ul className="space-y-1.5 text-sm">
            {uniqueTraits.map((t, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-success shrink-0">-</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
