/**
 * Restablece la contraseña del administrador e invalida sus sesiones.
 * Uso: npm run admin:reset-password -- <correo> <nueva-contraseña>
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

async function main() {
  const [email, password] = process.argv.slice(2);
  if (!email || !password) {
    console.error("Uso: npm run admin:reset-password -- <correo> <nueva-contraseña>");
    process.exit(1);
  }
  if (password.length < 10 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    console.error("La contraseña debe tener al menos 10 caracteres, con letras y números.");
    process.exit(1);
  }
  const db = new PrismaClient();
  try {
    const admin = await db.adminUser.findUnique({ where: { email: email.toLowerCase() } });
    if (!admin) {
      console.error(`No existe un administrador con el correo ${email}.`);
      process.exit(1);
    }
    await db.adminUser.update({
      where: { id: admin.id },
      data: { passwordHash: await bcrypt.hash(password, 12), sessionVersion: { increment: 1 } },
    });
    console.log("Contraseña actualizada. Las sesiones anteriores quedaron cerradas.");
  } finally {
    await db.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
