import type { StatusConfig, StatusState } from "../types";
import type { Localized } from "../i18n";

export interface HomeContent {
  statusLabels: Record<StatusState, string>;
}

export const homeEyebrow = "Designer, developer & photophone";

const en: HomeContent = {
  statusLabels: { online: "Online", away: "Away", busy: "Busy", offline: "Offline" },
};

const vi: HomeContent = {
  statusLabels: { online: "Trực tuyến", away: "Vắng mặt", busy: "Bận", offline: "Ngoại tuyến" },
};

export const home: Localized<HomeContent> = { en, vi };

export const homeStatus: Omit<StatusConfig, "labels"> = {
  override: null,
  timezone: "Asia/Ho_Chi_Minh",
  schedule: [
    { state: "busy",    from: 9,  to: 12 },
    { state: "away",    from: 15, to: 19 },
    { state: "online",  from: 8,  to: 23 },
    { state: "offline", from: 23, to: 9 },
  ],
} satisfies Omit<StatusConfig, "labels"> as Omit<StatusConfig, "labels">;
