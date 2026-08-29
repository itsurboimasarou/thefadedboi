import { useEffect, useState } from "react";

export interface NowPlaying {
  title: string | null;
  artist: string | null;
  albumTitle: string | null;
  cover: string | null;
  playing: boolean;
}

export interface MusicPlayback {
  nowPlaying: NowPlaying;
  volume: number;
  muted: boolean;
}

const EVT = "music-playback-change";
const VOLUME_KEY = "music-volume";
const MUTED_KEY = "music-muted";

const emptyNowPlaying: NowPlaying = {
  title: null,
  artist: null,
  albumTitle: null,
  cover: null,
  playing: false,
};

let state: MusicPlayback = { nowPlaying: emptyNowPlaying, volume: 1, muted: false };

function readVolume(): number {
  try {
    const raw = localStorage.getItem(VOLUME_KEY);
    if (raw === null) return 1;
    const n = Number(raw);
    return Number.isFinite(n) && n >= 0 && n <= 1 ? n : 1;
  } catch {
    return 1;
  }
}

function readMuted(): boolean {
  try {
    return localStorage.getItem(MUTED_KEY) === "1";
  } catch {
    return false;
  }
}

function emit() {
  window.dispatchEvent(new CustomEvent<MusicPlayback>(EVT, { detail: state }));
}

export function initMusicPrefs() {
  state = { ...state, volume: readVolume(), muted: readMuted() };
  emit();
}

export function setNowPlaying(nowPlaying: NowPlaying) {
  state = { ...state, nowPlaying };
  emit();
}

export function setVolume(v: number) {
  const volume = Math.min(1, Math.max(0, v));
  state = { ...state, volume, muted: volume > 0 ? false : state.muted };
  try {
    localStorage.setItem(VOLUME_KEY, String(volume));
  } catch {}
  emit();
}

export function setMuted(muted: boolean) {
  state = { ...state, muted };
  try {
    localStorage.setItem(MUTED_KEY, muted ? "1" : "0");
  } catch {}
  emit();
}

export function useMusicPlayback(): MusicPlayback {
  const [snap, setSnap] = useState<MusicPlayback>(state);
  useEffect(() => {
    setSnap(state);
    const h = (e: Event) => setSnap((e as CustomEvent<MusicPlayback>).detail);
    window.addEventListener(EVT, h);
    return () => window.removeEventListener(EVT, h);
  }, []);
  return snap;
}
