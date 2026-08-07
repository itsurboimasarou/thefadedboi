import type { Manifest, Subject, Album } from "./types";

export const REPO = "itsurboimasarou/prv-photos";
export const BRANCH = "main";
export const CDN = `https://cdn.jsdelivr.net/gh/${REPO}@${BRANCH}`;

const IMAGE_EXT = /\.(png|jpe?g|webp|gif|avif|svg)$/i;

/** Encode each path segment separately: encodeURI leaves "#", "?" and "+"
 *  intact, which silently breaks CDN URLs for files with those characters —
 *  the usual cause of a handful of photos failing while the rest load. */
const encPath = (p: string) => p.split("/").map(encodeURIComponent).join("/");

export const cdnUrl = (folder: string, file: string) =>
  `${CDN}/albums/${encPath(folder)}/${encodeURIComponent(file)}`;

/**
 * Optional pre-shrunk thumbnail. If the photos repo has a mirrored
 * `thumbs/<folder>/<file>` tree (800px longest edge is plenty), grid tiles
 * pull from it instead of the full-resolution original — by far the largest
 * available speedup, since the optimizer no longer fetches multi-MB files
 * just to emit a 300px tile.
 *
 * Set USE_THUMBS once the thumbs/ tree exists; until then grids fall back to
 * originals and nothing breaks.
 */
export const USE_THUMBS = process.env.PHOTOS_THUMBS === "1";

export const thumbUrl = (folder: string, file: string) =>
  USE_THUMBS
    ? `${CDN}/thumbs/${encPath(folder)}/${encodeURIComponent(file)}`
    : cdnUrl(folder, file);

const ghHeaders: HeadersInit = {
  Accept: "application/vnd.github+json",
  ...(process.env.GITHUB_TOKEN && {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
  }),
};

export async function listImages(
  folder: string
): Promise<{ full: string; thumb: string }[]> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${REPO}/contents/albums/${encPath(folder)}?ref=${BRANCH}`,
      { headers: ghHeaders }
    );
    if (!res.ok) {
      // console.warn(`[gallery] ${res.status} listing albums/${folder}`);
      return [];
    }
    const files: { name: string; type: string }[] = await res.json();
    return files
      .filter((f) => f.type === "file" && IMAGE_EXT.test(f.name))
      .map((f) => f.name)
      .sort()
      .map((name) => ({
        full: cdnUrl(folder, name),
        thumb: thumbUrl(folder, name),
      }));
  } catch (err) {
    // console.warn(`[gallery] failed listing albums/${folder}:`, err);
    return [];
  }
}

function validate(raw: any): Subject[] {
  if (!raw || !Array.isArray(raw.subjects)) return [];

  const okAlbum = (a: any): boolean =>
    a &&
    typeof a.slug === "string" &&
    typeof a.title === "string" &&
    typeof a.folder === "string";

  return raw.subjects
    .filter(
      (s: any) =>
        s &&
        typeof s.slug === "string" &&
        typeof s.title === "string" &&
        Array.isArray(s.albums)
    )
    .map((s: any) => ({
      ...s,
      albums: Array.isArray(s.albums)
        ? s.albums.filter(okAlbum).map((a: any) => {
            const { subAlbums, ...rest } = a;
            const subs = Array.isArray(subAlbums) ? subAlbums.filter(okAlbum) : [];
            return subs.length ? { ...rest, subAlbums: subs } : rest;
          })
        : [],
    }));
}

export async function getManifest(): Promise<Manifest> {
  try {
    const res = await fetch(
      `https://raw.githubusercontent.com/${REPO}/${BRANCH}/gallery.json`,
      { headers: { "Cache-Control": "no-cache" } }
    );
    if (!res.ok) {
      // console.warn(`[gallery] ${res.status} fetching gallery.json`);
      return { version: 2, subjects: [] };
    }
    const raw = await res.json();
    return { version: raw.version ?? 2, subjects: validate(raw) };
  } catch (err) {
    // console.warn("[gallery] failed fetching gallery.json:", err);
    return { version: 2, subjects: [] };
  }
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
