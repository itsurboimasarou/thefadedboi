import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useStars } from "../controls/StarMode";
import { useLiteMode } from "../controls/LiteMode";

const GAP_MIN = 2600;
const GAP_MAX = 7200;
const FIRST_MIN = 500;
const FIRST_MAX = 2400;
const MAX_LIVE = 2;

interface Star {
  id: number;
  style: CSSProperties;
}

const rand = (min: number, max: number) => min + Math.random() * (max - min);

function makeStar(id: number): Star {
  return {
    id,
    style: {
      top: `${rand(-4, 46).toFixed(1)}%`,
      left: `${rand(24, 104).toFixed(1)}%`,
      ["--star-angle" as string]: `${rand(122, 148).toFixed(1)}deg`,
      ["--star-dist" as string]: `${rand(85, 125).toFixed(0)}vmax`,
      ["--star-dur" as string]: `${rand(0.9, 1.6).toFixed(2)}s`,
      ["--star-tail" as string]: `${rand(80, 140).toFixed(0)}px`,
    },
  };
}

export default function ShootingStars() {
  const on = useStars();
  const lite = useLiteMode();
  const active = on && !lite;
  const [stars, setStars] = useState<Star[]>([]);
  const seq = useRef(0);

  useEffect(() => {
    if (!active) return;

    let timer: number | undefined;

    const spawn = () =>
      setStars((live) =>
        live.length >= MAX_LIVE ? live : [...live, makeStar(seq.current++)]
      );

    const tick = () => {
      spawn();
      timer = window.setTimeout(tick, rand(GAP_MIN, GAP_MAX));
    };

    const start = () => {
      if (timer !== undefined) return;
      timer = window.setTimeout(tick, rand(FIRST_MIN, FIRST_MAX));
    };

    const stop = () => {
      window.clearTimeout(timer);
      timer = undefined;
      setStars([]);
    };

    const onVisibility = () => (document.hidden ? stop() : start());

    if (!document.hidden) start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.clearTimeout(timer);
      setStars([]);
    };
  }, [active]);

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
