import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/router";
import Image from "next/image";
import type { GalleryImage } from "@/lib/types";
import Icon from "../ui/Icons";
import { useLocalized, type Localized } from "@/lib/i18n";
import useImageZoom from "@/lib/functions/useImageZoom";

const ui: Localized<{
  photoViewer: (title: string) => string;
  fullSizeAlt: (title: string, n: number) => string;
  close: string;
  previousPhoto: string;
  nextPhoto: string;
  viewPhotoAria: (n: number, title: string) => string;
  photoAlt: (title: string, n: number) => string;
  download: string;
  downloadBlocked: string;
  dismiss: string;
}> = {
  en: {
    photoViewer: (title) => `${title} photo viewer`,
    fullSizeAlt: (title, n) => `${title} — photo ${n} full size`,
    close: "Close",
    previousPhoto: "Previous photo",
    nextPhoto: "Next photo",
    viewPhotoAria: (n, title) => `View photo ${n} of ${title} full size`,
    photoAlt: (title, n) => `${title} — photo ${n}`,
    download: "Download photo",
    downloadBlocked:
      "Download blocked — this looks like an ad blocker. This page doesn't run ads or collect data; try allowing it and downloading again.",
    dismiss: "Dismiss",
  },
  vi: {
    photoViewer: (title) => `Trình xem ảnh ${title}`,
    fullSizeAlt: (title, n) => `${title} — ảnh ${n} kích thước đầy đủ`,
    close: "Đóng",
    previousPhoto: "Ảnh trước",
    nextPhoto: "Ảnh sau",
    viewPhotoAria: (n, title) => `Xem ảnh ${n} của ${title} kích thước đầy đủ`,
    photoAlt: (title, n) => `${title} — ảnh ${n}`,
    download: "Tải ảnh xuống",
    downloadBlocked:
      "Tải ảnh bị chặn — có vẻ do trình chặn quảng cáo. Trang này không chạy quảng cáo hay thu thập dữ liệu, hãy thử cho phép rồi tải lại.",
    dismiss: "Đóng",
  },
};

const FIT_SIZES = "(min-width: 1522px) 1400px, 92vw";
const ZOOM_SIZES = "3840px";
const EAGER_TILES = 4;

function withThumbSize(url: string, size: "lg"): string {
  return `${url}${url.includes("?") ? "&" : "?"}size=${size}`;
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

interface AlbumGridProps { images: GalleryImage[]; title: string }
export default function AlbumGrid({ images, title }: AlbumGridProps) {
  const t = useLocalized(ui);
  const router = useRouter();
  const [index, setIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const warmed = useRef<HTMLImageElement[]>([]);
  const warmedSrcs = useRef<Set<string>>(new Set());
  const [thumbs, setThumbs] = useState<Record<string, ThumbState>>({});
  const [downloadBlocked, setDownloadBlocked] = useState(false);
  const retryTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const items = useMemo(
    () =>
      images.map((it) =>
        typeof it === "string"
          ? { full: it, thumb: it }
          : { thumb: it.thumb ?? it.full, full: it.full }
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
  useEffect(() => setLoaded(false), [index]);
  useEffect(() => setDownloadBlocked(false), [index]);

  useEffect(() => setIndex(null), [images]);

  useEffect(() => {
    const onStart = () => {
      setLeaving(true);
      setIndex(null);
      warmed.current.forEach((img) => { img.src = ""; });
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

  const onThumbLoad = (src: string, e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
    patch(src, w && h ? { ready: true, ratio: w / h } : { ready: true });
  };

  const warm = (src: string) => {
    if (leaving || warmedSrcs.current.has(src)) return;
    warmedSrcs.current.add(src);
    const i = new window.Image();
    i.src = src;
    warmed.current.push(i);
    if (warmed.current.length > MAX_WARMED) {
      const dropped = warmed.current.shift();
      if (dropped) {
        warmedSrcs.current.delete(dropped.src);
        dropped.src = "";
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

  const lightbox =
    index !== null ? (
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
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="lightbox-zoom"
            style={{ transform: `translate(${zoom.x}px, ${zoom.y}px) scale(${zoom.scale})` }}
          >
            <img
              src={withThumbSize(items[index].thumb, "lg")}
              alt=""
              aria-hidden="true"
              className="lightbox-preview"
              style={{ opacity: loaded ? 0 : 1 }}
            />
            <Image
              key={`${items[index].full}#${thumbs[items[index].full]?.tries ?? 0}`}
              src={items[index].full}
              alt={t.fullSizeAlt(title, index + 1)}
              fill
              sizes={FIT_SIZES}
              quality={80}
              priority
              onLoad={() => setLoaded(true)}
              onError={() => onThumbError(items[index].full)}
              style={{ objectFit: "contain", opacity: loaded ? 1 : 0, transition: "opacity 0.25s" }}
            />
            {zoomed && (
              <Image
                key={`full-${items[index].full}`}
                src={items[index].full}
                alt=""
                aria-hidden="true"
                fill
                sizes={ZOOM_SIZES}
                quality={80}
                className="lightbox-full"
                draggable={false}
                style={{ objectFit: "contain" }}
              />
            )}
          </div>
          {items.length > 1 &&
            [1, -1].map((dir) => {
              const n = (index + dir + items.length) % items.length;
              return (
                <Image
                  key={`pre-${items[n].full}`}
                  src={items[n].full}
                  alt=""
                  aria-hidden="true"
                  fill
                  sizes={FIT_SIZES}
                  quality={80}
                  loading="eager"
                  style={{ opacity: 0, pointerEvents: "none" }}
                />
              );
            })}
        </div>
        <button type="button" className="lightbox-close" onClick={close} aria-label={t.close} data-tip={t.close}>
          <Icon name="close" size={18} />
        </button>
        <button
          type="button"
          className="lightbox-download"
          onClick={async (e) => {
            e.stopPropagation();
            const ok = await downloadImage(items[index].full);
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
        {items.map((img, i) =>
          leaving ? (
            <span key={img.full} className="album-thumb" aria-hidden="true" />
          ) : (
            <button
              key={img.full}
              type="button"
              className="album-thumb"
              style={{ "--ratio": thumbs[img.thumb]?.ratio ?? 1 } as CSSProperties}
              onMouseEnter={() => warm(img.full)}
              onTouchStart={() => warm(img.full)}
              onClick={() => !thumbs[img.thumb]?.dead && setIndex(i)}
              aria-label={t.viewPhotoAria(i + 1, title)}
            >
              {!thumbs[img.thumb]?.ready && !thumbs[img.thumb]?.dead && (
                <span className="thumb-loader" aria-hidden="true" />
              )}
              {thumbs[img.thumb]?.dead && (
                <span className="thumb-failed" aria-hidden="true">
                  <Icon name="image" size={20} />
                </span>
              )}
              <Image
                key={`${img.thumb}#${thumbs[img.thumb]?.tries ?? 0}`}
                src={img.thumb}
                alt={t.photoAlt(title, i + 1)}
                width={400}
                height={400}
                sizes="(max-width: 600px) 50vw, (max-width: 900px) 33vw, 420px"
                quality={75}
                loading={i < EAGER_TILES ? "eager" : "lazy"}
                fetchPriority={i < EAGER_TILES ? "high" : "low"}
                onLoad={(e) => onThumbLoad(img.thumb, e)}
                onError={() => onThumbError(img.thumb)}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  opacity: thumbs[img.thumb]?.ready ? 1 : 0,
                }}
              />
            </button>
          )
        )}
        {!leaving &&
          Array.from({ length: 5 }, (_, i) => (
            <span key={`filler-${i}`} className="album-thumb-filler" aria-hidden="true" />
          ))}
      </div>
      {mounted && lightbox && createPortal(lightbox, document.body)}
    </>
  );
}
