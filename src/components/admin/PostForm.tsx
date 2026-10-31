"use client";

import { useActionState, useState } from "react";
import type { Post } from "@prisma/client";
import type { PostFormState } from "@/server/actions/posts";
import { FORM_TOKEN_FIELD } from "@/lib/form-token";
import { Button } from "@/components/ui/Button";
import { Field, FormMessage } from "@/components/ui/Field";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { PostBody } from "@/components/site/PostBody";

type Props = {
  action: (prev: PostFormState, fd: FormData) => Promise<PostFormState>;
  post?: Post;
  formToken?: string;
  coverUrl?: string | null;
};

export function PostForm({ action, post, formToken, coverUrl }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  // Controlled so a validation error never wipes what was written.
  const [values, setValues] = useState({
    title: post?.title ?? "",
    excerpt: post?.excerpt ?? "",
    body: post?.body ?? "",
    status: post?.status ?? "DRAFT",
    access: post?.access ?? "FREE",
  });
  const [preview, setPreview] = useState(false);
  const set = (k: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setValues((v) => ({ ...v, [k]: e.target.value }));

  return (
    <form action={formAction} className="flex max-w-3xl flex-col gap-6" noValidate>
      {formToken && <input type="hidden" name={FORM_TOKEN_FIELD} value={formToken} />}
      <Field label="Título" htmlFor="title">
        <Input id="title" name="title" value={values.title} onChange={set("title")} required />
      </Field>
      <Field label="Resumen" htmlFor="excerpt" hint="Opcional. Aparece en el listado y al compartir, hasta 300 caracteres.">
        <Textarea id="excerpt" name="excerpt" value={values.excerpt} onChange={set("excerpt")} className="min-h-20" />
      </Field>
      <Field
        label="Contenido"
        htmlFor="body"
        hint="Separa párrafos con una línea en blanco. Formato: ## subtítulo, **negrita**, *cursiva*, - lista, > cita, [texto](https://enlace)."
      >
        {/* Stays mounted during preview so its value is always submitted. */}
        <Textarea id="body" name="body" value={values.body} onChange={set("body")} className={`min-h-96 ${preview ? "hidden" : ""}`} required />
        {preview && (
          <div className="min-h-96 rounded-[10px] border border-line bg-surface p-5">
            <PostBody source={values.body} />
          </div>
        )}
      </Field>
      <div>
        <Button type="button" variant="secondary" size="sm" onClick={() => setPreview((p) => !p)}>
          {preview ? "Seguir editando" : "Vista previa"}
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Estado" htmlFor="status">
          <Select id="status" name="status" value={values.status} onChange={set("status")}>
            <option value="DRAFT">Borrador</option>
            <option value="PUBLISHED">Publicado</option>
          </Select>
        </Field>
        <Field label="Acceso" htmlFor="access" hint="Exclusivo: solo los miembros leen el texto completo. El título y el resumen son públicos.">
          <Select id="access" name="access" value={values.access} onChange={set("access")}>
            <option value="FREE">Gratis</option>
            <option value="MEMBERS">Exclusivo</option>
          </Select>
        </Field>
        <Field label="Imagen de portada" htmlFor="cover" hint={coverUrl ? "Sube una imagen para reemplazar la actual." : "Opcional. JPEG, PNG o WebP, hasta 8 MB."}>
          <Input id="cover" name="cover" type="file" accept="image/jpeg,image/png,image/webp" />
        </Field>
      </div>
      {coverUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={coverUrl} alt="Portada actual" className="h-40 w-fit rounded-[10px] object-cover" />
      )}
      {state.error && <FormMessage tone="error">{state.error}</FormMessage>}
      <div>
        <Button type="submit" pending={pending} pendingLabel="Guardando…">
          Guardar
        </Button>
      </div>
    </form>
  );
}
