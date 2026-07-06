import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

export default function AlbumGrid({ images, title }) {
  const [index, setIndex] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const close = useCallback(() => setIndex(null), []);
  const step = useCallback(
    (dir) => setIndex((i) => (i === null ? i : (i + dir + images.length) % images.length)),
    [images.length]
  );

  useEffect(() => {
    if (index === null) return;
    const onKey = (e) => {
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

  useEffect(() => {
    [1, -1].map((dir) => {
      const n = (index + dir + images.length) % images.length;
      return (
        <Image key={`pre-${images[n]}`} src={images[n]} alt="" aria-hidden
          fill sizes="100vw" quality={80} loading="eager"
          style={{ opacity: 0, pointerEvents: "none" }} />
      );
    })
  }, [index, images]);

  const lightbox =
    index !== null ? (
      <div className="lightbox" role="dialog" aria-modal="true" aria-label={`${title} photo viewer`} onClick={close}>
        <div className="lightbox-frame" onClick={(e) => e.stopPropagation()}>
          <Image
            key={images[index]}
            src={images[index]}
            alt={`${title} — photo ${index + 1} full size`}
            fill
            sizes="100vw"
            quality={80}
            priority
            style={{ objectFit: "contain" }}
          />
        </div>
        <button type="button" className="lightbox-close" onClick={close} aria-label="Close">✕</button>
        {images.length > 1 && (
          <>
            <button type="button" className="lightbox-nav lightbox-nav--prev" onClick={(e) => { e.stopPropagation(); step(-1); }} aria-label="Previous photo">‹</button>
            <button type="button" className="lightbox-nav lightbox-nav--next" onClick={(e) => { e.stopPropagation(); step(1); }} aria-label="Next photo">›</button>
          </>
        )}
        <span className="lightbox-count">{index + 1} / {images.length}</span>
      </div>
    ) : null;

  return (
    <>
      <div className="album-grid">
        {images.map((src, i) => (
          <button key={src} type="button" className="album-thumb" onClick={() => setIndex(i)} aria-label={`View photo ${i + 1} of ${title} full size`}>
            <Image
              src={src}
              alt={`${title} — photo ${i + 1}`}
              width={400}
              height={400}
              sizes="(max-width: 600px) 50vw, (max-width: 900px) 33vw, 300px"
              quality={65}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </button>
        ))}
      </div>
      {mounted && lightbox && createPortal(lightbox, document.body)}
    </>
  );
}
