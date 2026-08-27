import { useEffect } from "react";

export default function useHuBarMeasure(railRef: React.RefObject<HTMLElement>) {
  useEffect(() => {
    const el = railRef.current;
    if (!el) return;
    const set = () => {
      const root = document.documentElement.style;
      root.setProperty("--hubar-h", `${el.offsetHeight}px`);
      root.setProperty("--hubar-w", `${el.offsetWidth}px`);
    };
    set();
    const ro = new ResizeObserver(set);
    ro.observe(el);
    return () => ro.disconnect();
  }, [railRef]);
}
