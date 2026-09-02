import Icon from "../ui/Icons";
import useHideOnScrollDown from "@/lib/functions/useHideOnScrollDown";
import { useLocalized, type Localized } from "@/lib/i18n";

export type GalleryMode = "still" | "motion";

const ui: Localized<{ label: string; still: string; motion: string }> = {
  en: { label: "Gallery view", still: "Still", motion: "Motion" },
  vi: { label: "Chế độ xem", still: "Tĩnh", motion: "Động" },
};

export default function GalleryModeSwitch({
  mode,
  onChange,
}: {
  mode: GalleryMode;
  onChange: (mode: GalleryMode) => void;
}) {
  const t = useLocalized(ui);
  const hidden = useHideOnScrollDown() && mode === "still";
  const sides: { key: GalleryMode; icon: string; label: string }[] = [
    { key: "still", icon: "image", label: t.still },
    { key: "motion", icon: "film", label: t.motion },
  ];

  return (
    <div
      className={`mode-switch${hidden ? " mode-switch--hidden" : ""}`}
      role="radiogroup"
      aria-label={t.label}
    >
      <span className="mode-switch-knob" data-side={mode} aria-hidden="true" />
      {sides.map((s) => (
        <button
          key={s.key}
          type="button"
          role="radio"
          aria-checked={mode === s.key}
          className={`mode-switch-side${mode === s.key ? " mode-switch-side--on" : ""}`}
          onClick={() => onChange(s.key)}
        >
          <Icon name={s.icon} size={20} />
          <span className="mode-switch-label">{s.label}</span>
        </button>
      ))}
    </div>
  );
}
