"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { uploadPhotos, type PhotoFormState } from "@/server/actions/photos";
import { FORM_TOKEN_FIELD } from "@/lib/form-token";
import { Button } from "@/components/ui/Button";
import { Field, FormMessage } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";

export function PhotoUploadForm({ formToken }: { formToken: string }) {
  const [state, action, pending] = useActionState(uploadPhotos, {} as PhotoFormState);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      router.refresh();
    }
  }, [state.ok, router]);

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-4 rounded-[12px] border border-line bg-surface p-5" noValidate>
      <input type="hidden" name={FORM_TOKEN_FIELD} value={formToken} />
      <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <Field label="Fotos" htmlFor="photos" hint="JPEG, PNG o WebP · hasta 8 MB cada una · hasta 12 por vez">
          <Input id="photos" name="photos" type="file" accept="image/jpeg,image/png,image/webp" multiple required />
        </Field>
        <Field label="Pie de foto" htmlFor="caption" hint="Opcional. Se aplica a todas las fotos subidas.">
          <Input id="caption" name="caption" maxLength={200} />
        </Field>
        <Button type="submit" pending={pending} pendingLabel="Subiendo…">
          Subir
        </Button>
      </div>
      {state.error && <FormMessage tone="error">{state.error}</FormMessage>}
      {state.ok && !pending && <FormMessage tone="success">Fotos subidas</FormMessage>}
    </form>
  );
}
