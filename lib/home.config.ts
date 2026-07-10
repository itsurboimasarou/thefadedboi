import type { StatusConfig } from "./types";

export const home = {
  eyebrow: "Greetings! How was the moon today?",
  quickShorts:
    "A lowkey guy made a lowkey place for anything you want to know about me, from my photoworks, cosplays, to my side projects. I do random things, even reviews",
  status: {
    override: null,
    timezone: "Europe/Berlin",
    schedule: [
      { state: "online", from: 8, to: 23 },
      { state: "away", from: 15, to: 18 },
      { state: "busy", from: 9, to: 12 },
      { state: "offline", from: 23, to: 9 },
    ],
    labels: { online: "Online", away: "Away", busy: "Busy", offline: "Offline" },
  } satisfies StatusConfig as StatusConfig,
  blog: {
    title: "I also write",
    description: "Longer thoughts on life — over on my blog (coming soon).",
    url: "#",
  },
};
