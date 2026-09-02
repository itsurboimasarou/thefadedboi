import type { NextApiRequest, NextApiResponse } from "next";
import { cdnTarget, cdnFetch } from "@/lib/assets";

function filenameFrom(pathname: string): string {
  const name = decodeURIComponent(pathname.split("/").pop() || "photo.jpg");
  return name.replace(/["\r\n]/g, "");
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { src } = req.query;
  const target = typeof src === "string" ? cdnTarget(src) : null;
  if (!target) {
    res.status(400).end();
    return;
  }

  const upstream = await cdnFetch(target);
  if (!upstream?.body) {
    res.status(502).end();
    return;
  }

  res.setHeader("Content-Type", upstream.headers.get("content-type") ?? "application/octet-stream");
  const len = upstream.headers.get("content-length");
  if (len) res.setHeader("Content-Length", len);
  res.setHeader("Content-Disposition", `attachment; filename="${filenameFrom(target.pathname)}"`);
  res.setHeader("Cache-Control", "private, no-store");

  const reader = upstream.body.getReader();
  req.on("close", () => reader.cancel().catch(() => {}));
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(Buffer.from(value));
    }
  } catch (err) {
    console.warn(`[photo] stream failed for ${src}:`, err);
  } finally {
    res.end();
  }
}
