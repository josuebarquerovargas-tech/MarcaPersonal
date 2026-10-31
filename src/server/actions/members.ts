"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/server/db";
import { requireAdmin } from "@/server/auth";

export async function setMemberStatus(id: string, status: "ACTIVE" | "SUSPENDED"): Promise<void> {
  await requireAdmin();
  await db.member.update({
    where: { id },
    data: { status, sessionVersion: status === "SUSPENDED" ? { increment: 1 } : undefined },
  });
  revalidatePath("/admin/miembros");
  revalidatePath(`/admin/miembros/${id}`);
}
