import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import Icon from "../ui/Icons";
import type { ScannedPlaylist, Track } from "@/lib/types";
import { usePanelSwipe } from "@/lib/functions/usePanelSwipe";
import { useInert } from "@/lib/functions/useInert";
import { useIsoLayoutEffect } from "@/lib/functions/useIsoLayoutEffect";
import Marquee from "../ui/Marquee";
import {
  useMusicPlayback,
  setNowPlaying,
  setVolume,
  setMuted,
  setAmbient,
  initMusicPrefs,
  readSavedTrack,
  saveTrack,
  TRACK_TTL,
} from "@/lib/musicState";
import { useCoverTone } from "@/lib/functions/useCoverTone";
import { useLocalized } from "@/lib/i18n";
import { musicPlayerUi as ui } from "@/lib/ui-strings";
import { folder, matcher } from "@/lib/search";

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
type PlayRef = { folder: string; file: string; all: boolean };

function formatTime(s: number): string {
  if (!Number.isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function trackQuality(t: Track): { ext: string; lossless: boolean; rate: string } | null {
  if (!t.format) return null;
  const lossless = t.lossless ?? (t.format === "FLAC" || t.format === "WAV");
  const ext = t.format === "M4A" ? (lossless ? "ALAC" : "AAC") : t.format;
  const depth = t.bitDepth && t.sampleRate ? `${t.bitDepth}-bit/${t.sampleRate}kHz` : "";
  const kbps = t.bitrate ? `${t.bitrate}kbps` : "";
  const rate = lossless ? depth || kbps : kbps || depth;
  return { ext, lossless, rate };
}

function randomIndex(exclude: number, len: number): number {
  if (len <= 1) return 0;
  let i = Math.floor(Math.random() * len);
  while (i === exclude) i = Math.floor(Math.random() * len);
  return i;
}

export default function MusicPlayer({ open, onClose, onDismiss, dragProgress, setDragProgress, switching }: MusicPlayerProps) {
  const t = useLocalized(ui);
  const [playlists, setPlaylists] = useState<ScannedPlaylist[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [sliding, setSliding] = useState(false);
  const [albumMenuOpen, setAlbumMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const [queueMode, setQueueMode] = useState<QueueMode>(null);
  const [now, setNow] = useState<PlayRef | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<RepeatMode>("off");
  const [single, setSingle] = useState(false);
  const [scrubbing, setScrubbing] = useState(false);
  const [dragTime, setDragTime] = useState(0);

  const { volume, muted, ambient } = useMusicPlayback();

  const audioRef = useRef<HTMLAudioElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const albumSelectRef = useRef<HTMLDivElement>(null);
  const viewsRef = useRef<HTMLDivElement>(null);
  const playerViewRef = useRef<HTMLDivElement>(null);
  const listViewRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const durationRef = useRef(0);
  const lastPlayedRef = useRef(0);
  const posRef = useRef(0);
  const resumeRef = useRef(false);
  useEffect(() => { durationRef.current = duration; }, [duration]);

  useInert(panelRef, !open);
  useInert(playerViewRef, listOpen);
  useInert(listViewRef, !listOpen);

  useIsoLayoutEffect(() => {
    if (open) setListOpen(false);
  }, [open]);

  useEffect(() => {
    const saved = readSavedTrack();
    if (!saved) return;
    lastPlayedRef.current = saved.at;
    posRef.current = saved.pos;
    setNow({ folder: saved.folder, file: saved.file, all: saved.all });
  }, []);

  useEffect(() => {
    if ((!open && !now) || playlists !== null) return;
    let cancelled = false;
    fetch("/api/music")
      .then((res) => res.json())
      .then((data) => { if (!cancelled) setPlaylists(data.playlists ?? []); })
      .catch(() => {
        if (!cancelled) { setPlaylists([]); setLoadError(true); }
      });
    return () => { cancelled = true; };
  }, [open, now, playlists]);

  const totalTracks = playlists?.reduce((n, p) => n + p.tracks.length, 0) ?? 0;

  useEffect(() => {
    if (playlists && queueMode === null && totalTracks > 0) setQueueMode("all");
  }, [playlists, queueMode, totalTracks]);

  const allItems: QueueItem[] = (playlists ?? []).flatMap((pl, pi) =>
    pl.tracks.map((t) => ({ ...t, playlistIdx: pi }))
  );

  const queueItems: QueueItem[] =
    queueMode === "all"
      ? allItems
      : typeof queueMode === "number"
        ? allItems.filter((t) => t.playlistIdx === queueMode)
        : [];

  const nowPlaylistIdx = now && playlists ? playlists.findIndex((p) => p.folder === now.folder) : -1;
  const playItems: QueueItem[] = !now
    ? []
    : now.all
      ? allItems
      : allItems.filter((t) => t.playlistIdx === nowPlaylistIdx);
  const activeTrack = now
    ? playItems.findIndex((t) => t.playlistIdx === nowPlaylistIdx && t.file === now.file)
    : -1;

  const current = activeTrack >= 0 ? playItems[activeTrack] : undefined;
  const currentPlaylist = current ? playlists?.[current.playlistIdx] : undefined;
  const cover = current?.cover ?? currentPlaylist?.cover;
  const quality = current ? trackQuality(current) : null;
  const ambientCover = useCoverTone(cover, ambient);
  const ambientOn = ambient && !!cover && !!ambientCover.src;

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

    useEffect(() => {
    resumeRef.current = posRef.current > 0;
    setProgress(posRef.current);
    if (resumeRef.current && Number.isFinite(current?.duration)) setDuration(current?.duration as number);
  }, [current?.url]);

  const clearTrack = () => {
    posRef.current = 0;
    setNow(null);
    setPlaying(false);
    setDuration(0);
    saveTrack(null);
  };

  const persist = () => {
    if (now) saveTrack({ ...now, pos: posRef.current, at: lastPlayedRef.current });
  };
  const stamp = () => {
    lastPlayedRef.current = Date.now();
    persist();
  };

  const missing = !!now && playlists !== null && !loadError && !current;
  useEffect(() => {
    if (missing) clearTrack();
  }, [missing]);

   useEffect(() => {
    if (!now) return;
    if (playing) {
      stamp();
      const id = setInterval(stamp, 5_000);
      return () => clearInterval(id);
    }
    const id = setTimeout(clearTrack, Math.max(0, lastPlayedRef.current + TRACK_TTL - Date.now()));
    return () => clearTimeout(id);
  }, [now, playing]);

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
      albumTitle: (current?.album ?? currentPlaylist?.folder) ?? null,
      cover: (current?.cover ?? currentPlaylist?.cover) ?? null,
      playing: playing && !!current,
    });
  }, [
    current?.file,
    current?.title,
    current?.artist,
    current?.album,
    current?.cover,
    currentPlaylist?.folder,
    currentPlaylist?.artist,
    currentPlaylist?.cover,
    playing,
  ]);

  useIsoLayoutEffect(() => {
    setSliding(true);
    const t = setTimeout(() => setSliding(false), 340);
    return () => clearTimeout(t);
  }, [listOpen]);

  useIsoLayoutEffect(() => {
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

  const playItem = (item: QueueItem, all: boolean) => {
    const folder = playlists?.[item.playlistIdx]?.folder;
    if (folder === undefined) return;
    if (!now || now.folder !== folder || now.file !== item.file) posRef.current = 0;
    setNow({ folder, file: item.file, all });
    setPlaying(true);
  };

  const goTo = (dir: 1 | -1) => {
    const items = current ? playItems : queueItems;
    const len = items.length;
    if (!len) return;
    const next = !current
      ? dir === 1 ? 0 : len - 1
      : dir === 1 && shuffle
        ? randomIndex(activeTrack, len)
        : (activeTrack + dir + len) % len;
    playItem(items[next], now && current ? now.all : queueMode === "all");
  };

  const handleEnded = () => {
    const len = playItems.length;
    if (!len || !current) return;
    if (repeat === "one") {
      const el = audioRef.current;
      if (el) { el.currentTime = 0; el.play().catch(() => {}); }
      return;
    }
    if (single || (repeat === "off" && !shuffle && activeTrack === len - 1)) {
      clearTrack();
      return;
    }
    goTo(1);
  };

  const handleError = () => {
    if (!current) return;
    setPlaying(false);
    fetch("/api/music", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => setPlaylists(data.playlists ?? []))
      .catch(() => {});
  };

  const togglePlay = () => {
    if (!current) {
      if (queueItems.length) playItem(queueItems[0], queueMode === "all");
      return;
    }
    setPlaying((v) => !v);
  };

  const selectQueue = (mode: QueueMode) => {
    setQueueMode(mode);
    setAlbumMenuOpen(false);
  };

  const playTrackAt = (idx: number) => {
    playItem(queueItems[idx], queueMode === "all");
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
      posRef.current = t;
      persist();
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

  const textOf = useMemo(() => folder(), [playlists]);
  const match = useMemo(() => matcher(query), [query]);
  const listed = queueItems
    .map((track, at) => ({ track, at }))
    .filter(({ track }) => {
      if (!match) return true;
      const pl = playlists?.[track.playlistIdx];
      return match(textOf(track, () => [track.title, track.artist ?? pl?.artist, track.album, pl?.folder, track.file]));
    });

  const openSearch = () => {
    setSearchOpen(true);
    setAlbumMenuOpen(false);
    searchRef.current?.focus();
  };
  const closeSearch = () => {
    setSearchOpen(false);
    setQuery("");
  };
  useEffect(() => {
    if (!listOpen) closeSearch();
  }, [listOpen]);

  const selectionLabel = !playlists || playlists.length === 0
    ? t.none
    : queueMode === "all"
      ? t.allTracks
      : typeof queueMode === "number"
        ? (playlists[queueMode]?.folder ?? t.none)
        : t.none;

  const swipe = usePanelSwipe({
    panelRef,
    enabled: open,
    direction: "left",
    dragProgress,
    setDragProgress,
    onCommit: onClose,
  });

  return (
    <div
      id="music-player"
      ref={panelRef}
      className={`control-panel player-panel${open ? " control-panel--open" : ""}${dragProgress !== null ? " control-panel--dragging" : ""}${switching ? " panel-switching" : ""}`}
      style={dragProgress !== null ? {
        transform: `translateX(calc(${(dragProgress - 1) * 100}% - ${(1 - dragProgress) * 16}px))`,
        opacity: dragProgress,
      } : undefined}
      data-ambient={ambientOn ? ambientCover.tone : undefined}
      role="dialog"
      aria-modal="true"
      aria-label={t.musicPlayerLabel}
      {...swipe}
    >
      <div className="player-bg-clip" aria-hidden="true">
        {ambientOn && (
          <div
            className="player-bg-cover"
            style={{ backgroundImage: `url(${ambientCover.src})` }}
          />
        )}
      </div>

      <div className="panel-head">
        <h2 className="h-with-icon panel-title">
          <Icon name="music" size={18} />
          <span className="panel-title-text">{t.music}</span>
        </h2>
        <div className="panel-head-actions">
          <div className="player-header-volume">
            <button
              type="button"
              className="panel-icon-btn"
              onClick={() => setMuted(!muted)}
              aria-pressed={muted}
              aria-label={muted || volume === 0 ? t.unmute : t.mute}
              data-tip={muted || volume === 0 ? t.unmute : t.mute}
            >
              <Icon name={muted || volume === 0 ? "volumeMute" : "volumeHigh"} size={18} />
            </button>
            <div
              className="player-volume-track"
              style={{ "--vol": Math.round((muted ? 0 : volume) * 100) } as CSSProperties}
            >
              <span className="player-volume-value" aria-hidden="true">
                {Math.round((muted ? 0 : volume) * 100)}%
              </span>
              <input
                type="range"
                className="player-header-volume-slider"
                style={{ "--fill": `${Math.round((muted ? 0 : volume) * 100)}%` } as CSSProperties}
                min={0}
                max={100}
                value={Math.round((muted ? 0 : volume) * 100)}
                onChange={(e) => {
                  const v = Number(e.target.value) / 100;
                  setVolume(v);
                  if (muted && v > 0) setMuted(false);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                aria-label={t.volume}
                aria-valuetext={`${Math.round((muted ? 0 : volume) * 100)}%`}
              />
            </div>
          </div>
          {listOpen ? (
            <button
              type="button"
              className="panel-back-btn"
              onClick={() => setListOpen(false)}
              aria-label={t.back}
            >
              <Icon name="chevronLeft" size={14} />
              {t.back}
            </button>
          ) : (
            <button
              type="button"
              className="panel-icon-btn"
              onClick={() => setListOpen(true)}
              aria-label={t.trackList}
              data-tip={t.trackList}
            >
              <Icon name="list" size={16} />
            </button>
          )}
          <button
            type="button"
            className="panel-icon-btn player-close-btn"
            onClick={onDismiss}
            aria-label={t.close}
            data-tip={t.close}
          >
            <Icon name="close" size={16} />
          </button>
        </div>
      </div>

      <div className={`panel-views${sliding ? " panel-views--sliding" : ""}`} ref={viewsRef}>
        {playlists === null ? (
          <p className="album-empty">{t.loading}</p>
        ) : (
        <>
        <div
          className={`panel-view-slide panel-view-slide--main${listOpen ? " panel-view-slide--behind" : ""}`}
          ref={playerViewRef}
        >
              <div className="player-now-playing">
                {cover ? (
                  <img src={cover} alt="" className="player-cover" />
                ) : (
                  <span className="player-cover player-cover--placeholder" aria-hidden="true">
                    <Icon name="music" size={28} />
                  </span>
                )}
                <Marquee
                  as="p"
                  className={`player-track-title${!current ? " player-track-title--empty" : ""}`}
                >
                  {current ? current.title : t.noTrackPlaying}
                </Marquee>
                {(current?.artist ?? currentPlaylist?.artist) && (
                  <Marquee as="p" className="player-track-subtext">
                    {current?.artist ?? currentPlaylist?.artist}
                  </Marquee>
                )}
                {(current?.album ?? currentPlaylist?.folder) && (
                  <Marquee as="p" className="player-track-subtext player-track-album">
                    {current?.album ?? currentPlaylist?.folder}
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
                <span className="player-quality">
                  {quality && (
                    <>
                      <span className={quality.lossless ? "player-quality-ext--lossless" : undefined}>
                        {quality.ext}
                      </span>
                      {quality.rate && ` • ${quality.rate}`}
                    </>
                  )}
                </span>
                <span>{formatTime(duration)}</span>
              </div>

              <div className="player-controls">
                <button
                  type="button"
                  className={`panel-icon-btn${shuffle ? " panel-icon-btn--active" : ""}`}
                  onClick={() => setShuffle((v) => !v)}
                  aria-pressed={shuffle}
                  aria-label={t.shuffle}
                  data-tip={t.shuffle}
                  data-tip-pos="up"
                >
                  <Icon name="shuffle" size={18} />
                </button>
                <button type="button" className="panel-icon-btn" onClick={() => goTo(-1)} aria-label={t.previousTrack} data-tip={t.previousTrack} data-tip-pos="up">
                  <Icon name="skipBack" size={18} />
                </button>
                <button
                  type="button"
                  className="panel-icon-btn player-play-btn"
                  onClick={togglePlay}
                  aria-label={playing ? t.pause : t.play}
                  data-tip={playing ? t.pause : t.play}
                  data-tip-pos="up"
                >
                  <Icon name={playing ? "pause" : "play"} size={22} />
                </button>
                <button type="button" className="panel-icon-btn" onClick={() => goTo(1)} aria-label={t.nextTrack} data-tip={t.nextTrack} data-tip-pos="up">
                  <Icon name="skipForward" size={18} />
                </button>
                <button
                  type="button"
                  className={`panel-icon-btn${repeat !== "off" ? " panel-icon-btn--active" : ""}`}
                  onClick={cycleRepeat}
                  aria-pressed={repeat !== "off"}
                  aria-label={repeat === "one" ? t.repeatOne : repeat === "all" ? t.repeatAll : t.repeatOff}
                  data-tip={repeat === "one" ? t.repeatOne : repeat === "all" ? t.repeatAll : t.repeatOff}
                  data-tip-pos="up"
                >
                  <Icon name={repeat === "one" ? "repeatOne" : "repeat"} size={18} />
                </button>
              </div>
        </div>

        <div
          className={`panel-view-slide panel-view-slide--theme${listOpen ? " panel-view-slide--front" : ""}`}
          ref={listViewRef}
        >
          <div className={`player-list-head${searchOpen ? " player-list-head--search" : ""}`}>
          <div className="player-album-select" ref={albumSelectRef}>
            <button
              type="button"
              className="player-album-trigger"
              onClick={() => setAlbumMenuOpen((v) => !v)}
              aria-haspopup="listbox"
              aria-expanded={albumMenuOpen}
              aria-label={searchOpen ? `${t.playlists}: ${selectionLabel}` : undefined}
              data-tip={searchOpen ? selectionLabel : undefined}
            >
              <Icon name="list" size={15} className="player-album-icon" />
              <Marquee className="player-album-trigger-text">{selectionLabel}</Marquee>
              <Icon name="chevronDown" size={12} className="player-album-caret" />
            </button>
            {albumMenuOpen && (
              <ul className="player-album-menu" role="listbox">
                {!playlists || playlists.length === 0 ? (
                  <li className="player-album-menu-empty">{t.noAlbums}</li>
                ) : (
                  <>
                    {totalTracks > 0 && (
                      <li>
                        <button
                          type="button"
                          className={`player-album-option${queueMode === "all" ? " player-album-option--active" : ""}`}
                          onClick={() => selectQueue("all")}
                        >
                          <Marquee className="player-album-option-text">{t.allTracks}</Marquee>
                        </button>
                      </li>
                    )}
                    {playlists.map((pl, i) => (
                      <li key={pl.folder}>
                        <button
                          type="button"
                          className={`player-album-option${queueMode === i ? " player-album-option--active" : ""}`}
                          onClick={() => selectQueue(i)}
                        >
                          <Marquee className="player-album-option-text">{pl.folder}</Marquee>
                        </button>
                      </li>
                    ))}
                  </>
                )}
              </ul>
            )}
          </div>
          <div className="player-search">
            <button
              type="button"
              className="player-search-btn"
              onClick={openSearch}
              aria-label={t.search}
              data-tip={searchOpen ? undefined : t.search}
              tabIndex={searchOpen ? -1 : 0}
            >
              <Icon name="search" size={15} />
            </button>
            <input
              ref={searchRef}
              type="text"
              inputMode="search"
              enterKeyHint="search"
              autoComplete="off"
              spellCheck={false}
              className="player-search-input"
              value={query}
              placeholder={t.searchTracks}
              aria-label={t.search}
              tabIndex={searchOpen ? 0 : -1}
              onChange={(e) => setQuery(e.target.value)}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
                if (e.key === "Escape") { e.stopPropagation(); closeSearch(); }
              }}
            />
            {searchOpen && (
              <button
                type="button"
                className="player-search-close"
                onClick={closeSearch}
                aria-label={t.closeSearch}
              >
                <Icon name="close" size={12} />
              </button>
            )}
          </div>
          </div>

          {listed.length === 0 ? (
            <p className="album-empty">
              {loadError ? t.loadError : match ? t.noMatches : t.noTracks}
            </p>
          ) : (
            <ul className="player-track-list">
              {listed.map(({ track, at: i }) => {
                const isCurrent = !!current && track.playlistIdx === current.playlistIdx && track.file === current.file;
                return (
                <li key={`${track.playlistIdx}-${track.file}`}>
                  <button
                    type="button"
                    className={`player-track${isCurrent ? " player-track--active" : ""}`}
                    onClick={() => playTrackAt(i)}
                  >
                    <Icon name={isCurrent && playing ? "pause" : "play"} size={13} />
                    <Marquee className="player-track-name">{track.title}</Marquee>
                    {Number.isFinite(track.duration) && (
                      <span className="player-track-duration">{formatTime(track.duration as number)}</span>
                    )}
                  </button>
                </li>
                );
              })}
            </ul>
          )}
        </div>
        </>
        )}
      </div>

      <p className="panel-swipe-hint">{t.swipeForControls}</p>

      {current && !listOpen && (
        <button
          type="button"
          className={`panel-icon-btn player-single-btn${single ? " panel-icon-btn--active" : ""}`}
          onClick={() => setSingle((v) => !v)}
          aria-pressed={single}
          aria-label={single ? t.singleOn : t.singleOff}
          data-tip={single ? t.singleOn : t.singleOff}
          data-tip-pos="up"
        >
          <Icon name="playOnce" size={16} />
        </button>
      )}

      {current && !listOpen && (
        <button
          type="button"
          className={`panel-icon-btn player-ambient-btn${ambient ? " panel-icon-btn--active" : ""}`}
          onClick={() => setAmbient(!ambient)}
          aria-pressed={ambient}
          aria-label={ambient ? t.ambientOn : t.ambientOff}
          data-tip={ambient ? t.ambientOn : t.ambientOff}
          data-tip-pos="up"
        >
          <Icon name="ambient" size={16} />
        </button>
      )}

      <audio
        ref={audioRef}
        src={current?.url}
        preload="none"
        onTimeUpdate={(e) => {
          if (resumeRef.current) return;
          posRef.current = e.currentTarget.currentTime;
          setProgress(posRef.current);
        }}
        onLoadedMetadata={(e) => {
          const el = e.currentTarget;
          setDuration(el.duration);
          if (!resumeRef.current) return;
          resumeRef.current = false;
          if (posRef.current < el.duration - 1) el.currentTime = posRef.current;
          else posRef.current = 0;
        }}
        onPause={stamp}
        onEnded={handleEnded}
        onError={handleError}
      />
    </div>
  );
}
