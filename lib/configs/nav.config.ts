export interface NavItem {
  href: string;
  label: string;
  icon: string;
}

/**
 * Order matters twice over: it's the order the HuBar renders, and it's the
 * "stack" order the page transition reads to decide which way to sweep.
 * Navigating further down this list stacks up; back towards the top stacks
 * down. Kept in one place so the two can't drift apart.
 */
export const navItems: NavItem[] = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/about", label: "Details", icon: "user" },
  { href: "/contacts", label: "Contacts", icon: "contacts" },
  { href: "/portfolio", label: "Portfolio", icon: "portfolio" },
  { href: "/gallery", label: "Gallery", icon: "image" },
  { href: "/devices", label: "Devices & Equipment", icon: "devices" },
];

export const navOrder: string[] = navItems.map((i) => i.href);

/**
 * "up" when the target sits later in the nav order, "down" when earlier.
 * Anything off the list (or the same page) has no meaningful direction, so
 * it falls back to "up".
 */
export function stackDirection(from: string, to: string): "up" | "down" {
  const a = navOrder.indexOf(from);
  const b = navOrder.indexOf(to);
  if (a === -1 || b === -1 || a === b) return "up";
  return b > a ? "up" : "down";
}
