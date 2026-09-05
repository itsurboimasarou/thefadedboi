
const HEAD_BYTES = 65536;
const MAKE = 0x010f;
const MODEL = 0x0110;
const ASCII = 2;

function readAscii(buf: Buffer, tiff: number, entry: number, le: boolean): string | undefined {
  const count = le ? buf.readUInt32LE(entry + 4) : buf.readUInt32BE(entry + 4);
  const pos = count > 4
    ? tiff + (le ? buf.readUInt32LE(entry + 8) : buf.readUInt32BE(entry + 8))
    : entry + 8;
  if (pos < 0 || pos + count > buf.length) return undefined;
  return buf.toString("latin1", pos, pos + count).replace(/\0[\s\S]*$/, "").trim() || undefined;
}

function parseExif(buf: Buffer): { make?: string; model?: string } {
  const start = buf.indexOf(Buffer.from("Exif\0\0", "latin1"));
  if (start === -1) return {};
  const x = buf.subarray(start);

  const tiff = 6;
  const order = x.toString("latin1", tiff, tiff + 2);
  if (order !== "II" && order !== "MM") return {};
  const le = order === "II";

  const ifd0 = tiff + (le ? x.readUInt32LE(tiff + 4) : x.readUInt32BE(tiff + 4));
  if (ifd0 + 2 > x.length) return {};
  const count = le ? x.readUInt16LE(ifd0) : x.readUInt16BE(ifd0);

  const out: { make?: string; model?: string } = {};
  for (let i = 0; i < count; i++) {
    const e = ifd0 + 2 + i * 12;
    if (e + 12 > x.length) break;
    const tag = le ? x.readUInt16LE(e) : x.readUInt16BE(e);
    if (tag !== MAKE && tag !== MODEL) continue;
    const type = le ? x.readUInt16LE(e + 2) : x.readUInt16BE(e + 2);
    if (type !== ASCII) continue;
    if (tag === MAKE) out.make = readAscii(x, tiff, e, le);
    else out.model = readAscii(x, tiff, e, le);
  }
  return out;
}

export interface CameraTags {
  make?: string;
  model?: string;
}

async function read(url: string): Promise<CameraTags> {
  try {
    const res = await fetch(url, { headers: { Range: `bytes=0-${HEAD_BYTES - 1}` } });
    if (!res.ok) return {};
    return parseExif(Buffer.from(await res.arrayBuffer()));
  } catch (err) {
    console.warn(`[photo] failed reading EXIF for ${url}:`, err);
    return {};
  }
}

const cache = new Map<string, Promise<CameraTags>>();

export function readCamera(url: string): Promise<CameraTags> {
  let hit = cache.get(url);
  if (!hit) {
    hit = read(url);
    hit.then((tags) => { if (!tags.model) cache.delete(url); }, () => cache.delete(url));
    cache.set(url, hit);
  }
  return hit;
}
