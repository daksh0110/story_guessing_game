import clsx from "clsx";
import type { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement>;

export default function Card({ className, ...divProps }: CardProps) {
  return (
    <div
      className={clsx(
        "rounded-3xl border-2 border-ink/10 bg-white p-5 shadow-sm sm:p-6",
        className,
      )}
      {...divProps}
    />
  );
}
