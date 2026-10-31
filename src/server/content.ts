import "server-only";
import { Prisma } from "@prisma/client";
import { db } from "@/server/db";
import { createContentRepo } from "@/lib/content/repo";

const repo = createContentRepo({
  read: async (key) => {
    const row = await db.siteContent.findUnique({ where: { key } });
    return row?.value ?? null;
  },
  write: async (key, value) => {
    const json = value as Prisma.InputJsonValue;
    await db.siteContent.upsert({
      where: { key },
      update: { value: json },
      create: { key, value: json },
    });
  },
});

export const getContent = repo.getContent;
export const setContent = repo.setContent;
