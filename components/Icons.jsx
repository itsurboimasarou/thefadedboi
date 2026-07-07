const p = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

const icons = {
  // frickin sections
  phone: <svg {...p}><rect x="7" y="2.5" width="10" height="19" rx="2.5" /><path d="M10.5 18.5h3" /></svg>,
  laptop: <svg {...p}><rect x="4" y="4.5" width="16" height="11" rx="2" /><path d="M2.5 19.5h19" /></svg>,
  gear: <svg {...p}><circle cx="12" cy="12" r="3.2" /><path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M18.5 5.5l-1.7 1.7M7.2 16.8l-1.7 1.7" /></svg>,
  camera: <svg {...p}><path d="M3 8.5a2 2 0 0 1 2-2h2l1.5-2h7L17 6.5h2a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" /><circle cx="12" cy="13" r="3.4" /></svg>,
  user: <svg {...p}><circle cx="12" cy="8" r="3.6" /><path d="M4.5 20.5c1.4-3.6 4.1-5.4 7.5-5.4s6.1 1.8 7.5 5.4" /></svg>,
  spark: <svg {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6.5 6.5l2 2M15.5 15.5l2 2M17.5 6.5l-2 2M8.5 15.5l-2 2" /></svg>,
  pen: <svg {...p}><path d="m4 20 1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19l-4 1Z" /><path d="m14.5 6.5 3 3" /></svg>,
  info: <svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 7.8v.2" /></svg>,
  mail: <svg {...p}><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m4 7 8 6 8-6" /></svg>,
  share: <svg {...p}><circle cx="6" cy="12" r="2.4" /><circle cx="17.5" cy="5.5" r="2.4" /><circle cx="17.5" cy="18.5" r="2.4" /><path d="m8.2 10.8 7-4M8.2 13.2l7 4" /></svg>,
  briefcase: <svg {...p}><rect x="3" y="7" width="18" height="13" rx="3" /><path d="M8.5 7V5.5A1.5 1.5 0 0 1 10 4h4a1.5 1.5 0 0 1 1.5 1.5V7" /><path d="M3 12.5h18" /></svg>,
  route: <svg {...p}><circle cx="6" cy="18" r="2.4" /><circle cx="18" cy="6" r="2.4" /><path d="M8.4 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.6" /></svg>,
  image: <svg {...p}><rect x="3" y="4" width="18" height="16" rx="3" /><circle cx="9" cy="10" r="1.8" /><path d="m5 19 5.2-5.2a1.5 1.5 0 0 1 2.1 0L19 20" /></svg>,
  blog: <svg {...p}><path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H16l4 4v10.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5Z" /><path d="M16 4v4h4M8 12h8M8 15.5h5" /></svg>,
  clock: <svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></svg>,
  // frickin specs
  display: <svg {...p}><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" /></svg>,
  chip: <svg {...p}><rect x="7" y="7" width="10" height="10" rx="2" /><path d="M9.5 2.5v3M14.5 2.5v3M9.5 18.5v3M14.5 18.5v3M2.5 9.5h3M2.5 14.5h3M18.5 9.5h3M18.5 14.5h3" /></svg>,
  memory: <svg {...p}><rect x="3" y="7" width="18" height="10" rx="2" /><path d="M7 17v3M12 17v3M17 17v3M7 10.5v3M12 10.5v3M17 10.5v3" /></svg>,
  battery: <svg {...p}><rect x="2.5" y="8" width="17" height="8" rx="2" /><path d="M21.5 10.5v3" /><path d="M6 10.5v3M9.5 10.5v3" /></svg>,
  os: <svg {...p}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="2.2" /><path d="M12 3a9 9 0 0 1 9 9" /></svg>,
  weight: <svg {...p}><path d="M6 8h12l2 12H4L6 8Z" /><circle cx="12" cy="5.5" r="2.2" /></svg>,
  storage: <svg {...p}><ellipse cx="12" cy="5.5" rx="8" ry="2.8" /><path d="M4 5.5v13c0 1.55 3.58 2.8 8 2.8s8-1.25 8-2.8v-13" /><path d="M4 12c0 1.55 3.58 2.8 8 2.8s8-1.25 8-2.8" /></svg>,
  tag: <svg {...p}><path d="M4 4h7l9 9-7 7-9-9V4Z" /><circle cx="8.5" cy="8.5" r="1.2" /></svg>,
  keyboard: <svg {...p}><rect x="2.5" y="6" width="19" height="12" rx="2" /><path d="M6 9.5h.01M9.5 9.5h.01M13 9.5h.01M16.5 9.5h.01M6 12.5h.01M9.5 12.5h.01M13 12.5h.01M16.5 12.5h.01M7.5 15.5h9" /></svg>,
  mouse: <svg {...p}><rect x="7" y="3" width="10" height="18" rx="5" /><path d="M12 6.5v3.5" /></svg>,
  headphones: <svg {...p}><path d="M4 14v-2a8 8 0 0 1 16 0v2" /><rect x="3" y="14" width="4.5" height="6.5" rx="2" /><rect x="16.5" y="14" width="4.5" height="6.5" rx="2" /></svg>,
  microphone: <svg {...p}><rect x="9" y="2.5" width="6" height="11" rx="3" /><path d="M5.5 11a6.5 6.5 0 0 0 13 0" /><path d="M12 17.5v3M9 20.5h6" /></svg>,
  heart: <svg {...p}><path d="M12 20.5s-7.5-4.7-9.2-9.4C1.6 7.7 4 4.8 7 4.8c2 0 3.6 1.1 5 3 1.4-1.9 3-3 5-3 3 0 5.4 2.9 4.2 6.3-1.7 4.7-9.2 9.4-9.2 9.4Z" /></svg>,
  cake: <svg {...p}><path d="M4 13a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v7H4v-7Z" /><path d="M4 16c1.3 1 2.7 1 4 0s2.7-1 4 0 2.7 1 4 0 2.7-1 4 0" /><path d="M12 11V8.5" /><path d="M12 6.5c-.9 0-1.5-.7-1.5-1.5S12 2.5 12 2.5s1.5 1.7 1.5 2.5-.6 1.5-1.5 1.5Z" /></svg>,
  target: <svg {...p}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5.2" /><circle cx="12" cy="12" r="1.6" /></svg>,
  pin: <svg {...p}><path d="M12 21.5s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11Z" /><circle cx="12" cy="10.5" r="2.6" /></svg>,
  dot: <svg {...p}><circle cx="12" cy="12" r="3.5" /></svg>,
};

const specMap = [
  ["display", "display"], ["screen", "display"],
  ["chip", "chip"], ["cpu", "chip"], ["processor", "chip"],
  ["memory", "memory"], ["ram", "memory"],
  ["camera", "camera"],
  ["battery", "battery"],
  ["os", "os"], ["software", "os"],
  ["weight", "weight"],
  ["storage", "storage"],
  ["model", "tag"],
];

export function specIconFor(label) {
  const l = label.toLowerCase();
  const hit = specMap.find(([k]) => l.includes(k));
  return hit ? hit[1] : "dot";
}

export default function Icon({ name, size = 20, className = "" }) {
  const svg = icons[name] ?? icons.dot;
  return (
    <span className={`icn ${className}`} style={{ width: size, height: size }}>
      {svg}
    </span>
  );
}
