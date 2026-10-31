import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error("Faltan ADMIN_EMAIL y ADMIN_PASSWORD en el entorno.");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await db.adminUser.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash },
  });

  await db.plan.upsert({
    where: { code: "MONTHLY" },
    update: {},
    create: { code: "MONTHLY", name: "Mensual", priceCRC: 4900, intervalMonths: 1 },
  });
  await db.plan.upsert({
    where: { code: "YEARLY" },
    update: {},
    create: { code: "YEARLY", name: "Anual", priceCRC: 49000, intervalMonths: 12 },
  });

  console.log("Seed listo: administrador y planes.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
