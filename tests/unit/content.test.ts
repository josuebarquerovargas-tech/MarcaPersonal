import { expect, test } from "vitest";
import { createContentRepo } from "@/lib/content/repo";
import { defaults } from "@/lib/content/defaults";
import { contentSchemas, CONTENT_KEYS } from "@/lib/content/keys";

function fakeRepo(rows: Record<string, unknown> = {}) {
  const store = new Map<string, unknown>(Object.entries(rows));
  return {
    store,
    repo: createContentRepo({
      read: async (key) => (store.has(key) ? store.get(key) : null),
      write: async (key, value) => {
        store.set(key, value);
      },
    }),
  };
}

test("los defaults validan contra sus propios esquemas", () => {
  for (const key of CONTENT_KEYS) {
    expect(contentSchemas[key].safeParse(defaults[key]).success, key).toBe(true);
  }
});

test("sin fila devuelve el default", async () => {
  const { repo } = fakeRepo();
  expect(await repo.getContent("hero")).toEqual(defaults.hero);
});

test("fila parcial se mezcla con el default", async () => {
  const { repo } = fakeRepo({ hero: { title: "X" } });
  const hero = await repo.getContent("hero");
  expect(hero.title).toBe("X");
  expect(hero.subtitle).toBe(defaults.hero.subtitle);
});

test("JSON inválido devuelve el default", async () => {
  const { repo } = fakeRepo({ hero: { title: 42 } });
  expect(await repo.getContent("hero")).toEqual(defaults.hero);
});

test("setContent valida y persiste", async () => {
  const { repo, store } = fakeRepo();
  await repo.setContent("contact", { ...defaults.contact, email: "hola@ejemplo.cr" });
  expect((store.get("contact") as { email: string }).email).toBe("hola@ejemplo.cr");
  await expect(repo.setContent("contact", { email: "no-es-correo" })).rejects.toThrow();
});

test("los textos por defecto no copian el sitio anterior", () => {
  const all = JSON.stringify(defaults);
  expect(all).not.toMatch(/destacado defensor de los derechos de los animales/i);
  expect(all).toContain("¿Estás listo a mostrar tu marca?");
  expect(all).not.toMatch(/perro|canin|24\/7|garantiz/i);
  expect(defaults.services.items).toHaveLength(5);
  expect(defaults.process.items).toHaveLength(5);
  expect(defaults.about.facts).toHaveLength(7);
});
