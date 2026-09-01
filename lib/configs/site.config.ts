import type { Localized } from "../i18n";

export interface SiteContent {
  tagline: string;
}

export const siteName = "masarou.";
export const siteHandle = "thefadedboi";
export const siteFooter = "Copyright © 2026 by masarou/thefadedboi - v6.0-甘雨";
export const siteGithub = "https://github.com/itsurboimasarou/thefadedboi/";

const en: SiteContent = {
  tagline: "I do random things, feel free to reach out to me if you want a collab to anything (not for any kind of NSFW contents).",
};

const vi: SiteContent = {
  tagline: "Mình làm tùm lum thứ, nếu bạn muốn hợp tác bất cứ thứ gì cứ liên hệ mình thoải mái (đừng là các nội dung NSFW).",
};

export const site: Localized<SiteContent> = { en, vi };

