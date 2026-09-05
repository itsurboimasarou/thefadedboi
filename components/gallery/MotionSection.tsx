import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import VideoPlayer from "./VideoPlayer";
import YearSelect from "./YearSelect";
import type { GalleryVideo } from "@/lib/types";
import type { AlbumChip } from "./AlbumPillBar";
import useHorizontalScroller from "@/lib/functions/useHorizontalScroller";
import Icon from "../ui/Icons";
import { useLocalized, type Localized } from "@/lib/i18n";

const ui: Localized<{
  list: string;
  albums: string;
  pick: (n: string) => string;
  empty: string;
  earlier: string;
  later: string;
}> = {
  en: {
    list: "Videos",
    albums: "Albums",
    pick: (n) => `Play ${n}`,
    empty: "Videos to be added.",
    earlier: "Scroll left",
    later: "Scroll right",
  },
  vi: {
    list: "Video",
    albums: "Album",
    pick: (n) => `Phát ${n}`,
    empty: "Video sẽ được thêm sau.",
    earlier: "Cuộn sang trái",
    later: "Cuộn sang phải",
  },
};

export default function MotionSection({
  videos,
  chips,
  active,
  onSelect,
  years,
  year,
  onYearChange,
}: {
  videos: GalleryVideo[];
  chips: AlbumChip[];
  active: string;
  onSelect: (key: string) => void;
  years: number[];
  year: number | undefined;
  onYearChange: (y: number | undefined) => void;
}) {
  const t = useLocalized(ui);
  const [current, setCurrent] = useState(0);
  const [fullView, setFullView] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [settled, setSettled] = useState(false);
  const strip = useHorizontalScroller([videos]);
  const albumRow = useHorizontalScroller([chips]);

  useEffect(() => setMounted(true), []);
  useEffect(() => { setCurrent(0); }, [videos]);
  
  useEffect(() => {
    const t = setTimeout(() => setSettled(true), 380);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!fullView) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setFullView(false); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [fullView]);

  const playing = videos[current];

  return (
    <>
      <VideoPlayer video={playing} onFullView={() => setFullView(true)} active={!fullView} />

      <div className="motion-box">
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
          {videos.length === 0 && <p className="motion-strip-empty">{t.empty}</p>}
          {videos.map((v, i) => (
            <button
              key={v.src}
              type="button"
              role="option"
              aria-selected={i === current}
              className={`motion-tile${i === current ? " motion-tile--on" : ""}`}
              onClick={() => setCurrent(i)}
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
          {years.length > 0 && (
            <YearSelect years={years} value={year} onChange={onYearChange} allowAll direction="up" />
          )}
        </div>
      </div>

      {mounted && fullView && playing &&
        createPortal(
          <div className="lightbox vplayer-overlay" role="dialog" aria-modal="true">
            <VideoPlayer video={playing} onFullView={() => setFullView(false)} full />
          </div>,
          document.body
        )}
    </>
  );
}
