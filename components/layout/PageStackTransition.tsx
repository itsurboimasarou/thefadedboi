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
import { stackDirection, stackNeighbour } from "@/lib/configs/nav.config";
import useEdgeSwipeNav, { type StackDir } from "@/lib/functions/useEdgeSwipeNav";
import { primeBgVideo } from "./VideoBackground";

type Phase = "idle" | "cover" | "reveal";

const COVER_MS = 300;
const REVEAL_MS = 380;
const SETTLE_MS = 240;

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

function veilOffset(dir: StackDir, progress: number): number {
  return dir === "up" ? (1 - progress) * 100 : (progress - 1) * 100;
}

export default function PageStackTransition({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");
  const [dir, setDir] = useState<StackDir>("up");
  const [drag, setDrag] = useState<{ dir: StackDir; progress: number; settle: boolean } | null>(null);
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
      primeBgVideo(href);
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

  const target = useCallback(
    (d: StackDir) => stackNeighbour(router.pathname, d === "up" ? 1 : -1),
    [router.pathname]
  );

  useEdgeSwipeNav({
    canGo: (d) => !awaitingLoad.current && !!target(d),
    onDrag: (d, progress) => {
      if (motionDisabled()) return;
      setDrag({ dir: d, progress, settle: false });
    },
    onEnd: (d, _progress, commit) => {
      const href = target(d);
      if (!commit || !href) {
        setDrag((cur) => (cur ? { ...cur, progress: 0, settle: true } : null));
        timers.current.push(setTimeout(() => setDrag(null), SETTLE_MS));
        return;
      }
      primeBgVideo(href);
      if (motionDisabled()) {
        router.push(href);
        return;
      }
      clearTimers();
      setDir(d);
      setDrag({ dir: d, progress: 1, settle: true });
      awaitingLoad.current = true;
      timers.current.push(setTimeout(() => router.push(href), SETTLE_MS));
    },
  });

  useEffect(() => {
    const onComplete = () => {
      if (!awaitingLoad.current) return;
      awaitingLoad.current = false;
      setDrag(null);
      setPhase("reveal");
      timers.current.push(setTimeout(() => setPhase("idle"), REVEAL_MS));
    };
    const onError = () => {
      awaitingLoad.current = false;
      clearTimers();
      setDrag(null);
      setPhase("idle");
    };

    router.events.on("routeChangeComplete", onComplete);
    router.events.on("routeChangeError", onError);
    return () => {
      router.events.off("routeChangeComplete", onComplete);
      router.events.off("routeChangeError", onError);
    };
  }, [router.events]);

  const visible = phase !== "idle" || drag !== null;

  return (
    <NavigateCtx.Provider value={navigate}>
      {children}
      {visible && (
        <div
          className="stack-veil"
          data-phase={drag ? "drag" : phase}
          data-dir={drag ? drag.dir : dir}
          data-settle={drag?.settle ? "" : undefined}
          style={drag ? { "--stack-at": `${veilOffset(drag.dir, drag.progress)}%` } as React.CSSProperties : undefined}
          aria-hidden="true"
        />
      )}
    </NavigateCtx.Provider>
  );
}
