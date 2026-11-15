import { useId } from 'react';

export interface SliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  label: string;
  onChange: (v: number) => void;
  format?: (v: number) => string;
  disabled?: boolean;
}

/** `<input type="range">` nativo con etiqueta y valor visible. */
export function Slider({
  value,
  min,
  max,
  step = 1,
  label,
  onChange,
  format,
  disabled,
}: SliderProps) {
  const id = useId();
  return (
    <div className="py-2">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="font-bold">
          {label}
        </label>
        <output htmlFor={id} className="font-mono text-[0.875rem] text-ink-dim tabular">
          {format ? format(value) : value}
        </output>
      </div>
      <input
        id={id}
        type="range"
        className="ix-range mt-2 h-11"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        aria-valuetext={format ? format(value) : undefined}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}
