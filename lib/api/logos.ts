import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

const EXTENSIONS = new Set([".png", ".webp", ".svg", ".jpg", ".jpeg"]);
const EXCLUDED = new Set(["logo-dark", "logo-light"]);

export default function handler(_req: NextApiRequest, res: NextApiResponse<string[]>) {
  const dir = path.join(process.cwd(), "public", "logo");
  let files: string[] = [];
  try {
    files = fs
      .readdirSync(dir)
      .filter((f) => EXTENSIONS.has(path.extname(f).toLowerCase()) && !EXCLUDED.has(path.parse(f).name))
      .sort();
  } catch {
    files = [];
  }
  res.status(200).json(files);
}
