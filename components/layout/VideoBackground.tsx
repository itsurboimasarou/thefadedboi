import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { RAW } from "@/lib/assets";
import { glassOn, setGlass } from "@/components/controls/GlassMode";

const SRC = process.env.NEXT_PUBLIC_BG_VIDEO || `${RAW}/bg.mp4`;

export default function VideoBackground() {
  const ref = useRef<HTMLVideoElement>(null);
  const [ok, setOk] = useState(true);
  const [orbField, setOrbField] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setOrbField(document.getElementById("orb-field"));
  }, []);

  useEffect(() => {
    if (!ok) return;
    const root = document.documentElement;
    root.classList.add("has-bg-video");
    setGlass(glassOn());
    return () => {
      root.classList.remove("has-bg-video");
      setGlass(glassOn());
    };
  }, [ok]);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (document.documentElement.classList.contains("lite-mode")) {
      v.pause();
      return;
    }
    v.play().catch(() => { });
  }, []);

  if (!ok || !orbField) return null;

  return createPortal(
    <video
      ref={ref}
      className="bg-video"
      src={SRC}
      muted
      loop
      playsInline
      autoPlay
      preload="auto"
      aria-hidden="true"
      tabIndex={-1}
      onError={() => setOk(false)}
    />,
    orbField
  );
}
