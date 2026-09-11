import { useEffect } from "react";

const GAP = 10;
const EDGE = 8;
const SHOW_DELAY = 120;
const HIDE_GRACE = 80;

type Side = "up" | "down" | "left" | "right";

const OPPOSITE: Record<Side, Side> = { up: "down", down: "up", left: "right", right: "left" };

const DOCK_SIDE: [string, Side][] = [
  ["hubar--left", "right"],
  ["hubar--right", "left"],
  ["hubar--top", "down"],
  ["hubar--bottom", "up"],
];

function preferredSide(el: HTMLElement): Side {
  const pos = el.dataset.tipPos;
  if (pos === "up" || pos === "down" || pos === "left" || pos === "right") return pos;
  const bar = el.closest(".hubar--left, .hubar--right, .hubar--top, .hubar--bottom");
  if (bar) {
    for (const [cls, side] of DOCK_SIDE) if (bar.classList.contains(cls)) return side;
  }
  return el.classList.contains("info-tip") ? "up" : "down";
}

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), Math.max(lo, hi));

function place(tip: HTMLElement, anchor: HTMLElement): boolean {
  const a = anchor.getBoundingClientRect();
  const vw = document.documentElement.clientWidth;
  const vh = document.documentElement.clientHeight;
  if (!a.width && !a.height) return false;
  if (a.bottom < 0 || a.top > vh || a.right < 0 || a.left > vw) return false;

  const w = tip.offsetWidth;
  const h = tip.offsetHeight;
  const room: Record<Side, boolean> = {
    up: a.top - GAP - h >= EDGE,
    down: a.bottom + GAP + h <= vh - EDGE,
    left: a.left - GAP - w >= EDGE,
    right: a.right + GAP + w <= vw - EDGE,
  };
  let side = preferredSide(anchor);
  if (!room[side] && room[OPPOSITE[side]]) side = OPPOSITE[side];

  const across = side === "up" || side === "down";
  const x = across ? a.left + a.width / 2 - w / 2 : side === "left" ? a.left - GAP - w : a.right + GAP;
  const y = across ? (side === "up" ? a.top - GAP - h : a.bottom + GAP) : a.top + a.height / 2 - h / 2;
  tip.style.translate = `${Math.round(clamp(x, EDGE, vw - EDGE - w))}px ${Math.round(clamp(y, EDGE, vh - EDGE - h))}px`;
  tip.dataset.side = side;
  return true;
}

export default function useTips() {
  useEffect(() => {
    const tip = document.createElement("div");
    tip.className = "site-tip";
    tip.id = "site-tip";
    tip.setAttribute("role", "tooltip");
    const layered = typeof tip.showPopover === "function";
    if (layered) tip.setAttribute("popover", "manual");
    else tip.hidden = true;
    document.body.appendChild(tip);

    let anchor: HTMLElement | null = null;
    let prevDescribedBy: string | null = null;
    let timer: number | undefined;
    let frame = 0;

    const isOpen = () => (layered ? tip.matches(":popover-open") : !tip.hidden);

    const release = () => {
      if (!anchor) return;
      if (prevDescribedBy === null) anchor.removeAttribute("aria-describedby");
      else anchor.setAttribute("aria-describedby", prevDescribedBy);
      anchor = null;
    };

    const hide = () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(frame);
      release();
      if (!isOpen()) return;
      if (layered) tip.hidePopover();
      else tip.hidden = true;
    };

    const track = () => {
      if (!anchor) return;
      const text = anchor.getAttribute("data-tip");
      if (!text || !anchor.isConnected || anchor.closest("[inert]")) return hide();
      if (tip.textContent !== text) tip.textContent = text;
      if (!place(tip, anchor)) return hide();
      frame = requestAnimationFrame(track);
    };

    const show = (el: HTMLElement) => {
      window.clearTimeout(timer);
      const text = el.getAttribute("data-tip");
      if (!text) return;
      if (anchor !== el) {
        release();
        anchor = el;
        prevDescribedBy = el.getAttribute("aria-describedby");
        el.setAttribute("aria-describedby", tip.id);
      }
      tip.textContent = text;
      if (!isOpen()) {
        if (layered) tip.showPopover();
        else tip.hidden = false;
      }
      cancelAnimationFrame(frame);
      track();
    };

    const tipOf = (t: EventTarget | null) =>
      t instanceof Element ? t.closest<HTMLElement>("[data-tip]") : null;

    const onOver = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const el = tipOf(e.target);
      if (!el) return;
      window.clearTimeout(timer);
      if (el === anchor) return;
      if (anchor) show(el);
      else timer = window.setTimeout(() => show(el), SHOW_DELAY);
    };

    const onOut = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const el = tipOf(e.target);
      if (!el) return;
      if (e.relatedTarget instanceof Node && el.contains(e.relatedTarget)) return;
      window.clearTimeout(timer);
      if (el === anchor) timer = window.setTimeout(hide, HIDE_GRACE);
    };

    const onFocusIn = (e: FocusEvent) => {
      const el = tipOf(e.target);
      if (el && el.matches(":focus-visible")) show(el);
    };

    const onFocusOut = (e: FocusEvent) => {
      if (anchor && tipOf(e.target) === anchor) hide();
    };

    const onDown = (e: PointerEvent) => {
      const el = tipOf(e.target);
      if (e.pointerType === "touch" && el?.classList.contains("info-tip")) {
        if (el === anchor) hide();
        else show(el);
        return;
      }
      hide();
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") hide();
    };

    document.addEventListener("pointerover", onOver);
    document.addEventListener("pointerout", onOut);
    document.addEventListener("pointerdown", onDown, true);
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    document.addEventListener("keydown", onKey);
    window.addEventListener("blur", hide);
    return () => {
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onOut);
      document.removeEventListener("pointerdown", onDown, true);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("blur", hide);
      hide();
      tip.remove();
    };
  }, []);
}
