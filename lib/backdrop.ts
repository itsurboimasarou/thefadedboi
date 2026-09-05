import { useSyncExternalStore } from "react";
import { bgImageUrls, bgVideoUrl } from "./assets";
import { createSetting } from "./setting";

export type BackdropKind = "video" | "image";

export interface BackdropAvailability {
  video: boolean | null;
  image: boolean | null;
  imageSrc: string | null;
}

const VIDEO_SRC = process.env.NEXT_PUBLIC_BG_VIDEO || bgVideoUrl;
const IMAGE_SRCS = process.env.NEXT_PUBLIC_BG_IMAGE
  ? [process.env.NEXT_PUBLIC_BG_IMAGE]
  : bgImageUrls;
const EVT = "backdrop-availability-change";

let avail: BackdropAvailability = { video: null, image: null, imageSrc: null };
let probed = false;

function publish(next: Partial<BackdropAvailability>) {
  avail = { ...avail, ...next };
  window.dispatchEvent(new CustomEvent(EVT));
}

function probeImage(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });
}

async function findImage(srcs: string[]): Promise<string | null> {
  for (const src of srcs) {
    if (await probeImage(src)) return src;
  }
  return null;
}

function probeVideo(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    const v = document.createElement("video");
    v.muted = true;
    v.preload = "metadata";
    v.onloadedmetadata = () => resolve(true);
    v.onerror = () => resolve(false);
    v.src = src;
  });
}

function ensureProbed() {
  if (probed || typeof window === "undefined") return;
  probed = true;
  probeVideo(VIDEO_SRC).then((ok) => publish({ video: ok }));
  findImage(IMAGE_SRCS).then((src) => publish({ image: src !== null, imageSrc: src }));
}

export function markBackdropUnavailable(kind: BackdropKind) {
  if (avail[kind] === false) return;
  publish(kind === "image" ? { image: false, imageSrc: null } : { video: false });
}

export const backdropVideoSrc = VIDEO_SRC;

const subscribe = (onChange: () => void) => {
  ensureProbed();
  window.addEventListener(EVT, onChange);
  return () => window.removeEventListener(EVT, onChange);
};
const SERVER: BackdropAvailability = { video: null, image: null, imageSrc: null };

export function useBackdropAvailability(): BackdropAvailability {
  return useSyncExternalStore(subscribe, () => avail, () => SERVER);
}

const kindSetting = createSetting<BackdropKind>({
  key: "bg-backdrop",
  event: "bg-backdrop-change",
  fallback: "video",
  parse: (raw) => (raw === "image" ? "image" : "video"),
});

export const useBackdropKind = kindSetting.use;
export const setBackdropKind = kindSetting.set;

export function resolveBackdrop(a: BackdropAvailability, pref: BackdropKind): BackdropKind | null {
  const video = a.video !== false;
  const image = a.image === true;
  if (video && image) return pref;
  if (video) return "video";
  if (image) return "image";
  return null;
}
