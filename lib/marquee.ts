import type { MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent } from "react";

function applyMarquee(el: HTMLElement): boolean {
  const dist = el.scrollWidth - el.clientWidth;
  if (dist <= 0) return false;
  el.style.setProperty("--marquee-dist", `${dist}px`);
  el.classList.add("is-marquee");
  return true;
}

export function onMarqueeEnter(e: ReactMouseEvent<HTMLElement>) {
  applyMarquee(e.currentTarget);
}

export function onMarqueeLeave(e: ReactMouseEvent<HTMLElement>) {
  e.currentTarget.classList.remove("is-marquee");
}

const touchTimers = new WeakMap<HTMLElement, ReturnType<typeof setTimeout>>();

export function onMarqueeTouchStart(e: ReactTouchEvent<HTMLElement>) {
  const el = e.currentTarget;
  const existing = touchTimers.get(el);
  if (existing) clearTimeout(existing);
  if (applyMarquee(el)) {
    touchTimers.set(
      el,
      setTimeout(() => {
        el.classList.remove("is-marquee");
        touchTimers.delete(el);
      }, 3600)
    );
  }
}
