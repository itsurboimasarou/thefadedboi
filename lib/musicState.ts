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
  ambient: boolean;
}

const EVT = "music-playback-change";
const VOLUME_KEY = "music-volume";
const MUTED_KEY = "music-muted";
const AMBIENT_KEY = "music-ambient";
const TRACK_KEY = "music-track";

export const TRACK_TTL = 24 * 60 * 60 * 1000;

export interface SavedTrack {
  folder: string;
  file: string;
  all: boolean;
  pos: number;
  at: number;
}

const emptyNowPlaying: NowPlaying = {
  title: null,
  artist: null,
  albumTitle: null,
  cover: null,
  playing: false,
};

let state: MusicPlayback = { nowPlaying: emptyNowPlaying, volume: 1, muted: false, ambient: true };

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

function readAmbient(): boolean {
  try {
    return localStorage.getItem(AMBIENT_KEY) !== "0";
  } catch {
    return true;
  }
}

function emit() {
  window.dispatchEvent(new CustomEvent<MusicPlayback>(EVT, { detail: state }));
}

export function initMusicPrefs() {
  state = { ...state, volume: readVolume(), muted: readMuted(), ambient: readAmbient() };
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

export function setAmbient(ambient: boolean) {
  state = { ...state, ambient };
  try {
    localStorage.setItem(AMBIENT_KEY, ambient ? "1" : "0");
  } catch {}
  emit();
}

export function readSavedTrack(): SavedTrack | null {
  try {
    const raw = localStorage.getItem(TRACK_KEY);
    if (raw === null) return null;
    const t = JSON.parse(raw) as Partial<SavedTrack> | null;
    if (
      !t ||
      typeof t.folder !== "string" ||
      typeof t.file !== "string" ||
      typeof t.at !== "number" ||
      Date.now() - t.at >= TRACK_TTL
    ) {
      localStorage.removeItem(TRACK_KEY);
      return null;
    }
    const pos = typeof t.pos === "number" && t.pos > 0 ? t.pos : 0;
    return { folder: t.folder, file: t.file, all: !!t.all, pos, at: t.at };
  } catch {
    return null;
  }
}

export function saveTrack(track: SavedTrack | null) {
  try {
    if (!track) localStorage.removeItem(TRACK_KEY);
    else localStorage.setItem(TRACK_KEY, JSON.stringify(track));
  } catch {}
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
