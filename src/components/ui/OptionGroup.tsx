import clsx from "clsx";
import { useId } from "react";

type OptionGroupProps<T extends string | number> = {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  formatOption?: (option: T) => string;
};

/** Pill-style single choice, for settings such as difficulty and team. */
export default function OptionGroup<T extends string | number>({
  label,
  options,
  value,
  onChange,
  formatOption = (option: T) => String(option),
}: OptionGroupProps<T>) {
  const labelId = useId();

  return (
    <div role="radiogroup" aria-labelledby={labelId} className="space-y-2">
      <p id={labelId} className="text-sm font-semibold">
        {label}
      </p>

      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = option === value;

          return (
            <button
              key={String(option)}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(option)}
              className={clsx(
                "rounded-xl border-2 px-4 py-2 font-semibold transition",
                active
                  ? "border-ink bg-ink text-white"
                  : "border-ink/15 bg-white hover:border-ink/40",
              )}
            >
              {formatOption(option)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
