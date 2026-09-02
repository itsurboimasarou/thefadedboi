import { toggleControlPanel } from "./ControlPanel";
import { siteName } from "@/lib/configs/site.config";
import { useLocalized, type Localized } from "@/lib/i18n";

const ui: Localized<{ open: string; close: string }> = {
  en: { open: "At a glance", close: "Close controls" },
  vi: { open: "Tổng quan", close: "Đóng bảng điều khiển" },
};

export default function HuBarTrigger({ open }: { open: boolean }) {
  const t = useLocalized(ui);
  const label = open ? t.close : t.open;

  return (
    <button
      type="button"
      className={`hubar-trigger${open ? " hubar-trigger--open" : ""}`}
      onClick={toggleControlPanel}
      aria-expanded={open}
      aria-controls="control-panel"
      aria-label={label}
    >
      <span className="logo-mark" role="img" aria-label={siteName} />
      <span className="tip">{label}</span>
    </button>
  );
}
