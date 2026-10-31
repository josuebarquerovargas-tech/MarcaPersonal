"use server";

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { requireAdmin } from "@/server/auth";
import { setContent } from "@/server/content";
import { formDataToContent } from "@/lib/content/fields";
import { contentSchemas, type ContentKey } from "@/lib/content/keys";
import { parsePlansForm } from "@/lib/membership/plans-form";
import { updatePlans } from "@/server/plans";

export type SaveContentState = { ok?: boolean; error?: string };

export async function savePlans(_prev: SaveContentState, formData: FormData): Promise<SaveContentState> {
  await requireAdmin();
  const parsed = parsePlansForm(formData);
  if (!parsed.ok) return { error: parsed.error };
  await updatePlans(parsed.plans);
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function saveContent(
  key: ContentKey,
  _prev: SaveContentState,
  formData: FormData,
): Promise<SaveContentState> {
  await requireAdmin();
  if (!(key in contentSchemas)) return { error: "Sección desconocida" };
  try {
    await setContent(key, formDataToContent(key, formData));
  } catch (e) {
    if (e instanceof ZodError) {
      const issue = e.issues[0];
      return { error: `${issue.path.join(".")}: ${issue.message}` };
    }
    throw e;
  }
  revalidatePath("/", "layout");
  return { ok: true };
}
