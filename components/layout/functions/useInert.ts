import { useEffect, type RefObject } from "react";

export function useInert(ref: RefObject<HTMLElement | null>, active: boolean): void {
  useEffect(() => {
    const el = ref.current;
    if (el) el.inert = active;
  }, [ref, active]);
}
