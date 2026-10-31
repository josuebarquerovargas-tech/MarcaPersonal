import type { Card } from "./schemas";

export type PaymentStatus = "APPROVED" | "DECLINED" | "INSUFFICIENT_FUNDS";

export type ChargeInput =
  | { amountCRC: number; method: "CARD"; card: Card }
  | { amountCRC: number; method: "SINPE"; phone: string };

export type ChargeResult = {
  status: PaymentStatus;
  ref: string;
  last4: string | null;
  message: string;
};

/**
 * Payment gateway boundary. The demo ships `FakeGateway`; a real provider
 * (ONVO Pay, Tilopay…) implements this same interface.
 */
export interface PaymentGateway {
  charge(input: ChargeInput): Promise<ChargeResult>;
}
