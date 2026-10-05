import clsx from "clsx";
import { useRef, useState } from "react";
import { getStroke } from "perfect-freehand";
import devConsole from "@/utils/console";

type Point = [number, number, number];

type Tool = "pen" | "eraser";

export type Stroke = {
  points: Point[];
  color: string;
  size: number;
  tool: Tool;
};

type DrawingCanvasProps = {
  showPen?: boolean;
  showEraser?: boolean;
  showColor?: boolean;
  showBrushSize?: boolean;
  showUndo?: boolean;
  showRedo?: boolean;
  showClear?: boolean;
  brushSizes?: number[];
  defaultBrushSize?: number;
  minBrushSize?: number;
  maxBrushSize?: number;
  defaultColor?: string;
  defaultTool?: Tool;
  width?: number;
  height?: number;
  className?: string;
  toolbarClassName?: string;
  onStrokeComplete?: (stroke: Stroke) => void;
  onClear?: () => void;
};

export default function DrawingCanvas({
  showPen = true,
  showEraser = true,
  showColor = true,
  showBrushSize = true,
  showUndo = true,
  showRedo = true,
  showClear = true,
  brushSizes,
  defaultBrushSize = 5,
  minBrushSize = 1,
  maxBrushSize = 50,
  defaultColor = "#000000",
  defaultTool = "pen",
  width = window.innerWidth,
  height = window.innerHeight,
  className,
  toolbarClassName,
  onStrokeComplete,
  onClear,
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [brushSize, setBrushSize] = useState(defaultBrushSize);
  const [color, setColor] = useState(defaultColor);
  const [tool, setTool] = useState<Tool>(defaultTool);

  const currentStrokeRef = useRef<Stroke | null>(null);
  const strokesRef = useRef<Stroke[]>([]);
  const redoStrokesRef = useRef<Stroke[]>([]);

  const getPoint = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const pressure = e.pressure || 0.5;

    devConsole.log("Canvas rect:", rect);
    devConsole.log("Canvas size:", canvas.width, canvas.height);

    return [x, y, pressure];
  };

  const drawStroke = (stroke: Stroke, outlinePoints: number[][]) => {
    const canvas = canvasRef.current;

    if (!canvas || outlinePoints.length === 0) {
      return;
    }

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return;
    }

    ctx.beginPath();

    ctx.moveTo(outlinePoints[0][0], outlinePoints[0][1]);

    for (let i = 1; i < outlinePoints.length; i++) {
      ctx.lineTo(outlinePoints[i][0], outlinePoints[i][1]);
    }

    ctx.closePath();

    if (stroke.tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = stroke.color;
    }

    ctx.fill();

    ctx.globalCompositeOperation = "source-over";
  };

  const drawSingleStroke = (stroke: Stroke) => {
    const outlinePoints = getStroke(stroke.points, {
      size: stroke.size,
    });

    drawStroke(stroke, outlinePoints);
  };

  const redrawCanvas = () => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const stroke of strokesRef.current) {
      drawSingleStroke(stroke);
    }

    if (currentStrokeRef.current) {
      drawSingleStroke(currentStrokeRef.current);
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const point = getPoint(e);

    currentStrokeRef.current = {
      points: [point],
      size: brushSize,
      color,
      tool,
    };

    redoStrokesRef.current = [];

    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!currentStrokeRef.current) {
      return;
    }

    if (e.buttons !== 1) {
      return;
    }

    const point = getPoint(e);

    currentStrokeRef.current.points.push(point);

    redrawCanvas();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const stroke = currentStrokeRef.current;

    if (!stroke) {
      return;
    }

    strokesRef.current.push(stroke);

    currentStrokeRef.current = null;

    onStrokeComplete?.(stroke);

    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }

    redrawCanvas();
  };

  const handlePointerCancel = () => {
    currentStrokeRef.current = null;
    redrawCanvas();
  };

  const undo = () => {
    const stroke = strokesRef.current.pop();

    if (!stroke) {
      return;
    }

    redoStrokesRef.current.push(stroke);

    redrawCanvas();
  };

  const redo = () => {
    const stroke = redoStrokesRef.current.pop();

    if (!stroke) {
      return;
    }

    strokesRef.current.push(stroke);

    redrawCanvas();
  };

  const clearCanvas = () => {
    strokesRef.current = [];
    redoStrokesRef.current = [];
    currentStrokeRef.current = null;

    redrawCanvas();

    onClear?.();
  };

  return (
    <div className={clsx("relative", "h-screen", "w-screen")}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={clsx("touch-none", "border", className)}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      />

      <div
        className={clsx(
          "absolute",
          "left-4",
          "top-4",
          "flex",
          "items-center",
          "gap-3",
          "rounded-lg",
          "bg-white",
          "p-3",
          "shadow",
          toolbarClassName,
        )}
      >
        {showPen && (
          <button
            type="button"
            onClick={() => setTool("pen")}
            className={clsx(
              "rounded",
              "px-3",
              "py-2",
              tool === "pen" ? "bg-black text-white" : "bg-gray-200",
            )}
          >
            Pen
          </button>
        )}

        {showEraser && (
          <button
            type="button"
            onClick={() => setTool("eraser")}
            className={clsx(
              "rounded",
              "px-3",
              "py-2",
              tool === "eraser" ? "bg-black text-white" : "bg-gray-200",
            )}
          >
            Eraser
          </button>
        )}

        {showColor && (
          <input
            type="color"
            value={color}
            disabled={tool === "eraser"}
            onChange={(e) => setColor(e.target.value)}
            className={clsx("h-9", "w-12", "cursor-pointer")}
          />
        )}

        {showBrushSize &&
          (brushSizes ? (
            <div className={clsx("flex", "items-center", "gap-1")}>
              {brushSizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setBrushSize(size)}
                  className={clsx(
                    "rounded",
                    "px-2",
                    "py-1",
                    brushSize === size ? "bg-black text-white" : "bg-gray-200",
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          ) : (
            <div className={clsx("flex", "items-center", "gap-2")}>
              <input
                type="range"
                min={minBrushSize}
                max={maxBrushSize}
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
              />

              <span className={clsx("w-8", "text-sm")}>{brushSize}</span>
            </div>
          ))}

        {showUndo && (
          <button
            type="button"
            onClick={undo}
            className={clsx("rounded", "bg-gray-200", "px-3", "py-2")}
          >
            Undo
          </button>
        )}

        {showRedo && (
          <button
            type="button"
            onClick={redo}
            className={clsx("rounded", "bg-gray-200", "px-3", "py-2")}
          >
            Redo
          </button>
        )}

        {showClear && (
          <button
            type="button"
            onClick={clearCanvas}
            className={clsx("rounded", "bg-gray-200", "px-3", "py-2")}
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
