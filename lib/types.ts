import type { ReactNode } from "react";
import type { Localized } from "./i18n";

export interface Fact { label: string; value: string }

export type StatusState = "online" | "away" | "busy" | "offline";
export interface StatusWindow { state: StatusState; from: number; to: number }
export interface StatusConfig {
  override: StatusState | null;
  timezone: string;
  schedule: StatusWindow[];
  labels: Record<StatusState, string>;
}

export interface LinkItem { label: string; value: string; href: string }
export interface Project {
  title: string;
  description: string;
  tags: string[];
  href?: string;
  visibility: "public" | "private";
}
export interface JourneyStop { period: string; role: string; org: string; note: string }
export interface Like { label: string; text: string }

export interface SubAlbum {
  slug: string;
  title: string;
  year?: number
  folder: string;
  driveUrl?: string;
}

export interface Album {
  slug: string;
  title: string;
  year?: number;
  folder: string;
  cover?: string;
  driveUrl?: string;
  subAlbums?: SubAlbum[];
}

export interface Subject {
  slug: string;
  title: string;
  description?: string;
  icon?: string;
  folder?: string;
  albums: Album[];
}

export type ScannedSubject = Subject & { images?: GalleryImage[] };

export interface Manifest {
  version: number;
  subjects: Subject[];
}

export type ScannedSubAlbum = SubAlbum & { images: GalleryImage[] };
export type ScannedAlbum = Album & { count: number };
export type ScannedIndexSubject = Omit<Subject, "albums"> & {
  images?: GalleryImage[];
  albums: ScannedAlbum[];
};

export type GalleryImage = string | { full: string; thumb?: string };

export type AudioFormat = "MP3" | "FLAC" | "OGG" | "WAV" | "M4A";

export interface TrackMeta {
  file: string;
  title?: string;
  artist?: string;
  album?: string;
  cover?: string;
  format?: AudioFormat;
  bitrate?: number;
  bitDepth?: number;
  sampleRate?: number;
  duration?: number;
}

export interface Playlist {
  slug: string;
  title: string;
  artist?: string;
  folder: string;
  cover?: string;
  tracks: TrackMeta[];
}

export interface MusicManifest {
  version: number;
  playlists: Playlist[];
}

export interface Track extends Omit<TrackMeta, "title"> {
  title: string;
  url: string;
}

export type ScannedPlaylist = Omit<Playlist, "tracks" | "cover"> & {
  cover?: string;
  tracks: Track[];
};

export interface Spec { label: Localized<string>; value: string }
export interface DeviceItem {
  name: string;
  tag?: string;
  image?: string;
  specs?: Spec[];
  detail?: Localized<string>;
  icon?: string;
}
export interface DeviceSection { categoryName: Localized<string>; category: string; items: DeviceItem[] }

export interface WithChildren { children?: ReactNode }
