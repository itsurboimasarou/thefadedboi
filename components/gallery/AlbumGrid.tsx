import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/router";
import type { GalleryImage } from "@/lib/types";
import Icon from "../ui/Icons";
import { useLocalized } from "@/lib/i18n";
import { albumGridUi as ui } from "@/lib/ui-strings";
import useImageZoom from "@/lib/functions/useImageZoom";
import usePhotoSwipe from "@/lib/functions/usePhotoSwipe";
import { useIsoLayoutEffect } from "@/lib/functions/useIsoLayoutEffect";
import { loadSeen, markSeen } from "@/lib/seenThumbs";
import { TILE_WIDTHS, VIEW_WIDTHS, ZOOM_WIDTH, isThumbApi, thumbSrc, thumbSrcSet } from "@/lib/thumbs";

const FIT_SIZES = "(min-width: 1522px) 1400px, 92vw";
const EAGER_TILES = 4;
const ROW_HEIGHT = 300;
const ROW_STRETCH = 1.4;

function tileSizes(ratio: number): string {
  const width = Math.min(TILE_WIDTHS[1], Math.round(ratio * ROW_HEIGHT * ROW_STRETCH));
  return `(max-width: 599px) 100vw, ${width}px`;
}

function filenameFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    return decodeURIComponent(pathname.split("/").pop() || "photo.jpg");
  } catch {
    return "photo.jpg";
  }
}

async function downloadImage(url: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/photo?src=${encodeURIComponent(url)}`);
    if (!res.ok) throw new Error(`photo fetch failed: ${res.status}`);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filenameFromUrl(url);
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(objectUrl);
    return true;
  } catch (err) {
    console.warn("[gallery] failed to download image:", err);
    return false;
  }
}

interface ThumbState {
  ready?: boolean;
  dead?: boolean;
  tries?: number;
  ratio?: number;
}

const MAX_RETRIES = 2;
const MAX_WARMED = 24;
const NOTHING_SEEN: ReadonlyMap<string, number> = new Map();

interface GridItem {
  full: string;
  thumb: string;
  name?: string;
  device?: string;
  ratio?: number;
  heavy?: boolean;
}

function viewProps(item: GridItem) {
  const srcSet = thumbSrcSet(item.thumb, VIEW_WIDTHS);
  return srcSet
    ? { sizes: FIT_SIZES, srcSet, src: thumbSrc(item.thumb, VIEW_WIDTHS[1]) }
    : { src: item.full };
}

function zoomSrc(item: GridItem): string {
  return item.heavy && isThumbApi(item.thumb) ? thumbSrc(item.thumb, ZOOM_WIDTH) : item.full;
}

interface AlbumGridProps { images: GalleryImage[]; title: string }
export default function AlbumGrid({ images, title }: AlbumGridProps) {
  const t = useLocalized(ui);
  const router = useRouter();
  const [index, setIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);
  const warmed = useRef<{ key: string; img: HTMLImageElement }[]>([]);
  const warmedSrcs = useRef<Set<string>>(new Set());
  const [thumbs, setThumbs] = useState<Record<string, ThumbState>>({});
  const [seen, setSeen] = useState(NOTHING_SEEN);
  const tileEls = useRef<Map<string, HTMLImageElement>>(new Map());
  const settled = useRef<WeakSet<HTMLImageElement>>(new WeakSet());
  const [downloadBlocked, setDownloadBlocked] = useState(false);
  const retryTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const items = useMemo(
    () =>
      images.map((it): GridItem =>
        typeof it === "string"
          ? { full: it, thumb: it }
          : {
              thumb: it.thumb ?? it.full,
              full: it.full,
              name: it.name,
              device: it.device,
              ratio: it.ratio,
              heavy: it.heavy,
            }
      ),
    [images]
  );

  const patch = (src: string, next: Partial<ThumbState>) =>
    setThumbs((s) => {
      const prev = s[src];
      const unchanged =
        prev && (Object.keys(next) as (keyof ThumbState)[]).every((k) => prev[k] === next[k]);
      return unchanged ? s : { ...s, [src]: { ...prev, ...next } };
    });

  useEffect(() => setMounted(true), []);
  useIsoLayoutEffect(() => setSeen(new Map(loadSeen())), []);
  useEffect(() => setDownloadBlocked(false), [index]);

  useEffect(() => setIndex(null), [images]);

  useEffect(() => {
    const onStart = () => {
      setLeaving(true);
      setIndex(null);
      warmed.current.forEach(({ img }) => { img.srcset = ""; img.src = ""; });
      warmed.current = [];
      warmedSrcs.current.clear();
    };
    const onDone = () => setLeaving(false);

    router.events.on("routeChangeStart", onStart);
    router.events.on("routeChangeComplete", onDone);
    router.events.on("routeChangeError", onDone);
    return () => {
      router.events.off("routeChangeStart", onStart);
      router.events.off("routeChangeComplete", onDone);
      router.events.off("routeChangeError", onDone);
    };
  }, [router.events]);

  const frameRef = useRef<HTMLDivElement>(null);
  const { zoom, zoomed, handlers } = useImageZoom(frameRef, index);
  const close = useCallback(() => setIndex(null), []);
  const step = useCallback(
    (dir: number) => setIndex((i) => (i === null ? i : (i + dir + items.length) % items.length)),
    [items.length]
  );

  const swipe = usePhotoSwipe(!zoomed && items.length > 1, step);

  const onThumbError = (src: string) => {
    const tries = thumbs[src]?.tries ?? 0;
    if (tries >= MAX_RETRIES) {
      patch(src, { dead: true });
      return;
    }
    const t = setTimeout(() => patch(src, { tries: tries + 1 }), 600 * (tries + 1));
    retryTimers.current.push(t);
  };

  useEffect(() => () => {
    retryTimers.current.forEach(clearTimeout);
    retryTimers.current = [];
  }, []);

  const onThumbLoad = (src: string, el: HTMLImageElement) => {
    const { naturalWidth: w, naturalHeight: h } = el;
    const ratio = w && h ? Math.round((w / h) * 1000) / 1000 : undefined;
    patch(src, ratio ? { ready: true, ratio } : { ready: true });
    if (ratio) markSeen(src, ratio);
  };

  const bindTile = (src: string) => (el: HTMLImageElement | null) => {
    if (!el) {
      tileEls.current.delete(src);
      return;
    }
    tileEls.current.set(src, el);
    if (!el.complete || settled.current.has(el)) return;
    settled.current.add(el);
    if (el.naturalWidth) onThumbLoad(src, el);
    else el.src = el.src;
  };

  const tileState = (img: GridItem) => {
    const state = thumbs[img.thumb];
    const kept = seen.get(img.thumb);
    return {
      loaded: !!state?.ready,
      ready: state?.ready ?? (kept !== undefined && !state?.tries),
      dead: !!state?.dead,
      tries: state?.tries ?? 0,
      ratio: state?.ratio ?? img.ratio ?? kept,
    };
  };

  const warm = (item: GridItem) => {
    if (leaving || warmedSrcs.current.has(item.full)) return;
    warmedSrcs.current.add(item.full);
    const i = new window.Image();
    i.decoding = "async";
    const view = viewProps(item);
    if (view.srcSet) {
      i.sizes = view.sizes;
      i.srcset = view.srcSet;
    }
    i.src = view.src;
    warmed.current.push({ key: item.full, img: i });
    if (warmed.current.length > MAX_WARMED) {
      const dropped = warmed.current.shift();
      if (dropped) {
        warmedSrcs.current.delete(dropped.key);
        dropped.img.srcset = "";
        dropped.img.src = "";
      }
    }
  };

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [index, close, step]);

  const current = index !== null ? items[index] : undefined;
  const loaded = !!current && loadedSrc === current.full;

  const lightbox =
    index !== null && current ? (
      <div
        className="lightbox"
        role="dialog"
        aria-modal="true"
        aria-label={t.photoViewer(title)}
        onClick={close}
      >
        <div
          className={`lightbox-frame${zoomed ? " lightbox-frame--zoomed" : ""}`}
          ref={frameRef}
          {...handlers}
          onPointerDown={(e) => { handlers.onPointerDown(e); swipe.onPointerDown(e); }}
          onPointerMove={(e) => { handlers.onPointerMove(e); swipe.onPointerMove(e); }}
          onPointerUp={(e) => { handlers.onPointerUp(); swipe.onPointerEnd(e); }}
          onPointerCancel={(e) => { handlers.onPointerCancel(); swipe.onPointerEnd(e); }}
          style={{
            transform: `translateX(${swipe.dx}px)`,
            transition: swipe.settling ? "transform 0.24s cubic-bezier(0.22, 1, 0.36, 1)" : "none",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="lightbox-zoom"
            style={{ transform: `translate(${zoom.x}px, ${zoom.y}px) scale(${zoom.scale})` }}
          >
            <img
              src={tileEls.current.get(current.thumb)?.currentSrc || thumbSrc(current.thumb, TILE_WIDTHS[0])}
              alt=""
              aria-hidden="true"
              className="lightbox-preview"
              style={{ opacity: loaded ? 0 : 1 }}
            />
            <img
              key={`${current.full}#${thumbs[current.full]?.tries ?? 0}`}
              {...viewProps(current)}
              alt={t.fullSizeAlt(title, index + 1)}
              className="lightbox-full"
              decoding="async"
              fetchPriority="high"
              onLoad={() => setLoadedSrc(current.full)}
              onError={() => onThumbError(current.full)}
              style={{ opacity: loaded ? 1 : 0, transition: "opacity 0.25s" }}
            />
            {zoomed && (
              <img
                key={`full-${current.full}`}
                src={zoomSrc(current)}
                alt=""
                aria-hidden="true"
                className="lightbox-full"
                decoding="async"
                draggable={false}
              />
            )}
          </div>
          {items.length > 1 &&
            [...new Set([1, -1].map((dir) => (index + dir + items.length) % items.length))].map((n) => {
              return (
                <img
                  key={`pre-${items[n].full}`}
                  {...viewProps(items[n])}
                  alt=""
                  aria-hidden="true"
                  className="lightbox-full"
                  decoding="async"
                  fetchPriority="low"
                  style={{ opacity: 0, pointerEvents: "none" }}
                />
              );
            })}
        </div>
        {(current.name || current.device) && (
          <div className="lightbox-title" aria-hidden="true">
            {current.name && (
              <span className="lightbox-title-name">{current.name}</span>
            )}
            {current.device && (
              <span className="lightbox-title-device">{current.device}</span>
            )}
          </div>
        )}
        <button type="button" className="lightbox-close" onClick={close} aria-label={t.close} data-tip={t.close}>
          <Icon name="close" size={18} />
        </button>
        <button
          type="button"
          className="lightbox-download"
          onClick={async (e) => {
            e.stopPropagation();
            const ok = await downloadImage(current.full);
            setDownloadBlocked(!ok);
          }}
          aria-label={t.download}
          data-tip={t.download}
        >
          <Icon name="download" size={18} />
        </button>
        {downloadBlocked && (
          <div className="lightbox-toast" onClick={(e) => e.stopPropagation()}>
            <span>{t.downloadBlocked}</span>
            <button
              type="button"
              className="lightbox-toast-dismiss"
              onClick={() => setDownloadBlocked(false)}
              aria-label={t.dismiss}
              data-tip={t.dismiss}
              data-tip-pos="up"
            >
              <Icon name="close" size={12} />
            </button>
          </div>
        )}
        {items.length > 1 && (
          <>
            <button
              type="button"
              className="lightbox-nav lightbox-nav--prev"
              onClick={(e) => { e.stopPropagation(); step(-1); }}
              aria-label={t.previousPhoto}
              data-tip={t.previousPhoto}
              data-tip-pos="right"
            >
              <Icon name="chevronLeft" size={22} />
            </button>
            <button
              type="button"
              className="lightbox-nav lightbox-nav--next"
              onClick={(e) => { e.stopPropagation(); step(1); }}
              aria-label={t.nextPhoto}
              data-tip={t.nextPhoto}
              data-tip-pos="left"
            >
              <Icon name="chevronRight" size={22} />
            </button>
          </>
        )}
        <span className="lightbox-count">{index + 1} / {items.length}</span>
      </div>
    ) : null;

  return (
    <>
      <div className="album-grid">
        {items.map((img, i) => {
          if (leaving) return <span key={img.full} className="album-thumb" aria-hidden="true" />;
          const { loaded, ready, dead, tries, ratio } = tileState(img);
          return (
            <button
              key={img.full}
              type="button"
              className="album-thumb"
              style={{ "--ratio": ratio ?? 1 } as CSSProperties}
              onMouseEnter={() => warm(img)}
              onTouchStart={() => warm(img)}
              onClick={() => !dead && setIndex(i)}
              aria-label={t.viewPhotoAria(i + 1, title)}
            >
              {!loaded && !dead && <span className="thumb-loader" aria-hidden="true" />}
              {dead && (
                <span className="thumb-failed" aria-hidden="true">
                  <Icon name="image" size={20} />
                </span>
              )}
              <img
                key={`${img.thumb}#${tries}`}
                ref={bindTile(img.thumb)}
                sizes={tileSizes(ratio ?? 1.5)}
                srcSet={thumbSrcSet(img.thumb, TILE_WIDTHS)}
                src={thumbSrc(img.thumb, TILE_WIDTHS[1])}
                alt={t.photoAlt(title, i + 1)}
                decoding="async"
                loading={i < EAGER_TILES ? "eager" : "lazy"}
                fetchPriority={i < EAGER_TILES ? "high" : "low"}
                onLoad={(e) => onThumbLoad(img.thumb, e.currentTarget)}
                onError={() => onThumbError(img.thumb)}
                style={{ opacity: ready ? 1 : 0 }}
              />
              {(img.name || img.device) && !dead && (
                <span className="album-thumb-caption" aria-hidden="true">
                  {img.device && (
                    <span className="album-thumb-device">{img.device}</span>
                  )}
                  {img.name && (
                    <span className="album-thumb-name">{img.name}</span>
                  )}
                </span>
              )}
            </button>
          );
        })}
        {!leaving &&
          Array.from({ length: 5 }, (_, i) => (
            <span key={`filler-${i}`} className="album-thumb-filler" aria-hidden="true" />
          ))}
      </div>
      {mounted && lightbox && createPortal(lightbox, document.body)}
    </>
  );
}
