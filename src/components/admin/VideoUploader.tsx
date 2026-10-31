"use client";

import { useRef, useState } from "react";
import { Spinner } from "@/components/ui/Button";

export type UploadResult = {
  key: string;
  thumbnailDataUrl: string | null;
  durationSec: number;
  filename: string;
};

type Props = { onComplete: (r: UploadResult) => void; onReset?: () => void };

const ACCEPT = "video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov";

async function captureThumbnail(file: File): Promise<{ dataUrl: string | null; duration: number }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.src = url;
    const done = (dataUrl: string | null) => {
      const duration = Number.isFinite(video.duration) ? Math.round(video.duration) : 0;
      URL.revokeObjectURL(url);
      resolve({ dataUrl, duration });
    };
    video.onerror = () => done(null);
    video.onloadedmetadata = () => {
      const t = Math.min(1, Math.max(0, (video.duration || 0) / 2));
      video.currentTime = t;
    };
    video.onseeked = () => {
      try {
        const canvas = document.createElement("canvas");
        const scale = Math.min(1, 1280 / (video.videoWidth || 1280));
        canvas.width = Math.round((video.videoWidth || 1280) * scale);
        canvas.height = Math.round((video.videoHeight || 720) * scale);
        canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
        done(canvas.toDataURL("image/jpeg", 0.85));
      } catch {
        done(null);
      }
    };
  });
}

export function VideoUploader({ onComplete, onReset }: Props) {
  const [state, setState] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setState("uploading");
    setProgress(0);
    setMessage(`Subiendo ${file.name}…`);
    try {
      const mime = file.type || (file.name.endsWith(".mov") ? "video/quicktime" : "video/mp4");
      const init = await fetch("/api/uploads/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, size: file.size, mime }),
      });
      if (!init.ok) throw new Error((await init.json()).error ?? "No se pudo iniciar la subida");
      const { uploadId, chunkSize, totalChunks } = (await init.json()) as {
        uploadId: string;
        chunkSize: number;
        totalChunks: number;
      };
      for (let i = 0; i < totalChunks; i++) {
        const blob = file.slice(i * chunkSize, Math.min(file.size, (i + 1) * chunkSize));
        const res = await fetch(`/api/uploads/${uploadId}/chunk?index=${i}`, {
          method: "PUT",
          body: blob,
        });
        if (!res.ok) throw new Error(`Falló la parte ${i + 1} de ${totalChunks}`);
        setProgress(Math.round(((i + 1) / totalChunks) * 100));
      }
      const done = await fetch(`/api/uploads/${uploadId}/complete`, { method: "POST" });
      if (!done.ok) throw new Error((await done.json()).error ?? "No se pudo completar la subida");
      const { key } = (await done.json()) as { key: string };
      setMessage("Generando miniatura…");
      const thumb = await captureThumbnail(file);
      setPreview(thumb.dataUrl);
      setState("done");
      setMessage("Subida completa");
      onComplete({ key, thumbnailDataUrl: thumb.dataUrl, durationSec: thumb.duration, filename: file.name });
    } catch (e) {
      setState("error");
      setMessage((e as Error).message);
    }
  }

  function pick(files: FileList | null) {
    const f = files?.[0];
    if (f) void upload(f);
  }

  function reset() {
    setState("idle");
    setProgress(0);
    setMessage("");
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
    onReset?.();
  }

  return (
    <div className="flex flex-col gap-3">
      <label
        htmlFor="video-file"
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          pick(e.dataTransfer.files);
        }}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[16px] border-2 border-dashed px-6 py-10 text-center transition-colors ${
          dragging ? "border-accent bg-accent/5" : "border-line hover:border-ink/40"
        } ${state === "uploading" ? "pointer-events-none opacity-70" : ""}`}
      >
        <span className="text-[15px] font-medium">Arrastra el video aquí o haz clic para elegirlo</span>
        <span className="text-sm text-muted">MP4, WebM o MOV · hasta 500 MB</span>
        <input
          ref={inputRef}
          id="video-file"
          type="file"
          accept={ACCEPT}
          aria-label="Archivo de video"
          className="sr-only"
          onChange={(e) => pick(e.target.files)}
          disabled={state === "uploading"}
        />
      </label>

      {state !== "idle" && (
        <div
          className="flex items-center gap-3 rounded-[10px] border border-line bg-surface-2/60 px-3.5 py-3"
          role="status"
          aria-live="polite"
        >
          {state === "uploading" && <Spinner />}
          {preview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="h-12 w-20 rounded-[6px] object-cover" />
          )}
          <div className="min-w-0 flex-1">
            <p className={`text-sm ${state === "error" ? "text-red-600 dark:text-red-400" : ""}`}>{message}</p>
            {state === "uploading" && (
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line">
                <div className="h-full bg-accent transition-[width] duration-200" style={{ width: `${progress}%` }} />
              </div>
            )}
          </div>
          {state !== "uploading" && (
            <button type="button" onClick={reset} className="text-sm text-muted underline hover:text-ink">
              Cambiar
            </button>
          )}
        </div>
      )}
    </div>
  );
}
