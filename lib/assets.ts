import type {
  Manifest,
  GalleryAlbum,
  GalleryVideo,
  DeviceSection,
  MusicManifest,
  Playlist,
  TrackMeta,
} from "./types";
import type { Localized } from "./i18n";
import { readCamera } from "./photoMeta";
import { deviceFrom, validateCameras, type CameraTable } from "./cameras";

const isLocalizedString = (v: any): v is Localized<string> =>
  !!v && typeof v.en === "string" && typeof v.vi === "string";

export const CDN = "https://cdn.thefadedboi.me";

const REPO = "itsurboimasarou/site-assets";
const BRANCH = "main";
const RAW = `https://gitea.com/${REPO}/raw/branch/${BRANCH}`;

const IMAGE_EXT = /\.(png|jpe?g|webp|gif|avif|svg)$/i;
const VIDEO_EXT = /\.(mp4|m4v|webm|mov|ogv|ogg|mkv|3gp|3g2)$/i;

export const VIDEO_ROOT = "videos";
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

const CDN_HOST = new URL(CDN).host;

export function cdnTarget(src: string): URL | null {
  try {
    const url = new URL(src);
    return url.host === CDN_HOST ? url : null;
  } catch {
    return null;
  }
}

export async function cdnFetch(target: URL | string): Promise<Response | null> {
  const res = await fetch(target).catch(() => null);
  return res?.ok ? res : null;
}

const indexUrl = (folder: string) =>
  `${CDN}/${encPath(folder)}/index.json`;

async function listFiles(folder: string, ext: RegExp): Promise<string[]> {
  try {
    const res = await fetch(indexUrl(folder), { cache: "no-store" });

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

export interface BackdropManifest {
  video: string | null;
  image: string | null;
}

const backdropUrl = (p: string) =>
  /^https?:\/\//i.test(p) ? p : `${CDN}/${encPath(p.replace(/^\/+/, ""))}`;

const named = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);

export async function getBackdrop(): Promise<BackdropManifest> {
  const raw = section(await getMisc(), "backdrop");
  if (!raw) return { video: null, image: null };

  const video = named(raw.video);
  const image = named(raw.image);
  return {
    video: video ? backdropUrl(video) : null,
    image: image ? backdropUrl(image) : null,
  };
}

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

export interface ScannedImage {
  full: string;
  thumb: string;
  name: string;
  device?: string;
}

async function getMisc(): Promise<Record<string, unknown> | null> {
  return fetchJson<Record<string, unknown>>("misc.json");
}

const section = (misc: Record<string, unknown> | null, key: string) => {
  const v = misc?.[key];
  return v && typeof v === "object" ? (v as Record<string, unknown>) : null;
};

export async function getCameras(): Promise<CameraTable> {
  return validateCameras(section(await getMisc(), "cameras"));
}

export async function listImages(folder: string): Promise<ScannedImage[]> {
  const [names, cameras] = await Promise.all([
    listFiles(folder, IMAGE_EXT),
    getCameras(),
  ]);
  return Promise.all(
    names.map(async (name) => {
      const full = cdnUrl(folder, name);
      const tags = await readCamera(full);
      const device = deviceFrom(tags.make, tags.model, cameras);
      return {
        full,
        thumb: thumbUrl(folder, name),
        name: name.replace(/\.[^.]+$/, ""),
        ...(device ? { device } : {}),
      };
    })
  );
}

export const videoOrigin = (file: string) =>
  `${CDN}/${VIDEO_ROOT}/${encPath(file)}`;

export const videoUrl = (file: string) =>
  `/api/video?file=${encodeURIComponent(file)}`;

export function isSafeVideoPath(file: string): boolean {
  if (!file || file.length > 512) return false;
  if (file.startsWith("/") || file.includes("\\") || file.includes("..")) return false;
  if (/^[a-z][a-z0-9+.-]*:/i.test(file)) return false;
  return VIDEO_EXT.test(file);
}

async function exists(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: "HEAD", cache: "no-store" });
    return res.ok;
  } catch {
    return false;
  }
}

export async function listVideos(folder: string): Promise<GalleryVideo[]> {
  const rel = folder.replace(new RegExp(`^${VIDEO_ROOT}/`), "");
  const names = await listFiles(folder, VIDEO_EXT);

  const checked = await Promise.all(
    names.map(async (name) => {
      const file = `${rel}/${name}`;
      if (await exists(videoOrigin(file))) {
        return { src: videoUrl(file), name: name.replace(/\.[^.]+$/, "") };
      }
      console.warn(`[assets] ${folder}/${name} is listed but missing from R2 — skipping`);
      return null;
    })
  );

  return checked.filter((v): v is GalleryVideo => v !== null);
}

function validateAlbums(list: any): GalleryAlbum[] {
  if (!Array.isArray(list)) return [];
  return list
    .filter((a: any) => a && typeof a.folder === "string")
    .map((a: any) => ({ folder: a.folder }));
}

export async function getManifest(): Promise<Manifest> {
  const raw = await fetchJson("gallery.json");
  if (!raw) return { version: 4, photos: [], videos: [] };
  return {
    version: raw.version ?? 4,
    photos: validateAlbums(raw.photos ?? raw.albums),
    videos: validateAlbums(raw.videos),
  };
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
