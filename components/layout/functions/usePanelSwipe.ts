import { useEffect, useRef, useState, type RefObject } from "react";
import { COMPACT_MQ } from "./useHuBarAutoHide";

interface PanelSwipeOptions {
  panelRef: RefObject<HTMLElement | null>;
  enabled: boolean;
  direction: "right" | "left";
  dragProgress: number | null;
  setDragProgress: (p: number | null) => void;
  onCommit: () => void;
  wheelEnabled?: boolean;
}

const isHorizontal = (dx: number, dy: number) =>
  Math.abs(dx) >= 10 && Math.abs(dx) > Math.abs(dy) * 1.2;

export function usePanelSwipe(o: PanelSwipeOptions) {
  const { panelRef, enabled, direction, dragProgress, setDragProgress, onCommit } = o;
  const wheelEnabled = o.wheelEnabled ?? true;

  const metaRef = useRef<{ x: number; y: number; width: number } | null>(null);
  const progressRef = useRef<number | null>(null);
  useEffect(() => { progressRef.current = dragProgress; }, [dragProgress]);

  const toRight = direction === "right";
  const progressFor = (dx: number, width: number) =>
    Math.min(1, Math.max(0, (toRight ? 0 : 1) + dx / width));
  const passedThreshold = (p: number) => (toRight ? p > 0.35 : p < 0.65);

  const begin = (x: number, y: number) => {
    if (!enabled || !window.matchMedia(COMPACT_MQ).matches) return false;
    metaRef.current = { x, y, width: panelRef.current?.getBoundingClientRect().width || 1 };
    return true;
  };

  const moveTo = (x: number, y: number, live: number | null) => {
    const meta = metaRef.current;
    if (!meta) return;
    const dx = x - meta.x;
    const dy = y - meta.y;
    if (live === null && !isHorizontal(dx, dy)) return;
    setDragProgress(progressFor(dx, meta.width));
  };

  const finish = (live: number | null) => {
    metaRef.current = null;
    if (live === null) return;
    if (passedThreshold(live)) onCommit();
    setDragProgress(null);
  };

  const [mouseDragging, setMouseDragging] = useState(false);
  useEffect(() => {
    if (!mouseDragging) return;
    const onMove = (e: MouseEvent) => moveTo(e.clientX, e.clientY, progressRef.current);
    const onUp = () => {
      setMouseDragging(false);
      finish(progressRef.current);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [mouseDragging]);

  const wheelLockRef = useRef(false);
  const wheelResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (wheelResetRef.current) clearTimeout(wheelResetRef.current);
  }, []);

  return {
    onTouchStart: (e: React.TouchEvent) => {
      const t = e.touches[0];
      begin(t.clientX, t.clientY);
    },
    onTouchMove: (e: React.TouchEvent) => {
      const t = e.touches[0];
      moveTo(t.clientX, t.clientY, dragProgress);
    },
    onTouchEnd: () => finish(dragProgress),
    onMouseDown: (e: React.MouseEvent) => {
      if (begin(e.clientX, e.clientY)) setMouseDragging(true);
    },
    onWheel: (e: React.WheelEvent) => {
      if (!wheelEnabled) return;
      if (wheelResetRef.current) clearTimeout(wheelResetRef.current);
      wheelResetRef.current = setTimeout(() => { wheelLockRef.current = false; }, 400);
      if (wheelLockRef.current) return;
      const towards = toRight ? -e.deltaX : e.deltaX;
      if (towards > 24 && Math.abs(e.deltaX) > Math.abs(e.deltaY) * 1.2) {
        wheelLockRef.current = true;
        onCommit();
      }
    },
  };
}
