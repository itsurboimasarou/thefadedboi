import { useEffect, useRef } from "react";
import { isCompact } from "./useHuBarFit";

export type StackDir = "up" | "down";

const EDGE = 32;
const ARM = 12;
const COMMIT = 0.35;

const BLOCK = ".control-panel, #music-player, .lightbox, .gallery-pillbar, .hubar, .panel-indicator, .gallery-timeline";

interface Options {
  canGo: (dir: StackDir) => boolean;
  onDrag: (dir: StackDir, progress: number) => void;
  onEnd: (dir: StackDir, progress: number, commit: boolean) => void;
}

export default function useEdgeSwipeNav(o: Options) {
  const opts = useRef(o);
  useEffect(() => { opts.current = o; });

  useEffect(() => {
    let start: { x: number; y: number; dir: StackDir } | null = null;
    let armed = false;
    let progress = 0;

    const onStart = (e: TouchEvent) => {
      start = null;
      armed = false;
      progress = 0;
      if (!isCompact() || e.touches.length !== 1) return;
      const target = e.target as Element | null;
      if (target?.closest?.(BLOCK)) return;
      if (document.querySelector(".control-panel--open")) return;

      const t = e.touches[0];
      const dir: StackDir | null =
        t.clientX > window.innerWidth - EDGE ? "up"
          : t.clientX < EDGE ? "down"
            : null;
      if (!dir || !opts.current.canGo(dir)) return;
      start = { x: t.clientX, y: t.clientY, dir };
    };

    const onMove = (e: TouchEvent) => {
      if (!start) return;
      const t = e.touches[0];
      const dx = t.clientX - start.x;
      const dy = t.clientY - start.y;
      const inward = start.dir === "up" ? -dx : dx;

      if (!armed) {
        if (Math.abs(dy) > Math.abs(dx)) { start = null; return; }
        if (inward < ARM) return;
        armed = true;
      }

      progress = Math.min(1, Math.max(0, inward / window.innerWidth));
      opts.current.onDrag(start.dir, progress);
      if (e.cancelable) e.preventDefault();
    };

    const onFinish = () => {
      if (start && armed) opts.current.onEnd(start.dir, progress, progress >= COMMIT);
      start = null;
      armed = false;
    };

    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onFinish);
    window.addEventListener("touchcancel", onFinish);
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onFinish);
      window.removeEventListener("touchcancel", onFinish);
    };
  }, []);
}
