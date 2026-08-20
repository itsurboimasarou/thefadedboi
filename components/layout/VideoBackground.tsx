import { useEffect, useRef, useState } from "react";
import { RAW } from "@/lib/assets";

const SRC = process.env.NEXT_PUBLIC_BG_VIDEO || `${RAW}/bg.mp4`;

export default function VideoBackground() {
  const ref = useRef<HTMLVideoElement>(null);
  const [ok, setOk] = useState(true);

  useEffect(() => {
    if (!ok) return;
    const root = document.documentElement;
    root.classList.add("has-bg-video");
    return () => root.classList.remove("has-bg-video");
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

  if (!ok) return null;

  return (
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
    />
  );
}
