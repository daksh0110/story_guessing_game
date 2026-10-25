import { DRAWING_EVENT_VERSION, type DrawingEvent, type DrawingEventPayload } from "@/types/events";
import { getCurrentPlayerId } from "@/services/identity";
import { createId } from "@/utils/id";
import { readStoredJson, writeStoredJson } from "@/utils/storage";

/**
 * Drawing event log, kept per room. Each publish appends one event and writes
 * the log to localStorage. Other tabs see the change and update live.
 *
 * To go online later, `publishDrawingEvent` would also emit the event over the
 * socket, and incoming socket events would be appended with `appendRemoteEvent`.
 * Nothing else in the app needs to change.
 */

const DRAWING_LOG_STORAGE_KEY = "storyframes:drawing-log";

type DrawingLog = Record<string, DrawingEvent[]>;
type Subscriber = () => void;

const subscribers = new Set<Subscriber>();

function notifySubscribers() {
  subscribers.forEach((callback) => callback());
}

window.addEventListener("storage", (event) => {
  if (event.key === DRAWING_LOG_STORAGE_KEY) {
    notifySubscribers();
  }
});

function loadLog(): DrawingLog {
  return readStoredJson<DrawingLog>(DRAWING_LOG_STORAGE_KEY, {});
}

function saveLog(log: DrawingLog) {
  writeStoredJson(DRAWING_LOG_STORAGE_KEY, log);
  notifySubscribers();
}

export function getDrawingEvents(roomCode: string): DrawingEvent[] {
  return loadLog()[roomCode] ?? [];
}

/** Records a local drawing action and returns the full event that was stored. */
export function publishDrawingEvent(roomCode: string, payload: DrawingEventPayload): DrawingEvent {
  const log = loadLog();
  const events = log[roomCode] ?? [];
  const playerId = getCurrentPlayerId();

  const event: DrawingEvent = {
    ...payload,
    version: DRAWING_EVENT_VERSION,
    eventId: createId(),
    roomCode,
    playerId,
    sequence: events.filter((existing) => existing.playerId === playerId).length + 1,
    sentAt: Date.now(),
  };

  log[roomCode] = [...events, event];
  saveLog(log);

  return event;
}

/** Removes a room's drawing history. Called when a new round starts. */
export function clearDrawingLog(roomCode: string) {
  const log = loadLog();

  if (!log[roomCode]) {
    return;
  }

  delete log[roomCode];
  saveLog(log);
}

/** Calls `callback` whenever any drawing event is added or removed. Returns an unsubscribe function. */
export function subscribeToDrawingEvents(callback: Subscriber): () => void {
  subscribers.add(callback);

  return () => {
    subscribers.delete(callback);
  };
}
