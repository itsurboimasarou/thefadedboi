import type { NextApiRequest, NextApiResponse } from "next";
import { getMusicManifest, trackUrl } from "@/lib/assets";
import { getTrackMeta, formatFromFile } from "@/lib/musicMeta";
import { createStreamToken } from "@/lib/streamToken";
import type { ScannedPlaylist, Track } from "@/lib/types";

const stemOf = (file: string) => file.replace(/\.[^.]+$/, "");

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse<{ playlists: ScannedPlaylist[] }>
) {
  const { playlists } = await getMusicManifest();

  const resolved: ScannedPlaylist[] = await Promise.all(
    playlists.map(async (p) => ({
      ...p,
      cover: p.cover ? trackUrl(p.folder, p.cover) : undefined,
      tracks: await Promise.all(
        p.tracks.map(async (t): Promise<Track> => {
          const rawUrl = trackUrl(p.folder, t.file);
          const meta = await getTrackMeta(rawUrl);
          const token = createStreamToken(p.folder, t.file);
          return {
            file: t.file,
            url: `/api/stream?t=${token}`,
            title: meta.title ?? t.title ?? stemOf(t.file),
            artist: meta.artist ?? t.artist,
            album: meta.album,
            cover: meta.picture ? `/api/cover?t=${token}` : undefined,
            format: formatFromFile(t.file) ?? t.format,
            bitrate: meta.bitrate ?? t.bitrate,
            bitDepth: meta.bitDepth ?? t.bitDepth,
            sampleRate: meta.sampleRate ?? t.sampleRate,
            duration: meta.duration ?? t.duration,
          };
        })
      ),
    }))
  );

  res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
  res.status(200).json({ playlists: resolved });
}
