import { useEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { useDock } from "../controls/HuBarDock";
import { useLocalized } from "@/lib/i18n";
import { galleryTimelineUi as ui } from "@/lib/ui-strings";

export interface TimelineMark { id: string; group: string; label: string }

const READ_LINE = 0.35;
const GAP = 28;
const MIN_GAP = 12;
const EDGE_MARGIN = 6;
const LINGER = 1400;
const DIM_AFTER = 700;
const WHEEL_BOOST = 3;

interface Place { mode: "gutter" | "edge"; side: "left" | "right"; x: number }

interface Scrub { id: string; y: number }

interface GalleryTimelineProps {
  marks: TimelineMark[];
  container: RefObject<HTMLElement | null>;
}

export default function GalleryTimeline({ marks, container }: GalleryTimelineProps) {
  const t = useLocalized(ui);
  const dock = useDock();
  const [current, setCurrent] = useState(marks[0]?.id);
  const [place, setPlace] = useState<Place | null>(null);
  const [awake, setAwake] = useState(false);
  const [lit, setLit] = useState(false);
  const [scrub, setScrub] = useState<Scrub | null>(null);
  const [mounted, setMounted] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const railRef = useRef<HTMLOListElement>(null);
  const hovered = useRef(false);
  const focused = useRef(false);
  const press = useRef<{ id?: string; moved: boolean } | null>(null);
  const sleepTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const dimTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => setMounted(true), []);

  const sectionOf = (id: string) =>
    container.current?.querySelector<HTMLElement>(`[data-mark="${id}"]`) ?? null;

  const held = () => hovered.current || focused.current || !!press.current;

  const wake = () => {
    setAwake(true);
    clearTimeout(sleepTimer.current);
    sleepTimer.current = setTimeout(() => {
      if (!held()) setAwake(false);
    }, LINGER);
  };

  const use = () => {
    setLit(true);
    clearTimeout(dimTimer.current);
    dimTimer.current = setTimeout(() => {
      if (!held()) setLit(false);
    }, DIM_AFTER);
    wake();
  };

  useEffect(() => {
    if (!mounted) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const line = window.innerHeight * READ_LINE;
      let found = marks[0]?.id;
      for (const m of marks) {
        const el = sectionOf(m.id);
        if (el && el.getBoundingClientRect().top <= line) found = m.id;
      }
      const page = document.documentElement;
      if (window.innerHeight + window.scrollY >= page.scrollHeight - 2) found = marks[marks.length - 1]?.id;
      setCurrent(found);

      const box = container.current?.getBoundingClientRect();
      if (!box) return;
      const side = document.querySelector(".hubar--left") ? "right" : "left";
      const width = railRef.current?.offsetWidth ?? 0;
      const room = side === "left" ? box.left : document.documentElement.clientWidth - box.right;
      const gap = Math.min(GAP, room - width - EDGE_MARGIN);
      const next: Place =
        gap >= MIN_GAP
          ? { mode: "gutter", side, x: Math.round(side === "left" ? box.left - gap - width : box.right + gap) }
          : { mode: "edge", side, x: 0 };
      setPlace((p) =>
        p && p.mode === next.mode && p.side === next.side && p.x === next.x ? p : next
      );
    };
    const onResize = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    const onScroll = () => {
      wake();
      onResize();
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [marks, mounted, dock]);

  useEffect(() => () => {
    clearTimeout(sleepTimer.current);
    clearTimeout(dimTimer.current);
  }, []);

  const jump = (id: string, smooth: boolean) => {
    const section = sectionOf(id);
    if (!section) return;
    const margin = parseFloat(getComputedStyle(section).scrollMarginTop) || 0;
    const top = section.getBoundingClientRect().top + window.scrollY - margin;
    const calm = !smooth || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top, behavior: calm ? "instant" : "smooth" });
  };

  const stopAt = (clientY: number): Scrub | null => {
    const nav = navRef.current;
    if (!nav) return null;
    let best: Scrub | null = null;
    let bestGap = Infinity;
    nav.querySelectorAll<HTMLElement>("[data-stop]").forEach((el) => {
      const box = el.getBoundingClientRect();
      const middle = box.top + box.height / 2;
      const gap = Math.abs(clientY - middle);
      if (gap < bestGap && el.dataset.stop) {
        bestGap = gap;
        best = { id: el.dataset.stop, y: middle - nav.getBoundingClientRect().top };
      }
    });
    return best;
  };

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1;
      window.scrollBy({ top: e.deltaY * unit * WHEEL_BOOST, behavior: "instant" });
      use();
    };
    nav.addEventListener("wheel", onWheel, { passive: false });
    return () => nav.removeEventListener("wheel", onWheel);
  }, [mounted]);

  useEffect(() => {
    const rail = railRef.current;
    const tick = rail?.querySelector<HTMLElement>(".gallery-timeline-tick--on");
    if (!rail || !tick || press.current) return;
    const box = tick.getBoundingClientRect();
    const frame = rail.getBoundingClientRect();
    if (box.top < frame.top) rail.scrollTop -= frame.top - box.top;
    else if (box.bottom > frame.bottom) rail.scrollTop += box.bottom - frame.bottom;
  }, [current]);

  const endPress = () => {
    press.current = null;
    setScrub(null);
    use();
  };

  const shown = scrub?.id ?? current;
  const groups = [...new Set(marks.map((m) => m.group))];
  const shownGroup = marks.find((m) => m.id === shown)?.group;
  const edge = place?.mode === "edge";

  if (!mounted) return null;
  return createPortal(
    <nav
      ref={navRef}
      className={`gallery-timeline${lit ? " gallery-timeline--lit" : ""}${edge ? " gallery-timeline--edge" : ""}${
        edge && !awake ? " gallery-timeline--asleep" : ""
      }`}
      data-side={place?.side ?? "left"}
      style={place ? (edge ? undefined : { left: place.x }) : { visibility: "hidden" }}
      aria-label={t.timeline}
      onPointerEnter={() => { hovered.current = true; use(); }}
      onPointerLeave={() => { hovered.current = false; use(); }}
      onFocus={(e) => { focused.current = e.target.matches(":focus-visible"); use(); }}
      onBlur={() => { focused.current = false; use(); }}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        const at = stopAt(e.clientY);
        press.current = { id: at?.id, moved: false };
        setScrub(at);
        use();
      }}
      onPointerMove={(e) => {
        const state = press.current;
        if (!state) return;
        const at = stopAt(e.clientY);
        if (at && at.id !== state.id) {
          state.id = at.id;
          state.moved = true;
          setScrub(at);
          jump(at.id, false);
        }
        use();
      }}
      onPointerUp={() => {
        const state = press.current;
        if (state?.id && !state.moved) jump(state.id, true);
        endPress();
      }}
      onPointerCancel={endPress}
      onClickCapture={(e) => {
        if (e.detail !== 0) e.stopPropagation();
      }}
    >
      <ol className="gallery-timeline-rail" ref={railRef}>
        {groups.map((y) => {
          const stops = marks.filter((m) => m.group === y);
          return (
            <li key={y} className="gallery-timeline-year">
              <button
                type="button"
                className={`gallery-timeline-label${y === shownGroup ? " gallery-timeline-label--on" : ""}`}
                onClick={() => jump(stops[0].id, true)}
                data-stop={stops[0].id}
                aria-current={y === shownGroup ? "true" : undefined}
              >
                {y}
              </button>
              {stops.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className={`gallery-timeline-tick${m.id === shown ? " gallery-timeline-tick--on" : ""}`}
                  onClick={() => jump(m.id, true)}
                  data-stop={m.id}
                  aria-label={m.label}
                  data-tip={scrub ? undefined : m.label}
                  data-tip-pos={place?.side === "right" ? "left" : "right"}
                />
              ))}
            </li>
          );
        })}
      </ol>
      {scrub && (
        <span className="gallery-timeline-bubble" style={{ top: scrub.y }} aria-hidden="true">
          {marks.find((m) => m.id === scrub.id)?.label}
        </span>
      )}
    </nav>,
    document.body
  );
}
