import type { NextApiRequest, NextApiResponse } from "next";
import { createHash } from "crypto";
import { promises as fs } from "fs";
import os from "os";
import path from "path";
import sharp from "sharp";
import { cdnUrl, cdnFetch } from "@/lib/assets";
import { DEFAULT_WIDTH, THUMB_WIDTHS, TILE_WIDTHS, ZOOM_WIDTH } from "@/lib/thumbs";

export const config = { maxDuration: 30 };

type Format = "avif" | "webp";

const SOURCE_EXT = /\.(png|jpe?g|webp|gif|avif)$/i;

interface Tier { quality: number; effort: number }
const TILE: Tier = { quality: 60, effort: 4 };
const VIEW: Tier = { quality: 68, effort: 3 };
const ZOOM: Tier = { quality: 70, effort: 3 };

const tierFor = (width: number): Tier =>
  width >= ZOOM_WIDTH ? ZOOM : (TILE_WIDTHS as readonly number[]).includes(width) ? TILE : VIEW;

const MAX_CACHED_BYTES = 96 * 1024 * 1024;
const memory = new Map<string, Buffer>();
let memoryBytes = 0;

function memoryGet(key: string): Buffer | undefined {
  const hit = memory.get(key);
  if (hit) {
    memory.delete(key);
    memory.set(key, hit);
  }
  return hit;
}

function memorySet(key: string, buf: Buffer): void {
  const prev = memory.get(key);
  if (prev) {
    memoryBytes -= prev.length;
    memory.delete(key);
  }
  memory.set(key, buf);
  memoryBytes += buf.length;
  for (const [oldest, value] of memory) {
    if (memoryBytes <= MAX_CACHED_BYTES || oldest === key) break;
    memory.delete(oldest);
    memoryBytes -= value.length;
  }
}

const DISK_DIRS = [
  path.join(process.cwd(), ".next", "cache", "thumbs"),
  path.join(os.tmpdir(), "thefadedboi-thumbs"),
];
let diskDir: Promise<string | null> | undefined;

function resolveDiskDir(): Promise<string | null> {
  diskDir ??= (async () => {
    for (const dir of DISK_DIRS) {
      try {
        await fs.mkdir(dir, { recursive: true });
        await fs.access(dir, fs.constants.W_OK);
        return dir;
      } catch {}
    }
    return null;
  })();
  return diskDir;
}

async function diskGet(name: string): Promise<Buffer | null> {
  const dir = await resolveDiskDir();
  if (!dir) return null;
  return fs.readFile(path.join(dir, name)).catch(() => null);
}

async function diskSet(name: string, buf: Buffer): Promise<void> {
  const dir = await resolveDiskDir();
  if (!dir) return;
  const target = path.join(dir, name);
  const temp = `${target}.${process.pid}.${Date.now()}.tmp`;
  try {
    await fs.writeFile(temp, buf);
    await fs.rename(temp, target);
  } catch (err) {
    await fs.unlink(temp).catch(() => {});
    console.warn(`[thumb] failed caching ${name}:`, err);
  }
}

const building = new Map<string, Promise<Buffer>>();

function getThumb(key: string, name: string, build: () => Promise<Buffer>): Promise<Buffer> {
  const hot = memoryGet(key);
  if (hot) return Promise.resolve(hot);

  let pending = building.get(key);
  if (!pending) {
    pending = (async () => {
      const stored = await diskGet(name);
      const buf = stored ?? (await build());
      memorySet(key, buf);
      if (!stored) void diskSet(name, buf);
      return buf;
    })();
    building.set(key, pending);
    const done = () => building.delete(key);
    pending.then(done, done);
  }
  return pending;
}

const MASTER_MIN_BYTES = 3 * 1024 * 1024;
const MASTER_QUALITY = 92;

const hashOf = (key: string) => createHash("sha1").update(key).digest("hex");

async function buildMaster(folder: string, file: string): Promise<Buffer> {
  const res = await cdnFetch(cdnUrl(folder, file));
  if (!res) throw new Error("CDN fetch failed");
  const source = Buffer.from(await res.arrayBuffer());
  if (source.length < MASTER_MIN_BYTES) return source;
  return sharp(source)
    .rotate()
    .resize({ width: ZOOM_WIDTH, withoutEnlargement: true })
    .jpeg({ quality: MASTER_QUALITY, chromaSubsampling: "4:4:4" })
    .toBuffer();
}

function getMaster(folder: string, file: string): Promise<Buffer> {
  const key = `${folder}/${file}/master`;
  return getThumb(key, `${hashOf(key)}.master`, () => buildMaster(folder, file));
}

async function encode(folder: string, file: string, width: number, format: Format): Promise<Buffer> {
  const { quality, effort } = tierFor(width);
  const image = sharp(await getMaster(folder, file))
    .rotate()
    .resize({ width, withoutEnlargement: true });
  return format === "avif"
    ? image.avif({ quality, effort }).toBuffer()
    : image.webp({ quality: quality + 10, effort: 4 }).toBuffer();
}

function widthFrom(raw: unknown): number {
  const n = typeof raw === "string" ? Number(raw) : NaN;
  return THUMB_WIDTHS.includes(n) ? n : DEFAULT_WIDTH;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { folder, file, w } = req.query;
  if (typeof folder !== "string" || typeof file !== "string" || !folder || !file) {
    res.status(400).end();
    return;
  }
  if (!SOURCE_EXT.test(file) || folder.length > 512 || file.length > 512) {
    res.status(400).end();
    return;
  }
  const width = widthFrom(w);
  const format: Format = (req.headers.accept ?? "").includes("image/avif") ? "avif" : "webp";

  const key = `${folder}/${file}/${width}.${format}`;

  res.setHeader("Cache-Control", "public, max-age=31536000, s-maxage=31536000, immutable");
  res.setHeader("Vary", "Accept");

  try {
    const buf = await getThumb(key, `${hashOf(key)}.${format}`, () => encode(folder, file, width, format));
    res.setHeader("Content-Type", `image/${format}`);
    res.status(200).send(buf);
  } catch (err) {
    console.warn(`[thumb] failed for ${key}:`, err);
    res.setHeader("Cache-Control", "no-store");
    res.status(502).end();
  }
}
