import type { StatusConfig } from "./types";

export const home = {
  eyebrow: "В них больше нет любви...",
  status: {
    override: null,
    timezone: "Europe/Berlin",
    schedule: [
      { state: "busy",    from: 9,  to: 12 },
      { state: "away",    from: 15, to: 19 },
      { state: "online",  from: 8,  to: 23 },
      { state: "offline", from: 23, to: 9 },
    ],

    labels: { online: "Online", away: "Away", busy: "Busy", offline: "Offline" },
  } satisfies StatusConfig as StatusConfig,
};
