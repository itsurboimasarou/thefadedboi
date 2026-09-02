import Link from "next/link";
import type { ComponentProps } from "react";
import { useStackNavigate } from "./PageStackTransition";

type StackLinkProps = Omit<ComponentProps<typeof Link>, "href"> & { href: string };

export default function StackLink({ href, onClick, ...rest }: StackLinkProps) {
  const navigate = useStackNavigate();

  return (
    <Link
      href={href}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented) return;
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        navigate(href);
      }}
      {...rest}
    />
  );
}
