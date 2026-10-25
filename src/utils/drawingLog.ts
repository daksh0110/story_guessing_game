import type { Stroke } from "@/types/drawing";
import type { DrawingEvent } from "@/types/events";

/**
 * Rebuilds every player's current strokes by replaying the event log in order.
 * Pure function, so the same events always produce the same canvas.
 */
export function buildStrokesByPlayer(events: DrawingEvent[]): Record<string, Stroke[]> {
  const strokesByPlayer: Record<string, Stroke[]> = {};

  for (const event of events) {
    const strokes = (strokesByPlayer[event.playerId] ??= []);

    switch (event.type) {
      case "drawing.stroke":
        // Redo re-sends a stroke with the same id, so skip duplicates.
        if (!strokes.some((stroke) => stroke.id === event.stroke.id)) {
          strokes.push(event.stroke);
        }
        break;

      case "drawing.undo": {
        const index = strokes.findIndex((stroke) => stroke.id === event.strokeId);

        if (index !== -1) {
          strokes.splice(index, 1);
        }
        break;
      }

      case "drawing.clear":
        strokes.length = 0;
        break;
    }
  }

  return strokesByPlayer;
}
