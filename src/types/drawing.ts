// x and y are normalized to the canvas width (x = px / width), so a drawing
// looks the same at any size. `size` is normalized the same way.
export type Point = [number, number, number];

export type Tool = "pen" | "eraser";

export type Stroke = {
  /** Unique per stroke. Undo and redo events refer to strokes by this id. */
  id: string;
  points: Point[];
  color: string;
  size: number;
  tool: Tool;
};
