import clsx from "clsx";
import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  block?: boolean;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-coral text-white hover:bg-coral-dark",
  secondary: "bg-teal text-white hover:bg-teal-dark",
  ghost: "border-2 border-ink/15 bg-white text-ink hover:border-ink/40",
  danger: "border-2 border-coral/40 bg-white text-coral-dark hover:bg-coral/10",
};

export default function Button({
  variant = "primary",
  block = false,
  className,
  type = "button",
  ...buttonProps
}: ButtonProps) {
  return (
    <button
      type={type}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-base font-semibold transition",
        "active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal",
        variantClasses[variant],
        block && "w-full",
        className,
      )}
      {...buttonProps}
    />
  );
}
