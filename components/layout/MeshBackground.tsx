import { useEffect, useRef } from "react";
import { liteMode } from "../controls/LiteMode";

const rgb = (hex: string): number[] => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const mixColor = (a: string, b: string, m: number): string => {
  const [r1, g1, b1] = rgb(a), [r2, g2, b2] = rgb(b);
  const ch = (x: number, y: number) => Math.round(Math.sqrt(x * x + (y * y - x * x) * m));
  return `rgb(${ch(r1, r2)}, ${ch(g1, g2)}, ${ch(b1, b2)})`;
};
const mix = (a: number, b: number, m: number): number => a + (b - a) * m;

interface MeshField {
  fx: number; fy: number; r: number; color: string;
  a: number; sp: number; ph: number; vertical?: boolean;
}
const PALETTES: { dark: MeshField[]; light: MeshField[] } = {
  dark: [
    { fx: -0.1, fy: 1.1, r: 0.9, color: "#c9b8f0", a: 0.30, sp: 0.00005, ph: 0 },
    { fx: 0.35, fy: 1.15, r: 0.85, color: "#6d4fb3", a: 0.40, sp: 0.00004, ph: 2 },
    { fx: 1.15, fy: 0.85, r: 1.0, color: "#3d2a70", a: 0.38, sp: 0.00006, ph: 4 },
    { fx: 0.7, fy: -0.1, r: 0.8, color: "#0b0f1e", a: 0.92, sp: 0.00003, ph: 1, vertical: true },
  ],
  light: [
    { fx: -0.1, fy: 1.1, r: 0.95, color: "#ffffff", a: 0.85, sp: 0.00005, ph: 0 },
    { fx: 0.35, fy: 1.15, r: 0.8, color: "#e2d6ff", a: 0.40, sp: 0.00004, ph: 2 },
    { fx: 1.15, fy: 0.85, r: 0.95, color: "#b79df0", a: 0.22, sp: 0.00006, ph: 4 },
    { fx: 0.7, fy: -0.1, r: 0.75, color: "#f0ecf9", a: 0.90, sp: 0.00003, ph: 1 },
  ],
};

const CROSSFADE = 100;

export default function MeshBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let w = 0, h = 0;
    let lastW = -1;

    let blend = document.documentElement.dataset.theme === "light" ? 1 : 0;
    let fadeFrom = blend;
    let fadeTo = blend;
    let fadeStart = 0;
    let raf = 0;
    let resizeTimer: ReturnType<typeof setTimeout> | null = null;

    const easeInOut = (x: number) =>
      x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;

    const resize = (): boolean => {
      if (window.innerWidth === lastW) return false;
      lastW = window.innerWidth;
      w = window.innerWidth;
      h = Math.max(window.innerHeight, window.screen.height);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return true;
    };

    const paint = () => {
      ctx.clearRect(0, 0, w, h);
      const R = Math.max(w, h);

      for (let i = 0; i < PALETTES.dark.length; i++) {
        const d = PALETTES.dark[i], l = PALETTES.light[i];
        const color = mixColor(d.color, l.color, blend);
        const alpha = mix(d.a, l.a, blend);

        let g: CanvasGradient;
        if (d.vertical) {
          const reach = (0.45 + Math.sin(d.ph) * 0.04) * h;
          g = ctx.createLinearGradient(0, 0, 0, reach);
          g.addColorStop(0, color);
          g.addColorStop(1, "transparent");
        } else {
          const x = (d.fx + Math.sin(d.ph) * 0.02) * w;
          const y = (d.fy + Math.cos(d.ph) * 0.02) * h;
          g = ctx.createRadialGradient(x, y, 0, x, y, d.r * R);
          g.addColorStop(0, color);
          g.addColorStop(1, "transparent");
        }

        ctx.globalAlpha = alpha;
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }

      ctx.globalAlpha = 0.85 * blend;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 1;
    };

    const step = (now: number) => {
      const p = Math.min((now - fadeStart) / CROSSFADE, 1);
      blend = fadeFrom + (fadeTo - fadeFrom) * easeInOut(p);
      paint();
      if (p < 1) {
        raf = requestAnimationFrame(step);
      } else {
        raf = 0;
      }
    };

    const startFade = (target: number) => {
      if (target === fadeTo && raf !== 0) return;
      fadeFrom = blend;
      fadeTo = target;
      if (liteMode()) {
        blend = target;
        if (raf) { cancelAnimationFrame(raf); raf = 0; }
        paint();
        return;
      }
      fadeStart = performance.now();
      if (raf === 0) raf = requestAnimationFrame(step);
    };

    resize();
    paint();

    const onResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resizeTimer = null;
        if (resize()) paint();
      }, 150);
    };
    window.addEventListener("resize", onResize, { passive: true });

    const obs = new MutationObserver(() => {
      startFade(document.documentElement.dataset.theme === "light" ? 1 : 0);
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    return () => {
      obs.disconnect();
      window.removeEventListener("resize", onResize);
      if (resizeTimer) clearTimeout(resizeTimer);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={canvasRef} className="mesh-bg" aria-hidden="true" />;
}
