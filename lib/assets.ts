import type {
  Manifest,
  Subject,
  Album,
  DeviceSection,
} from "./types";

export const CDN = "https://cdn.thefadedboi.me";

export const REPO = "itsurboimasarou/site-assets";
export const BRANCH = "main";
export const RAW = `https://raw.githubusercontent.com/${REPO}/${BRANCH}`;

const IMAGE_EXT = /\.(png|jpe?g|webp|gif|avif|svg)$/i;
const IGNORE_PREFIX = /^_/;

const encPath = (p: string) =>
  p.split(/[\/\\]/).map(encodeURIComponent).join("/");

export const cdnUrl = (folder: string, file: string) =>
  `${CDN}/albums/${encPath(folder)}/${encodeURIComponent(file)}`;

const indexUrl = (folder: string) =>
  `${CDN}/albums/${encPath(folder)}/index.json`;

export const USE_THUMBS = process.env.PHOTOS_THUMBS === "1";

export const thumbUrl = (folder: string, file: string) =>
  USE_THUMBS
    ? `${CDN}/thumbs/${encPath(folder)}/${encodeURIComponent(file)}`
    : cdnUrl(folder, file);

export const deviceImage = (file: string) =>
  `${RAW}/devices/${encodeURIComponent(file)}`;

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
  try {
    const res = await fetch(indexUrl(folder));
    if (!res.ok) {
      console.warn(
        `[assets] ${res.status} reading albums/${folder}/index.json — ` +
          `run "npm run sync-photos" to regenerate it`
      );
      return [];
    }
    const data = await res.json();
    const names: string[] = Array.isArray(data)
      ? data
      : Array.isArray(data?.files)
        ? data.files
        : [];

    return names
      .filter(
        (n) =>
          typeof n === "string" && IMAGE_EXT.test(n) && !IGNORE_PREFIX.test(n)
      )
      .sort()
      .map((name) => ({
        full: cdnUrl(folder, name),
        thumb: thumbUrl(folder, name),
      }));
  } catch (err) {
    console.warn(`[assets] failed reading albums/${folder}/index.json:`, err);
    return [];
  }
}

function validateSubjects(raw: any): Subject[] {
  if (!raw || !Array.isArray(raw.subjects)) return [];

  const okAlbum = (a: any): boolean =>
    a &&
    typeof a.slug === "string" &&
    typeof a.title === "string" &&
    typeof a.folder === "string";

  return raw.subjects
    .filter(
      (s: any) =>
        s && typeof s.slug === "string" && typeof s.title === "string"
    )
    .map((s: any) => ({
      ...s,
      albums: Array.isArray(s.albums)
        ? s.albums.filter(okAlbum).map((a: any) => {
            const { subAlbums, ...rest } = a;
            const subs = Array.isArray(subAlbums)
              ? subAlbums.filter(okAlbum)
              : [];
            return subs.length ? { ...rest, subAlbums: subs } : rest;
          })
        : [],
    }));
}

export async function getManifest(): Promise<Manifest> {
  const raw = await fetchJson("gallery.json");
  if (!raw) return { version: 2, subjects: [] };
  return { version: raw.version ?? 2, subjects: validateSubjects(raw) };
}

export function findAlbum(
  subjects: Subject[],
  subjectSlug: string,
  albumSlug: string
): { subject: Subject; album: Album } | null {
  const subject = subjects.find((s) => s.slug === subjectSlug);
  const album = subject?.albums.find((a) => a.slug === albumSlug);
  return subject && album ? { subject, album } : null;
}

function validateDevices(raw: any): DeviceSection[] {
  if (!raw || !Array.isArray(raw.sections)) return [];
  return raw.sections
    .filter(
      (s: any) =>
        s && typeof s.categoryName === "string" && Array.isArray(s.items)
    )
    .map((s: any) => ({
      categoryName: s.categoryName,
      category: s.category ?? "gear",
      items: s.items
        .filter((i: any) => i && typeof i.name === "string")
        .map((i: any) => {
          const { specs, ...rest } = i;
          const ok = Array.isArray(specs)
            ? specs.filter(
                (sp: any) =>
                  sp &&
                  typeof sp.label === "string" &&
                  typeof sp.value === "string"
              )
            : [];
          return ok.length ? { ...rest, specs: ok } : rest;
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
