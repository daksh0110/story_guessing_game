import clsx from "clsx";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import type { Point, Stroke, Tool } from "@/types/drawing";
import {
  BRUSH_REFERENCE_WIDTH,
  strokeToSvgPath,
} from "@/utils/strokes";
import { createId } from "@/utils/id";
import Icon from "@/components/ui/Icon";
import penIcon from "@/assets/svgs/icon-pen.svg";
import eraserIcon from "@/assets/svgs/icon-eraser.svg";
import undoIcon from "@/assets/svgs/icon-undo.svg";
import redoIcon from "@/assets/svgs/icon-redo.svg";
import trashIcon from "@/assets/svgs/icon-trash.svg";

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
  readOnly?: boolean;
  className?: string;
  toolbarClassName?: string;
  /** Fires on pointer release, with the finished stroke. */
  onStrokeComplete?: (stroke: Stroke) => void;
  onUndo?: (stroke: Stroke) => void;
  onRedo?: (stroke: Stroke) => void;
  onChange?: (strokes: Stroke[]) => void;
  onClear?: () => void;
};

function paintStroke(ctx: CanvasRenderingContext2D, stroke: Stroke, scale: number) {
  const path = new Path2D(strokeToSvgPath(stroke, scale));

  ctx.globalCompositeOperation =
    stroke.tool === "eraser" ? "destination-out" : "source-over";
  ctx.fillStyle = stroke.color;
  ctx.fill(path);
  ctx.globalCompositeOperation = "source-over";
}

type ToolbarButtonProps = {
  label: string;
  icon: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
};

function ToolbarButton({ label, icon, active = false, disabled = false, onClick }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={clsx(
        "flex h-10 items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold transition",
        "disabled:cursor-not-allowed disabled:opacity-40",
        active ? "bg-ink text-white" : "bg-white text-ink hover:bg-ink/5",
      )}
    >
      <Icon src={icon} className={clsx("h-4 w-4", active && "invert")} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

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
  defaultColor = "#1F2430",
  defaultTool = "pen",
  readOnly = false,
  className,
  toolbarClassName,
  onStrokeComplete,
  onUndo,
  onRedo,
  onChange,
  onClear,
}: DrawingCanvasProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [brushSize, setBrushSize] = useState(defaultBrushSize);
  const [color, setColor] = useState(defaultColor);
  const [tool, setTool] = useState<Tool>(defaultTool);

  const currentStrokeRef = useRef<Stroke | null>(null);
  const strokesRef = useRef<Stroke[]>([]);
  const redoStrokesRef = useRef<Stroke[]>([]);

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !ctx) {
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const stroke of strokesRef.current) {
      paintStroke(ctx, stroke, canvas.width);
    }

    if (currentStrokeRef.current) {
      paintStroke(ctx, currentStrokeRef.current, canvas.width);
    }
  }, []);

  // Keep the bitmap the same pixel size as the element on screen (including
  // devicePixelRatio), then repaint so resizing never blurs or stretches strokes.
  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;

    if (!wrapper || !canvas) {
      return;
    }

    const syncSize = () => {
      const { width, height } = wrapper.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      redrawCanvas();
    };

    syncSize();

    const observer = new ResizeObserver(syncSize);
    observer.observe(wrapper);

    return () => observer.disconnect();
  }, [redrawCanvas]);

  const getPoint = (e: ReactPointerEvent<HTMLCanvasElement>): Point => {
    const rect = e.currentTarget.getBoundingClientRect();

    // Divide both axes by width so the coordinates match the stroke format.
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.width;
    const pressure = e.pressure || 0.5;

    return [x, y, pressure];
  };

  const handlePointerDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (readOnly) {
      return;
    }

    currentStrokeRef.current = {
      id: createId(),
      points: [getPoint(e)],
      size: brushSize / BRUSH_REFERENCE_WIDTH,
      color,
      tool,
    };

    redoStrokesRef.current = [];

    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!currentStrokeRef.current || e.buttons !== 1) {
      return;
    }

    currentStrokeRef.current.points.push(getPoint(e));
    redrawCanvas();
  };

  const handlePointerUp = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const stroke = currentStrokeRef.current;

    if (!stroke) {
      return;
    }

    strokesRef.current.push(stroke);
    currentStrokeRef.current = null;

    onStrokeComplete?.(stroke);
    onChange?.(strokesRef.current);

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
    onChange?.(strokesRef.current);
    onUndo?.(stroke);
    redrawCanvas();
  };

  const redo = () => {
    const stroke = redoStrokesRef.current.pop();

    if (!stroke) {
      return;
    }

    strokesRef.current.push(stroke);
    onChange?.(strokesRef.current);
    onRedo?.(stroke);
    redrawCanvas();
  };

  const clearCanvas = () => {
    strokesRef.current = [];
    redoStrokesRef.current = [];
    currentStrokeRef.current = null;

    redrawCanvas();
    onChange?.(strokesRef.current);
    onClear?.();
  };

  return (
    <div className={clsx("flex w-full flex-col gap-3", className)}>
      {!readOnly && (
        <div
          className={clsx(
            "flex flex-wrap items-center gap-2 rounded-2xl bg-paper p-2",
            toolbarClassName,
          )}
        >
          {showPen && (
            <ToolbarButton
              label="Pen"
              icon={penIcon}
              active={tool === "pen"}
              onClick={() => setTool("pen")}
            />
          )}

          {showEraser && (
            <ToolbarButton
              label="Eraser"
              icon={eraserIcon}
              active={tool === "eraser"}
              onClick={() => setTool("eraser")}
            />
          )}

          {showColor && (
            <input
              type="color"
              aria-label="Brush color"
              value={color}
              disabled={tool === "eraser"}
              onChange={(e) => setColor(e.target.value)}
              className="h-10 w-12 cursor-pointer rounded-xl border-0 bg-white p-1 disabled:opacity-40"
            />
          )}

          {showBrushSize &&
            (brushSizes ? (
              <div className="flex items-center gap-1">
                {brushSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setBrushSize(size)}
                    aria-pressed={brushSize === size}
                    className={clsx(
                      "h-10 min-w-10 rounded-xl px-2 text-sm font-semibold",
                      brushSize === size ? "bg-ink text-white" : "bg-white",
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 px-1">
                <input
                  type="range"
                  aria-label="Brush size"
                  min={minBrushSize}
                  max={maxBrushSize}
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  className="w-24 accent-coral sm:w-32"
                />
                <span className="w-7 text-sm tabular-nums">{brushSize}</span>
              </div>
            ))}

          <div className="ml-auto flex items-center gap-2">
            {showUndo && (
              <ToolbarButton label="Undo" icon={undoIcon} onClick={undo} />
            )}

            {showRedo && (
              <ToolbarButton label="Redo" icon={redoIcon} onClick={redo} />
            )}

            {showClear && (
              <ToolbarButton label="Clear" icon={trashIcon} onClick={clearCanvas} />
            )}
          </div>
        </div>
      )}

      <div
        ref={wrapperRef}
        className="relative aspect-[4/3] w-full touch-none overflow-hidden rounded-2xl border-2 border-ink/10 bg-white"
      >
        <canvas
          ref={canvasRef}
          aria-label="Drawing canvas"
          role="img"
          className={clsx(
            "absolute inset-0 h-full w-full",
            readOnly ? "cursor-default" : "cursor-crosshair",
          )}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
        />
      </div>
    </div>
  );
}
