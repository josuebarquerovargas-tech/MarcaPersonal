import { PrismaClient } from "@prisma/client";

/** Turns the optional membership module on or off directly in the test database. */
export async function setMembership(enabled: boolean) {
  const db = new PrismaClient();
  try {
    await db.siteContent.upsert({
      where: { key: "features" },
      update: { value: { membership: enabled } },
      create: { key: "features", value: { membership: enabled } },
    });
  } finally {
    await db.$disconnect();
  }
}
