import { execSync } from "node:child_process";
import { config as loadEnv } from "dotenv";
import { PrismaClient } from "@prisma/client";

/**
 * Resets the local test database to a clean, seeded state before the e2e
 * suite runs: truncates every application table (migrations history is kept)
 * and re-runs the seed. Uses DATABASE_URL from .env (Docker PostgreSQL).
 */
export default async function globalSetup() {
  loadEnv();
  const db = new PrismaClient();
  try {
    const rows = await db.$queryRaw<{ tablename: string }[]>`
      SELECT tablename FROM pg_tables
      WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'`;
    const names = rows.map((r) => `"public"."${r.tablename}"`);
    if (names.length) {
      await db.$executeRawUnsafe(`TRUNCATE TABLE ${names.join(", ")} RESTART IDENTITY CASCADE`);
    }
  } finally {
    await db.$disconnect();
  }
  execSync("npx tsx prisma/seed.ts", { stdio: "inherit", env: { ...process.env } });
}
