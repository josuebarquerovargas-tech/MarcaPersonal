import { expect, test } from "vitest";
import { createFormTokens } from "@/lib/form-token";

type Row = { token: string; usedAt: Date | null; expiresAt: Date };

function fakeStore() {
  const rows = new Map<string, Row>();
  return {
    rows,
    deps: {
      insert: async (row: Row) => {
        rows.set(row.token, row);
      },
      find: async (token: string) => rows.get(token) ?? null,
      markUsed: async (token: string, at: Date) => {
        const r = rows.get(token);
        if (!r || r.usedAt) return false;
        r.usedAt = at;
        return true;
      },
      purge: async () => {},
    },
  };
}

test("issue returns a token that can be consumed exactly once", async () => {
  const { deps } = fakeStore();
  const ft = createFormTokens(deps);
  const token = await ft.issueFormToken();
  expect(token).toMatch(/^[0-9a-f-]{36}$/);
  expect(await ft.consumeFormToken(token)).toBe(true);
  expect(await ft.consumeFormToken(token)).toBe(false);
});

test("unknown token is rejected", async () => {
  const ft = createFormTokens(fakeStore().deps);
  expect(await ft.consumeFormToken("nope")).toBe(false);
});

test("expired token is rejected", async () => {
  const { deps, rows } = fakeStore();
  const ft = createFormTokens(deps);
  const token = await ft.issueFormToken(new Date("2026-01-01T00:00:00Z"));
  expect(rows.get(token)!.expiresAt).toEqual(new Date("2026-01-01T01:00:00Z"));
  expect(await ft.consumeFormToken(token, new Date("2026-01-01T02:00:00Z"))).toBe(false);
});
