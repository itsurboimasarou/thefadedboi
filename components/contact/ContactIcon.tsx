import type React from "react";
const p = { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", "aria-hidden": true };

export const contactIcons: Record<string, JSX.Element> = {
  GitHub: (
    <svg {...p} fill="currentColor">
      <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.95 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.56 9.56 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.85-2.34 4.7-4.57 4.94.36.31.68.92.68 1.85v2.75c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />
    </svg>
  ),
  LinkedIn: (
    <svg {...p} fill="currentColor">
      <path d="M4.98 3.5a2.49 2.49 0 1 1 0 4.98 2.49 2.49 0 0 1 0-4.98ZM3 9.25h4v11.5H3zM9.5 9.25h3.83v1.57h.06c.53-1 1.84-2.06 3.79-2.06 4.05 0 4.8 2.66 4.8 6.12v6.87h-4v-6.09c0-1.45-.03-3.32-2.02-3.32-2.03 0-2.34 1.58-2.34 3.21v6.2h-4z" />
    </svg>
  ),
  Facebook: (
    <svg {...p} fill="currentColor">
      <path d="M13.5 21v-7.5h2.52l.38-2.93H13.5V8.7c0-.85.24-1.43 1.45-1.43h1.55V4.65c-.27-.04-1.19-.12-2.26-.12-2.24 0-3.77 1.37-3.77 3.88v2.16H8v2.93h2.47V21Z" />
    </svg>
  ),
  YouTube: (
    <svg {...p} fill="currentColor">
      <path d="M21.6 7.2a2.5 2.5 0 0 0-1.76-1.77C18.28 5 12 5 12 5s-6.28 0-7.84.43A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.76 1.77C5.72 19 12 19 12 19s6.28 0 7.84-.43a2.5 2.5 0 0 0 1.76-1.77A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15.2V8.8l5.2 3.2Z" />
    </svg>
  ),
  Instagram: (
    <svg {...p} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="3.8" />
      <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  ),
  Telegram: (
    <svg {...p} fill="currentColor">
      <path d="M21.9 4.6 18.9 19c-.22 1-.83 1.25-1.68.78l-4.65-3.43-2.24 2.16c-.25.25-.46.46-.94.46l.33-4.73L18.35 6.5c.37-.33-.08-.52-.58-.19L7.13 13.02l-4.58-1.43c-1-.31-1.02-1 .21-1.48L20.6 3.3c.83-.3 1.55.2 1.3 1.3Z" />
    </svg>
  ),
  TikTok: (
    <svg {...p} fill="currentColor">
      <path d="M16.7 3c.35 1.86 1.5 3.13 3.3 3.42v2.9c-1.24.03-2.36-.32-3.53-1.08v5.62c0 4.16-3.05 6.06-5.83 5.9a5.36 5.36 0 0 1-5.14-5.4c.02-3.36 2.87-5.6 5.87-5.28v3.03c-.24-.05-.48-.09-.73-.09a2.42 2.42 0 1 0 2.44 2.5V3Z" />
    </svg>
  ),
  bilibili: (
    <svg {...p} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="7" width="18" height="13" rx="3.5" />
      <path d="m7.5 3 3 3.5M16.5 3l-3 3.5" />
      <path d="M8.5 12.5v2.5M15.5 12.5v2.5" />
    </svg>
  ),
  Email: (
    <svg {...p} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="3" /><path d="m4 7 8 6 8-6" />
    </svg>
  ),
};

const brandColors: Record<string, string> = {
  GitHub: "var(--ink)",
  LinkedIn: "#0a66c2",
  Facebook: "#1877f2",
  YouTube: "#ff0000",
  Instagram: "#e4405f",
  Telegram: "#26a5e4",
  TikTok: "#fe2c55",
  bilibili: "#fb7299",
};

export function ContactIcon({ name }: { name: string }) {
  const brand = brandColors[name];
  return (
    <span className="contact-icon" style={brand ? ({ "--brand": brand } as React.CSSProperties) : undefined}>
      {contactIcons[name] ?? contactIcons.Email}
    </span>
  );
}
