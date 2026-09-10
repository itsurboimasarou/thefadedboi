import { accentSets } from "@/lib/configs/accents.config";
import { useAccentSet, setAccentSetKey } from "./AccentSwitch";
import SetSelect from "./SetSelect";

const options = accentSets.map((s) => ({ key: s.key, label: s.label }));

export default function AccentSetSwitch() {
  const set = useAccentSet();
  return (
    <SetSelect
      value={set.key}
      options={options}
      onPick={setAccentSetKey}
      label="Theme set"
    />
  );
}
