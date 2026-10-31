import type { ChargeInput, ChargeResult, PaymentGateway } from "./gateway";
import { cardLast4 } from "./luhn";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function demoRef(): string {
  let s = "";
  for (let i = 0; i < 10; i++) s += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  return `DEMO-${s}`;
}

export const DEMO_CARD_RULES = [
  { ending: "4242", outcome: "aprobada" },
  { ending: "0002", outcome: "rechazada" },
  { ending: "9995", outcome: "sin fondos" },
] as const;

/**
 * Simulated gateway. Outcomes are decided by visible rules so the demo is
 * predictable: card ending 4242 → approved, 0002 → declined, 9995 →
 * insufficient funds, any other valid card → approved. SINPE phones ending
 * in 0000 are declined. No real charge ever happens.
 */
export class FakeGateway implements PaymentGateway {
  private readonly delayMs: number;

  constructor(opts: { delayMs?: number } = {}) {
    this.delayMs = opts.delayMs ?? 600;
  }

  async charge(input: ChargeInput): Promise<ChargeResult> {
    if (this.delayMs > 0) await new Promise((r) => setTimeout(r, this.delayMs));
    const ref = demoRef();

    if (input.method === "CARD") {
      const last4 = cardLast4(input.card.number);
      if (last4 === "0002") return { status: "DECLINED", ref, last4, message: "Tarjeta rechazada por el emisor" };
      if (last4 === "9995") return { status: "INSUFFICIENT_FUNDS", ref, last4, message: "Fondos insuficientes" };
      return { status: "APPROVED", ref, last4, message: "Pago aprobado" };
    }

    if (input.phone.endsWith("0000")) {
      return { status: "DECLINED", ref, last4: null, message: "SINPE Móvil no pudo completar la transferencia" };
    }
    return { status: "APPROVED", ref, last4: null, message: "Transferencia SINPE Móvil aprobada" };
  }
}

export const gateway: PaymentGateway = new FakeGateway();
