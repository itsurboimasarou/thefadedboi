import type { NextApiRequest, NextApiResponse } from "next";
import { verifyStreamToken } from "@/lib/streamToken";
import { trackUrl } from "@/lib/assets";
import { getTrackMeta } from "@/lib/musicMeta";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { t } = req.query;
  if (typeof t !== "string") {
    res.status(400).end();
    return;
  }

  const payload = verifyStreamToken(t);
  if (!payload) {
    res.status(403).end();
    return;
  }

  const meta = await getTrackMeta(trackUrl(payload.folder, payload.file));
  if (!meta.picture) {
    res.status(404).end();
    return;
  }

  res.setHeader("Content-Type", meta.picture.format);
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  res.status(200).send(Buffer.from(meta.picture.data));
}
