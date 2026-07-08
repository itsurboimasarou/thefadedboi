import { useEffect, useRef } from "react";
import { liteMode } from "../controls/LiteMode";

const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const mixColor = (a, b, m) => {
  const [r1, g1, b1] = rgb(a), [r2, g2, b2] = rgb(b);
  const ch = (x, y) => Math.round(Math.sqrt(x * x + (y * y - x * x) * m));
  return `rgb(${ch(r1, r2)}, ${ch(g1, g2)}, ${ch(b1, b2)})`;
};
const mix = (a, b, m) => a + (b - a) * m;

const PALETTES = {
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

export default function MeshBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let lastKey = "";
    let w, h, raf;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    let blend = document.documentElement.dataset.theme === "light" ? 1 : 0;
    let from = blend, to = blend, t0 = 0;
    const DURATION = 150;
    const easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

    let lastW = 0;
    const resize = () => {
      if (window.innerWidth === lastW) return;
      lastW = window.innerWidth;
      w = window.innerWidth;
      h = Math.max(window.innerHeight, window.screen.height);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (now) => {
      const reduced = liteMode();
      const target = document.documentElement.dataset.theme === "light" ? 1 : 0;

      if (target !== to) { from = blend; to = target; t0 = now; }

      if (reduced) blend = to;
      else {
        const p = Math.min((now - t0) / DURATION, 1);
        blend = from + (to - from) * easeInOut(p);
      }

      const key = `${target}|${reduced}|${Math.round(w)}x${Math.round(h)}`;
      if (reduced && key === lastKey) { raf = requestAnimationFrame(draw); return; }
      lastKey = reduced ? key : "";

      const time = reduced ? 0 : now;
      ctx.clearRect(0, 0, w, h);
      const R = Math.max(w, h);

      for (let i = 0; i < PALETTES.dark.length; i++) {
        const d = PALETTES.dark[i], l = PALETTES.light[i];
        const color = mixColor(d.color, l.color, blend);
        const alpha = mix(d.a, l.a, blend);

        let g;
        if (d.vertical) {
          const reach = (0.45 + Math.sin(time * d.sp + d.ph) * 0.04) * h;
          g = ctx.createLinearGradient(0, 0, 0, reach);
          g.addColorStop(0, color);
          g.addColorStop(1, "transparent");
        } else {
          const x = (d.fx + Math.sin(time * d.sp + d.ph) * 0.02) * w;
          const y = (d.fy + Math.cos(time * d.sp * 1.4 + d.ph) * 0.02) * h;
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
      if (!liteMode()) raf = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
  }, []);

  return <canvas ref={canvasRef} className="mesh-bg" aria-hidden="true" />;
}