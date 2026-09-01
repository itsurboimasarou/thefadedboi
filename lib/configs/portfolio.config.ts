import type { Project, JourneyStop } from "../types";
import type { Localized } from "../i18n";

export interface PortfolioContent {
  projects: Project[];
  journey: JourneyStop[];
}

const en: PortfolioContent = {
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
      role: "Cameraman (Photophone)",
      org: "Lotus Esports Club (in belongs to Hoa Sen University)",
      note: "Responsible for capturing high-quality photos and videos of club esport or dedicated events, including tournaments and promotional content.",
    },
    {
      period: "2025 — 2026",
      role: "Content Writer (for Mr. Binh Bear)",
      org: "GEARVN",
      note: "Writing content scripts for the GEARVN YouTube channel (short videos), including product reviews, tutorials, and tech news.",
    },
    {
      period: "2024 — 2025 (and now)",
      role: "Co-founder & Community Administrator",
      org: "Seven Star Rising (SSR)",
      note: "Co-founded and currently manage the Seven Star Rising (SSR) community, focusing on gaming discussions, events, and collaborations.",
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

const vi: PortfolioContent = {
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
      role: "Cameraman (Photophone)",
      org: "Lotus Esports Club (thuộc Đại học Hoa Sen)",
      note: "Chịu trách nhiềm về phần chụp ảnh & quay video chất lượng cao cho các sự kiện riêng và esport của câu lạc bộ, bao gồm giải đấu hay nội dung quảng bá.",
    },
    {
      period: "2025 — 2026",
      role: "Content Writer (for Mr. Bình Bear)",
      org: "GEARVN",
      note: "Chịu trách nhiệm & hỗ trợ viết kịch bản cho kênh YouTube của GEARVN (các video ngắn), bao gồm đánh gái sản phẩm, thủ thuật & tin tức công nghệ.",
    },
    {
      period: "2024 — 2025 (và hiện tại)",
      role: "Co-founder & Community Administrator",
      org: "Seven Star Rising (SSR)",
      note: "Đồng sáng lập và quản lý cộng đồng SSR, hướng về nội dung thảo luận gaming, sự kiện & hợp tác",
    },
    {
      period: "2022 — 2024",
      role: "Device Maintainer",
      org: "PixelOS",
      note: "Build và trụ trì PixelOS cho Redmi K40S (munch).",
    },
    {
      period: "2022",
      role: "Collaborator (Quản lý cộng đồng)",
      org: "ROG Phone Clan VN (thuộc cộng đồng ASUS ROG, một phần của ASUSTek Computer Inc. tại Vietnam)",
      note: "Quản lý cộng đồng ROG Clan (của tựa game Genshin Impact), bao gồm tổ chức sự kiện, quản lý mạng xã hội & hỗ trợ các thành viên.",
    },
  ] as JourneyStop[],
};

export const portfolio: Localized<PortfolioContent> = { en, vi };
