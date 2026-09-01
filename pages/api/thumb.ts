import type { NextApiRequest, NextApiResponse } from "next";
import sharp from "sharp";
import { cdnUrl, cdnFetch } from "@/lib/assets";

const SIZES = {
  sm: { width: 960, quality: 68 },
  lg: { width: 1600, quality: 68 },
} as const;
type Size = keyof typeof SIZES;
const EFFORT = 4;

const MAX_CACHED = 120;
const cache = new Map<string, Promise<Buffer>>();

function cacheGet(key: string): Promise<Buffer> | undefined {
  const hit = cache.get(key);
  if (hit) {
    cache.delete(key);
    cache.set(key, hit);
  }
  return hit;
}

function cacheSet(key: string, value: Promise<Buffer>): void {
  cache.set(key, value);
  if (cache.size > MAX_CACHED) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
}

async function buildThumb(folder: string, file: string, size: Size): Promise<Buffer> {
  const { width, quality } = SIZES[size];
  const res = await cdnFetch(cdnUrl(folder, file));
  if (!res) throw new Error("CDN fetch failed");
  const bytes = await res.arrayBuffer();
  return sharp(Buffer.from(bytes))
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .avif({ quality, effort: EFFORT })
    .toBuffer();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { folder, file, size: sizeParam } = req.query;
  if (typeof folder !== "string" || typeof file !== "string" || !folder || !file) {
    res.status(400).end();
    return;
  }
  const size: Size = sizeParam === "lg" ? "lg" : "sm";

  const key = `${folder}/${file}/${size}`;
  let entry = cacheGet(key);
  if (!entry) {
    entry = buildThumb(folder, file, size);
    entry.catch(() => cache.delete(key));
    cacheSet(key, entry);
  }

  try {
    const buf = await entry;
    res.setHeader("Content-Type", "image/avif");
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.status(200).send(buf);
  } catch (err) {
    console.warn(`[thumb] failed for ${key}:`, err);
    res.status(502).end();
  }
}
