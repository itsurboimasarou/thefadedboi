export interface CameraTable {
  names: Map<string, string>;
  showUnmapped: boolean;
}

export const EMPTY_CAMERAS: CameraTable = { names: new Map(), showUnmapped: false };

const clean = (s?: string) => s?.trim().replace(/\s+/g, " ") ?? "";

export function validateCameras(raw: unknown): CameraTable {
  if (!raw || typeof raw !== "object") return EMPTY_CAMERAS;
  const r = raw as { names?: unknown; showUnmapped?: unknown };
  const names = new Map<string, string>();
  if (r.names && typeof r.names === "object") {
    for (const [k, v] of Object.entries(r.names as Record<string, unknown>)) {
      if (typeof v === "string" && clean(k)) names.set(clean(k).toLowerCase(), v);
    }
  }
  return { names, showUnmapped: r.showUnmapped === true };
}

export function deviceFrom(make: string | undefined, model: string | undefined, table: CameraTable): string | undefined {
  const m = clean(model);
  if (!m) return undefined;

  const mk = clean(make);
  const pair = mk && !m.toLowerCase().startsWith(mk.toLowerCase()) ? `${mk} ${m}` : m;

  return (
    table.names.get(m.toLowerCase()) ??
    table.names.get(pair.toLowerCase()) ??
    (table.showUnmapped ? pair : undefined)
  );
}
