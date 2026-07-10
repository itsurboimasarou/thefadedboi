import type { ReactNode } from "react";

export interface Fact { label: string; value: string }

/* ── Status (scheduled) ── */
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
export interface Album {
  title: string;
  description?: string;
  googlePhotosUrl: string;
  folder: string;
}
/** Album with build-time scanned image paths (what pages receive as props). */
export interface AlbumWithImages extends Album { images: string[] }
/** AlbumGrid accepts plain paths or full/thumb pairs. */
export type GalleryImage = string | { full: string; thumb?: string };

export interface Spec { label: string; value: string }
export interface DeviceItem {
  name: string;
  tag?: string;
  image?: string;
  specs?: Spec[];
  detail?: string;
  icon?: string;
}
export interface DeviceSection { categoryName: string; category: string; items: DeviceItem[] }

export interface WithChildren { children?: ReactNode }
