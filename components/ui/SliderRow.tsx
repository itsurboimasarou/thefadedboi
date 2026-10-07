import type { CSSProperties } from "react";

interface SliderRowProps {
  id: string;
  label: string;
  readout: string;
  value: number;
  min: number;
  max: number;
  step: number;
  disabled?: boolean;
  onChange: (v: number) => void;
}

export default function SliderRow({
  id,
  label,
  readout,
  value,
  min,
  max,
  step,
  disabled,
  onChange,
}: SliderRowProps) {
  return (
    <div className="grad-slider">
      <label className="grad-slider-label" htmlFor={id}>
        <span>{label}</span>
        <span className="grad-slider-value">{readout}</span>
      </label>
      <input
        id={id}
        type="range"
        className="grad-slider-input"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        style={{ "--fill": `${max > min ? ((value - min) / (max - min)) * 100 : 0}%` } as CSSProperties}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}
