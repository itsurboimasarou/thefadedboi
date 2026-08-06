import type { ReactNode } from "react";

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
  cover?: string;
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

export interface SubjectBanner {
  text: string;
  ctaLabel: string;
  ctaHref: string;
}

export interface Subject {
  slug: string;
  title: string;
  description?: string;
  icon?: string;
  folder?: string;
  banner?: SubjectBanner;
  albums: Album[];
}

export type ScannedSubject = Subject & { images?: string[] };

export interface Manifest {
  version: number;
  subjects: Subject[];
}

export type ScannedSubAlbum = SubAlbum & { images: string[] };

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
