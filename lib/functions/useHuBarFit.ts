import { useEffect, useSyncExternalStore } from "react";

const SHORT_MQ = "(max-height: 600px)";
const SPLIT_MQ = "(max-width: 699.98px)";
export const FIT_KEY = "hubar-fit";

let railEl: HTMLElement | null = null;
let narrow = false;
let compact = false;
const listeners = new Set<() => void>();

function takeScroll(): [Element, number, number][] {
  const out: [Element, number, number][] = [];
  for (const el of document.querySelectorAll("*")) {
    if (el.scrollTop || el.scrollLeft) out.push([el, el.scrollTop, el.scrollLeft]);
  }
  return out;
}

function putScroll(saved: [Element, number, number][]) {
  for (const [el, top, left] of saved) {
    if (el.scrollTop !== top) el.scrollTop = top;
    if (el.scrollLeft !== left) el.scrollLeft = left;
  }
}

function desktopOverflows(rail: HTMLElement): boolean {
  const root = document.documentElement.classList;
  const hadCompact = root.contains("compact");
  const hadNarrow = root.contains("narrow");
  const docked = ["hubar--left", "hubar--right", "hubar--bottom"].filter((c) => rail.classList.contains(c));
  const hadTop = rail.classList.contains("hubar--top");
  const prevMax = rail.style.maxWidth;
  const prevWidth = rail.style.width;
  const scroll = takeScroll();

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
  putScroll(scroll);

  return Number.isFinite(allowed) && wanted > allowed - 0.5;
}

function isCosmetic(r: MutationRecord): boolean {
  const node = r.target;
  const el = node.nodeType === 1 ? (node as Element) : node.parentElement;
  return !!el?.closest(".status-clock, .hubar-nowplaying-text");
}

function apply() {
  if (!railEl) return;
  const split = document.documentElement.dataset.barMode === "split";
  const nextNarrow =
    (split && window.matchMedia(SPLIT_MQ).matches) || desktopOverflows(railEl);
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
    const splitMq = window.matchMedia(SPLIT_MQ);
    const mo = new MutationObserver((records) => {
      if (records.every(isCosmetic)) return;
      schedule();
    });
    mo.observe(rail, { childList: true, subtree: true });
    window.addEventListener("resize", schedule);
    short.addEventListener("change", schedule);
    splitMq.addEventListener("change", schedule);
    return () => {
      if (queued) cancelAnimationFrame(queued);
      mo.disconnect();
      window.removeEventListener("resize", schedule);
      short.removeEventListener("change", schedule);
      splitMq.removeEventListener("change", schedule);
      railEl = null;
    };
  }, [railRef]);
}
