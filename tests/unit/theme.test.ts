import { describe, expect, test } from "vitest";
import { resolveTheme, THEME_INIT_SCRIPT } from "@/lib/theme";

describe("resolveTheme", () => {
  test("stored wins over system", () => {
    expect(resolveTheme("dark", false)).toBe("dark");
    expect(resolveTheme("light", true)).toBe("light");
  });

  test("system when nothing stored", () => {
    expect(resolveTheme(null, true)).toBe("dark");
    expect(resolveTheme(null, false)).toBe("light");
  });

  test("invalid stored falls back to system", () => {
    expect(resolveTheme("blue", false)).toBe("light");
    expect(resolveTheme("blue", true)).toBe("dark");
  });
});

describe("THEME_INIT_SCRIPT", () => {
  test("sets data-theme on the html element before paint", () => {
    const dataset: Record<string, string> = {};
    const fakeWindow = {
      localStorage: { getItem: (k: string) => (k === "theme" ? "dark" : null) },
      matchMedia: () => ({ matches: false }),
      document: { documentElement: { dataset } },
    };
    const run = new Function("window", "document", "localStorage", THEME_INIT_SCRIPT);
    run(fakeWindow, fakeWindow.document, fakeWindow.localStorage);
    expect(dataset.theme).toBe("dark");
  });

  test("falls back to system when storage throws", () => {
    const dataset: Record<string, string> = {};
    const fakeWindow = {
      localStorage: {
        getItem: () => {
          throw new Error("blocked");
        },
      },
      matchMedia: () => ({ matches: true }),
      document: { documentElement: { dataset } },
    };
    const run = new Function("window", "document", "localStorage", THEME_INIT_SCRIPT);
    run(fakeWindow, fakeWindow.document, fakeWindow.localStorage);
    expect(dataset.theme).toBe("dark");
  });
});
