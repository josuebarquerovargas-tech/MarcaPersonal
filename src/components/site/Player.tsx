"use client";

import { useEffect, useRef, useState } from "react";

type Props = { src: string; poster?: string | null; title: string };

function fmt(t: number): string {
  if (!Number.isFinite(t)) return "0:00";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function Player({ src, poster, title }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTime = () => setTime(v.currentTime);
    const onMeta = () => setDuration(v.duration);
    const onPlay = () => {
      setPlaying(true);
      setStarted(true);
    };
    const onPause = () => setPlaying(false);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("loadedmetadata", onMeta);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    v.addEventListener("ended", onPause);
    return () => {
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("loadedmetadata", onMeta);
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("ended", onPause);
    };
  }, []);

  function toggle() {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) void v.play();
    else v.pause();
  }

  function seek(delta: number) {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(v.duration || 0, v.currentTime + delta));
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.target !== e.currentTarget && (e.target as HTMLElement).tagName === "INPUT") return;
    if (e.key === " " || e.key === "k") {
      e.preventDefault();
      toggle();
    } else if (e.key === "ArrowRight") seek(5);
    else if (e.key === "ArrowLeft") seek(-5);
    else if (e.key === "m") setMutedState(!muted);
    else if (e.key === "f") void fullscreen();
  }

  function setMutedState(m: boolean) {
    const v = videoRef.current;
    if (v) v.muted = m;
    setMuted(m);
  }

  async function fullscreen() {
    const el = wrapRef.current;
    if (!el) return;
    if (document.fullscreenElement) await document.exitFullscreen();
    else await el.requestFullscreen?.();
  }

  const pct = duration ? (time / duration) * 100 : 0;

  return (
    <div
      ref={wrapRef}
      tabIndex={0}
      onKeyDown={onKey}
      aria-label={`Reproductor: ${title}`}
      className="group relative aspect-video w-full overflow-hidden rounded-[16px] bg-black outline-none ring-accent focus-visible:ring-2"
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster ?? undefined}
        playsInline
        preload="metadata"
        className="size-full object-contain"
        onClick={toggle}
      />

      {!started && (
        <button
          type="button"
          onClick={toggle}
          aria-label="Reproducir"
          className="absolute inset-0 flex items-center justify-center"
        >
          <span className="flex size-20 items-center justify-center rounded-full bg-white/90 text-black shadow-soft transition-transform group-hover:scale-105">
            <svg viewBox="0 0 24 24" className="ml-1 size-8" fill="currentColor" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </button>
      )}

      <div
        className={`absolute inset-x-0 bottom-0 flex items-center gap-3 bg-gradient-to-t from-black/70 to-transparent px-4 pb-3 pt-10 text-white transition-opacity ${
          playing ? "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100" : "opacity-100"
        }`}
      >
        <button type="button" onClick={toggle} aria-label={playing ? "Pausar" : "Reproducir"} className="shrink-0">
          {playing ? (
            <svg viewBox="0 0 24 24" className="size-6" fill="currentColor" aria-hidden="true">
              <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="size-6" fill="currentColor" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
        <span className="text-xs tabular-nums">{fmt(time)}</span>
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={time}
          onChange={(e) => {
            const v = videoRef.current;
            if (v) v.currentTime = Number(e.target.value);
          }}
          aria-label="Progreso"
          className="h-1 flex-1 cursor-pointer accent-accent"
          style={{ background: `linear-gradient(to right, var(--accent) ${pct}%, rgba(255,255,255,0.3) ${pct}%)` }}
        />
        <span className="text-xs tabular-nums">{fmt(duration)}</span>
        <button type="button" onClick={() => setMutedState(!muted)} aria-label={muted ? "Activar sonido" : "Silenciar"} className="shrink-0">
          {muted ? (
            <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden="true">
              <path d="M16.5 12a4.5 4.5 0 0 0-2.5-4v2.2l2.4 2.4c.1-.2.1-.4.1-.6ZM19 12c0 .9-.2 1.8-.5 2.6l1.5 1.5A8.9 8.9 0 0 0 21 12a9 9 0 0 0-7-8.8v2.1A7 7 0 0 1 19 12ZM4.3 3 3 4.3 6.7 8H3v8h4l5 5v-6.7l4.3 4.3a7 7 0 0 1-2.3 1.2v2A9 9 0 0 0 17.7 20l2 2 1.3-1.3L4.3 3ZM12 4 9.9 6.1 12 8.2V4Z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden="true">
              <path d="M3 9v6h4l5 5V4L7 9H3Zm13.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4ZM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6Z" />
            </svg>
          )}
        </button>
        <button type="button" onClick={() => void fullscreen()} aria-label="Pantalla completa" className="shrink-0">
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
          </svg>
        </button>
      </div>
    </div>
  );
}
