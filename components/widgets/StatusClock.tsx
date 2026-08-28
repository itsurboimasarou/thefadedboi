import { useEffect, useState } from "react";
import { useLiveStatus, StatusDot } from "./LiveStatus";
import type { StatusConfig } from "@/lib/types";

export default function StatusClock({
  config,
  onClick,
}: {
  config: StatusConfig;
  onClick?: () => void;
}) {
  const state = useLiveStatus(config);
  const [hover, setHover] = useState(false);
  const [time, setTime] = useState("--:--:--");
  const [hh, mm, ss] = time.split(":");

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Berlin",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    let id: ReturnType<typeof setInterval> | null = null;
    const tick = () => setTime(fmt.format(new Date()));

    const start = () => {
      if (id !== null) return;
      tick();
      id = setInterval(tick, 1000);
    };
    const stop = () => {
      if (id === null) return;
      clearInterval(id);
      id = null;
    };
    const onVisibility = () => (document.hidden ? stop() : start());

    start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <button
      type="button"
      className={`status-clock status-clock--${state}`}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      title={onClick ? "Open music player" : undefined}
      aria-label={onClick ? `${config.labels[state]} — open music player` : config.labels[state]}
    >
      <StatusDot state={state} />
      <span
        className={`status-clock-label${hover ? " status-clock-label--on" : ""}`}
        aria-hidden="true"
      >
        {config.labels[state]}
      </span>
      <span className="status-clock-time" suppressHydrationWarning>
        <span className="status-clock-hh">{hh}</span>
        <span className="status-clock-sep">:</span>
        <span className="status-clock-mm">{mm}</span>
        <span className="status-clock-sep">:</span>
        <span className="status-clock-ss">{ss}</span>
      </span>
    </button>
  );
}
