import clsx from "clsx";

type IconProps = {
  src: string;
  alt?: string;
  className?: string;
};

/** Renders an SVG from `src/assets/svgs`. Pass `alt` only when the icon carries meaning. */
export default function Icon({ src, alt, className }: IconProps) {
  return (
    <img
      src={src}
      alt={alt ?? ""}
      aria-hidden={alt ? undefined : true}
      className={clsx("h-5 w-5 shrink-0", className)}
    />
  );
}
