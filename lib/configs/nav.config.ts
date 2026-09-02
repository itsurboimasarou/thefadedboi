import type { Localized } from "../i18n";

export interface NavItem {
  href: string;
  label: Localized<string>;
  icon: string;
}

export const navItems: NavItem[] = [
  { href: "/", label: { en: "Home", vi: "Trang chủ" }, icon: "home" },
  { href: "/about", label: { en: "Details", vi: "Chi tiết" }, icon: "user" },
  { href: "/contacts", label: { en: "Contacts", vi: "Liên hệ" }, icon: "contacts" },
  { href: "/portfolio", label: { en: "Portfolio", vi: "Portfolio" }, icon: "portfolio" },
  { href: "/gallery", label: { en: "Gallery", vi: "Thư viện" }, icon: "image" },
  {
    href: "/devices",
    label: { en: "Devices & Equipment", vi: "Thiết bị & Dụng cụ" },
    icon: "devices",
  },
];

export const navOrder: string[] = navItems.map((i) => i.href);

export function stackDirection(from: string, to: string): "up" | "down" {
  const a = navOrder.indexOf(from);
  const b = navOrder.indexOf(to);
  if (a === -1 || b === -1 || a === b) return "up";
  return b > a ? "up" : "down";
}
