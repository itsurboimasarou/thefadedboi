import type { NextApiRequest, NextApiResponse } from "next";
import { verifyStreamToken } from "@/lib/streamToken";
import { trackUrl } from "@/lib/assets";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { t } = req.query;
  if (typeof t !== "string") {
    res.status(400).end();
    return;
  }

  const payload = verifyStreamToken(t);
  if (!payload) {
    res.status(403).end();
    return;
  }

  const upstreamHeaders: HeadersInit = {};
  if (req.headers.range) upstreamHeaders.Range = req.headers.range;

  let upstream: Response;
  try {
    upstream = await fetch(trackUrl(payload.folder, payload.file), { headers: upstreamHeaders });
  } catch {
    res.status(502).end();
    return;
  }

  if (!upstream.ok || !upstream.body) {
    res.status(upstream.status || 502).end();
    return;
  }

  res.status(upstream.status);
  const passthrough = [
    "content-type",
    "content-length",
    "content-range",
    "cache-control",
    "etag",
    "last-modified",
  ];
  for (const h of passthrough) {
    const v = upstream.headers.get(h);
    if (v) res.setHeader(h, v);
  }
  res.setHeader("Accept-Ranges", upstream.headers.get("accept-ranges") ?? "bytes");

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

export const config = {
  api: {
    responseLimit: false,
  },
};
