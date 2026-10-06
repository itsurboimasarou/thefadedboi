import { useEffect, useState } from "react";

export type CoverTone = "dark" | "light";

const SAMPLE = 16;
const LIGHT_THRESHOLD = 0.6;

export function useCoverTone(src: string | undefined, enabled: boolean): CoverTone {
  const [tone, setTone] = useState<CoverTone>("dark");

  useEffect(() => {
    if (!src || !enabled) return;
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (cancelled) return;
      try {
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = SAMPLE;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, SAMPLE, SAMPLE);
        const { data } = ctx.getImageData(0, 0, SAMPLE, SAMPLE);
        let sum = 0;
        for (let i = 0; i < data.length; i += 4) {
          sum += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
        }
        const luminance = sum / (data.length / 4) / 255;
        setTone(luminance > LIGHT_THRESHOLD ? "light" : "dark");
      } catch {
        setTone("dark");
      }
    };
    img.onerror = () => { if (!cancelled) setTone("dark"); };
    img.src = src;
    return () => { cancelled = true; };
  }, [src, enabled]);

  return tone;
}
