import { useEffect, useRef } from "react";

const FIELDS = [
  { fx: -0.1, fy: 1.1,  r: 0.9,  color: "#dbe9ff", a: 0.50, sp: 0.00005, ph: 0 },
  { fx: 0.35, fy: 1.15, r: 0.85, color: "#56aaf2", a: 0.55, sp: 0.00004, ph: 2 },
  { fx: 1.15, fy: 0.85, r: 1.0,  color: "#2f7fd4", a: 0.45, sp: 0.00006, ph: 4 },
  { fx: 0.7,  fy: -0.1, r: 0.8,  color: "#131a33", a: 0.9,  sp: 0.00003, ph: 1 },
];

export default function MeshBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w, h, raf;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    const resize = () => {
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (t) => {
      ctx.clearRect(0, 0, w, h);
      const R = Math.max(w, h);
      for (const f of FIELDS) {
        const x = (f.fx + Math.sin(t * f.sp + f.ph) * 0.02) * w;
        const y = (f.fy + Math.cos(t * f.sp * 1.4 + f.ph) * 0.02) * h;
        const g = ctx.createRadialGradient(x, y, 0, x, y, f.r * R);
        g.addColorStop(0, f.color);
        g.addColorStop(1, "transparent");
        ctx.globalAlpha = f.a;
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }
      if (!reduced) raf = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={canvasRef} className="mesh-bg" aria-hidden="true" />;
}