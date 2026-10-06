const KEY = "gallery-seen";
const MAX_SEEN = 1500;
const SAVE_DELAY = 400;

let seen: Map<string, number> | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;

function save(): void {
  if (timer) clearTimeout(timer);
  timer = null;
  if (!seen) return;
  try { localStorage.setItem(KEY, JSON.stringify([...seen])); } catch {}
}

export function loadSeen(): Map<string, number> {
  if (seen) return seen;
  seen = new Map();
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "[]");
    if (Array.isArray(raw)) {
      for (const entry of raw) {
        if (Array.isArray(entry) && typeof entry[0] === "string" && entry[1] > 0) {
          seen.set(entry[0], Number(entry[1]));
        }
      }
    }
  } catch {}
  window.addEventListener("pagehide", save);
  return seen;
}

export function markSeen(src: string, ratio: number): void {
  const map = loadSeen();
  if (map.get(src) === ratio) return;
  map.delete(src);
  map.set(src, ratio);
  for (const oldest of map.keys()) {
    if (map.size <= MAX_SEEN) break;
    map.delete(oldest);
  }
  if (!timer) timer = setTimeout(save, SAVE_DELAY);
}
