import { useEffect, useState } from "react";
import type { StatusConfig, StatusState } from "@/lib/types";

const hourIn = (tz: string): number =>
  parseInt(new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", hourCycle: "h23" })
    .format(new Date()), 10);

const resolve = (cfg: StatusConfig): StatusState => {
  if (cfg.override) return cfg.override;
  const hr = hourIn(cfg.timezone);
  const hit = cfg.schedule.find(({ from, to }) =>
    from < to ? hr >= from && hr < to : hr >= from || hr < to
  );
  return hit?.state ?? "offline";
};

export function useLiveStatus(cfg: StatusConfig): StatusState {
  const [state, setState] = useState<StatusState>(() => resolve(cfg));
  useEffect(() => {
    const tick = () => setState(resolve(cfg));
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [cfg]);
  return state;
}

export const StatusDot = ({ state }: { state: StatusState }) => (
  <span className={`status-dot status-dot--${state}`} aria-hidden="true" />
);

export const StatusPill = ({
  state,
  labels,
  onClick,
}: {
  state: StatusState;
  labels: Record<StatusState, string>;
  onClick?: () => void;
}) => {
  const inner = (
    <>
      <StatusDot state={state} />
      {labels[state]}
    </>
  );

  // Only becomes interactive when a handler is supplied, so the same
  // component still works as a plain indicator elsewhere.
  return onClick ? (
    <button
      type="button"
      className={`status-pill status-pill--${state} status-pill--action`}
      onClick={onClick}
      title="View changelog"
    >
      {inner}
    </button>
  ) : (
    <span className={`status-pill status-pill--${state}`}>{inner}</span>
  );
};