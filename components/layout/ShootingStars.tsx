import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useStars, useStarRate, DEFAULT_STAR_RATE } from "../controls/StarMode";
import { useLiteMode } from "../controls/LiteMode";

interface Rate {
  showerMin: number;
  showerMax: number;
  staggerMin: number;
  staggerMax: number;
  quietMin: number;
  quietMax: number;
  maxLive: number;
}

const RATES: Rate[] = [
  { showerMin: 1, showerMax: 2, staggerMin: 200, staggerMax: 700, quietMin: 9000, quietMax: 15000, maxLive: 3 },
  { showerMin: 2, showerMax: 5, staggerMin: 140, staggerMax: 620, quietMin: 4200, quietMax: 8400, maxLive: 5 },
  { showerMin: 4, showerMax: 8, staggerMin: 100, staggerMax: 420, quietMin: 3000, quietMax: 6000, maxLive: 8 },
  { showerMin: 5, showerMax: 9, staggerMin: 80, staggerMax: 300, quietMin: 600, quietMax: 1600, maxLive: 10 },
];

const FIRST_MIN = 600;
const FIRST_MAX = 2200;
const DUR_MIN = 0.9;
const DUR_MAX = 1.6;

type Corner = "left" | "right";

interface Star {
  id: number;
  style: CSSProperties;
}

const rand = (min: number, max: number) => min + Math.random() * (max - min);

function makeStar(id: number, corner: Corner): Star {
  const right = corner === "right";
  const overTop = Math.random() < 0.65;
  const top = overTop ? rand(-3, 3) : rand(0, 35);
  const left = overTop ? (right ? rand(30, 100) : rand(0, 70)) : right ? rand(97, 101) : rand(-1, 3);
  return {
    id,
    style: {
      top: `${top.toFixed(1)}%`,
      left: `${left.toFixed(1)}%`,
      ["--star-angle" as string]: `${(right ? rand(128, 146) : rand(34, 52)).toFixed(1)}deg`,
      ["--star-dist" as string]: `${rand(85, 125).toFixed(0)}vmax`,
      ["--star-dur" as string]: `${rand(DUR_MIN, DUR_MAX).toFixed(2)}s`,
      ["--star-tail" as string]: `${rand(80, 140).toFixed(0)}px`,
    },
  };
}

function useMediaBackdrop(): boolean {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const root = document.documentElement;
    const read = () => setOn(root.classList.contains("has-bg-video"));
    read();
    const mo = new MutationObserver(read);
    mo.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, []);
  return on;
}

export default function ShootingStars() {
  const on = useStars();
  const lite = useLiteMode();
  const media = useMediaBackdrop();
  const rate = RATES[useStarRate()] ?? RATES[DEFAULT_STAR_RATE];
  const active = on && !lite && !media;
  const [stars, setStars] = useState<Star[]>([]);
  const seq = useRef(0);

  useEffect(() => {
    if (!active) {
      setStars([]);
      return;
    }

    const timers = new Set<number>();
    let running = false;

    const later = (fn: () => void, ms: number) => {
      const t = window.setTimeout(() => {
        timers.delete(t);
        fn();
      }, ms);
      timers.add(t);
    };

    const spawn = (corner: Corner) =>
      setStars((live) =>
        live.length >= rate.maxLive ? live : [...live, makeStar(seq.current++, corner)]
      );

    const shower = () => {
      const corner: Corner = Math.random() < 0.5 ? "left" : "right";
      const count = Math.round(rand(rate.showerMin, rate.showerMax));
      let at = 0;
      for (let i = 0; i < count; i++) {
        later(() => spawn(corner), at);
        at += rand(rate.staggerMin, rate.staggerMax);
      }
      later(shower, at + DUR_MAX * 1000 + rand(rate.quietMin, rate.quietMax));
    };

    const start = () => {
      if (running) return;
      running = true;
      later(shower, rand(FIRST_MIN, FIRST_MAX));
    };
    
    const halt = () => {
      running = false;
      timers.forEach((t) => window.clearTimeout(t));
      timers.clear();
    };

    const onVisibility = () => {
      if (document.hidden) {
        halt();
        setStars([]);
      } else {
        start();
      }
    };

    if (!document.hidden) start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      halt();
    };
  }, [active, rate]);

  if (!active) return null;

  return (
    <div className="sky" aria-hidden="true">
      {stars.map((s) => (
        <span
          key={s.id}
          className="star"
          style={s.style}
          onAnimationEnd={() =>
            setStars((live) => live.filter((x) => x.id !== s.id))
          }
        />
      ))}
    </div>
  );
}
