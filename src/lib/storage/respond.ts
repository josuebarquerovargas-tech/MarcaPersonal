import { Readable } from "node:stream";
import type { Storage } from "./storage";
import { parseRange } from "./range";
import { mimeFromKey } from "./mime";

/**
 * Builds a Response for a stored file honoring the HTTP Range header.
 * Shared by the public media route and the access-controlled video stream.
 */
export async function fileResponse(
  store: Storage,
  key: string,
  rangeHeader: string | null,
  extraHeaders: Record<string, string> = {},
): Promise<Response> {
  const info = await store.stat(key);
  if (!info) return new Response("No encontrado", { status: 404 });

  const headers = new Headers({
    "Content-Type": mimeFromKey(key),
    "Accept-Ranges": "bytes",
    ...extraHeaders,
  });

  const range = parseRange(rangeHeader, info.size);
  if (range === "invalid") {
    headers.set("Content-Range", `bytes */${info.size}`);
    return new Response(null, { status: 416, headers });
  }

  if (range) {
    headers.set("Content-Range", `bytes ${range.start}-${range.end}/${info.size}`);
    headers.set("Content-Length", String(range.end - range.start + 1));
    const stream = Readable.toWeb(
      store.createReadStream(key, range) as Readable,
    ) as ReadableStream;
    return new Response(stream, { status: 206, headers });
  }

  headers.set("Content-Length", String(info.size));
  const stream = Readable.toWeb(store.createReadStream(key) as Readable) as ReadableStream;
  return new Response(stream, { status: 200, headers });
}
