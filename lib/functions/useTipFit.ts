import { useEffect } from "react";

const MARGIN = 8;
const CENTRED = ["up", "down", ""];

function edges(el: HTMLElement): [number, number] | null {
  const tip = el.querySelector<HTMLElement>(":scope > .tip, :scope > .tip--up");
  if (tip) {
    if (getComputedStyle(tip).display === "none") return null;
    const r = tip.getBoundingClientRect();
    return r.width ? [r.left, r.right] : null;
  }
  if (!el.hasAttribute("data-tip")) return null;
  if (!CENTRED.includes(el.getAttribute("data-tip-pos") ?? "")) return null;
  const cs = getComputedStyle(el, "::after");
  if (cs.display === "none") return null;
  const w = parseFloat(cs.width);
  if (!w) return null;
  const b = el.getBoundingClientRect();
  const centre = b.left + b.width / 2;
  return [centre - w / 2, centre + w / 2];
}

function clipper(el: HTMLElement): DOMRect | null {
  for (let e = el.parentElement; e; e = e.parentElement) {
    const o = getComputedStyle(e);
    if (o.overflowX !== "visible" || o.overflowY !== "visible") return e.getBoundingClientRect();
  }
  return null;
}

function fit(el: HTMLElement) {
  el.style.removeProperty("--tip-shift");
  el.removeAttribute("data-tip-flip");
  const box = edges(el);
  if (!box) return;
  const [left, right] = box;

  const clip = clipper(el);
  const lo = Math.max(MARGIN, (clip?.left ?? 0) + MARGIN);
  const hi = Math.min(window.innerWidth - MARGIN, (clip?.right ?? window.innerWidth) - MARGIN);

  const shift = right > hi ? hi - right : left < lo ? lo - left : 0;
  if (shift) el.style.setProperty("--tip-shift", `${Math.round(shift)}px`);

  if (clip) {
    const host = el.getBoundingClientRect();
    const tip = el.querySelector<HTMLElement>(":scope > .tip--up");
    const opensUp = !!tip || el.getAttribute("data-tip-pos") === "up";
    const needed = (tip?.getBoundingClientRect().height ?? 28) + 10;
    if (opensUp && host.top - needed < clip.top + MARGIN) el.setAttribute("data-tip-flip", "down");
  }
}

export default function useTipFit() {
  useEffect(() => {
    const target = (e: Event) => (e.target as Element | null)?.closest?.<HTMLElement>("[data-tip], :has(> .tip), :has(> .tip--up)");
    const enter = (e: Event) => { const el = target(e); if (el) fit(el); };
    const leave = (e: Event) => { const el = target(e); if (el) el.style.removeProperty("--tip-shift"); };

    document.addEventListener("pointerover", enter);
    document.addEventListener("pointerout", leave);
    document.addEventListener("focusin", enter);
    document.addEventListener("focusout", leave);
    return () => {
      document.removeEventListener("pointerover", enter);
      document.removeEventListener("pointerout", leave);
      document.removeEventListener("focusin", enter);
      document.removeEventListener("focusout", leave);
    };
  }, []);
}
