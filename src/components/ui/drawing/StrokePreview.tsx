import clsx from "clsx";
import type { Stroke } from "@/types/drawing";
import {
  PAPER_COLOR,
  VIEWBOX_HEIGHT,
  VIEWBOX_WIDTH,
  strokeToSvgPath,
} from "@/utils/strokes";

type StrokePreviewProps = {
  strokes: Stroke[];
  label?: string;
  className?: string;
};

/**
 * Read-only SVG view of a drawing. It scales to fit any container, so it
 * works in grids, lightboxes, and phone layouts without re-rendering a canvas.
 */
export default function StrokePreview({ strokes, label = "Drawing", className }: StrokePreviewProps) {
  return (
    <svg
      viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={label}
      className={clsx("block h-full w-full", className)}
      style={{ backgroundColor: PAPER_COLOR }}
    >
      {strokes.map((stroke, index) => (
        <path
          key={index}
          d={strokeToSvgPath(stroke, VIEWBOX_WIDTH)}
          fill={stroke.tool === "eraser" ? PAPER_COLOR : stroke.color}
        />
      ))}
    </svg>
  );
}
