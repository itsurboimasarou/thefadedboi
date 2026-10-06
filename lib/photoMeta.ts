
const HEAD_BYTES = 131072;
const MAKE = 0x010f;
const MODEL = 0x0110;
const ORIENTATION = 0x0112;
const ASCII = 2;
const SHORT = 3;

function readAscii(buf: Buffer, tiff: number, entry: number, le: boolean): string | undefined {
  const count = le ? buf.readUInt32LE(entry + 4) : buf.readUInt32BE(entry + 4);
  const pos = count > 4
    ? tiff + (le ? buf.readUInt32LE(entry + 8) : buf.readUInt32BE(entry + 8))
    : entry + 8;
  if (pos < 0 || pos + count > buf.length) return undefined;
  return buf.toString("latin1", pos, pos + count).replace(/\0[\s\S]*$/, "").trim() || undefined;
}

function parseExif(buf: Buffer): { make?: string; model?: string; orientation?: number } {
  const start = buf.indexOf(Buffer.from("Exif\0\0", "latin1"));
  if (start === -1) return {};
  const x = buf.subarray(start);

  const tiff = 6;
  if (x.length < tiff + 8) return {};
  const order = x.toString("latin1", tiff, tiff + 2);
  if (order !== "II" && order !== "MM") return {};
  const le = order === "II";

  const ifd0 = tiff + (le ? x.readUInt32LE(tiff + 4) : x.readUInt32BE(tiff + 4));
  if (ifd0 + 2 > x.length) return {};
  const count = le ? x.readUInt16LE(ifd0) : x.readUInt16BE(ifd0);

  const out: { make?: string; model?: string; orientation?: number } = {};
  for (let i = 0; i < count; i++) {
    const e = ifd0 + 2 + i * 12;
    if (e + 12 > x.length) break;
    const tag = le ? x.readUInt16LE(e) : x.readUInt16BE(e);
    if (tag !== MAKE && tag !== MODEL && tag !== ORIENTATION) continue;
    const type = le ? x.readUInt16LE(e + 2) : x.readUInt16BE(e + 2);
    if (tag === ORIENTATION) {
      if (type === SHORT) out.orientation = le ? x.readUInt16LE(e + 8) : x.readUInt16BE(e + 8);
      continue;
    }
    if (type !== ASCII) continue;
    if (tag === MAKE) out.make = readAscii(x, tiff, e, le);
    else out.model = readAscii(x, tiff, e, le);
  }
  return out;
}

function jpegSize(buf: Buffer): { width?: number; height?: number } {
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return {};
  let p = 2;
  while (p + 9 <= buf.length) {
    if (buf[p] !== 0xff) return {};
    const marker = buf[p + 1];
    if (marker === 0xff) { p++; continue; }
    if (marker === 0xda) return {};
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { height: buf.readUInt16BE(p + 5), width: buf.readUInt16BE(p + 7) };
    }
    p += 2 + buf.readUInt16BE(p + 2);
  }
  return {};
}

function totalBytes(res: Response): number | undefined {
  const range = res.headers.get("content-range")?.match(/\/(\d+)\s*$/);
  const raw = range ? range[1] : res.status === 200 ? res.headers.get("content-length") : null;
  const n = raw ? Number(raw) : NaN;
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

export interface PhotoMeta {
  make?: string;
  model?: string;
  ratio?: number;
  bytes?: number;
}

async function read(url: string): Promise<PhotoMeta> {
  try {
    const res = await fetch(url, { headers: { Range: `bytes=0-${HEAD_BYTES - 1}` } });
    if (!res.ok) return {};
    const bytes = totalBytes(res);
    const buf = Buffer.from(await res.arrayBuffer());
    const { make, model, orientation } = parseExif(buf);
    const { width, height } = jpegSize(buf);
    const turned = orientation !== undefined && orientation >= 5 && orientation <= 8;
    const ratio =
      width && height
        ? Math.round((turned ? height / width : width / height) * 1000) / 1000
        : undefined;
    return { make, model, ratio, bytes };
  } catch (err) {
    console.warn(`[photo] failed reading metadata for ${url}:`, err);
    return {};
  }
}

const cache = new Map<string, Promise<PhotoMeta>>();

export function readPhotoMeta(url: string): Promise<PhotoMeta> {
  let hit = cache.get(url);
  if (!hit) {
    hit = read(url);
    hit.then((meta) => { if (!meta.model) cache.delete(url); }, () => cache.delete(url));
    cache.set(url, hit);
  }
  return hit;
}
