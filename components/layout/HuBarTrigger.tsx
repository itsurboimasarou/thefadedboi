import { toggleControlPanel } from "./ControlPanel";
import { site } from "@/lib/site.config";

export default function HuBarTrigger({ open }: { open: boolean }) {
  return (
    <button
      type="button"
      className={`hubar-trigger${open ? " hubar-trigger--open" : ""}`}
      onClick={toggleControlPanel}
      aria-expanded={open}
      aria-controls="control-panel"
      aria-label={open ? "Close controls" : "At a glance"}
      title="At a glance"
    >
      <span className="logo-mark" role="img" aria-label={site.name} />
      <span className="hubar-trigger-arrow" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m6 15 6-6 6 6" />
        </svg>
      </span>
    </button>
  );
}
