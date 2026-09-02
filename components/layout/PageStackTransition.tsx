import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/router";
import { stackDirection } from "@/lib/configs/nav.config";

type Direction = "up" | "down";
type Phase = "idle" | "cover" | "reveal";

const COVER_MS = 300;
const REVEAL_MS = 380;

const NavigateCtx = createContext<(href: string) => void>(() => {});

export function useStackNavigate(): (href: string) => void {
  return useContext(NavigateCtx);
}

function motionDisabled(): boolean {
  return (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    document.documentElement.classList.contains("lite-mode")
  );
}

export default function PageStackTransition({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");
  const [dir, setDir] = useState<Direction>("up");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const awaitingLoad = useRef(false);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => () => clearTimers(), []);

  const navigate = useCallback(
    (href: string) => {
      if (href === router.pathname || awaitingLoad.current) return;
      if (motionDisabled()) {
        router.push(href);
        return;
      }

      clearTimers();
      setDir(stackDirection(router.pathname, href));
      setPhase("cover");
      awaitingLoad.current = true;

      timers.current.push(
        setTimeout(() => {
          router.push(href);
        }, COVER_MS)
      );
    },
    [router]
  );

  useEffect(() => {
    const onComplete = () => {
      if (!awaitingLoad.current) return;
      awaitingLoad.current = false;
      setPhase("reveal");
      timers.current.push(setTimeout(() => setPhase("idle"), REVEAL_MS));
    };
    const onError = () => {
      awaitingLoad.current = false;
      clearTimers();
      setPhase("idle");
    };

    router.events.on("routeChangeComplete", onComplete);
    router.events.on("routeChangeError", onError);
    return () => {
      router.events.off("routeChangeComplete", onComplete);
      router.events.off("routeChangeError", onError);
    };
  }, [router.events]);

  return (
    <NavigateCtx.Provider value={navigate}>
      {children}
      {phase !== "idle" && (
        <div className="stack-veil" data-phase={phase} data-dir={dir} aria-hidden="true" />
      )}
    </NavigateCtx.Provider>
  );
}
