import { useEffect, useState } from "react";

const NEAR_TOP = 80;
const HIDE_DELTA = 8;
const SHOW_DELTA = -1;

export default function useHideOnScrollDown(): boolean {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastY;
      if (y < NEAR_TOP) setHidden(false);
      else if (delta <= SHOW_DELTA) setHidden(false);
      else if (delta > HIDE_DELTA) setHidden(true);
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return hidden;
}
