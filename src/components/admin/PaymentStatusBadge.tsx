import type { PaymentStatus } from "@prisma/client";
import { Badge } from "@/components/ui/Badge";

const label: Record<PaymentStatus, string> = { APPROVED: "Aprobado", DECLINED: "Rechazado", INSUFFICIENT_FUNDS: "Sin fondos" };
const tone: Record<PaymentStatus, "success" | "danger" | "warning"> = { APPROVED: "success", DECLINED: "danger", INSUFFICIENT_FUNDS: "warning" };

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <Badge tone={tone[status]}>{label[status]}</Badge>;
}

export const paymentStatusLabel = label;
