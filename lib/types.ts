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
export interface EventAlbum {
  name: string;
  year: number;
  folder: string;
  googlePhotosUrl: string;
}

interface SectionBase { title: string; description?: string }

export interface SimpleSection extends SectionBase {
  kind: "simple";
  folder: string;
  googlePhotosUrl: string;
}
export interface EventsSection extends SectionBase {
  kind: "events";
  googlePhotosUrl?: string;
  events: EventAlbum[];
}
export interface BannerSection extends SectionBase {
  kind: "banner";
  folder: string;
  bannerText: string;
  ctaLabel: string;
  ctaHref: string;
}
export type GallerySection = SimpleSection | EventsSection | BannerSection;

export type ScannedSimple = SimpleSection & { images: string[] };
export type ScannedBanner = BannerSection & { images: string[] };
export type ScannedEvents = EventsSection & {
  images: string[];
  eventImages: Record<string, string[]>;
};
export type ScannedSection = ScannedSimple | ScannedBanner | ScannedEvents;
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
