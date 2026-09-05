import type { NextApiRequest, NextApiResponse } from "next";
import { getBackdrop, type BackdropManifest } from "@/lib/assets";

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse<BackdropManifest>
) {
  const manifest = await getBackdrop();
  const video = process.env.NEXT_PUBLIC_BG_VIDEO || manifest.video;
  const image = process.env.NEXT_PUBLIC_BG_IMAGE || manifest.image;

  res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
  res.status(200).json({ video, image });
}
