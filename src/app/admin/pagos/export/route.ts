import type { NextRequest } from "next/server";
import type { PaymentStatus } from "@prisma/client";
import { requireAdminApi } from "@/server/auth";
import { db } from "@/server/db";
import { toCsv } from "@/lib/csv";
import { paymentStatusLabel } from "@/components/admin/PaymentStatusBadge";

export const dynamic = "force-dynamic";

const STATUSES = new Set(["APPROVED", "DECLINED", "INSUFFICIENT_FUNDS"]);

export async function GET(req: NextRequest) {
  const admin = await requireAdminApi();
  if (admin instanceof Response) return admin;

  const estado = req.nextUrl.searchParams.get("estado");
  const status = estado && STATUSES.has(estado) ? (estado as PaymentStatus) : undefined;
  const payments = await db.payment.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    include: { member: true, subscription: { include: { plan: true } } },
  });

  const csv = toCsv(
    payments.map((p) => ({
      fecha: p.createdAt.toISOString(),
      miembro: p.member.name,
      correo: p.member.email,
      plan: p.subscription?.plan.name ?? "",
      metodo: p.method === "CARD" ? "Tarjeta" : "SINPE Móvil",
      ultimos4: p.cardLast4 ?? "",
      referencia: p.gatewayRef,
      monto_crc: p.amountCRC,
      estado: paymentStatusLabel[p.status],
    })),
  );

  return new Response("﻿" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="pagos.csv"',
      "Cache-Control": "no-store",
    },
  });
}
