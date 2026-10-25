import clsx from "clsx";
import { useId, type InputHTMLAttributes } from "react";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string | null;
};

export default function TextField({
  label,
  hint,
  error,
  id,
  className,
  ...inputProps
}: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="block text-sm font-semibold">
        {label}
      </label>

      <input
        id={inputId}
        aria-invalid={Boolean(error)}
        className={clsx(
          "w-full rounded-2xl border-2 bg-white px-4 py-3 text-lg outline-none transition focus:border-teal",
          error ? "border-coral" : "border-ink/15",
          className,
        )}
        {...inputProps}
      />

      {error ? (
        <p role="alert" className="text-sm font-medium text-coral-dark">
          {error}
        </p>
      ) : hint ? (
        <p className="text-sm text-muted">{hint}</p>
      ) : null}
    </div>
  );
}
