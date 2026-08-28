import type { NextApiRequest, NextApiResponse } from "next";
import { getMusicManifest, trackUrl } from "@/lib/assets";
import type { ScannedPlaylist } from "@/lib/types";

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse<{ playlists: ScannedPlaylist[] }>
) {
  const { playlists } = await getMusicManifest();

  const resolved: ScannedPlaylist[] = playlists.map((p) => ({
    ...p,
    cover: p.cover ? trackUrl(p.folder, p.cover) : undefined,
    tracks: p.tracks.map((t) => ({ ...t, url: trackUrl(p.folder, t.file) })),
  }));

  res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
  res.status(200).json({ playlists: resolved });
}
