import { contentSchemas, type Content, type ContentKey } from "./keys";
import { defaults } from "./defaults";

export type ContentRepoDeps = {
  read(key: ContentKey): Promise<unknown | null>;
  write(key: ContentKey, value: unknown): Promise<void>;
};

export function createContentRepo(deps: ContentRepoDeps) {
  return {
    async getContent<K extends ContentKey>(key: K): Promise<Content[K]> {
      const stored = await deps.read(key);
      const base = defaults[key];
      if (!stored || typeof stored !== "object") return base;
      const merged = { ...base, ...(stored as object) };
      const parsed = contentSchemas[key].safeParse(merged);
      return parsed.success ? (parsed.data as Content[K]) : base;
    },
    async setContent<K extends ContentKey>(key: K, value: unknown): Promise<Content[K]> {
      const parsed = contentSchemas[key].parse(value) as Content[K];
      await deps.write(key, parsed);
      return parsed;
    },
  };
}
