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

export interface GalleryAlbum {
  folder: string;
}

export interface Manifest {
  version: number;
  photos: GalleryAlbum[];
  videos: GalleryAlbum[];
}

export type ScannedGalleryAlbum = GalleryAlbum & {
  name: string;
  year?: number;
  images: GalleryImage[];
};

export type ScannedVideoAlbum = GalleryAlbum & {
  name: string;
  year?: number;
  videos: GalleryVideo[];
};

export type GalleryImage =
  | string
  | {
      full: string;
      thumb?: string;
      name?: string;
      device?: string;
      album?: string;
      month?: string;
      ratio?: number;
      heavy?: boolean;
    };

export interface VideoInfo {
  container?: string;
  bytes?: number;
  width?: number;
  height?: number;
  duration?: number;
  frameRate?: number;
  bitrate?: number;
  videoCodec?: string;
  bitDepth?: number;
  hdr?: string;
  audioCodec?: string;
  recordedAt?: string;
}

export interface GalleryVideo {
  src: string;
  name: string;
  brief?: string;
  info?: VideoInfo;
}

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
  lossless?: boolean;
  duration?: number;
  hasCover?: boolean;
}

export interface Playlist {
  artist?: string;
  folder: string;
  cover?: string;
  tracks: TrackMeta[];
}

export interface MusicManifest {
  version: number;
  playlists: Playlist[];
}

export interface Track extends Omit<TrackMeta, "title" | "hasCover"> {
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
  year?: string;
}
export interface DeviceSection {
  categoryName: Localized<string>;
  category: string;
  layout?: "collection";
  description?: Localized<string>;
  items: DeviceItem[];
}

export interface WithChildren { children?: ReactNode }
