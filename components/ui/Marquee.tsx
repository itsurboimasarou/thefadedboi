import type { ElementType, ReactNode } from "react";
import { onMarqueeEnter, onMarqueeLeave, onMarqueeTouchStart } from "@/lib/marquee";

interface MarqueeProps {
  as?: ElementType;
  className?: string;
  children: ReactNode;
}

export default function Marquee({ as: Tag = "span", className = "", children }: MarqueeProps) {
  return (
    <Tag
      className={`marquee${className ? ` ${className}` : ""}`}
      onMouseEnter={onMarqueeEnter}
      onMouseLeave={onMarqueeLeave}
      onTouchStart={onMarqueeTouchStart}
    >
      <span className="marquee-track">{children}</span>
    </Tag>
  );
}
