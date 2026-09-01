import crypto from "crypto";

const SECRET = process.env.MUSIC_SS;
const TTL_MS = 12 * 60 * 60 * 1000;
const IV_LEN = 12;
const TAG_LEN = 16;

interface StreamPayload {
  f: string;
  n: string;
  e: number;
}

let cachedKey: Buffer | null = null;

function key(): Buffer {
  if (!SECRET) throw new Error("MUSIC_SS is not set.");
  if (!cachedKey) cachedKey = crypto.createHash("sha256").update(SECRET).digest();
  return cachedKey;
}

export function createStreamToken(folder: string, file: string): string {
  const iv = crypto.randomBytes(IV_LEN);
  const cipher = crypto.createCipheriv("aes-256-gcm", key(), iv);
  const payload: StreamPayload = { f: folder, n: file, e: Date.now() + TTL_MS };
  const body = Buffer.concat([
    cipher.update(JSON.stringify(payload), "utf8"),
    cipher.final(),
  ]);
  return Buffer.concat([iv, cipher.getAuthTag(), body]).toString("base64url");
}

export function verifyStreamToken(token: string): { folder: string; file: string } | null {
  try {
    const raw = Buffer.from(token, "base64url");
    if (raw.length <= IV_LEN + TAG_LEN) return null;

    const decipher = crypto.createDecipheriv("aes-256-gcm", key(), raw.subarray(0, IV_LEN));
    decipher.setAuthTag(raw.subarray(IV_LEN, IV_LEN + TAG_LEN));
    const json = Buffer.concat([
      decipher.update(raw.subarray(IV_LEN + TAG_LEN)),
      decipher.final(),
    ]).toString("utf8");

    const p = JSON.parse(json) as StreamPayload;
    if (typeof p.f !== "string" || typeof p.n !== "string") return null;
    if (typeof p.e !== "number" || Date.now() > p.e) return null;
    return { folder: p.f, file: p.n };
  } catch {
    return null;
  }
}
