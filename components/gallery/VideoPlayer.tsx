import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import Icon from "../ui/Icons";
import type { GalleryVideo } from "@/lib/types";
import { useLocalized, type Localized } from "@/lib/i18n";

const ui: Localized<{
  play: string;
  pause: string;
  seek: string;
  volume: string;
  mute: string;
  unmute: string;
  download: string;
  fullView: string;
  exitFullView: string;
  nothing: string;
}> = {
  en: {
    play: "Play",
    pause: "Pause",
    seek: "Seek",
    volume: "Volume",
    mute: "Mute",
    unmute: "Unmute",
    download: "Download video",
    fullView: "Large view",
    exitFullView: "Close large view",
    nothing: "No video selected.",
  },
  vi: {
    play: "Phát",
    pause: "Tạm dừng",
    seek: "Tua",
    volume: "Âm lượng",
    mute: "Tắt tiếng",
    unmute: "Bật tiếng",
    download: "Tải video xuống",
    fullView: "Chế độ xem lớn",
    exitFullView: "Đóng chế độ xem lớn",
    nothing: "Chưa chọn video nào.",
  },
};

const VOLUME_KEY = "video-volume";
const MUTED_KEY = "video-muted";

let lastVolume: number | null = null;
let lastMuted = false;

function loadLevel() {
  if (lastVolume !== null) return;
  try {
    const raw = localStorage.getItem(VOLUME_KEY);
    const n = raw === null ? 1 : Number(raw);
    lastVolume = Number.isFinite(n) && n >= 0 && n <= 1 ? n : 1;
    lastMuted = localStorage.getItem(MUTED_KEY) === "1";
  } catch {
    lastVolume = 1;
  }
}

function keepVolume(v: number) {
  lastVolume = v;
  try {
    localStorage.setItem(VOLUME_KEY, String(v));
  } catch {}
}

let handoff: { src: string; time: number; playing: boolean } | null = null;

function resumeAt(el: HTMLVideoElement, time: number, play: boolean) {
  const apply = () => {
    try {
      el.currentTime = time;
    } catch {}
    if (play) el.play().catch(() => {});
  };
  if (el.readyState >= 1) apply();
  else el.addEventListener("loadedmetadata", apply, { once: true });
}

function keepMuted(m: boolean) {
  lastMuted = m;
  try {
    localStorage.setItem(MUTED_KEY, m ? "1" : "0");
  } catch {}
}

const bufferedTo = (el: HTMLVideoElement) => {
  const r = el.buffered;
  for (let i = r.length - 1; i >= 0; i--) {
    if (r.start(i) <= el.currentTime) return r.end(i);
  }
  return 0;
};

const pad = (n: number) => String(Math.floor(n)).padStart(2, "0");
const clock = (s: number) =>
  Number.isFinite(s) ? `${Math.floor(s / 60)}:${pad(s % 60)}` : "0:00";

export default function VideoPlayer({
  video,
  onFullView,
  full = false,
  active = true,
}: {
  video: GalleryVideo | undefined;
  onFullView?: () => void;
  full?: boolean;
  active?: boolean;
}) {
  const t = useLocalized(ui);
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [at, setAt] = useState(0);
  const [length, setLength] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(lastVolume ?? 1);
  const [muted, setMuted] = useState(lastMuted);
  const [volOpen, setVolOpen] = useState(false);
  const scrubbing = useRef(false);
  const sliding = useRef(false);
  const coarse = useRef(false);
  const volWrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAt(0);
    setLength(0);
    setBuffered(0);
    setPlaying(false);
  }, [video?.src]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !video) return;

    if (!active) {
      el.pause();
      return;
    }

    const carry = handoff;
    if (carry && carry.src === video.src) {
      resumeAt(el, carry.time, carry.playing);
      setAt(carry.time);
    }

    return () => {
      if (el.ended) return;
      handoff = { src: video.src, time: el.currentTime, playing: !el.paused };
    };
  }, [active, video?.src]);

  useEffect(() => {
    loadLevel();
    setVolume(lastVolume ?? 1);
    setMuted(lastMuted);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.volume = volume;
    el.muted = muted;
  }, [volume, muted, video?.src]);

  useEffect(() => {
    if (!volOpen) return;
    const onDown = (e: PointerEvent) => {
      if (!volWrap.current?.contains(e.target as Node)) setVolOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setVolOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [volOpen]);

  const toggle = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    if (el.paused) el.play().catch(() => {});
    else el.pause();
  }, []);

  const seekTo = (value: number) => {
    const el = ref.current;
    setAt(value);
    if (el) el.currentTime = value;
  };

  const levelTo = (value: number) => {
    keepVolume(value);
    setVolume(value);
    if (value > 0 && muted) {
      keepMuted(false);
      setMuted(false);
    }
  };
  const onVolumeClick = () => {
    if (coarse.current && !volOpen) {
      setVolOpen(true);
      return;
    }
    keepMuted(!muted);
    setMuted(!muted);
  };

  const off = muted || volume === 0;
  const level = Math.round((muted ? 0 : volume) * 100);
  const pct = (v: number) => (length > 0 ? Math.min(100, (v / length) * 100) : 0);

  if (!video) {
    return (
      <div className={`vplayer${full ? " vplayer--full" : ""} vplayer--empty`}>
        <p>{t.nothing}</p>
      </div>
    );
  }

  return (
    <div
      className={`vplayer${full ? " vplayer--full" : ""}${
        playing ? "" : " vplayer--paused"
      }`}
    >
      <div className="vplayer-stage">
        <video
          ref={ref}
          key={video.src}
          src={video.src}
          className="vplayer-video"
          playsInline
          preload="metadata"
          onClick={toggle}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onLoadedMetadata={(e) => setLength(e.currentTarget.duration || 0)}
          onProgress={(e) => setBuffered(bufferedTo(e.currentTarget))}
          onTimeUpdate={(e) => {
            if (!scrubbing.current) setAt(e.currentTarget.currentTime);
            setBuffered(bufferedTo(e.currentTarget));
          }}
          onEnded={() => {
            setPlaying(false);
            handoff = null;
          }}
        />
        <span className="vplayer-title" title={video.name}>{video.name}</span>

        <div className="vplayer-bar">
          <button
            type="button"
            className="vplayer-btn"
            onClick={toggle}
            aria-label={playing ? t.pause : t.play}
            data-tip={playing ? t.pause : t.play}
            data-tip-pos="up"
          >
            <Icon name={playing ? "pause" : "play"} size={18} />
          </button>

          <span className="vplayer-clock">{clock(at)}</span>

          <div className="vplayer-seek-wrap">
            <span className="vplayer-seek-buffer" style={{ width: `${pct(buffered)}%` }} />
            <span className="vplayer-seek-fill" style={{ width: `${pct(at)}%` }} />
            <input
              type="range"
              className="vplayer-seek"
              min={0}
              max={length || 0}
              step={0.01}
              value={Math.min(at, length || 0)}
              aria-label={t.seek}
              onPointerDown={() => { scrubbing.current = true; }}
              onPointerUp={() => { scrubbing.current = false; }}
              onChange={(e) => seekTo(Number(e.target.value))}
            />
          </div>

          <span className="vplayer-clock">{clock(length)}</span>

          <div
            className={`vplayer-volume${volOpen ? " vplayer-volume--open" : ""}`}
            ref={volWrap}
            onPointerEnter={(e) => { if (e.pointerType === "mouse") setVolOpen(true); }}
            onPointerLeave={(e) => {
              if (e.pointerType === "mouse" && !sliding.current) setVolOpen(false);
            }}
          >
            <button
              type="button"
              className="vplayer-btn"
              onPointerDown={(e) => { coarse.current = e.pointerType !== "mouse"; }}
              onClick={onVolumeClick}
              aria-pressed={muted}
              aria-label={off ? t.unmute : t.mute}
            >
              <Icon name={off ? "volumeMute" : "volumeHigh"} size={18} />
            </button>
            <div className="vplayer-volume-panel">
              <div className="vplayer-volume-track" style={{ "--vol": level } as CSSProperties}>
                <span className="vplayer-volume-value" aria-hidden="true">{level}%</span>
                <input
                  type="range"
                  className="vplayer-volume-slider"
                  min={0}
                  max={100}
                  value={level}
                  aria-label={t.volume}
                  aria-valuetext={`${level}%`}
                  onPointerDown={() => { sliding.current = true; }}
                  onPointerUp={() => { sliding.current = false; }}
                  onPointerCancel={() => { sliding.current = false; }}
                  onLostPointerCapture={() => { sliding.current = false; }}
                  onChange={(e) => levelTo(Number(e.target.value) / 100)}
                />
              </div>
            </div>
        </div>

        <a
          className="vplayer-btn"
          href={video.src}
          download={`${video.name}.mp4`}
          aria-label={t.download}
          data-tip={t.download}
          data-tip-pos="up"
        >
          <Icon name="download" size={18} />
        </a>

        {onFullView && (
          <button
            type="button"
            className="vplayer-btn"
            onClick={onFullView}
            aria-label={full ? t.exitFullView : t.fullView}
            data-tip={full ? t.exitFullView : t.fullView}
            data-tip-pos="up"
          >
            <Icon name={full ? "close" : "expand"} size={18} />
          </button>
        )}
        </div>
      </div>
    </div>
  );
}
