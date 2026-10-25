import { getStroke } from "perfect-freehand";
import type { Stroke } from "@/types/drawing";

/** Brush sizes are chosen in px for a canvas this wide, then normalized. */
export const BRUSH_REFERENCE_WIDTH = 1000;

/** SVG coordinate space used by previews. Matches a 4:3 canvas. */
export const VIEWBOX_WIDTH = 1000;
export const VIEWBOX_HEIGHT = 750;

export const PAPER_COLOR = "#ffffff";

/**
 * Builds an SVG path for one stroke. `scale` converts normalized coordinates
 * into the target space (canvas bitmap width, or the SVG viewBox width).
 */
export function strokeToSvgPath(stroke: Stroke, scale: number): string {
  const outline = getStroke(
    stroke.points.map(([x, y, pressure]) => [x * scale, y * scale, pressure]),
    { size: stroke.size * scale },
  );

  if (outline.length === 0) {
    return "";
  }

  const [first, ...rest] = outline;
  const segments = rest.map(([x, y]) => `L${x.toFixed(2)} ${y.toFixed(2)}`);

  return [`M${first[0].toFixed(2)} ${first[1].toFixed(2)}`, ...segments, "Z"].join(" ");
}
