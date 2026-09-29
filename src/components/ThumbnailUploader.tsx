"use client";

import { useCallback, useState } from "react";

interface ThumbnailImage {
  id: string;
  data: string;
  mediaType: string;
  preview: string;
  name: string;
}

interface Props {
  images: ThumbnailImage[];
  onImagesChange: (images: ThumbnailImage[]) => void;
}

export default function ThumbnailUploader({ images, onImagesChange }: Props) {
  const [dragOver, setDragOver] = useState(false);

  const processFiles = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files).filter((f) =>
        f.type.startsWith("image/")
      );

      Promise.all(
        fileArray.map(
          (file) =>
            new Promise<ThumbnailImage>((resolve) => {
              const reader = new FileReader();
              reader.onload = () => {
                const result = reader.result as string;
                const base64 = result.split(",")[1];
                resolve({
                  id: crypto.randomUUID(),
                  data: base64,
                  mediaType: file.type as string,
                  preview: result,
                  name: file.name,
                });
              };
              reader.readAsDataURL(file);
            })
        )
      ).then((newImages) => {
        onImagesChange([...images, ...newImages]);
      });
    },
    [images, onImagesChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      processFiles(e.dataTransfer.files);
    },
    [processFiles]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const files = Array.from(e.clipboardData.items)
        .filter((item) => item.type.startsWith("image/"))
        .map((item) => item.getAsFile())
        .filter((f): f is File => f !== null);
      if (files.length > 0) processFiles(files);
    },
    [processFiles]
  );

  const removeImage = (id: string) => {
    onImagesChange(images.filter((img) => img.id !== id));
  };

  return (
    <div className="space-y-4">
      <div
        className={`drop-zone rounded-xl p-8 text-center cursor-pointer ${dragOver ? "drag-over" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onPaste={handlePaste}
        onClick={() => document.getElementById("file-input")?.click()}
      >
        <input
          id="file-input"
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files && processFiles(e.target.files)}
        />
        <div className="text-muted space-y-2">
          <svg
            className="mx-auto h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-lg">
            Перетащи превью сюда или нажми для загрузки
          </p>
          <p className="text-sm">PNG, JPG, WebP. Можно несколько файлов.</p>
        </div>
      </div>

      {images.length > 0 && (
        <div className="thumbnail-grid">
          {images.map((img) => (
            <div
              key={img.id}
              className="relative group rounded-lg overflow-hidden bg-card border border-border"
            >
              <img
                src={img.preview}
                alt={img.name}
                className="w-full aspect-video object-cover"
              />
              <button
                onClick={() => removeImage(img.id)}
                className="absolute top-2 right-2 bg-danger/80 hover:bg-danger text-white rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-sm"
              >
                X
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1 text-xs truncate">
                {img.name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
