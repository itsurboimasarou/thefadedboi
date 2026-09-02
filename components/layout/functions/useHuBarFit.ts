import { useEffect, useSyncExternalStore } from "react";

const SHORT_MQ = "(max-height: 600px)";
export const FIT_KEY = "hubar-fit";

let railEl: HTMLElement | null = null;
let narrow = false;
let compact = false;
const listeners = new Set<() => void>();

function desktopOverflows(rail: HTMLElement): boolean {
  const root = document.documentElement.classList;
  const hadCompact = root.contains("compact");
  const hadNarrow = root.contains("narrow");
  const docked = ["hubar--left", "hubar--right", "hubar--bottom"].filter((c) => rail.classList.contains(c));
  const hadTop = rail.classList.contains("hubar--top");
  const prevMax = rail.style.maxWidth;
  const prevWidth = rail.style.width;

  root.remove("compact", "narrow");
  rail.classList.remove(...docked);
  rail.classList.add("hubar--top");

  const allowed = parseFloat(getComputedStyle(rail).maxWidth);
  rail.style.maxWidth = "none";
  rail.style.width = "max-content";
  const wanted = rail.getBoundingClientRect().width;

  rail.style.maxWidth = prevMax;
  rail.style.width = prevWidth;
  if (!hadTop) rail.classList.remove("hubar--top");
  rail.classList.add(...docked);
  if (hadCompact) root.add("compact");
  if (hadNarrow) root.add("narrow");

  return Number.isFinite(allowed) && wanted > allowed - 0.5;
}

function apply() {
  if (!railEl) return;
  const nextNarrow = desktopOverflows(railEl);
  const nextCompact = nextNarrow || window.matchMedia(SHORT_MQ).matches;
  if (nextNarrow === narrow && nextCompact === compact) return;

  narrow = nextNarrow;
  compact = nextCompact;
  const root = document.documentElement.classList;
  root.toggle("narrow", narrow);
  root.toggle("compact", compact);
  if (narrow) {
    try {
      const seen = parseFloat(localStorage.getItem(FIT_KEY) || "") || 0;
      localStorage.setItem(FIT_KEY, String(Math.max(seen, window.innerWidth)));
    } catch {}
  }
  for (const fn of listeners) fn();
}

const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
};

export const isCompact = () => compact;
export const useCompact = () => useSyncExternalStore(subscribe, () => compact, () => false);

export function useHuBarFit(railRef: React.RefObject<HTMLElement>) {
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    railEl = rail;

    let queued = 0;
    const schedule = () => {
      if (queued) return;
      queued = requestAnimationFrame(() => { queued = 0; apply(); });
    };

    apply();
    document.fonts?.ready.then(schedule).catch(() => {});

    const short = window.matchMedia(SHORT_MQ);
    const mo = new MutationObserver(schedule);
    mo.observe(rail, { childList: true, subtree: true, characterData: true });
    window.addEventListener("resize", schedule);
    short.addEventListener("change", schedule);
    return () => {
      if (queued) cancelAnimationFrame(queued);
      mo.disconnect();
      window.removeEventListener("resize", schedule);
      short.removeEventListener("change", schedule);
      railEl = null;
    };
  }, [railRef]);
}
