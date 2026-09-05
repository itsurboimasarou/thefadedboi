import { useCallback, useRef, useState } from "react";

const AXIS_LOCK = 10;
const AXIS_BIAS = 1.2;
const COMMIT_RATIO = 0.18;
const COMMIT_MAX = 90;

type Axis = "undecided" | "x" | "y";

export interface PhotoSwipe {
  dx: number;
  settling: boolean;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerEnd: (e: React.PointerEvent) => void;
}

export default function usePhotoSwipe(
  enabled: boolean,
  step: (dir: number) => void
): PhotoSwipe {
  const [dx, setDx] = useState(0);
  const [settling, setSettling] = useState(false);
  const from = useRef<{ id: number; x: number; y: number; width: number } | null>(null);
  const axis = useRef<Axis>("undecided");

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (!enabled) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    from.current = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      width: e.currentTarget.getBoundingClientRect().width || 1,
    };
    axis.current = "undecided";
    setSettling(false);
  }, [enabled]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const start = from.current;
    if (!start || start.id !== e.pointerId) return;

    const moveX = e.clientX - start.x;
    const moveY = e.clientY - start.y;

    if (axis.current === "undecided") {
      if (Math.abs(moveX) < AXIS_LOCK && Math.abs(moveY) < AXIS_LOCK) return;
      if (Math.abs(moveX) <= Math.abs(moveY) * AXIS_BIAS) {
        axis.current = "y";
        from.current = null;
        return;
      }
      axis.current = "x";
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    }

    setDx(moveX);
  }, []);

  const onPointerEnd = useCallback((e: React.PointerEvent) => {
    const start = from.current;
    const wasHorizontal = axis.current === "x";
    from.current = null;
    axis.current = "undecided";
    if (!start || !wasHorizontal) return;

    const travelled = e.clientX - start.x;
    const enough = Math.min(start.width * COMMIT_RATIO, COMMIT_MAX);

    setSettling(true);
    setDx(0);
    if (Math.abs(travelled) > enough) step(travelled < 0 ? 1 : -1);
  }, [step]);

  return { dx, settling, onPointerDown, onPointerMove, onPointerEnd };
}
