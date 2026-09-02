import { useEffect, useState } from "react";

type Placement = { center: number; size: number; vertical: boolean; jump: boolean };

export default function useHuBarIndicator(
  groupRef: React.RefObject<HTMLElement>,
  pathname: string,
  vertical: boolean
) {
  const [placement, setPlacement] = useState<Placement | null>(null);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    const sync = () => {
      const active = group.querySelector<HTMLElement>('.hubar-item[aria-current="page"]');
      if (!active) return setPlacement(null);
      const size = vertical ? active.offsetHeight : active.offsetWidth;
      const center = (vertical ? active.offsetTop : active.offsetLeft) + size / 2;
      setPlacement((prev) => {
        const jump = prev === null || prev.vertical !== vertical;
        if (prev && !jump && prev.center === center && prev.size === size) return prev;
        return { center, size, vertical, jump };
      });
    };

    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(group);
    return () => ro.disconnect();
  }, [groupRef, pathname, vertical]);

  return placement;
}
