import { useEffect, useRef, useState } from "react";

const COUNT = 40;

const FLAKES = Array.from({ length: COUNT }, (_, i) => ({
  left: `${Math.round((i * 53) % 100)}%`,
  ["--flake-size" as string]: `${6 + (i % 5) * 3}px`,
  opacity: 0.25 + ((i * 7) % 50) / 100,
  animationDuration: `${9 + ((i * 3) % 11)}s`,
  animationDelay: `${(i * 1.3) % 14}s`,
}));

export default function Snowfall() {
  const [retired, setRetired] = useState<boolean[]>(() =>
    Array(COUNT).fill(false)
  );
  const onRef = useRef(true);
  const skyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sync = (on: boolean) => {
      onRef.current = on;

      if (on) {
        setRetired(Array(COUNT).fill(false));
        return;
      }

      const spans = skyRef.current?.querySelectorAll<HTMLElement>(".flake");
      if (!spans) return;

      const drop: number[] = [];
      spans.forEach((el) => {
        const i = Number(el.dataset.flake);
        const anim = el.getAnimations()[0];
        const t = anim?.currentTime;
        if (anim == null || t == null || Number(t) <= 0) drop.push(i);
      });

      if (drop.length) {
        setRetired((r) => {
          const next = [...r];
          drop.forEach((i) => { next[i] = true; });
          return next;
        });
      }
    };

    sync(!document.documentElement.classList.contains("no-snow"));

    const onChange = (e: Event) => sync((e as CustomEvent<boolean>).detail);
    window.addEventListener("snow-mode-change", onChange);
    return () => window.removeEventListener("snow-mode-change", onChange);
  }, []);

  useEffect(() => {
    const sky = skyRef.current;
    if (!sky) return;

    const onIteration = (e: AnimationEvent) => {
      if (onRef.current) return;
      const el = e.target as HTMLElement;
      const i = Number(el.dataset.flake);
      if (Number.isNaN(i)) return;
      setRetired((r) => {
        if (r[i]) return r;
        const next = [...r];
        next[i] = true;
        return next;
      });
    };

    sky.addEventListener("animationiteration", onIteration);
    return () => sky.removeEventListener("animationiteration", onIteration);
  }, []);

  return (
    <div className="sky" ref={skyRef} aria-hidden="true">
      {FLAKES.map((f, i) =>
        retired[i] ? null : (
          <span key={i} className="flake" data-flake={i} style={f}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <use href="#flake-glyph" />
            </svg>
          </span>
        )
      )}
    </div>
  );
}
