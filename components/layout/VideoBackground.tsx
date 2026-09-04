import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Icon from "../ui/Icons";
import { glassOn, setGlass } from "@/components/controls/GlassMode";
import {
  backdropSources,
  markBackdropUnavailable,
  resolveBackdrop,
  useBackdropAvailability,
  useBackdropKind,
} from "@/lib/backdrop";
import { useLocalized, type Localized } from "@/lib/i18n";

const HOME = "/";

const ui: Localized<{ pause: string; play: string }> = {
  en: { pause: "Pause background video", play: "Play background video" },
  vi: { pause: "Tạm dừng video nền", play: "Phát video nền" },
};

export function primeBgVideo(href: string) {
  if (href === HOME) return;
  const root = document.documentElement;
  if (!root.classList.contains("has-bg-video")) return;
  root.classList.remove("has-bg-video");
  setGlass(glassOn());
}

export default function VideoBackground() {
  const t = useLocalized(ui);
  const ref = useRef<HTMLVideoElement>(null);
  const [orbField, setOrbField] = useState<HTMLElement | null>(null);
  const [body, setBody] = useState<HTMLElement | null>(null);
  const [paused, setPaused] = useState(false);
  const avail = useBackdropAvailability();
  const pref = useBackdropKind();
  const kind = resolveBackdrop(avail, pref);

  useEffect(() => {
    setOrbField(document.getElementById("orb-field"));
    setBody(document.body);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (!kind) return;
    root.classList.add("has-bg-video");
    root.dataset.backdrop = kind;
    setGlass(glassOn());
    return () => {
      root.classList.remove("has-bg-video");
      delete root.dataset.backdrop;
      setGlass(glassOn());
    };
  }, [kind]);

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

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => { });
    else v.pause();
  };

  if (!kind || !orbField) return null;

  const media =
    kind === "video" ? (
      <video
        ref={ref}
        className="bg-video"
        src={backdropSources.video}
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
        src={backdropSources.image}
        alt=""
        aria-hidden="true"
        decoding="async"
        onError={() => markBackdropUnavailable("image")}
      />
    );

  const control =
    kind === "video" && body
      ? createPortal(
          <button
            type="button"
            className="backdrop-pause"
            onClick={toggle}
            aria-pressed={paused}
            aria-label={paused ? t.play : t.pause}
            data-tip={paused ? t.play : t.pause}
            data-tip-pos="left"
          >
            <Icon name={paused ? "play" : "pause"} size={16} />
          </button>,
          body
        )
      : null;

  return (
    <>
      {createPortal(media, orbField)}
      {control}
    </>
  );
}
