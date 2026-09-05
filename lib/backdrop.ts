import { useSyncExternalStore } from "react";
import { createSetting } from "./setting";

export type BackdropKind = "video" | "image";

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

interface BackdropManifest {
  video: string | null;
  images: string[];
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

  findImage(manifest.images ?? []).then((src) =>
    publish({ image: src !== null, imageSrc: src })
  );
}

export function markBackdropUnavailable(kind: BackdropKind) {
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
