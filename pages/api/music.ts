import type { NextApiRequest, NextApiResponse } from "next";
import { getMusicManifest, trackUrl } from "@/lib/assets";
import { formatFromFile } from "@/lib/musicMeta";
import { createStreamToken } from "@/lib/streamToken";
import type { ScannedPlaylist, Track } from "@/lib/types";

const stemOf = (file: string) => file.replace(/\.[^.]+$/, "");

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse<{ playlists: ScannedPlaylist[] }>
) {
  const { playlists } = await getMusicManifest();

  const resolved: ScannedPlaylist[] = playlists.map((p) => ({
    ...p,
    cover: p.cover ? trackUrl(p.folder, p.cover) : undefined,
    tracks: p.tracks.map((t): Track => {
      const token = createStreamToken(p.folder, t.file);
      return {
        file: t.file,
        url: `/api/stream?t=${token}`,
        title: t.title ?? stemOf(t.file),
        artist: t.artist,
        album: t.album,
        cover: t.hasCover ? `/api/cover?t=${token}` : undefined,
        format: formatFromFile(t.file) ?? t.format,
        bitrate: t.bitrate,
        bitDepth: t.bitDepth,
        sampleRate: t.sampleRate,
        lossless: t.lossless,
        duration: t.duration,
      };
    }),
  }));

  res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
  res.status(200).json({ playlists: resolved });
}
