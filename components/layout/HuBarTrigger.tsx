import Icon from "../ui/Icons";
import { toggleControlPanel } from "./ControlPanel";
import { siteName } from "@/lib/configs/site.config";
import { useLocalized } from "@/lib/i18n";
import { hubarTriggerUi as ui } from "@/lib/ui-strings";

export default function HuBarTrigger({
  open,
  icon = "logo",
}: {
  open: boolean;
  icon?: "logo" | "chevron";
}) {
  const t = useLocalized(ui);
  const label = open ? t.close : t.open;

  return (
    <button
      type="button"
      className={`hubar-trigger hubar-trigger--${icon}${open ? " hubar-trigger--open" : ""}`}
      onClick={toggleControlPanel}
      aria-expanded={open}
      aria-controls="control-panel"
      aria-label={label}
    >
      {icon === "chevron" ? (
        <Icon name="chevronDown" size={22} />
      ) : (
        <span className="logo-mark" role="img" aria-label={siteName} />
      )}
      <span className="tip">{label}</span>
    </button>
  );
}
