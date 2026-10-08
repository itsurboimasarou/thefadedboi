import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import Icon from "../ui/Icons";
import type { GalleryVideo, VideoInfo } from "@/lib/types";
import { useLocalized } from "@/lib/i18n";
import { videoPlayerUi as ui } from "@/lib/ui-strings";

const VOLUME_KEY = "video-volume";

const VOL_FULL = 100;
const VOL_MIN = 40;
const VOL_MAX = 120;
const VOL_SHARE = 0.15;

function onPicture(el: HTMLVideoElement, x: number, y: number): boolean {
  const { videoWidth: vw, videoHeight: vh } = el;
  if (!vw || !vh) return true;
  const box = el.getBoundingClientRect();
  const scale = Math.min(box.width / vw, box.height / vh);
  const w = vw * scale;
  const h = vh * scale;
  const left = box.left + (box.width - w) / 2;
  const top = box.top + (box.height - h) / 2;
  return x >= left && x <= left + w && y >= top && y <= top + h;
}

const VOL_CHROME = 8 + 24 + 2 + 14 + 8;
const MUTED_KEY = "video-muted";

let lastVolume: number | null = null;
let lastMuted = false;
let lastLoop = false;

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

const CODEC_NAMES: Record<string, string> = {
  h264: "H.264 (AVC)",
  hevc: "H.265 (HEVC)",
  av1: "AV1",
  vp9: "VP9",
  vp8: "VP8",
  mpeg4: "MPEG-4",
  prores: "ProRes",
};
const HDR_NAMES: Record<string, string> = {
  hdr10: "HDR10",
  hlg: "HLG",
  "dolby-vision": "Dolby Vision",
};

const trim = (n: number, digits: number) => String(Number(n.toFixed(digits)));
const bitrateText = (kbps: number) =>
  kbps >= 1000 ? `${trim(kbps / 1000, 2)} Mbps` : `${Math.round(kbps)} kbps`;

type InfoLabels = Record<
  "resolution" | "codec" | "fileType" | "duration" | "frameRate" | "bitrate" | "bitDepth" | "range",
  string
>;

function infoRows(
  info: VideoInfo | undefined,
  labels: InfoLabels,
  el: { width: number; height: number; length: number }
): [string, string][] {
  const width = info?.width || el.width;
  const height = info?.height || el.height;
  const duration = info?.duration || el.length;
  const rows: [string, string | undefined][] = [
    [labels.resolution, width && height ? `${width} × ${height}` : undefined],
    [labels.codec, info?.videoCodec ? CODEC_NAMES[info.videoCodec] ?? info.videoCodec.toUpperCase() : undefined],
    [labels.fileType, info?.container?.toUpperCase()],
    [labels.duration, duration ? clock(duration) : undefined],
    [labels.frameRate, info?.frameRate ? `${trim(info.frameRate, 2)} fps` : undefined],
    [labels.bitrate, info?.bitrate ? bitrateText(info.bitrate) : undefined],
    [labels.bitDepth, info?.bitDepth ? `${info.bitDepth}-bit` : undefined],
    [labels.range, info ? (info.hdr ? `HDR (${HDR_NAMES[info.hdr] ?? info.hdr})` : "SDR") : undefined],
  ];
  return rows.filter((r): r is [string, string] => !!r[1]);
}

const IDLE_MS = 2600;

export default function VideoPlayer({
  video,
  onStep,
}: {
  video: GalleryVideo | undefined;
  onStep?: (dir: 1 | -1) => void;
}) {
  const t = useLocalized(ui);
  const ref = useRef<HTMLVideoElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [idle, setIdle] = useState(false);
  const idleTimer = useRef<ReturnType<typeof setTimeout>>();
  const [playing, setPlaying] = useState(false);
  const [at, setAt] = useState(0);
  const [length, setLength] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(lastVolume ?? 1);
  const [muted, setMuted] = useState(lastMuted);
  const [volOpen, setVolOpen] = useState(false);
  const [loop, setLoop] = useState(lastLoop);
  const [infoOpen, setInfoOpen] = useState(false);
  const [natural, setNatural] = useState({ width: 0, height: 0 });
  const infoWrap = useRef<HTMLDivElement>(null);
  const scrubbing = useRef(false);
  const sliding = useRef(false);
  const coarse = useRef(false);
  const volWrap = useRef<HTMLDivElement>(null);
  const [volTravel, setVolTravel] = useState(VOL_FULL);

  useEffect(() => {
    setAt(0);
    setLength(0);
    setBuffered(0);
    setPlaying(false);
    setInfoOpen(false);
    setNatural({ width: 0, height: 0 });
  }, [video?.src]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !video) return;

    const carry = handoff;
    if (carry && carry.src === video.src) {
      resumeAt(el, carry.time, carry.playing);
      setAt(carry.time);
    }

    return () => {
      if (el.ended) return;
      handoff = { src: video.src, time: el.currentTime, playing: !el.paused };
    };
  }, [video?.src]);

  useEffect(() => {
    const onChange = () => {
      setFullscreen(!!root.current && document.fullscreenElement === root.current);
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          const el = ref.current;
          if (!el || !el.paused || el.readyState < 1) return;
          try {
            el.currentTime = el.currentTime;
          } catch {}
        })
      );
    };
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const wake = useCallback(() => {
    setIdle(false);
    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setIdle(true), IDLE_MS);
  }, []);

  useEffect(() => {
    if (!fullscreen) {
      clearTimeout(idleTimer.current);
      setIdle(false);
      return;
    }
    wake();
    return () => clearTimeout(idleTimer.current);
  }, [fullscreen, wake]);

  const toggleFullscreen = () => {
    const el = root.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => {});
    } else {
      (ref.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null)
        ?.webkitEnterFullscreen?.();
    }
  };

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
    const el = root.current;
    const wrap = volWrap.current;
    if (!el || !wrap) return;
    const fit = () => {
      const box = el.getBoundingClientRect();
      const head = parseFloat(getComputedStyle(el).getPropertyValue("--vp-head")) || 0;
      const room = wrap.getBoundingClientRect().top - box.top - head - VOL_CHROME;
      const wanted = Math.max(VOL_FULL, box.height * VOL_SHARE);
      setVolTravel(Math.round(Math.min(VOL_MAX, Math.max(VOL_MIN, Math.min(room, wanted)))));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [video?.src, fullscreen]);

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

  useEffect(() => {
    if (!infoOpen) return;
    const onDown = (e: PointerEvent) => {
      if (!infoWrap.current?.contains(e.target as Node)) setInfoOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setInfoOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [infoOpen]);

  const toggleLoop = () => {
    lastLoop = !loop;
    setLoop(!loop);
  };

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
  const volStep = volTravel >= 100 ? 1 : volTravel >= 50 ? 2 : 5;
  const pct = (v: number) => (length > 0 ? Math.min(100, (v / length) * 100) : 0);

  if (!video) {
    return (
      <div className="vplayer vplayer--empty">
        <p>{t.nothing}</p>
      </div>
    );
  }

  const rows = infoRows(video.info, t, { ...natural, length });

  return (
    <div
      ref={root}
      className={`vplayer${fullscreen ? " vplayer--fs" : ""}${
        playing ? "" : " vplayer--paused"
      }${fullscreen && idle && !infoOpen && !volOpen ? " vplayer--idle" : ""}`}
      onPointerMove={fullscreen ? wake : undefined}
      onPointerDown={fullscreen ? wake : undefined}
      onKeyDown={fullscreen ? wake : undefined}
    >
      <div className="vplayer-head">
        <span
          className={`vplayer-name${video.brief ? " vplayer-name--brief" : ""}`}
          title={video.brief ? `${video.name} | ${video.brief}` : video.name}
        >
          <span className="vplayer-title">{video.name}</span>
          {video.brief && (
            <>
              <span className="vplayer-name-sep" aria-hidden="true">|</span>
              <span className="vplayer-brief">{video.brief}</span>
            </>
          )}
        </span>
        <div className="vplayer-info" ref={infoWrap}>
          <button
            type="button"
            className={`panel-icon-btn${infoOpen ? " vplayer-head-btn--on" : ""}`}
            onClick={() => setInfoOpen((v) => !v)}
            aria-expanded={infoOpen}
            aria-label={t.info}
            data-tip={infoOpen ? undefined : t.info}
          >
            <Icon name="infoFilled" size={20} />
          </button>
          {infoOpen && (
            <div className="vplayer-info-panel" role="dialog" aria-label={t.info}>
              {rows.length ? (
                <dl>
                  {rows.map(([label, value]) => (
                    <div key={label}>
                      <dt>{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p>{t.noInfo}</p>
              )}
            </div>
          )}
        </div>
        <a
          className="panel-icon-btn"
          href={video.src}
          download={`${video.name}.${video.info?.container ?? "mp4"}`}
          aria-label={t.download}
          data-tip={t.download}
        >
          <Icon name="download" size={16} />
        </a>
      </div>

      <div className="vplayer-stage">
        <video
          ref={ref}
          key={video.src}
          src={video.src}
          className="vplayer-video"
          playsInline
          loop={loop}
          preload="metadata"
          onClick={(e) => {
            if (onPicture(e.currentTarget, e.clientX, e.clientY)) toggle();
          }}
          onMouseMove={(e) => {
            const el = e.currentTarget;
            el.toggleAttribute("data-on-picture", onPicture(el, e.clientX, e.clientY));
          }}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onLoadedMetadata={(e) => {
            setLength(e.currentTarget.duration || 0);
            setNatural({ width: e.currentTarget.videoWidth, height: e.currentTarget.videoHeight });
          }}
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

        {onStep && (
          <>
            <button
              type="button"
              className="vplayer-nav vplayer-nav--prev"
              onClick={() => onStep(-1)}
              aria-label={t.previousVideo}
              data-tip={t.previousVideo}
              data-tip-pos="right"
            >
              <Icon name="chevronLeft" size={22} />
            </button>
            <button
              type="button"
              className="vplayer-nav vplayer-nav--next"
              onClick={() => onStep(1)}
              aria-label={t.nextVideo}
              data-tip={t.nextVideo}
              data-tip-pos="left"
            >
              <Icon name="chevronRight" size={22} />
            </button>
          </>
        )}

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
              <div
                className="vplayer-volume-track"
                style={{ "--vol": level, "--vol-travel": `${volTravel}px` } as CSSProperties}
              >
                <span className="vplayer-volume-value" aria-hidden="true">{level}%</span>
                <input
                  type="range"
                  className="vplayer-volume-slider"
                  style={{ "--fill": `${level}%` } as CSSProperties}
                  min={0}
                  max={100}
                  step={volStep}
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

        <button
          type="button"
          className={`vplayer-btn${loop ? " vplayer-btn--on" : ""}`}
          onClick={toggleLoop}
          aria-pressed={loop}
          aria-label={loop ? t.loopOn : t.loopOff}
          data-tip={loop ? t.loopOn : t.loopOff}
          data-tip-pos="up"
        >
          <Icon name="repeat" size={18} />
        </button>

        <button
          type="button"
          className="vplayer-btn"
          onClick={toggleFullscreen}
          aria-label={fullscreen ? t.exitFullScreen : t.fullScreen}
          data-tip={fullscreen ? t.exitFullScreen : t.fullScreen}
          data-tip-pos="up"
        >
          <Icon name={fullscreen ? "shrink" : "expand"} size={18} />
        </button>
        </div>
      </div>
    </div>
  );
}
