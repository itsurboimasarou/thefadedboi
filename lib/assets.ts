import type {
  Manifest,
  GalleryAlbum,
  GalleryVideo,
  VideoInfo,
  DeviceSection,
  MusicManifest,
  Playlist,
  TrackMeta,
} from "./types";
import type { Localized } from "./i18n";
import { HEAVY_BYTES } from "./thumbs";
import { deviceFrom, validateCameras, type CameraTable } from "./cameras";

const isLocalizedString = (v: any): v is Localized<string> =>
  !!v && typeof v.en === "string" && typeof v.vi === "string";

export const CDN = "https://cdn.thefadedboi.me";

export const API = (
  process.env.ASSETS_API ?? "https://site-assets-api.itsurboimasarou.workers.dev"
).replace(/\/+$/, "");

const VIDEO_EXT = /\.(mp4|m4v|webm|mov|ogv|ogg|mkv|3gp|3g2)$/i;

export const VIDEO_ROOT = "videos";

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

async function fetchApi<T = any>(path: string): Promise<T | null> {
  try {
    const key = process.env.ASSETS_API_KEY;
    const res = await fetch(`${API}${path}`, {
      headers: key ? { Authorization: `Bearer ${key}` } : undefined,
    });
    if (!res.ok) {
      if (res.status !== 404) console.warn(`[assets] ${res.status} fetching ${path}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.warn(`[assets] failed fetching ${path}:`, err);
    return null;
  }
}

const albumPath = (folder: string) =>
  `/album?folder=${encodeURIComponent(folder)}`;

export const deviceImage = (file: string) =>
  `${CDN}/devices/${encodeURIComponent(file)}`;

export interface BackdropManifest {
  video: string | null;
  image: string | null;
}

const backdropUrl = (p: string, version: string | null) => {
  if (/^https?:\/\//i.test(p)) return p;
  const url = `${CDN}/${encPath(p.replace(/^\/+/, ""))}`;
  return version ? `${url}?v=${encodeURIComponent(version)}` : url;
};

const named = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);

export async function getBackdrop(): Promise<BackdropManifest> {
  const raw = section(await getMisc(), "backdrop");
  if (!raw) return { video: null, image: null };

  const video = named(raw.video);
  const image = named(raw.image);
  return {
    video: video ? backdropUrl(video, named(raw.videoVersion)) : null,
    image: image ? backdropUrl(image, named(raw.imageVersion)) : null,
  };
}

export interface ScannedImage {
  full: string;
  thumb: string;
  name: string;
  device?: string;
  ratio?: number;
  heavy?: true;
}

async function getMisc(): Promise<Record<string, unknown> | null> {
  return fetchApi<Record<string, unknown>>("/misc");
}

const section = (misc: Record<string, unknown> | null, key: string) => {
  const v = misc?.[key];
  return v && typeof v === "object" ? (v as Record<string, unknown>) : null;
};

export async function getCameras(): Promise<CameraTable> {
  return validateCameras(section(await getMisc(), "cameras"));
}

const byFile = (a: { file: string }, b: { file: string }) =>
  a.file < b.file ? -1 : a.file > b.file ? 1 : 0;

const text = (v: unknown) => (typeof v === "string" ? v : undefined);
const positive = (v: unknown) => (typeof v === "number" && v > 0 ? v : undefined);

export async function listImages(folder: string): Promise<ScannedImage[]> {
  const [album, cameras] = await Promise.all([
    fetchApi(albumPath(folder)),
    getCameras(),
  ]);
  const photos: any[] = Array.isArray(album?.photos) ? album.photos : [];
  return photos
    .filter((p) => p && typeof p.file === "string")
    .sort(byFile)
    .map((p) => {
      const name: string = p.file;
      const device = deviceFrom(text(p.cameraMake), text(p.cameraModel), cameras);
      const ratio = positive(p.ratio);
      const bytes = positive(p.bytes);
      return {
        full: cdnUrl(folder, name),
        thumb: thumbUrl(folder, name),
        name: name.replace(/.[^.]+$/, ""),
        ...(device ? { device } : {}),
        ...(ratio ? { ratio } : {}),
        ...(bytes && bytes > HEAVY_BYTES ? { heavy: true as const } : {}),
      };
    });
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

const VIDEO_INFO_KEYS = [
  "container", "bytes", "width", "height", "duration", "frameRate",
  "bitrate", "videoCodec", "bitDepth", "hdr", "audioCodec", "recordedAt",
] as const satisfies readonly (keyof VideoInfo)[];

function videoInfo(v: any): VideoInfo {
  const info: Record<string, string | number> = {};
  for (const key of VIDEO_INFO_KEYS) {
    const value = v[key];
    if (typeof value === "string" || typeof value === "number") info[key] = value;
  }
  return info as VideoInfo;
}

const albumVideos = async (folder: string): Promise<any[]> => {
  const album = await fetchApi(albumPath(folder));
  const videos: any[] = Array.isArray(album?.videos) ? album.videos : [];
  return videos.filter((v) => v && typeof v.file === "string").sort(byFile);
};

export async function getVideoInfo(folder: string): Promise<Map<string, VideoInfo>> {
  return new Map((await albumVideos(folder)).map((v) => [v.file as string, videoInfo(v)]));
}

export async function listVideos(folder: string): Promise<GalleryVideo[]> {
  const rel = folder.replace(new RegExp(`^${VIDEO_ROOT}/`), "");
  return (await albumVideos(folder)).map((v) => {
    const name: string = v.file;
    return {
      src: videoUrl(`${rel}/${name}`),
      name: name.replace(/.[^.]+$/, ""),
      info: videoInfo(v),
    };
  });
}

function validateAlbums(list: any): GalleryAlbum[] {
  if (!Array.isArray(list)) return [];
  return list
    .filter((a: any) => a && typeof a.folder === "string")
    .map((a: any) => ({ folder: a.folder }));
}

export async function getManifest(): Promise<Manifest> {
  const raw = await fetchApi("/gallery");
  if (!raw) return { version: 5, photos: [], videos: [] };
  return {
    version: 5,
    photos: validateAlbums(raw.photos),
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
  const raw = await fetchApi("/music");
  if (!raw) return { version: 2, playlists: [] };
  return { version: 2, playlists: validatePlaylists(raw) };
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
      ...(s.layout === "collection" ? { layout: "collection" as const } : {}),
      ...(isLocalizedString(s.description) ? { description: s.description } : {}),
      items: s.items
        .filter((i: any) => i && typeof i.name === "string")
        .map((i: any) => {
          const { specs, detail, year, ...rest } = i;
          if (typeof year === "string" || typeof year === "number") rest.year = String(year);
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
  return validateDevices(await fetchApi("/devices"));
}
