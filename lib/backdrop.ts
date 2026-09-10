import { useSyncExternalStore } from "react";
import { createSetting } from "./setting";

export type BackdropMedia = "video" | "image";

export type BackdropKind = "none" | "gradient" | "image" | "video";

export type BackdropChoice = "none" | "gradient" | "media";

const CHOICES: BackdropChoice[] = ["none", "gradient", "media"];

export interface BackdropAvailability {
  video: boolean | null;
  image: boolean | null;
  imageSrc: string | null;
  videoSrc: string | null;
}

const EVT = "backdrop-availability-change";

let avail: BackdropAvailability = { video: null, image: null, imageSrc: null, videoSrc: null };
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

interface BackdropManifest {
  video: string | null;
  image: string | null;
}

async function ensureProbed() {
  if (probed || typeof window === "undefined") return;
  probed = true;

  let manifest: BackdropManifest;
  try {
    const res = await fetch("/api/backdrop");
    if (!res.ok) throw new Error(String(res.status));
    manifest = await res.json();
  } catch {
    return;
  }

  const video = manifest.video;
  if (video) {
    probeVideo(video).then((ok) => publish({ video: ok, videoSrc: ok ? video : null }));
  } else {
    publish({ video: false, videoSrc: null });
  }

  const image = manifest.image;
  if (image) {
    probeImage(image).then((ok) => publish({ image: ok, imageSrc: ok ? image : null }));
  } else {
    publish({ image: false, imageSrc: null });
  }
}

export function markBackdropUnavailable(kind: BackdropMedia) {
  if (avail[kind] === false) return;
  publish(
    kind === "image"
      ? { image: false, imageSrc: null }
      : { video: false, videoSrc: null }
  );
}


const subscribe = (onChange: () => void) => {
  ensureProbed();
  window.addEventListener(EVT, onChange);
  return () => window.removeEventListener(EVT, onChange);
};
const SERVER: BackdropAvailability = { video: null, image: null, imageSrc: null, videoSrc: null };

export function useBackdropAvailability(): BackdropAvailability {
  return useSyncExternalStore(subscribe, () => avail, () => SERVER);
}

const choiceSetting = createSetting<BackdropChoice>({
  key: "bg-backdrop",
  event: "bg-backdrop-change",
  fallback: "media",
  parse: (raw) =>
    raw === "video" || raw === "image"
      ? "media"
      : CHOICES.includes(raw as BackdropChoice)
        ? (raw as BackdropChoice)
        : "media",
  apply: (v) => {
    if (typeof document !== "undefined") document.documentElement.dataset.backdrop = v;
  },
});

const mediaSetting = createSetting<BackdropMedia>({
  key: "bg-media",
  event: "bg-media-change",
  fallback: "video",
  parse: (raw) => {
    if (raw === "image" || raw === "video") return raw;
    try {
      if (localStorage.getItem("bg-backdrop") === "image") return "image";
    } catch {}
    return "video";
  },
});

export const useBackdropChoice = choiceSetting.use;
export const setBackdropChoice = choiceSetting.set;
export const useBackdropMedia = mediaSetting.use;
export const setBackdropMedia = mediaSetting.set;

export function mediaAvailable(a: BackdropAvailability, kind: BackdropMedia): boolean {
  return kind === "video" ? a.video !== false : a.image === true;
}

export function canSwapMedia(a: BackdropAvailability): boolean {
  return mediaAvailable(a, "video") && mediaAvailable(a, "image");
}

export function resolveBackdrop(
  a: BackdropAvailability,
  choice: BackdropChoice,
  media: BackdropMedia
): BackdropKind {
  if (choice !== "media") return choice;
  const other: BackdropMedia = media === "video" ? "image" : "video";
  if (mediaAvailable(a, media)) return media;
  if (mediaAvailable(a, other)) return other;
  return "gradient";
}
