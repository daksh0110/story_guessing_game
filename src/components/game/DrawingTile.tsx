import type { Stroke } from "@/types/drawing";
import StrokePreview from "@/components/ui/drawing/StrokePreview";
import clsx from "clsx";

type DrawingTileProps = {
  name: string;
  strokes?: Stroke[];
  caption?: string;
  badge?: string;
  placeholder: string;
  onOpen?: () => void;
};

/** One artist's drawing in a grid. Pass `onOpen` to make it clickable. */
export default function DrawingTile({
  name,
  strokes,
  caption,
  badge,
  placeholder,
  onOpen,
}: DrawingTileProps) {
  const content = (
    <>
      <span
        className={clsx(
          "block",
          "aspect-4/3",
          "w-full",
          "overflow-hidden",
          "bg-white",
        )}
      >
        {strokes ? (
          <StrokePreview strokes={strokes} label={`${name}'s drawing`} />
        ) : (
          <span
            className={clsx(
              "flex",
              "h-full",
              "items-center",
              "justify-center",
              "bg-paper",
              "p-4",
              "text-center",
              "text-sm",
              "text-muted",
            )}
          >
            {placeholder}
          </span>
        )}
      </span>

      <span className={clsx("block", "space-y-1", "p-4")}>
        <span
          className={clsx("flex", "items-center", "justify-between", "gap-2")}
        >
          <span className={clsx("truncate", "font-semibold")}>{name}</span>
          {badge && (
            <span
              className={clsx(
                "shrink-0",
                "rounded-full",
                "bg-teal/15",
                "px-2",
                "py-0.5",
                "text-xs",
                "font-semibold",
                "text-teal-dark",
              )}
            >
              {badge}
            </span>
          )}
        </span>

        {caption && (
          <span className={clsx("block", "text-sm", "text-muted")}>
            {caption}
          </span>
        )}
      </span>
    </>
  );

  return (
    <article
      className={clsx(
        "overflow-hidden",
        "rounded-2xl",
        "border-2",
        "border-ink/10",
        "bg-white",
      )}
    >
      {onOpen ? (
        <button
          type="button"
          onClick={onOpen}
          className={clsx(
            "block",
            "w-full",
            "text-left",
            "transition",
            "hover:bg-paper",
            "focus-visible:outline-3",
            "focus-visible:outline-teal",
          )}
        >
          {content}
        </button>
      ) : (
        content
      )}
    </article>
  );
}
