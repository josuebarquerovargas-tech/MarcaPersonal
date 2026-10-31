/**
 * Seed: administrador, planes y contenido de muestra para la demostración.
 * Es idempotente: se puede ejecutar varias veces sin duplicar registros.
 */
import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();
const uploadsDir = path.resolve(process.env.UPLOADS_DIR ?? "./data/uploads");
// Relativo al directorio de trabajo para que funcione tanto con tsx como compilado en Docker.
const demoDir = path.resolve(process.env.DEMO_DIR ?? "prisma/demo");

const DEMO_VIDEOS = [
  {
    slug: "demo-como-mostrar-tu-marca",
    title: "Demo: cómo mostrar tu marca",
    description: "Contenido de muestra para la demostración. Reemplazalo por un video real desde el panel.",
    access: "FREE" as const,
    featured: false,
    file: "demo-1",
    daysAgo: 2,
  },
  {
    slug: "demo-primeros-pasos-en-redes-sociales",
    title: "Demo: primeros pasos en redes sociales",
    description: "Contenido de muestra para la demostración. Reemplazalo por un video real desde el panel.",
    access: "FREE" as const,
    featured: false,
    file: "demo-2",
    daysAgo: 9,
  },
  {
    slug: "demo-contenido-exclusivo",
    title: "Demo: contenido exclusivo para hacer crecer tu marca",
    description: "Contenido de muestra para demostrar la membresía. Reemplazalo por un video real desde el panel.",
    access: "MEMBERS" as const,
    featured: true,
    file: "demo-3",
    daysAgo: 1,
  },
];

/** Clips con títulos del enfoque anterior que pudieran quedar en una base existente. */
const OLD_DEMO_SLUGS = ["demo-rutina-de-paseo", "demo-senales-de-estres-en-perros", "demo-sesion-exclusiva-de-adiestramiento"];

async function seedAdminAndPlans() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) throw new Error("Faltan ADMIN_EMAIL y ADMIN_PASSWORD en el entorno.");

  await db.adminUser.upsert({
    where: { email: email.toLowerCase() },
    update: {},
    create: { email: email.toLowerCase(), passwordHash: await bcrypt.hash(password, 12) },
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
}

async function seedDemoVideos() {
  await db.video.deleteMany({ where: { slug: { in: OLD_DEMO_SLUGS } } });
  await mkdir(path.join(uploadsDir, "videos"), { recursive: true });
  await mkdir(path.join(uploadsDir, "thumbs"), { recursive: true });
  const now = Date.now();
  let i = 0;
  for (const v of DEMO_VIDEOS) {
    const filePath = `videos/${v.file}.mp4`;
    const thumbnailPath = `thumbs/${v.file}.jpg`;
    await copyFile(path.join(demoDir, `${v.file}.mp4`), path.join(uploadsDir, filePath));
    await copyFile(path.join(demoDir, `${v.file}.jpg`), path.join(uploadsDir, thumbnailPath));
    await db.video.upsert({
      where: { slug: v.slug },
      // Solo el exclusivo se publica, para demostrar la membresía. Los gratis quedan ocultos.
      update: { status: v.access === "MEMBERS" ? "PUBLISHED" : "DRAFT" },
      create: {
        slug: v.slug,
        title: v.title,
        description: v.description,
        kind: "FILE",
        filePath,
        thumbnailPath,
        durationSec: 6,
        access: v.access,
        status: v.access === "MEMBERS" ? "PUBLISHED" : "DRAFT",
        featured: v.featured,
        sortOrder: i++,
        publishedAt: new Date(now - v.daysAgo * 86_400_000),
      },
    });
  }
}

async function seedDemoMember() {
  const monthly = await db.plan.findUniqueOrThrow({ where: { code: "MONTHLY" } });
  const member = await db.member.upsert({
    where: { email: "miembro@demo.cr" },
    update: {},
    create: { name: "Miembro de prueba", email: "miembro@demo.cr", passwordHash: await bcrypt.hash("Miembro1234!", 12) },
  });
  const existing = await db.subscription.findFirst({ where: { memberId: member.id } });
  if (existing) return;
  const startedAt = new Date();
  const currentPeriodEnd = new Date(startedAt);
  currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
  const subscription = await db.subscription.create({
    data: { memberId: member.id, planId: monthly.id, status: "ACTIVE", startedAt, currentPeriodEnd },
  });
  await db.payment.create({
    data: {
      memberId: member.id,
      subscriptionId: subscription.id,
      amountCRC: monthly.priceCRC,
      method: "CARD",
      status: "APPROVED",
      gatewayRef: "DEMO-SEED000001",
      cardLast4: "4242",
    },
  });
}

async function main() {
  await seedAdminAndPlans();
  if (process.env.SEED_DEMO !== "false") {
    await seedDemoVideos();
    await seedDemoMember();
  }
  console.log("Seed listo: administrador, planes y contenido de demostración.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
