"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { uploadPhotos, type PhotoFormState } from "@/server/actions/photos";
import { FORM_TOKEN_FIELD } from "@/lib/form-token";
import { Button } from "@/components/ui/Button";
import { Field, FormMessage } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";

const MAX_FILES = 12;
const MAX_BYTES = 8 * 1024 * 1024;

export function PhotoUploadForm({ formToken }: { formToken: string }) {
  const [state, action, pending] = useActionState(uploadPhotos, {} as PhotoFormState);
  const [clientError, setClientError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      router.refresh();
    }
  }, [state.ok, router]);

  function check(files: FileList | null) {
    if (!files || files.length === 0) return setClientError(null);
    if (files.length > MAX_FILES) return setClientError(`Podés subir hasta ${MAX_FILES} fotos por vez.`);
    const big = Array.from(files).find((f) => f.size > MAX_BYTES);
    if (big) return setClientError(`“${big.name}” supera los 8 MB.`);
    setClientError(null);
  }

  return (
    <form
      ref={formRef}
      action={action}
      onSubmit={(e) => {
        if (clientError) e.preventDefault();
      }}
      className="flex flex-col gap-4 rounded-[12px] border border-line bg-surface p-5"
      noValidate
    >
      <input type="hidden" name={FORM_TOKEN_FIELD} value={formToken} />
      <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <Field label="Fotos" htmlFor="photos" hint="JPEG, PNG o WebP · hasta 8 MB cada una · hasta 12 por vez" error={clientError ?? undefined}>
          <Input
            id="photos"
            name="photos"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            required
            onChange={(e) => check(e.target.files)}
          />
        </Field>
        <Field label="Pie de foto" htmlFor="caption" hint="Opcional. Se aplica a todas las fotos subidas.">
          <Input id="caption" name="caption" maxLength={200} />
        </Field>
        <Button type="submit" pending={pending} pendingLabel="Subiendo…" disabled={!!clientError}>
          Subir
        </Button>
      </div>
      {state.error && <FormMessage tone="error">{state.error}</FormMessage>}
      {state.ok && !pending && <FormMessage tone="success">Fotos subidas</FormMessage>}
    </form>
  );
}
