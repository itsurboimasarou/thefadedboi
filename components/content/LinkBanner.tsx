import Link from "next/link";
import Icon from "../ui/Icons";

interface LinkBannerProps {
  text: string;
  ctaLabel: string;
  ctaHref: string;
  variant?: "tint" | "solid";
  icon?: string;
}

export default function LinkBanner({ text, ctaLabel, ctaHref, variant = "tint", icon }: LinkBannerProps) {
  return (
    <div className={`link-banner${variant === "solid" ? " link-banner--solid" : ""}`}>
      {icon && <Icon name={icon} size={28} className="link-banner-icon" />}
      <p>{text}</p>
      <Link href={ctaHref} className="btn">{ctaLabel}</Link>
    </div>
  );
}