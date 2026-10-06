export const TILE_WIDTHS = [480, 960] as const;
export const VIEW_WIDTHS = [1280, 1920, 2560] as const;
export const ZOOM_WIDTH = 3840;
export const DEFAULT_WIDTH = 960;

export const THUMB_WIDTHS: readonly number[] = [...TILE_WIDTHS, ...VIEW_WIDTHS, ZOOM_WIDTH];

export const HEAVY_BYTES = 6 * 1024 * 1024;

const THUMB_API = "/api/thumb";

export const isThumbApi = (url: string) => url.startsWith(THUMB_API);

export const thumbSrc = (base: string, width: number) =>
  isThumbApi(base) ? `${base}${base.includes("?") ? "&" : "?"}w=${width}` : base;

export const thumbSrcSet = (base: string, widths: readonly number[]) =>
  isThumbApi(base) ? widths.map((w) => `${thumbSrc(base, w)} ${w}w`).join(", ") : undefined;
