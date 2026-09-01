import { useCallback, useEffect, useRef, useState } from "react";
import type { Dock } from "../../controls/HuBarDock";

const HIDE_DELAY = 600;
const FIRST_HIDE_DELAY = 3000;
export const COMPACT_MQ = "(max-width: 798px), (max-height: 600px)";
const TOUCH_MQ = "(pointer: coarse)";
const EDGE = 24;
const SWIPE = 30;

export function useCompact() {
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(COMPACT_MQ);
    const sync = () => setCompact(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return compact;
}

function nearEdge(dock: Dock, x: number, y: number) {
  switch (dock) {
    case "left": return x < EDGE;
    case "right": return x > window.innerWidth - EDGE;
    case "top": return y < EDGE;
    case "bottom": return y > window.innerHeight - EDGE;
  }
}

function inwardDelta(dock: Dock, start: { x: number; y: number }, x: number, y: number) {
  switch (dock) {
    case "left": return x - start.x;
    case "right": return start.x - x;
    case "top": return y - start.y;
    case "bottom": return start.y - y;
  }
}

export default function useHuBarAutoHide(
  railRef: React.RefObject<HTMLElement>,
  dock: Dock,
  pinned: boolean
) {
  const [hidden, setHidden] = useState(false);
  const [touchMode, setTouchMode] = useState(false);
  const compact = useCompact();

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pinnedRef = useRef(pinned);
  const hiddenRef = useRef(false);
  const compactRef = useRef(false);
  const suppressDismiss = useRef(false);
  const pinnedSettled = useRef(false);

  useEffect(() => { pinnedRef.current = pinned; }, [pinned]);
  useEffect(() => { hiddenRef.current = hidden; }, [hidden]);
  useEffect(() => { compactRef.current = compact; }, [compact]);

  const cancel = useCallback(() => {
    if (timer.current !== null) { clearTimeout(timer.current); timer.current = null; }
  }, []);

  const schedule = useCallback((delay: number = HIDE_DELAY) => {
    cancel();
    if (pinnedRef.current || compactRef.current) return;
    timer.current = setTimeout(() => setHidden(true), delay);
  }, [cancel]);

  const summon = useCallback((suppressMs = 0) => {
    cancel();
    setHidden(false);
    if (suppressMs > 0) {
      suppressDismiss.current = true;
      setTimeout(() => { suppressDismiss.current = false; }, suppressMs);
    }
  }, [cancel]);

  const reveal = useCallback(() => {
    setHidden(false);
    schedule();
  }, [schedule]);

  useEffect(() => {
    if (compact) summon();
  }, [compact, summon]);

  useEffect(() => {
    const t = setTimeout(() => { pinnedSettled.current = true; }, 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!pinnedSettled.current) return;
    if (pinned) {
      summon();
    } else if (!compactRef.current) {
      cancel();
      setHidden(true);
    }
  }, [pinned, summon, cancel]);

  useEffect(() => {
    const touch = window.matchMedia(TOUCH_MQ);
    const sync = () => setTouchMode(touch.matches);
    sync();
    touch.addEventListener("change", sync);
    return () => touch.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!touchMode) schedule(FIRST_HIDE_DELAY);
    return cancel;
  }, [touchMode, schedule, cancel]);

  useEffect(() => {
    if (!touchMode) return;
    let start: { x: number; y: number } | null = null;

    const onStart = (e: TouchEvent) => {
      const t = e.touches[0];
      start = nearEdge(dock, t.clientX, t.clientY) ? { x: t.clientX, y: t.clientY } : null;
    };
    const onMove = (e: TouchEvent) => {
      if (!start) return;
      const t = e.touches[0];
      if (inwardDelta(dock, start, t.clientX, t.clientY) > SWIPE) {
        summon(350);
        start = null;
      }
    };

    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
    };
  }, [touchMode, dock, summon]);

  useEffect(() => {
    if (!touchMode) return;
    const onTap = (e: TouchEvent) => {
      if (pinnedRef.current || compactRef.current) return;
      if (suppressDismiss.current) return;
      if ((e.target as HTMLElement).closest(".hubar")) return;
      if (hiddenRef.current) return;
      schedule(HIDE_DELAY);
    };
    document.addEventListener("touchstart", onTap, { passive: true });
    return () => document.removeEventListener("touchstart", onTap);
  }, [touchMode, schedule]);

  const railHandlers = {
    onMouseEnter: () => summon(),
    onMouseLeave: () => schedule(),
    onFocus: () => summon(),
    onBlur: () => schedule(),
    onTouchStart: (e: React.TouchEvent) => {
      if (hiddenRef.current) {
        e.preventDefault();
        summon(350);
      }
    },
  };

  const hotzoneHandlers = { onMouseEnter: reveal };

  return { hidden, touchMode, compact, railHandlers, hotzoneHandlers };
}
