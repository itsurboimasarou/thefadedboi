import { useEffect, useState } from "react";

export type CoverTone = "dark" | "light";

export interface CoverAmbient {
  src: string | null;
  tone: CoverTone;
}

const SAMPLE = 16;
const LIGHT_THRESHOLD = 0.6;

function toneOf(img: HTMLImageElement): CoverTone {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = SAMPLE;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return "dark";
    ctx.drawImage(img, 0, 0, SAMPLE, SAMPLE);
    const { data } = ctx.getImageData(0, 0, SAMPLE, SAMPLE);
    let sum = 0;
    for (let i = 0; i < data.length; i += 4) {
      sum += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
    }
    const luminance = sum / (data.length / 4) / 255;
    return luminance > LIGHT_THRESHOLD ? "light" : "dark";
  } catch {
    return "dark";
  }
}

export function useCoverTone(src: string | undefined, enabled: boolean): CoverAmbient {
  const [loaded, setLoaded] = useState<CoverAmbient>({ src: null, tone: "dark" });

  useEffect(() => {
    if (!src || !enabled) return;
    let cancelled = false;
    const load = (cors: boolean) => {
      const img = new Image();
      if (cors) img.crossOrigin = "anonymous";
      img.onload = () => {
        if (!cancelled) setLoaded({ src, tone: cors ? toneOf(img) : "dark" });
      };
      img.onerror = () => { if (!cancelled && cors) load(false); };
      img.src = src;
    };
    load(true);
    return () => { cancelled = true; };
  }, [src, enabled]);

  return loaded;
}
