import type { NextApiRequest, NextApiResponse } from "next";
import { videoOrigin, isSafeVideoPath } from "@/lib/assets";

export const config = {
  api: {
    responseLimit: false,
  },
};

const PASSTHROUGH = [
  "content-type",
  "content-length",
  "content-range",
  "cache-control",
  "etag",
  "last-modified",
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { file } = req.query;
  if (typeof file !== "string" || !isSafeVideoPath(file)) {
    res.status(400).end();
    return;
  }

  const headers: HeadersInit = {};
  if (req.headers.range) headers.Range = req.headers.range;
  const method = req.method === "HEAD" ? "HEAD" : "GET";

  let upstream: Response;
  try {
    upstream = await fetch(videoOrigin(file), { method, headers });
  } catch {
    res.status(502).end();
    return;
  }

  if (!upstream.ok) {
    res.status(upstream.status || 502).end();
    return;
  }

  res.status(upstream.status);
  for (const h of PASSTHROUGH) {
    const v = upstream.headers.get(h);
    if (v) res.setHeader(h, v);
  }
  res.setHeader("Accept-Ranges", upstream.headers.get("accept-ranges") ?? "bytes");
  res.setHeader("Content-Disposition", "inline");

  if (method === "HEAD" || !upstream.body) {
    res.end();
    return;
  }

  const reader = upstream.body.getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(value);
    }
  } finally {
    res.end();
  }
}
