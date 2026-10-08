import { useEffect, useRef, useState } from "react";
import VideoPlayer from "./VideoPlayer";
import YearSelect from "./YearSelect";
import Search from "../widgets/Search";
import type { GalleryVideo } from "@/lib/types";
import type { AlbumChip } from "./AlbumPillBar";
import useHorizontalScroller from "@/lib/functions/useHorizontalScroller";
import { useIsoLayoutEffect } from "@/lib/functions/useIsoLayoutEffect";
import Icon from "../ui/Icons";
import { useLocalized } from "@/lib/i18n";
import { motionUi as ui } from "@/lib/ui-strings";

const MORPH_MS = 380;

export default function MotionSection({
  videos,
  chips,
  active,
  onSelect,
  years,
  year,
  onYearChange,
  query,
  onQueryChange,
  empty,
}: {
  videos: GalleryVideo[];
  chips: AlbumChip[];
  active: string;
  onSelect: (key: string) => void;
  years: number[];
  year: number | undefined;
  onYearChange: (y: number | undefined) => void;
  query: string;
  onQueryChange: (v: string) => void;
  empty?: string;
}) {
  const t = useLocalized(ui);
  const [current, setCurrent] = useState(0);
  const [settled, setSettled] = useState(false);
  const strip = useHorizontalScroller([videos]);
  const albumRow = useHorizontalScroller([chips]);

  const playingSrc = useRef<string | undefined>(undefined);
  useEffect(() => {
    const kept = videos.findIndex((v) => v.src === playingSrc.current);
    setCurrent(kept < 0 ? 0 : kept);
  }, [videos]);

  const [browsing, setBrowsing] = useState(false);
  const [boxHeight, setBoxHeight] = useState<number>();
  const box = useRef<HTMLDivElement>(null);
  const floor = useRef(0);
  const scrolled = useRef(0);
  const span = useRef({ rest: 0, full: 0 });

  const search = (v: string) => {
    if (v !== "" && !browsing && box.current) {
      const rect = box.current.getBoundingClientRect();
      floor.current = rect.bottom + window.scrollY;
      scrolled.current = window.scrollY;
      span.current.rest = rect.height;
      setBrowsing(true);
    }
    if (v === "") setBrowsing(false);
    onQueryChange(v);
  };

  useIsoLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const { rest } = span.current;
    let { full } = span.current;
    if (browsing) {
      const now = el.getBoundingClientRect();
      full = now.height + floor.current - (now.bottom + window.scrollY);
      span.current.full = full;
      setBoxHeight(full);

      el.style.height = `${full}px`;
      window.scrollTo({ top: scrolled.current, behavior: "instant" });
    } else {
      setBoxHeight(undefined);
    }
    if (!rest || !full || full <= rest) return;
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      document.documentElement.classList.contains("lite-mode")
    ) return;

    const extra = full - rest;
    let frames: Keyframe[];
    if (browsing) {
      const margin = parseFloat(getComputedStyle(el).marginTop) || 0;
      frames = [
        { height: `${rest}px`, marginTop: `${margin + extra}px` },
        { height: `${full}px`, marginTop: `${margin}px` },
      ];
    } else {
      frames = [
        { height: `${full}px`, top: `${-extra}px`, marginBottom: `${-extra}px` },
        { height: `${rest}px`, top: "0px", marginBottom: "0px" },
      ];
    }
    const morph = el.animate(frames, {
      duration: MORPH_MS,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
    });
    return () => morph.cancel();
  }, [browsing]);

  const pick = (i: number) => {
    setCurrent(i);
    setBrowsing(false);
  };
  
  useEffect(() => {
    const t = setTimeout(() => setSettled(true), 380);
    return () => clearTimeout(t);
  }, []);

  const playing = videos[current];
  playingSrc.current = playing?.src;

  return (
    <>
      {!browsing && (
        <VideoPlayer
          video={playing}
          onStep={
            videos.length > 1
              ? (dir) => setCurrent((i) => (i + dir + videos.length) % videos.length)
              : undefined
          }
        />
      )}

      <div
        className={`motion-box${browsing ? " motion-box--browse" : ""}`}
        ref={box}
        style={boxHeight ? { height: boxHeight } : undefined}
      >
        <div className="motion-strip-wrap">
          {strip.overflow.left && (
            <button
              type="button"
              className="motion-arrow motion-arrow--prev"
              onClick={() => strip.page(-1)}
              aria-label={t.earlier}
            >
              <Icon name="chevronLeft" size={18} />
            </button>
          )}
          {strip.overflow.right && (
            <button
              type="button"
              className="motion-arrow motion-arrow--next"
              onClick={() => strip.page(1)}
              aria-label={t.later}
            >
              <Icon name="chevronRight" size={18} />
            </button>
          )}
        <div className="motion-strip" ref={strip.ref} role="listbox" aria-label={t.list}>
          {videos.length === 0 && <p className="motion-strip-empty">{empty ?? t.empty}</p>}
          {videos.map((v, i) => (
            <button
              key={v.src}
              type="button"
              role="option"
              aria-selected={i === current}
              className={`motion-tile${i === current ? " motion-tile--on" : ""}`}
              onClick={() => pick(i)}
              aria-label={t.pick(v.name)}
            >
              <video
                src={settled ? `${v.src}#t=0.1` : undefined}
                preload="metadata"
                muted
                playsInline
                tabIndex={-1}
              />
              <span className="motion-tile-name">{v.name}</span>
            </button>
          ))}
        </div>
        </div>

        <div className="motion-albums">
          <div className="motion-albums-scroll" ref={albumRow.ref} aria-label={t.albums}>
            {chips.map((c) => (
              <button
                key={c.key}
                type="button"
                className={`gallery-pill${active === c.key ? " gallery-pill--on" : ""}`}
                aria-pressed={active === c.key}
                onClick={() => onSelect(c.key)}
              >
                {c.label}
                <span className="gallery-pill-count">{c.count}</span>
              </button>
            ))}
          </div>
          <Search value={query} onChange={search} />
          {years.length > 0 && (
            <YearSelect years={years} value={year} onChange={onYearChange} allowAll direction="up" />
          )}
        </div>
      </div>
    </>
  );
}
