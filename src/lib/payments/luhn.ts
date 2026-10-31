/** Luhn checksum for card numbers; spaces are ignored. */
export function luhnValid(input: string): boolean {
  const digits = input.replace(/\s+/g, "");
  if (!/^\d{12,19}$/.test(digits)) return false;
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = Number(digits[i]);
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return sum % 10 === 0;
}

export function cardLast4(input: string): string {
  return input.replace(/\s+/g, "").slice(-4);
}
