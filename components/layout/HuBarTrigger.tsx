import { toggleControlPanel } from "./ControlPanel";
import { siteName } from "@/lib/configs/site.config";

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
      <span className="logo-mark" role="img" aria-label={siteName} />
    </button>
  );
}
