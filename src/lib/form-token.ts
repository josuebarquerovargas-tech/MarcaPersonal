export const FORM_TOKEN_TTL_MS = 60 * 60 * 1000;
export const FORM_TOKEN_FIELD = "formToken";

export type FormTokenRow = { token: string; usedAt: Date | null; expiresAt: Date };

export type FormTokenDeps = {
  insert(row: FormTokenRow): Promise<void>;
  find(token: string): Promise<FormTokenRow | null>;
  /** Atomically marks the token used; returns false if it was already used. */
  markUsed(token: string, at: Date): Promise<boolean>;
  /** Removes used or expired tokens older than `before`. */
  purge(before: Date): Promise<void>;
};

export function createFormTokens(deps: FormTokenDeps) {
  return {
    async issueFormToken(now: Date = new Date()): Promise<string> {
      const token = crypto.randomUUID();
      await deps.insert({
        token,
        usedAt: null,
        expiresAt: new Date(now.getTime() + FORM_TOKEN_TTL_MS),
      });
      return token;
    },
    async consumeFormToken(token: string, now: Date = new Date()): Promise<boolean> {
      if (!token) return false;
      const row = await deps.find(token);
      if (!row || row.usedAt || row.expiresAt.getTime() < now.getTime()) return false;
      const ok = await deps.markUsed(token, now);
      void deps.purge(new Date(now.getTime() - FORM_TOKEN_TTL_MS)).catch(() => {});
      return ok;
    },
  };
}
