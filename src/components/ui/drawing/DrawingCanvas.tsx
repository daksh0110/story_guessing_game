import clsx from "clsx";
import { useRef } from "react";
import { getStroke } from "perfect-freehand";
import devConsole from "@/utils/console";

type Point = [number, number, number];

const BRUSH_SIZE = 5;

export default function DrawingCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Points of the stroke currently being drawn
  const currentStrokeRef = useRef<Point[]>([]);

  // All completed strokes
  const strokesRef = useRef<Point[][]>([]);

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

  const drawStroke = (outlinePoints: number[][]) => {
    const canvas = canvasRef.current;

    if (!canvas || outlinePoints.length === 0) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    ctx.beginPath();

    ctx.moveTo(outlinePoints[0][0], outlinePoints[0][1]);

    for (let i = 1; i < outlinePoints.length; i++) {
      ctx.lineTo(outlinePoints[i][0], outlinePoints[i][1]);
    }

    ctx.closePath();
    ctx.fill();
  };

  const redrawCanvas = () => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all completed strokes
    for (const stroke of strokesRef.current) {
      const outlinePoints = getStroke(stroke, {
        size: BRUSH_SIZE,
      });

      drawStroke(outlinePoints);
    }

    // Draw the stroke currently being drawn
    if (currentStrokeRef.current.length > 0) {
      const outlinePoints = getStroke(currentStrokeRef.current, {
        size: BRUSH_SIZE,
      });

      drawStroke(outlinePoints);
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const point = getPoint(e);

    currentStrokeRef.current = [point];
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.buttons !== 1) return;

    const point = getPoint(e);

    currentStrokeRef.current.push(point);

    redrawCanvas();
  };

  const handlePointerUp = () => {
    if (currentStrokeRef.current.length === 0) {
      return;
    }

    strokesRef.current.push(currentStrokeRef.current);

    currentStrokeRef.current = [];

    redrawCanvas();
  };

  return (
    <canvas
      ref={canvasRef}
      width={window.innerWidth}
      height={window.innerHeight}
      className={clsx("h-screen", "w-screen", "touch-none", "border")}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    />
  );
}
