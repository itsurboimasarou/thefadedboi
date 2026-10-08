const p = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

const icons: Record<string, JSX.Element> = {
  // frickin sections
  phone: <svg {...p}><rect x="7" y="2.5" width="10" height="19" rx="2.5" /><path d="M10.5 18.5h3" /></svg>,
  laptop: <svg {...p}><rect x="4" y="4.5" width="16" height="11" rx="2" /><path d="M2.5 19.5h19" /></svg>,
  gear: <svg {...p}><circle cx="12" cy="12" r="3.2" /><path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M18.5 5.5l-1.7 1.7M7.2 16.8l-1.7 1.7" /></svg>,
  camera: <svg {...p} viewBox="0 0.25 24 24"><path d="M3 8.5a2 2 0 0 1 2-2h2l1.5-2h7L17 6.5h2a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" /><circle cx="12" cy="13" r="3.4" /></svg>,
  user: <svg {...p} viewBox="0 0.45 24 24"><circle cx="12" cy="8" r="3.6" /><path d="M4.5 20.5c1.4-3.6 4.1-5.4 7.5-5.4s6.1 1.8 7.5 5.4" /></svg>,
  spark: <svg {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6.5 6.5l2 2M15.5 15.5l2 2M17.5 6.5l-2 2M8.5 15.5l-2 2" /></svg>,
  pen: <svg {...p}><path d="m4 20 1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19l-4 1Z" /><path d="m14.5 6.5 3 3" /></svg>,
  info: <svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 7.8v.2" /></svg>,
  infoFilled: <svg {...p} fill="currentColor" stroke="none"><path fillRule="evenodd" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 4.4a1.3 1.3 0 1 1 0 2.6 1.3 1.3 0 0 1 0-2.6Zm-1.1 5.2a1.1 1.1 0 0 1 2.2 0v5a1.1 1.1 0 0 1-2.2 0Z" /></svg>,
  mail: <svg {...p}><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m4 7 8 6 8-6" /></svg>,
  share: <svg {...p} viewBox="-0.25 0 24 24"><circle cx="6" cy="12" r="2.4" /><circle cx="17.5" cy="5.5" r="2.4" /><circle cx="17.5" cy="18.5" r="2.4" /><path d="m8.2 10.8 7-4M8.2 13.2l7 4" /></svg>,
  briefcase: <svg {...p}><rect x="3" y="7" width="18" height="13" rx="3" /><path d="M8.5 7V5.5A1.5 1.5 0 0 1 10 4h4a1.5 1.5 0 0 1 1.5 1.5V7" /><path d="M3 12.5h18" /></svg>,
  route: <svg {...p}><circle cx="6" cy="18" r="2.4" /><circle cx="18" cy="6" r="2.4" /><path d="M8.4 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.6" /></svg>,
  image: <svg {...p}><rect x="3" y="4" width="18" height="16" rx="3" /><circle cx="9" cy="10" r="1.8" /><path d="m5 19 5.2-5.2a1.5 1.5 0 0 1 2.1 0L19 20" /></svg>,
  blog: <svg {...p}><path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H16l4 4v10.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5Z" /><path d="M16 4v4h4M8 12h8M8 15.5h5" /></svg>,
  trophy: <svg {...p}><path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" /><path d="M7 6H4.5a2.5 2.5 0 0 0 2.5 4M17 6h2.5a2.5 2.5 0 0 1-2.5 4" /><path d="M12 14v3M8.5 20h7M9.5 20l.6-3h3.8l.6 3" /></svg>,
  download: <svg {...p}><path d="M12 3v12M7.5 10.5 12 15l4.5-4.5" /><path d="M4 17.5v1.5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1.5" /></svg>,
  // frickin specs
  display: <svg {...p}><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" /></svg>,
  chip: <svg {...p}><rect x="7" y="7" width="10" height="10" rx="2" /><path d="M9.5 2.5v3M14.5 2.5v3M9.5 18.5v3M14.5 18.5v3M2.5 9.5h3M2.5 14.5h3M18.5 9.5h3M18.5 14.5h3" /></svg>,
  memory: <svg {...p} viewBox="0 1.5 24 24"><rect x="3" y="7" width="18" height="10" rx="2" /><path d="M7 17v3M12 17v3M17 17v3M7 10.5v3M12 10.5v3M17 10.5v3" /></svg>,
  gpu: <svg {...p} viewBox="0 1.5 24 24"><rect x="2.5" y="7" width="17" height="10" rx="2" /><path d="M4.5 17v3M2.5 10h-0.01" /><circle cx="10" cy="12" r="2.8" /><path d="M15.5 9.5h2M15.5 12h2M21.5 9v6" /></svg>,
  battery: <svg {...p}><rect x="2.5" y="8" width="17" height="8" rx="2" /><path d="M21.5 10.5v3" /><path d="M6 10.5v3M9.5 10.5v3" /></svg>,
  os: <svg {...p}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="2.2" /><path d="M12 3a9 9 0 0 1 9 9" /></svg>,
  weight: <svg {...p} viewBox="0 -0.35 24 24"><path d="M6 8h12l2 12H4L6 8Z" /><circle cx="12" cy="5.5" r="2.2" /></svg>,
  storage: <svg {...p}><ellipse cx="12" cy="5.5" rx="8" ry="2.8" /><path d="M4 5.5v13c0 1.55 3.58 2.8 8 2.8s8-1.25 8-2.8v-13" /><path d="M4 12c0 1.55 3.58 2.8 8 2.8s8-1.25 8-2.8" /></svg>,
  tag: <svg {...p}><path d="M4 4h7l9 9-7 7-9-9V4Z" /><circle cx="8.5" cy="8.5" r="1.2" /></svg>,
  keyboard: <svg {...p}><rect x="2.5" y="6" width="19" height="12" rx="2" /><path d="M6.75 9h.01M10.25 9h.01M13.75 9h.01M17.25 9h.01M6.75 12h.01M10.25 12h.01M13.75 12h.01M17.25 12h.01M7.5 15h9" /></svg>,
  mouse: <svg {...p}><rect x="7" y="3" width="10" height="18" rx="5" /><path d="M12 6.5v3.5" /></svg>,
  headphones: <svg {...p} viewBox="0 0.25 24 24"><path d="M4 14v-2a8 8 0 0 1 16 0v2" /><rect x="3" y="14" width="4.5" height="6.5" rx="2" /><rect x="16.5" y="14" width="4.5" height="6.5" rx="2" /></svg>,
  microphone: <svg {...p} viewBox="0 -0.5 24 24"><rect x="9" y="2.5" width="6" height="11" rx="3" /><path d="M5.5 11a6.5 6.5 0 0 0 13 0" /><path d="M12 17.5v3M9 20.5h6" /></svg>,
  heart: <svg {...p} viewBox="0 0.65 24 24"><path d="M12 20.5s-7.5-4.7-9.2-9.4C1.6 7.7 4 4.8 7 4.8c2 0 3.6 1.1 5 3 1.4-1.9 3-3 5-3 3 0 5.4 2.9 4.2 6.3-1.7 4.7-9.2 9.4-9.2 9.4Z" /></svg>,
  cake: <svg {...p} viewBox="0 -0.75 24 24"><path d="M4 13a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v7H4v-7Z" /><path d="M4 16c1.3 1 2.7 1 4 0s2.7-1 4 0 2.7 1 4 0 2.7-1 4 0" /><path d="M12 11V8.5" /><path d="M12 6.5c-.9 0-1.5-.7-1.5-1.5S12 2.5 12 2.5s1.5 1.7 1.5 2.5-.6 1.5-1.5 1.5Z" /></svg>,
  target: <svg {...p}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5.2" /><circle cx="12" cy="12" r="1.6" /></svg>,
  pin: <svg {...p} viewBox="0 0.5 24 24"><path d="M12 21.5s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11Z" /><circle cx="12" cy="10.5" r="2.6" /></svg>,
  sun: <svg {...p} strokeWidth={2.4}><circle cx="12" cy="12" r="4.6" /><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5 5l1.6 1.6M17.4 17.4 19 19M19 5l-1.6 1.6M6.6 17.4 5 19" /></svg>,
  slash: <svg {...p}><circle cx="12" cy="12" r="9" /><path d="m5.6 5.6 12.8 12.8" /></svg>,
  moon: <svg {...p} viewBox="0.29 -0.29 24 24" strokeWidth={2.4}><path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z" /></svg>,
  dot: <svg {...p}><circle cx="12" cy="12" r="3.5" /></svg>,
  // frickin nav
  home: <svg {...p}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /><path d="M9.5 21v-6h5v6" /></svg>,
  contacts: <svg {...p}><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m4 7 8 6 8-6" /></svg>,
  portfolio: <svg {...p}><rect x="3" y="7" width="18" height="13" rx="3" /><path d="M8.5 7V5.5A1.5 1.5 0 0 1 10 4h4a1.5 1.5 0 0 1 1.5 1.5V7" /><path d="M3 12.5h18" /></svg>,
  devices: <svg {...p}><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8" /><path d="M12 16v4" /></svg>,
  thumbtack: <svg {...p} viewBox="0 0.5 24 24"><path d="M9 4h6l-1 6 3 3v2H7v-2l3-3-1-6Z" /><path d="M12 15v6" /></svg>,
  dockTop: <svg {...p}><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M3 9h18" /><rect x="7" y="5" width="10" height="2" rx="1" fill="currentColor" stroke="none" /></svg>,
  dockBottom: <svg {...p}><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M3 15h18" /><rect x="7" y="17" width="10" height="2" rx="1" fill="currentColor" stroke="none" /></svg>,
  dockLeft: <svg {...p}><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M9 3v18" /><rect x="5" y="7" width="2" height="10" rx="1" fill="currentColor" stroke="none" /></svg>,
  dockRight: <svg {...p}><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M15 3v18" /><rect x="17" y="7" width="2" height="10" rx="1" fill="currentColor" stroke="none" /></svg>,
  star4: <svg {...p}><path d="M12 2c.6 4.2 5.8 9.4 10 10-4.2.6-9.4 5.8-10 10-.6-4.2-5.8-9.4-10-10 4.2-.6 9.4-5.8 10-10Z" /></svg>,
  startrail: <svg {...p}><path d="M16 3c.3 2.1 2.9 4.7 5 5-2.1.3-4.7 2.9-5 5-.3-2.1-2.9-4.7-5-5 2.1-.3 4.7-2.9 5-5Z" /><path d="M10.5 13.5 4 20M7.5 10 3 14.5M14 16.5 9.5 21" /></svg>,
  star4Filled: <svg {...p} fill="currentColor" stroke="none"><path d="M12 2c.6 4.2 5.8 9.4 10 10-4.2.6-9.4 5.8-10 10-.6-4.2-5.8-9.4-10-10 4.2-.6 9.4-5.8 10-10Z" /></svg>,
  themeAuto: <svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 3a9 9 0 0 0 0 18Z" fill="currentColor" stroke="none" /></svg>,
  shapeRounded: <svg {...p}><rect x="2.5" y="7" width="19" height="10" rx="3" /></svg>,
  shapePill: <svg {...p}><rect x="2.5" y="7" width="19" height="10" rx="5" /></svg>,
  gradient: <svg {...p}><rect x="3" y="4" width="18" height="16" rx="3" /><path d="M6 18 18 6M5 13l7-7M12 18l7-7" /></svg>,
  media: <svg {...p}><rect x="3" y="4" width="18" height="16" rx="3" /><path d="M10 9.2v5.6l4.8-2.8Z" /></svg>,
  arrowDownRight: <svg {...p}><path d="M7 7l10 10" /><path d="M17 10.5V17H10.5" /></svg>,
  arrowDownLeft: <svg {...p}><path d="M17 7 7 17" /><path d="M7 10.5V17h6.5" /></svg>,
  paintbrush: <svg {...p} viewBox="0.06 -0.81 24 24"><path d="M17.5 3.5a2.1 2.1 0 0 1 3 3L12 15l-4-1 1-4Z" /><path d="M9.5 15.5c0 2.5-1.8 4-4.5 4-.9 0-1.5-.2-2-.5 1-.6 1-1.4 1-2.3 0-1.9 1.6-3.4 3.5-3.4.9 0 1.7.3 2 .8Z" /></svg>,
  chevronDown: <svg {...p}><path d="m6 9 6 6 6-6" /></svg>,
  chevronLeft: <svg {...p}><path d="m15 6-6 6 6 6" /></svg>,
  chevronRight: <svg {...p}><path d="m9 6 6 6-6 6" /></svg>,
  circleArrow: <svg {...p}><path d="M20 12a8 8 0 1 1-2.34-5.66" /><path d="M20 4.5v5h-5" /></svg>,
  close: <svg {...p}><path d="M6 6l12 12M18 6 6 18" /></svg>,
  layers: <svg {...p}><path d="m12 4.5 9 5-9 5-9-5 9-5Z" /><path d="m3 14.5 9 5 9-5" /></svg>,
  globe: <svg {...p}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.6 2.6 4 5.7 4 9s-1.4 6.4-4 9c-2.6-2.6-4-5.7-4-9s1.4-6.4 4-9Z" /></svg>,
  music: <svg {...p} viewBox="-0.8 0.05 24 24"><path d="M9 18V5.5l10-2v12.5" /><circle cx="6" cy="18" r="2.6" /><circle cx="16" cy="16" r="2.6" /></svg>,
  shrink: <svg {...p}><path d="M3 9h4.5A1.5 1.5 0 0 0 9 7.5V3M21 9h-4.5A1.5 1.5 0 0 1 15 7.5V3M3 15h4.5A1.5 1.5 0 0 1 9 16.5V21M21 15h-4.5a1.5 1.5 0 0 0-1.5 1.5V21" /></svg>,
  expand: <svg {...p}><path d="M9 3H4.5A1.5 1.5 0 0 0 3 4.5V9M15 3h4.5A1.5 1.5 0 0 1 21 4.5V9M9 21H4.5A1.5 1.5 0 0 1 3 19.5V15M15 21h4.5a1.5 1.5 0 0 0 1.5-1.5V15" /></svg>,
  film: <svg {...p}><rect x="2.5" y="5" width="19" height="14" rx="2.5" /><path d="M7.5 5v14M16.5 5v14M2.5 12h19M2.5 8.5h5M2.5 15.5h5M16.5 8.5h5M16.5 15.5h5" /></svg>,
  play: <svg {...p}><path d="M7 4.5v15l13-7.5Z" /></svg>,
  pause: <svg {...p}><rect x="6" y="4.5" width="4" height="15" rx="1" /><rect x="14" y="4.5" width="4" height="15" rx="1" /></svg>,
  skipBack: <svg {...p}><path d="M18 5v14l-11-7Z" /><path d="M6 5v14" /></svg>,
  skipForward: <svg {...p}><path d="M6 5v14l11-7Z" /><path d="M18 5v14" /></svg>,
  list: <svg {...p}><path d="M8 6h13M8 12h13M8 18h13" /><path d="M3 6h.01M3 12h.01M3 18h.01" /></svg>,
  sort: <svg {...p}><path d="M7 4v16M3.5 16.5 7 20l3.5-3.5" /><path d="M17 20V4M13.5 7.5 17 4l3.5 3.5" /></svg>,
  search: <svg {...p}><circle cx="11" cy="11" r="7" /><path d="m16 16 4 4" /></svg>,
  filter: <svg {...p} viewBox="0 0.65 24 24"><path d="M4 5.5h16l-6.2 7.3v5.2l-3.6 1.8v-7L4 5.5Z" /></svg>,
  calendar: <svg {...p} viewBox="0 -0.25 24 24"><rect x="3.5" y="5" width="17" height="15.5" rx="3" /><path d="M3.5 10h17M8 3v4M16 3v4" /></svg>,
  shuffle: <svg {...p} viewBox="0.5 0 24 24"><path d="M16 3h5v5" /><path d="M4 20 21 3" /><path d="M21 16v5h-5" /><path d="m15 15 6 6" /><path d="m4 4 5 5" /></svg>,
  repeat: <svg {...p}><path d="m17 1 4 4-4 4" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><path d="m7 23-4-4 4-4" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></svg>,
  playOnce: <svg {...p}><path d="M4 12h11M11 7l5 5-5 5M20 6v12" /></svg>,
  repeatOne: <svg {...p}><path d="m17 1 4 4-4 4" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><path d="m7 23-4-4 4-4" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /><text x="12" y="16.5" fontSize="12" fontWeight="700" fill="currentColor" stroke="none" textAnchor="middle" style={{ fontFamily: "var(--font-lang), sans-serif" }}>1</text></svg>,
  volumeHigh: <svg {...p} viewBox="0.85 0 24 24"><path d="M4 9v6h4l5 4V5L8 9H4Z" /><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8 8 0 0 1 0 12" /></svg>,
  collection: <svg {...p}><rect x="3" y="4" width="18" height="5" rx="1.5" /><path d="M5 9v9.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V9M10 13h4" /></svg>,
  ambient: <svg {...p}><circle cx="12" cy="12" r="3.4" /><circle cx="12" cy="12" r="8.6" strokeDasharray="1.6 3.8" /></svg>,
  volumeMute: <svg {...p} viewBox="0.5 0 24 24"><path d="M4 9v6h4l5 4V5L8 9H4Z" /><path d="m16 9 5 6M21 9l-5 6" /></svg>,
  shirt: <svg {...p} viewBox="0 0.25 24 24"><path d="m8 4.5-4.4 2.1L2 10.5l3.4 1.2V20h13.2v-8.3l3.4-1.2-1.6-3.9L16 4.5a4 4 0 0 1-8 0Z" /></svg>,
};

const specMap: ReadonlyArray<readonly [string, string]> = [
  ["display", "display"], ["screen", "display"],
  ["chip", "chip"], ["cpu", "chip"], ["processor", "chip"], ["soc", "chip"], ["apu", "chip"],
  ["memory", "memory"], ["ram", "memory"],
  ["camera", "camera"],
  ["battery", "battery"],
  ["gpu", "gpu"], ["graphics", "gpu"], ["video", "gpu"],
  ["os", "os"], ["software", "os"],
  ["weight", "weight"],
  ["storage", "storage"],
  ["model", "tag"],
];

export function specIconFor(label: string): string {
  const l = label.toLowerCase();
  const hit = specMap.find(([k]) => l.includes(k));
  return hit ? hit[1] : "dot";
}

interface IconProps { name: string; size?: number | string; className?: string }
export default function Icon({ name, size = 20, className = "" }: IconProps) {
  const svg = icons[name] ?? icons.dot;
  return (
    <span className={`icn ${className}`} style={{ width: size, height: size }}>
      {svg}
    </span>
  );
}
