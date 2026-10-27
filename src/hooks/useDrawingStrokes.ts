import { useEffect, useMemo, useState } from "react";
import { getDrawingEvents, subscribeToDrawingEvents } from "@/services/drawingChannel";
import { buildStrokesByPlayer } from "@/utils/drawingLog";
import type { Stroke } from "@/types/drawing";
import type { DrawingEvent } from "@/types/events";

/** Live strokes for every player in a room, rebuilt whenever the log changes. */
export function useDrawingStrokes(roomCode: string): Record<string, Stroke[]> {
  const [events, setEvents] = useState<DrawingEvent[]>(() => getDrawingEvents(roomCode));

  useEffect(() => {
    const refresh = () => setEvents(getDrawingEvents(roomCode));
    return subscribeToDrawingEvents(refresh);
  }, [roomCode]);

  return useMemo(() => buildStrokesByPlayer(events), [events]);
}
