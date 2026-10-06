import { parseWebStream, selectCover } from "music-metadata";
import type { AudioFormat } from "./types";

export interface TrackPicture {
  data: Uint8Array;
  format: string;
}

export interface FileTrackMeta {
  title?: string;
  artist?: string;
  album?: string;
  bitrate?: number;
  bitDepth?: number;
  sampleRate?: number;
  lossless?: boolean;
  duration?: number;
  picture?: TrackPicture;
}

const EXT_FORMAT: Record<string, AudioFormat> = {
  mp3: "MP3",
  flac: "FLAC",
  ogg: "OGG",
  wav: "WAV",
  m4a: "M4A",
};

export function formatFromFile(file: string): AudioFormat | undefined {
  const ext = file.split(".").pop()?.toLowerCase();
  return ext ? EXT_FORMAT[ext] : undefined;
}

async function fetchTrackMeta(url: string): Promise<FileTrackMeta> {
  try {
    const res = await fetch(url);
    if (!res.ok || !res.body) return {};
    const { common, format } = await parseWebStream(
      res.body,
      { mimeType: res.headers.get("content-type") ?? undefined },
      { duration: true, skipPostHeaders: true }
    );
    const cover = selectCover(common.picture);
    return {
      title: common.title,
      artist: common.artist,
      album: common.album,
      bitrate: format.bitrate ? Math.round(format.bitrate / 1000) : undefined,
      bitDepth: format.bitsPerSample,
      sampleRate: format.sampleRate ? format.sampleRate / 1000 : undefined,
      lossless: format.lossless,
      duration: format.duration,
      picture: cover ? { data: cover.data, format: cover.format } : undefined,
    };
  } catch (err) {
    console.warn(`[music] failed reading metadata for ${url}:`, err);
    return {};
  }
}

const cache = new Map<string, Promise<FileTrackMeta>>();

export function getTrackMeta(url: string): Promise<FileTrackMeta> {
  let entry = cache.get(url);
  if (!entry) {
    entry = fetchTrackMeta(url);
    cache.set(url, entry);
  }
  return entry;
}
