import type { Project, JourneyStop } from "./types";

export const portfolio = {
  projects: [
    {
      title: "Seven Star Rising (SSR)",
      description: "A community of HoYoverse games in Vietnam",
      tags: ["Community"],
      visibility: "public",
      href: "https://www.facebook.com/7starsrising",
    },
    {
      title: "masarouBlog",
      description: "A personal blog (on Notion) where I type anything I want to say",
      tags: ["Blog"],
      visibility: "private",
      href: "/",
    },
    {
      title: "Coming Soon...",
      description: "TBD",
      tags: [],
      visibility: "none",
      href: "#",
    },
  ] as Project[],
  journey: [
    {
      period: "2026 - now",
      role: "Cameraman (Photophoner)",
      org: "Lotus Esports Club (in belongs to Hoa Sen University)",
      note: "Responsible for capturing high-quality photos and videos of esports events, including tournaments and promotional content.",
    },
    {
      period: "2025 — 2026",
      role: "Content Writer (for Mr. Binh Bear)",
      org: "GEARVN",
      note: "Writing content scripts for the GEARVN YouTube channel, including product reviews, tutorials, and tech news.",
    },
    {
      period: "2024 — 2025 (and now)",
      role: "Co-founder & Community Administrator",
      org: "Seven Star Rising (SSR)",
      note: "Co-founded and currently manage the Seven Star Rising (SSR) community, focusing on gaming and technology discussions, events, and collaborations.",
    },
    {
      period: "2022 — 2024",
      role: "Device Maintainer",
      org: "PixelOS",
      note: "Build and maintain PixelOS for Redmi K40S (munch).",
    },
    {
      period: "2022",
      role: "Collaborator (Community Mananger)",
      org: "ROG Phone Clan VN (in belongs to ASUS ROG community, a behalf of ASUSTek Computer Inc. at Vietnam)",
      note: "Managing the ROG Phone Clan VN community (for Genshin Impact), including organizing events, managing social media, and providing support to members.",
    },
  ] as JourneyStop[],
};
