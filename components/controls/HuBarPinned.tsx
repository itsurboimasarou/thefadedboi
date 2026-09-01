import { createSetting } from "@/lib/setting";

const pinned = createSetting<boolean>({
  key: "hubar-pinned",
  event: "hubar-pinned-change",
  fallback: true,
  parse: (raw) => raw !== "0",
  serialize: (on) => (on ? "1" : "0"),
});

export const pinnedOn = pinned.get;
export const setPinned = pinned.set;
export const usePinned = pinned.use;

export default function AutoHideToggle() {
  const isPinned = usePinned();
  const on = !isPinned;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label="Auto-hide"
      className="theme-switch lite-switch"
      onClick={() => setPinned(!isPinned)}
    >
      <span className="knob" aria-hidden="true" />
    </button>
  );
}
