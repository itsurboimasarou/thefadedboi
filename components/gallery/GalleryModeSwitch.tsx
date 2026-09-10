import Icon from "../ui/Icons";
import useHideOnScrollDown from "@/lib/functions/useHideOnScrollDown";
import { useLocalized } from "@/lib/i18n";
import { galleryModeUi as ui } from "@/lib/ui-strings";

export type GalleryMode = "still" | "motion";

export default function GalleryModeSwitch({
  mode,
  onChange,
}: {
  mode: GalleryMode;
  onChange: (mode: GalleryMode) => void;
}) {
  const t = useLocalized(ui);
  const hidden = useHideOnScrollDown();
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
