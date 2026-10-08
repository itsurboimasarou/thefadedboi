import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Icon from "../ui/Icons";
import {
  canSwapMedia,
  markBackdropUnavailable,
  resolveBackdrop,
  setBackdropMedia,
  useBackdropAvailability,
  useBackdropChoice,
  useBackdropMedia,
} from "@/lib/backdrop";
import { useLocalized } from "@/lib/i18n";
import { backdropToolsUi as ui } from "@/lib/ui-strings";

const HOME = "/";

const BACKDROP_CLASSES = ["has-bg-video"];

export function primeBgVideo(href: string) {
  if (href === HOME) return;
  const root = document.documentElement;
  if (!BACKDROP_CLASSES.some((c) => root.classList.contains(c))) return;
  root.classList.remove(...BACKDROP_CLASSES);
}

export default function VideoBackground() {
  const t = useLocalized(ui);
  const ref = useRef<HTMLVideoElement>(null);
  const [orbField, setOrbField] = useState<HTMLElement | null>(null);
  const [body, setBody] = useState<HTMLElement | null>(null);
  const [paused, setPaused] = useState(false);
  const avail = useBackdropAvailability();
  const choice = useBackdropChoice();
  const media = useBackdropMedia();
  const kind = resolveBackdrop(avail, choice, media);
  const isMedia = kind === "video" || kind === "image";
  const canSwap = isMedia && canSwapMedia(avail);

  useEffect(() => {
    setOrbField(document.getElementById("orb-field"));
    setBody(document.body);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("has-bg-video", isMedia);
    return () => {
      root.classList.remove(...BACKDROP_CLASSES);
    };
  }, [isMedia]);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (document.documentElement.classList.contains("lite-mode")) {
      v.pause();
      setPaused(true);
      return;
    }
    v.play().catch(() => { });
  }, [kind]);

  useEffect(() => {
    const onLite = (e: Event) => {
      const v = ref.current;
      if (!v) return;
      if ((e as CustomEvent<boolean>).detail) v.pause();
      else v.play().catch(() => { });
    };
    window.addEventListener("lite-mode-change", onLite);
    return () => window.removeEventListener("lite-mode-change", onLite);
  }, []);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => { });
    else v.pause();
  };

  if (!isMedia || !orbField) return null;

  const mediaEl =
    kind === "video" ? (
      <video
        ref={ref}
        className="bg-video"
        src={avail.videoSrc ?? ""}
        muted
        loop
        playsInline
        autoPlay
        preload="auto"
        aria-hidden="true"
        tabIndex={-1}
        onPlay={() => setPaused(false)}
        onPause={() => setPaused(true)}
        onError={() => markBackdropUnavailable("video")}
      />
    ) : (
      <img
        className="bg-image"
        src={avail.imageSrc ?? ""}
        alt=""
        aria-hidden="true"
        decoding="async"
        onError={() => markBackdropUnavailable("image")}
      />
    );

  const tools =
    body && (kind === "video" || canSwap)
      ? createPortal(
          <div className="backdrop-tools">
            {kind === "video" && (
              <button
                type="button"
                className="backdrop-tool"
                onClick={toggle}
                aria-pressed={paused}
                aria-label={paused ? t.play : t.pause}
                data-tip={paused ? t.play : t.pause}
                data-tip-pos="left"
              >
                <Icon name={paused ? "play" : "pause"} size={16} />
              </button>
            )}
            {canSwap && (
              <button
                type="button"
                className="backdrop-tool"
                onClick={() => setBackdropMedia(kind === "video" ? "image" : "video")}
                aria-label={kind === "video" ? t.toPhoto : t.toVideo}
                data-tip={kind === "video" ? t.toPhoto : t.toVideo}
                data-tip-pos="left"
              >
                <Icon name={kind === "video" ? "image" : "film"} size={16} />
              </button>
            )}
          </div>,
          body
        )
      : null;

  return (
    <>
      {createPortal(mediaEl, orbField)}
      {tools}
    </>
  );
}
