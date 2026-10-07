import { readFile } from "node:fs/promises";
import path from "node:path";

const CHANGELOG_PATH = path.join(process.cwd(), "public", "changelog.md");

export async function getChangelog(): Promise<string> {
  try {
    return await readFile(CHANGELOG_PATH, "utf8");
  } catch (err) {
    console.warn("[changelog] failed reading public/changelog.md:", err);
    return "";
  }
}
