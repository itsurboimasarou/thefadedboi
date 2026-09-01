import crypto from "crypto";

const SC = process.env.MUSIC_SS;
const TTL_MS = 12 * 60 * 60 * 1000;

interface StreamPayload {
  folder: string;
  file: string;
  exp: number;
}

function secret(): string {
  if (!SC) {
    throw new Error(
      "MUSIC_SIGN_SECRET is not available."
    );
  }
  return SC;
}

function sign(data: string): string {
  return crypto.createHmac("sha256", secret()).update(data).digest("base64url");
}

function verifySig(data: string, sig: string): boolean {
  const expected = Buffer.from(sign(data));
  const given = Buffer.from(sig);
  return expected.length === given.length && crypto.timingSafeEqual(expected, given);
}

export function createStreamToken(folder: string, file: string): string {
  const payload: StreamPayload = { folder, file, exp: Date.now() + TTL_MS };
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${data}.${sign(data)}`;
}

export function verifyStreamToken(token: string): { folder: string; file: string } | null {
  const dot = token.indexOf(".");
  if (dot === -1) return null;
  const data = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!verifySig(data, sig)) return null;

  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString()) as StreamPayload;
    if (typeof payload.folder !== "string" || typeof payload.file !== "string") return null;
    if (typeof payload.exp !== "number" || Date.now() > payload.exp) return null;
    return { folder: payload.folder, file: payload.file };
  } catch {
    return null;
  }
}
