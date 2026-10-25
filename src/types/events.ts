import type { Stroke } from "@/types/drawing";

/**
 * Wire format for drawing events. Every event is plain JSON, so the same
 * object can be stored locally today and sent over a socket later unchanged.
 */
export const DRAWING_EVENT_VERSION = 1;

type DrawingEnvelope = {
  version: typeof DRAWING_EVENT_VERSION;
  /** Unique per event, so a resent event can be ignored. */
  eventId: string;
  roomCode: string;
  playerId: string;
  /** 1-based counter per player within a round. */
  sequence: number;
  sentAt: number;
};

export type DrawingEventPayload =
  | { type: "drawing.stroke"; stroke: Stroke }
  | { type: "drawing.undo"; strokeId: string }
  | { type: "drawing.clear" };

export type DrawingEvent = DrawingEnvelope & DrawingEventPayload;
