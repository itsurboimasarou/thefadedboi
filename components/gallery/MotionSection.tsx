import { useEffect, useState } from "react";
import VideoPlayer from "./VideoPlayer";
import YearSelect from "./YearSelect";
import type { GalleryVideo } from "@/lib/types";
import type { AlbumChip } from "./AlbumPillBar";
import useHorizontalScroller from "@/lib/functions/useHorizontalScroller";
import Icon from "../ui/Icons";
import { useLocalized } from "@/lib/i18n";
import { motionUi as ui } from "@/lib/ui-strings";

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
  const [settled, setSettled] = useState(false);
  const strip = useHorizontalScroller([videos]);
  const albumRow = useHorizontalScroller([chips]);

  useEffect(() => { setCurrent(0); }, [videos]);
  
  useEffect(() => {
    const t = setTimeout(() => setSettled(true), 380);
    return () => clearTimeout(t);
  }, []);

  const playing = videos[current];

  return (
    <>
      <VideoPlayer video={playing} />

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
    </>
  );
}
