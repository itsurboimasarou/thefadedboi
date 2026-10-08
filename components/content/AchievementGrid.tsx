import { useEffect, useRef, useState } from "react";
import AlbumGrid from "../gallery/AlbumGrid";
import type { GalleryImage } from "@/lib/types";

interface AchievementGridProps { images: GalleryImage[]; title: string }

export default function AchievementGrid({ images, title }: AchievementGridProps) {
  const scroller = useRef<HTMLDivElement>(null);
  const [more, setMore] = useState(false);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const update = () => setMore(el.scrollTop + el.clientHeight < el.scrollHeight - 1);
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [images]);

  return (
    <div className="cert-grid">
      <div className="cert-grid-scroll" ref={scroller} data-more={more || undefined}>
        <AlbumGrid images={images} title={title} download={false} />
      </div>
    </div>
  );
}
