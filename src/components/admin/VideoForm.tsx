"use client";

import { useActionState, useState } from "react";
import type { Video } from "@prisma/client";
import type { VideoFormState } from "@/server/actions/videos";
import { parseEmbedUrl, PLATFORM_LABEL } from "@/lib/videos/embed";
import { FORM_TOKEN_FIELD } from "@/lib/form-token";
import { Button } from "@/components/ui/Button";
import { Field, FormMessage } from "@/components/ui/Field";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { VideoUploader, type UploadResult } from "./VideoUploader";

type Props = {
  action: (prev: VideoFormState, fd: FormData) => Promise<VideoFormState>;
  video?: Video;
  formToken?: string;
  thumbnailUrl?: string | null;
};

function toDateInput(d: Date): string {
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

export function VideoForm({ action, video, formToken, thumbnailUrl }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  const editing = !!video;
  const [kind, setKind] = useState<"FILE" | "EMBED">(video?.kind ?? "FILE");
  const [upload, setUpload] = useState<UploadResult | null>(null);
  const [sourceUrl, setSourceUrl] = useState(video?.sourceUrl ?? "");
  const [title, setTitle] = useState(video?.title ?? "");
  const [description, setDescription] = useState(video?.description ?? "");
  const parsedEmbed = kind === "EMBED" && sourceUrl ? parseEmbedUrl(sourceUrl) : null;

  const canSubmit = editing || (kind === "FILE" ? !!upload : !!parsedEmbed);

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-6" noValidate>
      {formToken && <input type="hidden" name={FORM_TOKEN_FIELD} value={formToken} />}
      <input type="hidden" name="kind" value={kind} />

      {!editing && (
        <div role="tablist" aria-label="Origen del video" className="flex gap-1 rounded-full border border-line bg-surface p-1">
          {(["FILE", "EMBED"] as const).map((k) => (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={kind === k}
              onClick={() => setKind(k)}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                kind === k ? "bg-ink text-bg" : "text-muted hover:text-ink"
              }`}
            >
              {k === "FILE" ? "Subir archivo" : "Enlace"}
            </button>
          ))}
        </div>
      )}

      {!editing && kind === "FILE" && (
        <div role="tabpanel">
          <VideoUploader
            onComplete={(r) => {
              setUpload(r);
              if (!title) setTitle(r.filename.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "));
            }}
            onReset={() => setUpload(null)}
          />
          <input type="hidden" name="fileKey" value={upload?.key ?? ""} />
          <input type="hidden" name="thumbnailData" value={upload?.thumbnailDataUrl ?? ""} />
          <input type="hidden" name="durationSec" value={upload?.durationSec ?? ""} />
        </div>
      )}

      {!editing && kind === "EMBED" && (
        <div role="tabpanel" className="flex flex-col gap-4">
          <Field
            label="Enlace del video"
            htmlFor="sourceUrl"
            hint="Pegá el enlace de TikTok, Instagram o YouTube."
            error={sourceUrl && !parsedEmbed ? "No reconozco ese enlace." : undefined}
          >
            <Input
              id="sourceUrl"
              name="sourceUrl"
              inputMode="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://www.tiktok.com/@usuario/video/…"
            />
          </Field>
          {parsedEmbed && (
            <div className="overflow-hidden rounded-[12px] border border-line bg-surface-2/60">
              <p className="px-3 py-2 text-xs uppercase tracking-wide text-muted">
                Vista previa · {PLATFORM_LABEL[parsedEmbed.platform]}
              </p>
              <iframe
                title="Vista previa"
                src={parsedEmbed.embedUrl}
                className={`w-full border-0 ${parsedEmbed.platform === "YOUTUBE" ? "aspect-video" : "h-[560px] max-w-[340px]"}`}
                loading="lazy"
                allow="autoplay; encrypted-media; picture-in-picture"
              />
            </div>
          )}
        </div>
      )}

      {editing && (
        <div className="flex items-center gap-4 rounded-[12px] border border-line bg-surface-2/60 p-3">
          {thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumbnailUrl} alt="" className="h-16 w-28 rounded-[6px] object-cover" />
          ) : (
            <div className="h-16 w-28 rounded-[6px] bg-line" />
          )}
          <div className="text-sm text-muted">
            <p>{video.kind === "FILE" ? "Archivo subido" : `Enlace · ${video.platform ? PLATFORM_LABEL[video.platform] : ""}`}</p>
            {video.sourceUrl && (
              <a href={video.sourceUrl} target="_blank" rel="noreferrer" className="underline">
                Abrir original ↗
              </a>
            )}
          </div>
        </div>
      )}

      <Field label="Título" htmlFor="title">
        <Input id="title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </Field>
      <Field label="Descripción" htmlFor="description" hint="Opcional.">
        <Textarea id="description" name="description" value={description} onChange={(e) => setDescription(e.target.value)} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Acceso" htmlFor="access">
          <Select id="access" name="access" defaultValue={video?.access ?? "FREE"}>
            <option value="FREE">Gratis</option>
            <option value="MEMBERS">Miembros</option>
          </Select>
        </Field>
        <Field label="Estado" htmlFor="status">
          <Select id="status" name="status" defaultValue={video?.status ?? "DRAFT"}>
            <option value="DRAFT">Borrador</option>
            <option value="PUBLISHED">Publicado</option>
          </Select>
        </Field>
        <Field label="Fecha" htmlFor="publishedAt">
          <Input
            id="publishedAt"
            name="publishedAt"
            type="date"
            defaultValue={toDateInput(video?.publishedAt ?? new Date())}
          />
        </Field>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="featured" defaultChecked={video?.featured ?? false} className="size-4 accent-accent" />
        Destacar en la portada
      </label>

      <Field label="Miniatura" htmlFor="thumbnail" hint={editing ? "Subí una imagen para reemplazar la actual." : "Opcional. Si no la subís, se usa la captura automática."}>
        <Input id="thumbnail" name="thumbnail" type="file" accept="image/jpeg,image/png,image/webp" />
      </Field>

      {state.error && <FormMessage tone="error">{state.error}</FormMessage>}

      <div className="flex items-center gap-3">
        <Button type="submit" pending={pending} pendingLabel="Guardando…" disabled={!canSubmit}>
          Guardar
        </Button>
        {!canSubmit && !editing && (
          <span className="text-sm text-muted">
            {kind === "FILE" ? "Primero subí el archivo." : "Pegá un enlace válido."}
          </span>
        )}
      </div>
    </form>
  );
}
