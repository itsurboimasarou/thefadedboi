import { useCallback, useEffect, useRef, useState } from "react";

const MIN = 1;
const MAX = 6;
const STEP = 1.16;
const DOUBLE_TAP_MS = 300;

export interface ZoomState {
  scale: number;
  x: number;
  y: number;
}

const IDENTITY: ZoomState = { scale: 1, x: 0, y: 0 };
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export default function useImageZoom(frameRef: React.RefObject<HTMLElement | null>, resetKey: unknown) {
  const [zoom, setZoom] = useState<ZoomState>(IDENTITY);
  const drag = useRef<{ id: number; x: number; y: number; ox: number; oy: number } | null>(null);
  const pinch = useRef<{ dist: number; scale: number; cx: number; cy: number } | null>(null);
  const lastTap = useRef(0);
  const pinchedAt = useRef(0);
  const moved = useRef(false);

  useEffect(() => setZoom(IDENTITY), [resetKey]);

  const scaleAbout = useCallback((next: number, point?: { x: number; y: number }) => {
    setZoom((z) => {
      const to = clamp(next, MIN, MAX);
      if (to === z.scale) return z;
      if (to === MIN) return IDENTITY;

      const box = frameRef.current?.getBoundingClientRect();
      const cx = box ? box.left + box.width / 2 : 0;
      const cy = box ? box.top + box.height / 2 : 0;
      const px = point ? point.x - cx : 0;
      const py = point ? point.y - cy : 0;
      const k = to / z.scale;

      const x = px - k * (px - z.x);
      const y = py - k * (py - z.y);
      const limitX = box ? (box.width * (to - 1)) / 2 : 0;
      const limitY = box ? (box.height * (to - 1)) / 2 : 0;
      return { scale: to, x: clamp(x, -limitX, limitX), y: clamp(y, -limitY, limitY) };
    });
  }, [frameRef]);

  const panBy = useCallback((dx: number, dy: number, from: { x: number; y: number }) => {
    setZoom((z) => {
      if (z.scale === MIN) return z;
      const box = frameRef.current?.getBoundingClientRect();
      const limitX = box ? (box.width * (z.scale - 1)) / 2 : 0;
      const limitY = box ? (box.height * (z.scale - 1)) / 2 : 0;
      return {
        scale: z.scale,
        x: clamp(from.x + dx, -limitX, limitX),
        y: clamp(from.y + dy, -limitY, limitY),
      };
    });
  }, [frameRef]);

  const toggle = useCallback((point: { x: number; y: number }) => {
    setZoom((z) => (z.scale > MIN ? IDENTITY : z));
    if (zoom.scale === MIN) scaleAbout(2.5, point);
  }, [zoom.scale, scaleAbout]);

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    scaleAbout(zoom.scale * (e.deltaY < 0 ? STEP : 1 / STEP), { x: e.clientX, y: e.clientY });
  }, [zoom.scale, scaleAbout]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    moved.current = false;
    if (zoom.scale > MIN) {
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
      drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, ox: zoom.x, oy: zoom.y };
    }
  }, [zoom]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved.current = true;
    panBy(dx, dy, { x: d.ox, y: d.oy });
  }, [panBy]);

  const endDrag = useCallback(() => { drag.current = null; }, []);

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;

    const mid = (t: TouchList) => ({
      x: (t[0].clientX + t[1].clientX) / 2,
      y: (t[0].clientY + t[1].clientY) / 2,
    });
    const gap = (t: TouchList) =>
      Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);

    const onStart = (e: TouchEvent) => {
      if (e.touches.length !== 2) return;
      drag.current = null;
      const c = mid(e.touches);
      pinch.current = { dist: gap(e.touches), scale: zoom.scale, cx: c.x, cy: c.y };
    };
    const onMove = (e: TouchEvent) => {
      if (!pinch.current || e.touches.length !== 2) return;
      e.preventDefault();
      const p = pinch.current;
      scaleAbout((p.scale * gap(e.touches)) / p.dist, { x: p.cx, y: p.cy });
    };
    const onEnd = () => {
      if (pinch.current) pinchedAt.current = Date.now();
      pinch.current = null;
    };

    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: false });
    el.addEventListener("touchend", onEnd);
    el.addEventListener("touchcancel", onEnd);
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
      el.removeEventListener("touchcancel", onEnd);
    };
  }, [frameRef, zoom.scale, scaleAbout, resetKey]);

  const onClick = useCallback((e: React.MouseEvent) => {
    if (moved.current) { e.stopPropagation(); moved.current = false; }
  }, []);

  const onDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    toggle({ x: e.clientX, y: e.clientY });
  }, [toggle]);

  const onTouchEndTap = useCallback((e: React.TouchEvent) => {
    if (e.changedTouches.length !== 1 || moved.current) return;
    if (Date.now() - pinchedAt.current < 400) { lastTap.current = 0; return; }
    const now = Date.now();
    if (now - lastTap.current < DOUBLE_TAP_MS) {
      const t = e.changedTouches[0];
      toggle({ x: t.clientX, y: t.clientY });
      lastTap.current = 0;
    } else {
      lastTap.current = now;
    }
  }, [toggle]);

  return {
    zoom,
    zoomed: zoom.scale > MIN,
    reset: useCallback(() => setZoom(IDENTITY), []),
    zoomIn: useCallback(() => scaleAbout(zoom.scale * 1.6), [zoom.scale, scaleAbout]),
    zoomOut: useCallback(() => scaleAbout(zoom.scale / 1.6), [zoom.scale, scaleAbout]),
    handlers: {
      onWheel,
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
      onClick,
      onDoubleClick,
      onTouchEnd: onTouchEndTap,
    },
  };
}
