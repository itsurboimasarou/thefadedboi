import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Icon from "../ui/Icons";
import type { ScannedPlaylist, Track } from "@/lib/types";
import { COMPACT_MQ } from "../layout/functions/useHuBarAutoHide";
import Marquee from "../ui/Marquee";
import { useMusicPlayback, setNowPlaying, setVolume, setMuted, initMusicPrefs } from "@/lib/musicState";

interface MusicPlayerProps {
  open: boolean;
  onClose: () => void;
  onDismiss: () => void;
  dragProgress: number | null;
  setDragProgress: (p: number | null) => void;
  switching: boolean;
}

type QueueMode = "all" | number | null;
type RepeatMode = "off" | "all" | "one";
type QueueItem = Track & { playlistIdx: number };

function formatTime(s: number): string {
  if (!Number.isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function formatQuality(t: Track): string {
  if (!t.format) return "";
  if (t.format === "FLAC" || t.format === "WAV") {
    return t.bitDepth && t.sampleRate
      ? `${t.format}, ${t.bitDepth}-bit/${t.sampleRate}kHz`
      : t.format;
  }
  return t.bitrate ? `${t.format}, ${t.bitrate}kbps` : t.format;
}

function randomIndex(exclude: number, len: number): number {
  if (len <= 1) return 0;
  let i = Math.floor(Math.random() * len);
  while (i === exclude) i = Math.floor(Math.random() * len);
  return i;
}

export default function MusicPlayer({ open, onClose, onDismiss, dragProgress, setDragProgress, switching }: MusicPlayerProps) {
  const [playlists, setPlaylists] = useState<ScannedPlaylist[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [sliding, setSliding] = useState(false);
  const [albumMenuOpen, setAlbumMenuOpen] = useState(false);
  const [queueMode, setQueueMode] = useState<QueueMode>(null);
  const [activeTrack, setActiveTrack] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<RepeatMode>("off");
  const [scrubbing, setScrubbing] = useState(false);
  const [dragTime, setDragTime] = useState(0);

  const { volume, muted } = useMusicPlayback();

  const audioRef = useRef<HTMLAudioElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const albumSelectRef = useRef<HTMLDivElement>(null);
  const viewsRef = useRef<HTMLDivElement>(null);
  const playerViewRef = useRef<HTMLDivElement>(null);
  const listViewRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const dragMetaRef = useRef<{ x: number; y: number; width: number } | null>(null);
  const durationRef = useRef(0);
  useEffect(() => { durationRef.current = duration; }, [duration]);

  useLayoutEffect(() => {
    if (open) setListOpen(false);
  }, [open]);

  useEffect(() => {
    if (!open || playlists !== null) return;
    let cancelled = false;
    fetch("/api/music")
      .then((res) => res.json())
      .then((data) => { if (!cancelled) setPlaylists(data.playlists ?? []); })
      .catch(() => {
        if (!cancelled) { setPlaylists([]); setLoadError(true); }
      });
    return () => { cancelled = true; };
  }, [open, playlists]);

  const totalTracks = playlists?.reduce((n, p) => n + p.tracks.length, 0) ?? 0;

  useEffect(() => {
    if (playlists && queueMode === null && totalTracks > 0) setQueueMode("all");
  }, [playlists, queueMode, totalTracks]);

  const queueItems: QueueItem[] = !playlists
    ? []
    : queueMode === "all"
      ? playlists.flatMap((pl, pi) => pl.tracks.map((t) => ({ ...t, playlistIdx: pi })))
      : typeof queueMode === "number"
        ? (playlists[queueMode]?.tracks ?? []).map((t) => ({ ...t, playlistIdx: queueMode }))
        : [];

  const current = activeTrack !== null ? queueItems[activeTrack] : undefined;
  const currentPlaylist = current ? playlists?.[current.playlistIdx] : undefined;

  useEffect(() => {
    if (!albumMenuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!albumSelectRef.current?.contains(e.target as Node)) setAlbumMenuOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [albumMenuOpen]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el || !current) return;
    if (playing) el.play().catch(() => setPlaying(false));
    else el.pause();
  }, [playing, current]);

  useEffect(() => { setProgress(0); }, [current?.url]);

  useEffect(() => { initMusicPrefs(); }, []);

  useEffect(() => {
    const el = audioRef.current;
    if (el) el.volume = volume;
  }, [volume]);
  useEffect(() => {
    const el = audioRef.current;
    if (el) el.muted = muted;
  }, [muted]);

  useEffect(() => {
    setNowPlaying({
      title: current?.title ?? null,
      artist: (current?.artist ?? currentPlaylist?.artist) ?? null,
      albumTitle: currentPlaylist?.title ?? null,
      cover: currentPlaylist?.cover ?? null,
      playing: playing && !!current,
    });
  }, [
    current?.file,
    current?.title,
    current?.artist,
    currentPlaylist?.slug,
    currentPlaylist?.title,
    currentPlaylist?.artist,
    currentPlaylist?.cover,
    playing,
  ]);

  useLayoutEffect(() => {
    setSliding(true);
    const t = setTimeout(() => setSliding(false), 340);
    return () => clearTimeout(t);
  }, [listOpen]);

  useLayoutEffect(() => {
    const wrap = viewsRef.current;
    const a = playerViewRef.current;
    const b = listViewRef.current;
    if (!wrap || !a || !b) return;
    const sync = () => {
      wrap.style.height = `${(listOpen ? b : a).scrollHeight}px`;
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(a);
    ro.observe(b);
    return () => ro.disconnect();
  }, [listOpen, playlists, queueMode]);

  const goTo = (dir: 1 | -1) => {
    const len = queueItems.length;
    if (!len) return;
    setActiveTrack((i) => {
      if (i === null) return dir === 1 ? 0 : len - 1;
      if (dir === 1 && shuffle) return randomIndex(i, len);
      return (i + dir + len) % len;
    });
    setPlaying(true);
  };

  const handleEnded = () => {
    const len = queueItems.length;
    if (!len || activeTrack === null) return;
    if (repeat === "one") {
      const el = audioRef.current;
      if (el) { el.currentTime = 0; el.play().catch(() => {}); }
      return;
    }
    if (repeat === "off" && !shuffle && activeTrack === len - 1) {
      setPlaying(false);
      return;
    }
    goTo(1);
  };

  const togglePlay = () => {
    if (activeTrack === null) {
      if (queueItems.length) { setActiveTrack(0); setPlaying(true); }
      return;
    }
    setPlaying((v) => !v);
  };

  const selectQueue = (mode: QueueMode) => {
    setQueueMode(mode);
    setActiveTrack(null);
    setPlaying(false);
    setAlbumMenuOpen(false);
  };

  const playTrackAt = (idx: number) => {
    setActiveTrack(idx);
    setPlaying(true);
    setListOpen(false);
  };

  const ratioFromClientX = (clientX: number) => {
    const el = progressRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    return Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
  };

  const beginScrub = (clientX: number) => {
    if (!durationRef.current) return;
    setDragTime(ratioFromClientX(clientX) * durationRef.current);
    setScrubbing(true);
  };

  const finishScrub = () => {
    setScrubbing(false);
    setDragTime((t) => {
      const el = audioRef.current;
      if (el) el.currentTime = t;
      setProgress(t);
      return t;
    });
  };

  useEffect(() => {
    if (!scrubbing) return;
    const onMouseMove = (e: MouseEvent) =>
      setDragTime(ratioFromClientX(e.clientX) * durationRef.current);
    const onMouseUp = (e: MouseEvent) => {
      setDragTime(ratioFromClientX(e.clientX) * durationRef.current);
      finishScrub();
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [scrubbing]);

  const onProgressMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    beginScrub(e.clientX);
  };
  const onProgressTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    beginScrub(e.touches[0].clientX);
  };
  const onProgressTouchMove = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (!scrubbing) return;
    setDragTime(ratioFromClientX(e.touches[0].clientX) * durationRef.current);
  };
  const onProgressTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    finishScrub();
  };

  const displayProgress = scrubbing ? dragTime : progress;

  const cycleRepeat = () =>
    setRepeat((r) => (r === "off" ? "all" : r === "all" ? "one" : "off"));

  const selectionLabel = !playlists || playlists.length === 0
    ? "<None>"
    : queueMode === "all"
      ? "All tracks"
      : typeof queueMode === "number"
        ? (playlists[queueMode]?.title ?? "<None>")
        : "<None>";

  const onPanelTouchStart = (e: React.TouchEvent) => {
    if (!open || !window.matchMedia(COMPACT_MQ).matches) return;
    const t = e.touches[0];
    dragMetaRef.current = {
      x: t.clientX,
      y: t.clientY,
      width: panelRef.current?.getBoundingClientRect().width || 1,
    };
  };
  const onPanelTouchMove = (e: React.TouchEvent) => {
    const meta = dragMetaRef.current;
    if (!meta) return;
    const t = e.touches[0];
    const dx = t.clientX - meta.x;
    const dy = t.clientY - meta.y;
    if (dragProgress === null && (Math.abs(dx) < 10 || Math.abs(dx) <= Math.abs(dy) * 1.2)) return;
    setDragProgress(Math.min(1, Math.max(0, 1 + dx / meta.width)));
  };
  const onPanelTouchEnd = () => {
    dragMetaRef.current = null;
    if (dragProgress === null) return;
    if (dragProgress < 0.65) onClose();
    setDragProgress(null);
  };

  const dragProgressRef = useRef<number | null>(null);
  useEffect(() => { dragProgressRef.current = dragProgress; }, [dragProgress]);
  const [mouseDragging, setMouseDragging] = useState(false);
  const onPanelMouseDown = (e: React.MouseEvent) => {
    if (!open || !window.matchMedia(COMPACT_MQ).matches) return;
    dragMetaRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: panelRef.current?.getBoundingClientRect().width || 1,
    };
    setMouseDragging(true);
  };
  useEffect(() => {
    if (!mouseDragging) return;
    const onMove = (e: MouseEvent) => {
      const meta = dragMetaRef.current;
      if (!meta) return;
      const dx = e.clientX - meta.x;
      const dy = e.clientY - meta.y;
      if (dragProgressRef.current === null && (Math.abs(dx) < 10 || Math.abs(dx) <= Math.abs(dy) * 1.2)) return;
      setDragProgress(Math.min(1, Math.max(0, 1 + dx / meta.width)));
    };
    const onUp = () => {
      dragMetaRef.current = null;
      setMouseDragging(false);
      if (dragProgressRef.current !== null && dragProgressRef.current < 0.65) onClose();
      setDragProgress(null);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [mouseDragging]);

  const wheelLockRef = useRef(false);
  const wheelResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onPanelWheel = (e: React.WheelEvent) => {
    if (wheelResetRef.current) clearTimeout(wheelResetRef.current);
    wheelResetRef.current = setTimeout(() => { wheelLockRef.current = false; }, 400);
    if (wheelLockRef.current) return;
    if (e.deltaX > 24 && e.deltaX > Math.abs(e.deltaY) * 1.2) {
      wheelLockRef.current = true;
      onClose();
    }
  };

  return (
    <div
      id="music-player"
      ref={panelRef}
      className={`control-panel player-panel${open ? " control-panel--open" : ""}${dragProgress !== null ? " control-panel--dragging" : ""}${switching ? " panel-switching" : ""}`}
      style={dragProgress !== null ? {
        transform: `translateX(calc(${(dragProgress - 1) * 100}% - ${(1 - dragProgress) * 16}px))`,
        opacity: dragProgress,
      } : undefined}
      role="dialog"
      aria-modal="true"
      aria-label="Music player"
      aria-hidden={!open}
      onTouchStart={onPanelTouchStart}
      onTouchMove={onPanelTouchMove}
      onTouchEnd={onPanelTouchEnd}
      onMouseDown={onPanelMouseDown}
      onWheel={onPanelWheel}
    >
      <div className="player-bg-clip" aria-hidden="true">
        {currentPlaylist?.cover && (
          <div
            className="player-bg-cover"
            style={{ backgroundImage: `url(${currentPlaylist.cover})` }}
          />
        )}
      </div>

      <div className="panel-head">
        <h2 className="h-with-icon panel-title">
          <Icon name="music" size={18} />
          Music
        </h2>
        <div className="panel-head-actions">
          <div className="player-header-volume">
            <button
              type="button"
              className="panel-icon-btn"
              onClick={() => setMuted(!muted)}
              aria-pressed={muted}
              aria-label={muted || volume === 0 ? "Unmute" : "Mute"}
              title={muted || volume === 0 ? "Unmute" : "Mute"}
            >
              <Icon name={muted || volume === 0 ? "volumeMute" : "volumeHigh"} size={18} />
            </button>
            <input
              type="range"
              className="player-header-volume-slider"
              min={0}
              max={100}
              value={Math.round((muted ? 0 : volume) * 100)}
              onChange={(e) => {
                const v = Number(e.target.value) / 100;
                setVolume(v);
                if (muted && v > 0) setMuted(false);
              }}
              onMouseDown={(e) => e.stopPropagation()}
              aria-label="Volume"
            />
          </div>
          {listOpen ? (
            <button
              type="button"
              className="panel-back-btn"
              onClick={() => setListOpen(false)}
              aria-label="Back"
            >
              <Icon name="arrowLeft" size={14} />
              Back
            </button>
          ) : (
            <button
              type="button"
              className="panel-icon-btn"
              onClick={() => setListOpen(true)}
              aria-label="Track list"
              title="Track list"
            >
              <Icon name="list" size={16} />
            </button>
          )}
          <button
            type="button"
            className="panel-icon-btn player-close-btn"
            onClick={onDismiss}
            aria-label="Close"
            title="Close"
          >
            <Icon name="close" size={16} />
          </button>
        </div>
      </div>

      <div className={`panel-views${sliding ? " panel-views--sliding" : ""}`} ref={viewsRef}>
        {playlists === null ? (
          <p className="album-empty">Loading tracks…</p>
        ) : (
        <>
        <div
          className={`panel-view-slide panel-view-slide--main${listOpen ? " panel-view-slide--behind" : ""}`}
          ref={playerViewRef}
          aria-hidden={listOpen}
        >
              <div className="player-now-playing">
                {currentPlaylist?.cover ? (
                  <img src={currentPlaylist.cover} alt="" className="player-cover" />
                ) : (
                  <span className="player-cover player-cover--placeholder" aria-hidden="true">
                    <Icon name="music" size={28} />
                  </span>
                )}
                <Marquee
                  as="p"
                  className={`player-track-title${!current ? " player-track-title--empty" : ""}`}
                >
                  {current ? current.title : "No current playing track"}
                </Marquee>
                {current && (
                  <Marquee as="p" className="player-track-subtext">
                    {[current.artist ?? currentPlaylist?.artist, currentPlaylist?.title, formatQuality(current)]
                      .filter(Boolean)
                      .join(" • ")}
                  </Marquee>
                )}
              </div>

              <div
                className="player-progress"
                ref={progressRef}
                onMouseDown={onProgressMouseDown}
                onTouchStart={onProgressTouchStart}
                onTouchMove={onProgressTouchMove}
                onTouchEnd={onProgressTouchEnd}
              >
                <div
                  className="player-progress-fill"
                  style={{ width: duration ? `${(displayProgress / duration) * 100}%` : "0%" }}
                />
                <div
                  className={`player-progress-knob${scrubbing ? " player-progress-knob--active" : ""}`}
                  style={{ left: duration ? `${(displayProgress / duration) * 100}%` : "0%" }}
                />
              </div>
              <div className="player-time">
                <span>{formatTime(displayProgress)}</span>
                <span>{formatTime(duration)}</span>
              </div>

              <div className="player-controls">
                <button
                  type="button"
                  className={`panel-icon-btn${shuffle ? " panel-icon-btn--active" : ""}`}
                  onClick={() => setShuffle((v) => !v)}
                  aria-pressed={shuffle}
                  aria-label="Shuffle"
                  title="Shuffle"
                >
                  <Icon name="shuffle" size={18} />
                </button>
                <button type="button" className="panel-icon-btn" onClick={() => goTo(-1)} aria-label="Previous track" title="Previous track">
                  <Icon name="skipBack" size={18} />
                </button>
                <button
                  type="button"
                  className="panel-icon-btn player-play-btn"
                  onClick={togglePlay}
                  aria-label={playing ? "Pause" : "Play"}
                  title={playing ? "Pause" : "Play"}
                >
                  <Icon name={playing ? "pause" : "play"} size={22} />
                </button>
                <button type="button" className="panel-icon-btn" onClick={() => goTo(1)} aria-label="Next track" title="Next track">
                  <Icon name="skipForward" size={18} />
                </button>
                <button
                  type="button"
                  className={`panel-icon-btn${repeat !== "off" ? " panel-icon-btn--active" : ""}`}
                  onClick={cycleRepeat}
                  aria-pressed={repeat !== "off"}
                  aria-label={repeat === "one" ? "Repeat: one track" : repeat === "all" ? "Repeat: all" : "Repeat: off"}
                  title={repeat === "one" ? "Repeat: one track" : repeat === "all" ? "Repeat: all" : "Repeat: off"}
                >
                  <Icon name={repeat === "one" ? "repeatOne" : "repeat"} size={18} />
                </button>
              </div>
        </div>

        <div
          className={`panel-view-slide panel-view-slide--theme${listOpen ? " panel-view-slide--front" : ""}`}
          ref={listViewRef}
          aria-hidden={!listOpen}
        >
          <div className="player-album-select" ref={albumSelectRef}>
            <button
              type="button"
              className="player-album-trigger"
              onClick={() => setAlbumMenuOpen((v) => !v)}
              aria-haspopup="listbox"
              aria-expanded={albumMenuOpen}
            >
              <Marquee className="player-album-trigger-text">{selectionLabel}</Marquee>
              <Icon name="chevronDown" size={12} className="player-album-caret" />
            </button>
            {albumMenuOpen && (
              <ul className="player-album-menu" role="listbox">
                {!playlists || playlists.length === 0 ? (
                  <li className="player-album-menu-empty">No albums available.</li>
                ) : (
                  <>
                    {totalTracks > 0 && (
                      <li>
                        <button
                          type="button"
                          className={`player-album-option${queueMode === "all" ? " player-album-option--active" : ""}`}
                          onClick={() => selectQueue("all")}
                        >
                          <Marquee className="player-album-option-text">All tracks</Marquee>
                        </button>
                      </li>
                    )}
                    {playlists.map((pl, i) => (
                      <li key={pl.slug}>
                        <button
                          type="button"
                          className={`player-album-option${queueMode === i ? " player-album-option--active" : ""}`}
                          onClick={() => selectQueue(i)}
                        >
                          <Marquee className="player-album-option-text">{pl.title}</Marquee>
                        </button>
                      </li>
                    ))}
                  </>
                )}
              </ul>
            )}
          </div>

          {queueItems.length === 0 ? (
            <p className="album-empty">
              {loadError ? "Couldn't load tracks — try again later." : "No tracks available."}
            </p>
          ) : (
            <ul className="player-track-list">
              {queueItems.map((t, i) => (
                <li key={`${t.playlistIdx}-${t.file}`}>
                  <button
                    type="button"
                    className={`player-track${activeTrack === i ? " player-track--active" : ""}`}
                    onClick={() => playTrackAt(i)}
                  >
                    <Icon name={activeTrack === i && playing ? "pause" : "play"} size={13} />
                    <Marquee className="player-track-name">{t.title}</Marquee>
                    {Number.isFinite(t.duration) && (
                      <span className="player-track-duration">{formatTime(t.duration as number)}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        </>
        )}
      </div>

      <p className="panel-swipe-hint">Swipe left for site controls</p>

      <audio
        ref={audioRef}
        src={current?.url}
        preload="none"
        onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={handleEnded}
      />
    </div>
  );
}
