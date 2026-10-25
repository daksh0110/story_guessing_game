/** Unique id for players, rooms, strokes, and events. Works on non-secure LAN origins too. */
export function createId(): string {
  // randomUUID needs a secure context, so phones on a LAN address need a fallback.
  return typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}
