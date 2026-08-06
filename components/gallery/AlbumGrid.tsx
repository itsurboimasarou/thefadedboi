import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/router";
import Image from "next/image";
import type { GalleryImage } from "@/lib/types";

interface AlbumGridProps { images: GalleryImage[]; title: string }
export default function AlbumGrid({ images, title }: AlbumGridProps) {
  const router = useRouter();
  const [index, setIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const warmed = useRef<HTMLImageElement[]>([]);

  const items: { full: string; thumb: string }[] = images.map((it) =>
    typeof it === "string" ? { full: it, thumb: it } : { thumb: it.thumb ?? it.full, full: it.full }
  );

  useEffect(() => setMounted(true), []);
  useEffect(() => setLoaded(false), [index]);

  useEffect(() => {
    const onStart = () => {
      setLeaving(true);
      setIndex(null);
      warmed.current.forEach((img) => { img.src = ""; });
      warmed.current = [];
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

  const close = useCallback(() => setIndex(null), []);
  const step = useCallback(
    (dir: number) => setIndex((i) => (i === null ? i : (i + dir + items.length) % items.length)),
    [items.length]
  );

  const warm = (src: string) => {
    if (leaving) return;
    const i = new window.Image();
    i.src = src;
    warmed.current.push(i);
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
        aria-label={`${title} photo viewer`}
        onClick={close}
      >
        <div className="lightbox-frame" onClick={(e) => e.stopPropagation()}>
          <img
            src={items[index].thumb}
            alt=""
            aria-hidden="true"
            className="lightbox-preview"
            style={{ opacity: loaded ? 0 : 1 }}
          />
          <Image
            key={items[index].full}
            src={items[index].full}
            alt={`${title} — photo ${index + 1} full size`}
            fill
            sizes="100vw"
            quality={80}
            priority
            onLoad={() => setLoaded(true)}
            style={{ objectFit: "contain", opacity: loaded ? 1 : 0, transition: "opacity 0.25s" }}
          />
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
                  sizes="100vw"
                  quality={80}
                  loading="eager"
                  style={{ opacity: 0, pointerEvents: "none" }}
                />
              );
            })}
          {!loaded && (
            <span className="lightbox-loader" aria-hidden="true">
              <img src="/logo.svg" alt="" />
            </span>
          )}
        </div>
        <button type="button" className="lightbox-close" onClick={close} aria-label="Close">✕</button>
        {items.length > 1 && (
          <>
            <button
              type="button"
              className="lightbox-nav lightbox-nav--prev"
              onClick={(e) => { e.stopPropagation(); step(-1); }}
              aria-label="Previous photo"
            >‹</button>
            <button
              type="button"
              className="lightbox-nav lightbox-nav--next"
              onClick={(e) => { e.stopPropagation(); step(1); }}
              aria-label="Next photo"
            >›</button>
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
            <span key={img.full} className="album-thumb album-thumb--idle" aria-hidden="true" />
          ) : (
            <button
              key={img.full}
              type="button"
              className="album-thumb"
              onMouseEnter={() => warm(img.full)}
              onTouchStart={() => warm(img.full)}
              onClick={() => setIndex(i)}
              aria-label={`View photo ${i + 1} of ${title} full size`}
            >
              <Image
                src={img.thumb}
                alt={`${title} — photo ${i + 1}`}
                width={400}
                height={400}
                sizes="(max-width: 600px) 50vw, (max-width: 900px) 33vw, 300px"
                quality={65}
                fetchPriority="low"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </button>
          )
        )}
      </div>
      {mounted && lightbox && createPortal(lightbox, document.body)}
    </>
  );
}
