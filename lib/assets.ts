import type {
  Manifest,
  GalleryAlbum,
  DeviceSection,
  MusicManifest,
  Playlist,
  TrackMeta,
} from "./types";
import type { Localized } from "./i18n";

const isLocalizedString = (v: any): v is Localized<string> =>
  !!v && typeof v.en === "string" && typeof v.vi === "string";

export const CDN = "https://cdn.thefadedboi.me";

const REPO = "itsurboimasarou/site-assets";
const BRANCH = "main";
const RAW = `https://gitea.com/${REPO}/raw/branch/${BRANCH}`;

const IMAGE_EXT = /\.(png|jpe?g|webp|gif|avif|svg)$/i;
const IGNORE_PREFIX = /^_/;

const encPath = (p: string) =>
  p.split(/[\/\\]/).map(encodeURIComponent).join("/");

const assetUrl = (kind: string, folder: string, file: string) =>
  `${CDN}/${kind}/${encPath(folder)}/${encPath(file)}`;

export const cdnUrl = (folder: string, file: string) =>
  `${CDN}/${encPath(folder)}/${encPath(file)}`;

export const trackUrl = (folder: string, file: string) =>
  assetUrl("tracks", folder, file);

const thumbUrl = (folder: string, file: string) =>
  `/api/thumb?folder=${encodeURIComponent(folder)}&file=${encodeURIComponent(file)}`;

// ── CDN proxying ────────────────────────────────────────────────────
// Shared by both proxy routes: /api/thumb (re-encodes to AVIF) and
// /api/photo (streams the original as a download). They exist because the
// CDN sends no CORS headers, so the browser can't fetch it directly.
const CDN_HOST = new URL(CDN).host;

// Parses a caller-supplied URL, returning null unless it points at our own
// CDN. Both routes take a URL from the query string, so this check is what
// keeps them from being usable as an open proxy for arbitrary hosts.
export function cdnTarget(src: string): URL | null {
  try {
    const url = new URL(src);
    return url.host === CDN_HOST ? url : null;
  } catch {
    return null;
  }
}

// Collapses network errors and non-2xx into a single null failure path, so
// callers don't each have to re-implement try/catch plus an .ok check.
export async function cdnFetch(target: URL | string): Promise<Response | null> {
  const res = await fetch(target).catch(() => null);
  return res?.ok ? res : null;
}

const indexUrl = (folder: string) =>
  `${CDN}/${encPath(folder)}/index.json`;

async function listFiles(folder: string, ext: RegExp): Promise<string[]> {
  try {
    const res = await fetch(indexUrl(folder));

    const data = await res.json();
    const names: string[] = Array.isArray(data)
      ? data
      : Array.isArray(data?.files)
        ? data.files
        : [];

    return names
      .filter((n) => {
        if (typeof n !== "string") return false;
        const base = n.split("/").pop() ?? n;
        return ext.test(base) && !IGNORE_PREFIX.test(base);
      })
      .sort();
  } catch (err) {
    console.warn(`[assets] failed reading ${folder}/index.json:`, err);
    return [];
  }
}

export const deviceImage = (file: string) =>
  `${RAW}/devices/${encodeURIComponent(file)}`;

export const bgVideoUrl = `${CDN}/bg.mp4`;

async function fetchRaw(path: string): Promise<string | null> {
  try {
    const res = await fetch(`${RAW}/${path}`, {
      headers: { "Cache-Control": "no-cache" },
    });
    if (!res.ok) {
      console.warn(`[assets] ${res.status} fetching ${path}`);
      return null;
    }
    return await res.text();
  } catch (err) {
    console.warn(`[assets] failed fetching ${path}:`, err);
    return null;
  }
}

async function fetchJson<T = any>(path: string): Promise<T | null> {
  const text = await fetchRaw(path);
  if (text === null) return null;
  try {
    return JSON.parse(text) as T;
  } catch (err) {
    console.warn(`[assets] ${path} is not valid JSON:`, err);
    return null;
  }
}

export async function listImages(
  folder: string
): Promise<{ full: string; thumb: string }[]> {
  const names = await listFiles(folder, IMAGE_EXT);
  return names.map((name) => ({
    full: cdnUrl(folder, name),
    thumb: thumbUrl(folder, name),
  }));
}

function validateAlbums(raw: any): GalleryAlbum[] {
  if (!raw || !Array.isArray(raw.albums)) return [];
  return raw.albums
    .filter((a: any) => a && typeof a.folder === "string")
    .map((a: any) => ({ folder: a.folder }));
}

export async function getManifest(): Promise<Manifest> {
  const raw = await fetchJson("gallery.json");
  if (!raw) return { version: 4, albums: [] };
  return { version: raw.version ?? 4, albums: validateAlbums(raw) };
}

const okTrack = (t: any): t is TrackMeta =>
  t && typeof t.file === "string";

function validatePlaylists(raw: any): Playlist[] {
  if (!raw || !Array.isArray(raw.playlists)) return [];
  return raw.playlists
    .filter((p: any) => p && typeof p.folder === "string")
    .map((p: any) => ({
      ...p,
      tracks: Array.isArray(p.tracks) ? p.tracks.filter(okTrack) : [],
    }));
}

export async function getMusicManifest(): Promise<MusicManifest> {
  const raw = await fetchJson("music.json");
  if (!raw) return { version: 1, playlists: [] };
  return { version: raw.version ?? 1, playlists: validatePlaylists(raw) };
}

function validateDevices(raw: any): DeviceSection[] {
  if (!raw || !Array.isArray(raw.sections)) return [];
  return raw.sections
    .filter(
      (s: any) =>
        s && isLocalizedString(s.categoryName) && Array.isArray(s.items)
    )
    .map((s: any) => ({
      categoryName: s.categoryName,
      category: s.category ?? "gear",
      items: s.items
        .filter((i: any) => i && typeof i.name === "string")
        .map((i: any) => {
          const { specs, detail, ...rest } = i;
          const ok = Array.isArray(specs)
            ? specs.filter(
                (sp: any) =>
                  sp &&
                  isLocalizedString(sp.label) &&
                  typeof sp.value === "string"
              )
            : [];
          const item = ok.length ? { ...rest, specs: ok } : rest;
          return isLocalizedString(detail) ? { ...item, detail } : item;
        }),
    }))
    .filter((s: DeviceSection) => s.items.length > 0);
}

export async function getDevices(): Promise<DeviceSection[]> {
  return validateDevices(await fetchJson("devices.json"));
}

export async function getChangelog(): Promise<string> {
  return (await fetchRaw("changelog.md")) ?? "";
}
